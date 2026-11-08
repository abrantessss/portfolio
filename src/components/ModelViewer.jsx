import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";

import { Model as CaptureModel } from "./Capture";
import { Model as YCBModel } from "./YCB";
import { Model as TLMModel } from "./TLM05e";

const MODELS = {
  tlm: TLMModel,
  capture: CaptureModel,
  ycb: YCBModel,
};

/** OrbitControls that sweeps back and forth instead of rotating all the way around. */
function PingPongControls({
  autoRotateSpeed = 2,
  minAzimuthAngle = -Math.PI / 4,
  maxAzimuthAngle = Math.PI / 4,
  ...props
}) {
  const controlsRef = useRef(null);
  const speedRef = useRef(autoRotateSpeed);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !controls.autoRotate) return;

    const angle = controls.getAzimuthalAngle();

    // Positive speed decreases the angle, negative speed increases it.
    if (angle >= maxAzimuthAngle - 0.05 && speedRef.current < 0) {
      speedRef.current = Math.abs(autoRotateSpeed);
      controls.autoRotateSpeed = speedRef.current; // mutate directly, no re-render
    } else if (angle <= minAzimuthAngle + 0.05 && speedRef.current > 0) {
      speedRef.current = -Math.abs(autoRotateSpeed);
      controls.autoRotateSpeed = speedRef.current;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotateSpeed={speedRef.current}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      {...props}
    />
  );
}

/**
 * Sibling of the model inside the Suspense boundary, so it mounts at exactly
 * the moment the GLTF has resolved. That is the cue to fade out the skeleton.
 */
function SignalReady({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export default function ModelViewer({
  modelKey,
  camera,
  controls,
  modelRotation,
  modelScale,
  frameloop = "always",
  onReady,
}) {
  const Model = MODELS[modelKey];

  return (
    <Canvas
      // "demand" while off-screen stops the render loop and the auto-rotation
      // without tearing down the WebGL context.
      frameloop={frameloop}
      dpr={[1, 1.5]}
      gl={{ powerPreference: "high-performance", antialias: true }}
      camera={camera}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Suspense fallback={null}>
        <Center>
          <group rotation={modelRotation || [0, 0, 0]} scale={modelScale || 1}>
            <Model />
          </group>
        </Center>
        <SignalReady onReady={onReady} />
      </Suspense>
      <PingPongControls {...controls} />
    </Canvas>
  );
}
