import { useGLTF } from '@react-three/drei'

export const TLM_URL = '/TLM05e-transformed.glb'

/*
  Source model: assets-src/TLM05e.glb (5.85 MB, 174 materials / 174 draw calls).
  The CAD export gave every body its own copy of the same handful of appearances,
  each with its own baked normal map. Optimised with gltf-transform to
  1.93 MB / 19 materials / 19 draw calls — see README.
*/
export function Model(props) {
  const { scene } = useGLTF(TLM_URL)
  // dispose={null} keeps the cached GLTF alive when the card scrolls out of
  // view, so coming back does not re-upload geometry and textures to the GPU.
  return <primitive object={scene} dispose={null} {...props} />
}
