import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import SectionHeading from "./SectionHeading";

// three.js, @react-three/fiber and @react-three/drei are ~600 KB of JS. Keeping
// them behind a dynamic import means the hero and About sections render without
// ever parsing them; the chunk is fetched as this section comes into range.
const ModelViewer = lazy(() => import("./ModelViewer"));

// Static data: defined once at module scope rather than rebuilt every render.
const PROJECTS = [
  {
    title: "TLMoto",
    description: (
      <>
        Initiated as a core member of the Powertrain team, driving the development of the{" "}
        <b className="font-bold text-stone-950">high-voltage system</b> through{" "}
        <b className="font-bold text-stone-950">battery pack design</b>, race powertrain simulations,
        motor bench testing, and inverter programming. Progressed to coordinate the Powertrain,
        Electronics, and Software departments as{" "}
        <b className="font-bold text-stone-950">Electrical Technical Director</b>, ensuring seamless
        alignment across the{" "}
        <b className="font-bold text-stone-950">overall electrical architecture</b>. This leadership
        role involved defining electrical system concepts, managing{" "}
        <b className="font-bold text-stone-950">cross-functional workflows</b>, and overseeing
        comprehensive risk assessment and{" "}
        <b className="font-bold text-stone-950">technical decision-making</b>.
      </>
    ),
    tech: ["Project Management", "MS Project", "HV/LV Systems"],
    modelKey: "tlm",
    camera: { position: [0, 1, 2.5], fov: 45 },
    controls: {
      enableZoom: false,
      autoRotate: true,
      autoRotateSpeed: 2,
      minPolarAngle: Math.PI / 2 - Math.PI / 12,
      maxPolarAngle: Math.PI / 2 + Math.PI / 12,
      minAzimuthAngle: -0.7 - Math.PI / 12,
      maxAzimuthAngle: -0.7 + Math.PI / 12,
    },
  },
  {
    title: "Project CAPTURE",
    description: (
      <>
        Led the <b className="font-bold text-stone-950">design and implementation of control mechanisms</b>{" "}
        for a UAV capture gripper, conducting rigorous validation in both{" "}
        <b className="font-bold text-stone-950">Gazebo simulations</b> and on{" "}
        <b className="font-bold text-stone-950">physical hardware</b>. Formulated advanced simulations
        for a shuttle drone and a fixed-wing UAV, deriving{" "}
        <b className="font-bold text-stone-950">robust path-following controllers</b> to execute{" "}
        <b className="font-bold text-stone-950">a diverse range of flight trajectories</b>.
      </>
    ),
    tech: ["ROS 2", "C++", "Python", "Gazebo"],
    modelKey: "capture",
    camera: { position: [0, 0, 1.8], fov: 50 },
    controls: {
      enableZoom: false,
      autoRotate: true,
      autoRotateSpeed: 2,
      minPolarAngle: Math.PI / 2 - Math.PI / 9,
      maxPolarAngle: Math.PI / 2 + Math.PI / 9,
      minAzimuthAngle: -Math.PI / 9,
      maxAzimuthAngle: Math.PI / 9,
    },
  },
  {
    title: "Project PackBot",
    description: (
      <>
        Contributed to the{" "}
        <b className="font-bold text-stone-950">research and testing of computer vision algorithms</b>{" "}
        for <b className="font-bold text-stone-950">6D object detection and localization</b>,
        facilitating the integration of camera systems into the project development. The work focused
        on benchmarking existing algorithms and{" "}
        <b className="font-bold text-stone-950">automating the entire pipeline</b> utilizing advanced{" "}
        <b className="font-bold text-stone-950">segmentation and depth estimation</b> algorithms.
      </>
    ),
    tech: ["Python", "Machine Learning", "Computer Vision"],
    modelKey: "ycb",
    camera: { position: [0.5, 4, 6], fov: 40 },
    modelRotation: [0, Math.PI, 0],
    modelScale: 1.2,
    controls: {
      enableZoom: false,
      autoRotate: true,
      autoRotateSpeed: 2,
      minPolarAngle: Math.PI / 2 - Math.PI / 8,
      maxPolarAngle: Math.PI / 2 + Math.PI / 8,
      minAzimuthAngle: -0.2 - Math.PI / 8,
      maxAzimuthAngle: -0.2 + Math.PI / 8,
    },
  },
];

/** Placeholder shown until the viewer chunk and the model have both loaded. */
function ViewerSkeleton({ hidden }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-stone-400">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        >
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest">Loading model</span>
      </div>
    </div>
  );
}

function ProjectCard({ project, index, isVisible }) {
  const isEven = index % 2 === 0;
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // Live visibility drives the render loop; the latched value drives mounting.
  // Creating a WebGL context is expensive, so the canvas is mounted the first
  // time the card comes into range and then kept — off-screen it simply stops
  // rendering rather than being torn down and rebuilt on every scroll past.
  const [cardRef, isInView, mounted] = useInView({ once: false, rootMargin: "300px 0px" });

  return (
    <div
      ref={cardRef}
      className={`flex flex-col ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      } gap-10 bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-stone-200 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      }`}
      style={{ transitionDelay: `${300 + index * 250}ms` }}
    >
      {/* 3D render window */}
      <div className="w-full lg:w-[55%] aspect-video bg-stone-200 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner border-2 border-stone-300/50 cursor-crosshair">
        <ViewerSkeleton hidden={ready} />
        {mounted && (
          <Suspense fallback={null}>
            <ModelViewer
              modelKey={project.modelKey}
              camera={project.camera}
              controls={project.controls}
              modelRotation={project.modelRotation}
              modelScale={project.modelScale}
              frameloop={isInView ? "always" : "demand"}
              onReady={onReady}
            />
          </Suspense>
        )}
      </div>

      {/* Explanation */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-2 lg:px-6 py-4">
        <h3 className="font-mono text-3xl md:text-4xl font-bold text-stone-950 mb-6 leading-tight text-center lg:text-left">
          {project.title}
        </h3>
        <p className="text-stone-700 text-lg leading-relaxed text-justify mb-8">
          {project.description}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-auto">
          {project.tech.map((t) => (
            <span
              key={t}
              className="px-4 py-1.5 border border-stone-300 rounded-full font-mono text-sm font-bold text-stone-600 bg-stone-50 hover:bg-stone-950 hover:text-stone-100 hover:border-stone-950 transition-colors cursor-default"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  // Two separate triggers: a wide margin starts fetching the viewer chunk and
  // the models while the user is still reading About, while the reveal and the
  // typewriter wait until the section is genuinely on screen.
  const [sectionRef, isNear] = useInView({ rootMargin: "400px 0px" });
  const [revealRef, isVisible] = useInView({ threshold: 0.05 });

  useEffect(() => {
    if (!isNear) return;
    let cancelled = false;
    import("./preloadModels").then((mod) => {
      if (!cancelled) mod.default();
    });
    return () => {
      cancelled = true;
    };
  }, [isNear]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="min-h-screen bg-stone-100 px-8 md:px-20 py-24 relative overflow-hidden"
    >
      <div ref={revealRef} className="max-w-7xl mx-auto w-full z-10">
        <SectionHeading number="02." title="Projects" isVisible={isVisible} />

        <div className="flex flex-col gap-12">
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
