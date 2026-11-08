import { useGLTF } from "@react-three/drei";

import { CAPTURE_URL } from "./Capture";
import { TLM_URL } from "./TLM05e";
import { YCB_URL } from "./YCB";

/**
 * Warms the GLTF cache for every project model.
 *
 * This used to run at module scope inside each model file, which meant all
 * three models downloaded during the hero animation even though none were on
 * screen. Projects now imports this dynamically once the section is in range.
 */
export default function preloadModels() {
  useGLTF.preload(TLM_URL);
  useGLTF.preload(CAPTURE_URL);
  useGLTF.preload(YCB_URL);
}
