import { useGLTF } from '@react-three/drei'

export const CAPTURE_URL = '/capture-transformed.glb'

/*
  Source model: assets-src/capture.glb (14.94 MB) → 753 KB via gltfjsx --transform.

  The file carries two animation clips, but no action was ever played. Binding
  them with useAnimations still ran an AnimationMixer every frame, so the hook
  is gone; add it back alongside an actions[...].play() if the clips are wanted.
*/
export function Model(props) {
  const { scene } = useGLTF(CAPTURE_URL)
  return <primitive object={scene} dispose={null} {...props} />
}
