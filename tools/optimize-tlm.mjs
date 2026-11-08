/**
 * Collapses the TLMoto CAD export into something a browser can render.
 *
 * The source is a raw CAD export (~1.2 GB, 13.3M triangles): one mesh with a
 * few hundred primitives, where every body carries its own copy of the same
 * handful of appearances and its own separately baked normal map. That is
 * hundreds of materials and draw calls for what is visually about a dozen
 * surfaces.
 *
 * The non-obvious step is stripping NORMAL before welding. CAD exporters split
 * a vertex per facet so each face can carry its own normal, so exact welding
 * merges nothing and the simplifier — which cannot collapse across an unwelded
 * boundary — refuses to decimate. Dropping the attribute first takes the mesh
 * from 33.8M to 7.1M vertices and lets simplification cut ~90% of triangles;
 * normals are recomputed afterwards.
 *
 * Triangles floor out around 1.35M no matter how loose the error bound: the
 * model is thousands of small disconnected shells (fasteners, brackets,
 * cabling) already at their minimum representation.
 *
 * Usage:
 *   node --max-old-space-size=11000 tools/optimize-tlm.mjs <in.glb> <out.glb>
 *
 * Requires (dev-only, not needed to build the site). Install outside the
 * Google Drive mount — npm corrupts node_modules there:
 *   @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions
 *   meshoptimizer draco3dgltf sharp
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup, prune, join, weld, simplify, normals, flatten, textureCompress, draco,
} from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import fs from 'node:fs';

const [, , inPath, outPath, ratioArg, errorArg] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: optimize-tlm.mjs <in.glb> <out.glb> [ratio] [error]');
  process.exit(1);
}

/** Target fraction of the original triangle count (the floor wins in practice). */
const RATIO = Number(ratioArg ?? 0.015);
/** Simplification error bound, as a fraction of mesh extent. */
const ERROR = Number(errorArg ?? 0.02);
/** Normal maps below this are sub-pixel at the size the model is displayed. */
const NORMAL_MIN_PX = 512;
/** Shown in a ~700px-wide card, so 256px textures are already generous. */
const TEXTURE_MAX_PX = 256;
/** 12-bit positions ≈ 0.5mm on a 2m vehicle; invisible, and ~20% smaller. */
const QUANTIZE = { quantizePosition: 12, quantizeNormal: 8, quantizeTexcoord: 10 };

await MeshoptSimplifier.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

console.log('reading… (a 1.2 GB source takes a few minutes)');
const doc = await io.read(inPath);

function stamp(label) {
  const root = doc.getRoot();
  let tris = 0;
  let verts = 0;
  let draws = 0;
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      draws++;
      const indices = prim.getIndices();
      tris += (indices ? indices.getCount() : prim.getAttribute('POSITION').getCount()) / 3;
      verts += prim.getAttribute('POSITION').getCount();
    }
  }
  console.log(
    `${label.padEnd(12)} materials=${String(root.listMaterials().length).padStart(4)}` +
    ` draws=${String(draws).padStart(4)}` +
    ` triangles=${String(Math.round(tris)).padStart(9)}` +
    ` vertices=${String(verts).padStart(9)}`
  );
}

stamp('source');

// Drop the per-body detail normal maps. This is what lets the otherwise
// identical materials dedupe down to the handful of real appearances.
let dropped = 0;
for (const material of doc.getRoot().listMaterials()) {
  const texture = material.getNormalTexture();
  if (!texture) continue;
  const size = texture.getSize();
  if (!size || Math.max(size[0], size[1]) < NORMAL_MIN_PX) {
    material.setNormalTexture(null);
    dropped++;
  }
}
console.log(`dropped ${dropped} normal maps under ${NORMAL_MIN_PX}px`);

// Each of these adds a shader permutation and per-pixel work that does not
// read at this size.
for (const extension of doc.getRoot().listExtensionsUsed()) {
  if ([
    'KHR_materials_clearcoat',
    'KHR_materials_transmission',
    'KHR_materials_specular',
    'KHR_materials_ior',
  ].includes(extension.extensionName)) {
    extension.dispose();
  }
}

await doc.transform(flatten(), dedup(), prune({ keepAttributes: false, keepLeaves: false }));
stamp('deduped');

// Merge primitives sharing a material before decimating, so the simplifier
// sees whole panels rather than hundreds of disconnected slivers.
await doc.transform(join({ keepNamed: false }));
stamp('joined');

// See the header comment: without this, weld() and simplify() both no-op.
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    prim.setAttribute('NORMAL', null);
    prim.setAttribute('TANGENT', null);
  }
}
await doc.transform(prune({ keepAttributes: false }), weld());
stamp('welded');

await doc.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: ERROR, lockBorder: false })
);
stamp('simplified');

await doc.transform(
  normals({ overwrite: true }),
  textureCompress({
    encoder: sharp,
    targetFormat: 'webp',
    resize: [TEXTURE_MAX_PX, TEXTURE_MAX_PX],
    quality: 80,
  }),
  dedup(),
  prune({ keepAttributes: false, keepLeaves: false }),
  draco({ method: 'edgebreaker', ...QUANTIZE })
);
stamp('final');

await io.write(outPath, doc);
console.log(`written → ${outPath} (${(fs.statSync(outPath).size / 1048576).toFixed(2)} MB)`);
