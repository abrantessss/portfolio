# Portfolio — luisabrantes

React + Vite + Tailwind v4, with three 3D project viewers built on
`@react-three/fiber`.

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run lint
```

> **Note:** `npm install` fails on the Google Drive mount (`EBADF`,
> `TAR_ENTRY_ERROR`) — the virtual filesystem corrupts `node_modules`. Clone or
> copy the repo to a local disk to install, build, or run the dev server.

## Assets

`public/` ships only what the site actually downloads. Original, uncompressed
sources live in `assets-src/`, which Vite does not copy into the build.

| Shipped (`public/`)      | Source (`assets-src/`) | Size              |
| ------------------------ | ---------------------- | ----------------- |
| `TLM05e-transformed.glb` | `TLM05e.glb`           | 1.23 GB → 3.6 MB  |
| `capture-transformed.glb`| `capture.glb`          | 14.9 MB → 753 KB  |
| `YCB-transformed.glb`    | `YCB.glb`              | 77 KB → 13 KB     |
| `SelfTL-344/688.webp`    | `SelfTL.webp`          | 683 KB → 25 KB    |
| `CV-preview*.webp`       | `CV.pdf` page 1        | — → 23 KB         |
| `favicon-32.png`         | `favicon-source.png`   | 116 KB → 1.7 KB   |

### Regenerating the TLMoto model

The CAD export gives every body its own copy of the same handful of appearances,
each with a separately baked normal map — hundreds of materials and draw calls
for what is visually a dozen surfaces. `tools/optimize-tlm.mjs` collapses that:

```bash
npm i -D @gltf-transform/core @gltf-transform/extensions \
         @gltf-transform/functions meshoptimizer draco3dgltf sharp
node --max-old-space-size=11000 tools/optimize-tlm.mjs \
     assets-src/TLM05e.glb public/TLM05e-transformed.glb
```

It drops normal maps below 512 px (sub-pixel at the size the model is shown,
and removing them lets the duplicate materials dedupe), strips clearcoat /
transmission / specular / ior, joins primitives that share a material,
decimates the CAD tessellation, resizes textures to 256 px, and Draco-compresses
the result with 12-bit positions.

Net effect: **203 materials → 18, 203 draw calls → 18, 13.3M triangles → 1.36M,
1.23 GB → 3.6 MB.** The triangle count floors out around 1.35M regardless of
how loose the error bound is — the model is thousands of small disconnected
shells already at their minimum representation. See the script header for why
`NORMAL` has to be stripped before welding; without that step both `weld()` and
`simplify()` silently do nothing.

The other two models were produced with `npx gltfjsx@6.5.3 <file> --transform`.

### Other assets

```bash
# Hero photo: displayed at most 344x408 CSS px
npx sharp-cli -i assets-src/SelfTL.webp -o public/SelfTL-688.webp resize 688 816 --fit cover

# CV thumbnail from page 1 of the PDF
pdftocairo -png -r 150 -f 1 -l 1 -singlefile public/CV.pdf cvpage
```

## Performance notes

Things that are load-bearing — changing them will make the site slow again:

- **three.js is lazily imported.** `Projects` pulls `ModelViewer` through
  `React.lazy`, keeping ~950 KB out of the initial bundle. Importing anything
  from `@react-three/*` into an eagerly-loaded module undoes this.
- **Models preload on approach, not at import.** `useGLTF.preload` lives in
  `preloadModels.js`, called when the Projects section is 400 px away. Moving a
  `preload()` back to module scope downloads every model during the hero
  animation.
- **Canvases mount once, on approach, and then stay.** Off-screen they switch to
  `frameloop="demand"` rather than unmounting, because creating a WebGL context
  is more expensive than keeping an idle one.
- **Typewriter headings and carets are CSS animations**, not `setInterval`. The
  previous version re-rendered four sections every 530 ms for the lifetime of
  the page.
- **The hero reveal never reads layout in its animation loop.** Geometry is
  cached and refreshed from `ResizeObserver` / `scroll`; writes are skipped when
  the rounded position has not changed. It is not mounted at all on touch
  devices or under `prefers-reduced-motion`.
