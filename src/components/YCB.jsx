import { useGLTF } from '@react-three/drei'

export const YCB_URL = '/YCB-transformed.glb'

/*
  Source model: assets-src/YCB.glb (77 KB) → 13 KB via gltfjsx --transform.
*/
export function Model(props) {
  const { scene } = useGLTF(YCB_URL)
  return <primitive object={scene} dispose={null} {...props} />
}
