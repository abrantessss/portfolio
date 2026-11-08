import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import SectionHeading from "./SectionHeading";

function CVModal({ onClose }) {
  // The <iframe> spins up a PDF viewer, which janks the open transition if it
  // mounts in the same frame. Let the modal settle first.
  const [showIframe, setShowIframe] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const timeout = setTimeout(() => setShowIframe(true), 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Stop the page behind the modal from scrolling.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Curriculum Vitae"
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 transition-opacity duration-300 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative bg-stone-100 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ${
          entered ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-300 bg-stone-200">
          <h3 className="font-mono font-bold text-stone-950 text-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            CV.pdf
          </h3>
          <div className="flex items-center gap-4">
            <a
              href="/CV.pdf"
              download="LuisAbrantesCV.pdf"
              className="font-mono font-bold px-4 py-2 bg-stone-950 text-stone-100 rounded-lg hover:bg-stone-700 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
            <button
              onClick={onClose}
              aria-label="Close CV"
              className="p-2 text-stone-500 hover:text-stone-950 hover:bg-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-stone-300 w-full p-2 md:p-6 relative flex items-center justify-center">
          {!showIframe && (
            <div className="absolute font-mono text-stone-500 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Loading Document...
            </div>
          )}
          {showIframe && (
            <iframe
              src="/CV.pdf"
              className="w-full h-full rounded shadow-sm border border-stone-400 bg-stone-100 relative z-10"
              title="Curriculum Vitae"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const [sectionRef, isVisible] = useInView({ threshold: 0.05 });
  const [isCVExpanded, setIsCVExpanded] = useState(false);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="min-h-screen bg-stone-200 flex items-center px-8 md:px-20 py-24 relative"
    >
      <div className="max-w-7xl mx-auto w-full z-10">
        <SectionHeading number="01." title="About Me" isVisible={isVisible} />

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-center">
          <div
            className={`space-y-8 text-justify text-stone-700 text-xl leading-relaxed transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-4"
            }`}
          >
            <p>
              I am currently pursuing a Master's degree in{" "}
              <b className="font-bold text-stone-950">Electrical and Computer Engineering</b> at{" "}
              <a href="https://tecnico.ulisboa.pt" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">
                Instituto Superior Técnico
              </a>
              , specializing in{" "}
              <b className="font-bold text-stone-950">Control, Robotics, and Artificial Intelligence</b>.
            </p>
            <p>
              Alongside my academic path, I have gained hands-on experience through
              multidisciplinary projects. I started in electric powertrains development at{" "}
              <a href="https://tlmoto.tecnico.ulisboa.pt/" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">
                TLMoto
              </a>{" "}
              and progressed to{" "}
              <b className="font-bold text-stone-950">Electrical Technical Director</b>, assuming{" "}
              <b className="font-bold text-stone-950">technical leadership</b> and{" "}
              <b className="font-bold text-stone-950">project management</b> responsibilities across
              the <b className="font-bold text-stone-950">electrical departments</b>.
            </p>
            <p>
              In parallel, I am involved in robotics research at{" "}
              <a href="https://isr.tecnico.ulisboa.pt/" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">
                ISR-Lisboa
              </a>{" "}
              through{" "}
              <a href="https://capture.isr.tecnico.ulisboa.pt/" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">
                Project CAPTURE
              </a>
              , focusing on autonomous launch and capture maneuvers between UAVs. Driven by a
              commitment to advancing technology, I aim to build a career in{" "}
              <b className="font-bold text-stone-950">aerial robotics</b>, with a strong focus on{" "}
              <b className="font-bold text-stone-950">guidance, navigation, and control (GNC)</b> for
              autonomous flight systems.
            </p>
          </div>

          {/* CV thumbnail */}
          <div
            className={`flex justify-center lg:justify-end transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-8"
            }`}
          >
            <button
              type="button"
              onClick={() => setIsCVExpanded(true)}
              aria-label="Open Curriculum Vitae"
              className="w-full max-w-[320px] aspect-[1/1.4] bg-white rounded-xl shadow-md border border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden p-0"
            >
              <div className="absolute top-0 w-full h-2 bg-stone-950 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-20" />

              <img
                src="/CV-preview-320.webp"
                srcSet="/CV-preview-320.webp 320w, /CV-preview.webp 640w"
                sizes="320px"
                width="320"
                height="448"
                alt="First page of the curriculum vitae"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />

              <div className="absolute bottom-5 bg-stone-900/95 backdrop-blur-sm px-5 py-2 rounded-full shadow-md border border-stone-700 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                <span className="font-mono text-base font-bold text-stone-100">Curriculum Vitae</span>
              </div>

              <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-stone-100 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                <h3 className="font-mono font-bold text-2xl mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  Expand CV
                </h3>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mounted only while open: keeps a backdrop-filter layer and a PDF
          iframe out of the document for the rest of the session. */}
      {isCVExpanded && <CVModal onClose={() => setIsCVExpanded(false)} />}
    </section>
  );
}
