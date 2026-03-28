import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";
import { Model as CaptureModel } from "./Capture";
import { Model as YCBModel } from "./YCB";
import { Model as TLMModel } from "./TLM05e";

// Custom controls to make the model oscillate back and forth
function PingPongControls({ autoRotateSpeed = 2, minAzimuthAngle = -Math.PI / 4, maxAzimuthAngle = Math.PI / 4, ...props }) {
  const controlsRef = useRef();
  const speedRef = useRef(autoRotateSpeed);

  useFrame(() => {
    if (controlsRef.current && controlsRef.current.autoRotate) {
      const angle = controlsRef.current.getAzimuthalAngle();
      
      // Positive speed decreases the angle, negative speed increases it
      if (angle >= maxAzimuthAngle - 0.05 && speedRef.current < 0) {
        // Reached max limit, switch to positive speed to reverse
        speedRef.current = Math.abs(autoRotateSpeed);
        controlsRef.current.autoRotateSpeed = speedRef.current; // Mutate directly, bypassing React re-renders
      } else if (angle <= minAzimuthAngle + 0.05 && speedRef.current > 0) {
        // Reached min limit, switch to negative speed to reverse
        speedRef.current = -Math.abs(autoRotateSpeed);
        controlsRef.current.autoRotateSpeed = speedRef.current;
      }
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

// Extracted Project Card to manage its own IntersectionObserver for performance
function ProjectCard({ project, index, isVisible }) {
  const isEven = index % 2 === 0;
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Only run the heavy 3D engine when the user is actually looking at this specific card
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "200px 0px" } // Start rendering slightly before it scrolls into view
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-stone-200 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
      style={{ transitionDelay: `${300 + index * 250}ms` }}
    >
      {/* 3D Render Window */}
      <div className="w-full lg:w-[55%] aspect-video bg-stone-200 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner border-2 border-stone-300/50 group cursor-crosshair">
        <Canvas 
          frameloop={isInView ? "always" : "demand"} 
          dpr={[1, 1.5]} 
          gl={{ powerPreference: "high-performance" }}
          camera={project.camera}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Suspense fallback={null}>
            {project.Model ? (
              <Center>
                <group rotation={project.modelRotation || [0, 0, 0]} scale={project.modelScale || 1}>
                  <project.Model />
                </group>
              </Center>
            ) : (
              <mesh>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color="#f97316" />
              </mesh>
            )}
          </Suspense>
          <PingPongControls {...project.controls} />
        </Canvas>
      </div>

      {/* Explanation Content */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-2 lg:px-6 py-4">
        <h3 className="font-mono text-3xl md:text-4xl font-bold text-stone-950 mb-6 leading-tight">
          {project.title}
        </h3>
        <p className="text-stone-700 text-lg leading-relaxed text-justify mb-8">
          {project.description}
        </p>
        
        {/* Technology Tags */}
        <div className="flex flex-wrap gap-3 mt-auto">
          {project.tech.map((t, i) => (
            <span key={i} className="px-4 py-1.5 border border-stone-300 rounded-full font-mono text-sm font-bold text-stone-600 bg-stone-50 hover:bg-stone-950 hover:text-stone-100 hover:border-stone-950 transition-colors cursor-default">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);
  const sectionRef = useRef(null);

  const FULL_TEXT = "Projects";

  // Detect when the section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 } // Trigger earlier since this section will be tall
    );
    
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    async function run() {
      await sleep(200);
      for (let i = 1; i <= FULL_TEXT.length; i++) {
        if (cancelled) return;
        setText(FULL_TEXT.slice(0, i));
        await sleep(130);
      }
      await sleep(500);
      if (!cancelled) setDone(true);
    }
    run();
    return () => { cancelled = true; };
  }, [isVisible]);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Project Data (Pre-filled with context from your About text)
  const projects = [
    {
      title: "TLMoto",
      description: (
        <>
          Initiated as a core member of the Powertrain team, driving the development of the <span className="font-bold text-stone-950">high-voltage system</span> through <span className="font-bold text-stone-950">battery pack design</span>, race powertrain simulations, motor bench testing, and inverter programming. Progressed to coordinate the Powertrain, Electronics, and Software departments as  <span className="font-bold text-stone-950">Electrical Technical Director</span>, ensuring seamless alignment across the <span className="font-bold text-stone-950">overall electrical architecture</span>. This leadership role involved defining electrical system concepts, managing <span className="font-bold text-stone-950">cross-functional workflows</span>, and overseeing comprehensive risk assessment and <span className="font-bold text-stone-950">technical decision-making</span>.
        </>
      ),
      tech: ["Project Management", "Notion", "HV/LV Systems"],
      camera: { position: [0, 1, 2.5], fov: 45 },
      Model: TLMModel,
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
          Led the <span className="font-bold text-stone-950">design and implementation of control mechanisms</span> for a UAV capture gripper, conducting rigorous validation in both <span className="font-bold text-stone-950">Gazebo simulations</span> and on <span className="font-bold text-stone-950">physical hardware</span>. Formulated advanced simulations for a shuttle drone and a fixed-wing UAV, deriving <span className="font-bold text-stone-950">robust path-following controllers</span> to execute <span className="font-bold text-stone-950">a diverse range of flight trajectories</span>.
        </>
      ),
      tech: ["ROS 2", "C++", "Python", "Gazebo"],
      camera: { position: [0, 0, 1.8], fov: 50 },
      Model: CaptureModel,
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
          Contributed to the <span className="font-bold text-stone-950">research and testing of computer vision algorithms</span> for <span className="font-bold text-stone-950">6D object detection and localization</span>, facilitating the integration of camera systems into the project development. The work focused on benchmarking existing algorithms and <span className="font-bold text-stone-950">automating the entire pipeline</span> utilizing advanced <span className="font-bold text-stone-950">segmentation and depth estimation</span> algorithms.
        </>
      ),
      tech: ["Python", "Machine Learning", "Computer Vision"],
      camera: { position: [0.5, 4, 6], fov: 40 },
      Model: YCBModel,
      modelRotation: [0, Math.PI, 0], // Rotate the model 180 degrees on the Y axis
      modelScale: 1.2, // Boost the size slightly
      controls: {
        enableZoom: false,
        autoRotate: true,
        autoRotateSpeed: 2,
        minPolarAngle: Math.PI / 2 - Math.PI / 8,
        maxPolarAngle: Math.PI / 2 + Math.PI / 8,
        minAzimuthAngle: -0.2 - Math.PI / 8,
        maxAzimuthAngle: -0.2 + Math.PI / 8,
      },
    }
  ];

  return (
    <section id="projects" ref={sectionRef} className="min-h-screen bg-stone-100 px-8 md:px-20 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Typewriter Title */}
        <div className="mb-12">
          <h2 className="font-mono text-5xl md:text-6xl font-bold text-stone-950">
            <span className="text-stone-400 mr-2">02.</span>
            {done ? <span>{FULL_TEXT}</span> : (
              <span className="relative inline-block">
                <span className="invisible">{FULL_TEXT}</span>
                <span className="absolute inset-0 whitespace-pre">
                  {text}
                  <span className="inline-block w-[3px] align-middle ml-1" style={{ height: "0.85em", background: "#0c0a09", opacity: blink ? 1 : 0, transition: "opacity 0.1s" }} />
                </span>
              </span>
            )}
          </h2>
          <div className={`w-full h-px bg-stone-300 mt-8 transition-transform duration-700 origin-left ${isVisible ? "scale-x-100 delay-100" : "scale-x-0"}`} />
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-12">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}