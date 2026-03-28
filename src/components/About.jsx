import { useState, useEffect, useRef } from "react";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);
  const [isCVExpanded, setIsCVExpanded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const sectionRef = useRef(null);

  const FULL_TEXT = "About Me";

  // Detect when the section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.5 } // Trigger when 30% of the section is visible
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
      await sleep(200); // Very short pause before typing starts
      for (let i = 1; i <= FULL_TEXT.length; i++) {
        if (cancelled) return;
        setText(FULL_TEXT.slice(0, i));
        await sleep(130); // Extremely fast typing speed
      }
      await sleep(500); // Keep cursor blinking for a moment after finishing
      if (!cancelled) setDone(true);
    }
    run();
    return () => { cancelled = true; };
  }, [isVisible]);

  // Blinking cursor effect
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Prevent animation lag by delaying the heavy iframe render until the modal transition finishes
  useEffect(() => {
    let timeout;
    if (isCVExpanded) {
      timeout = setTimeout(() => setShowIframe(true), 500);
    } else {
      setShowIframe(false);
    }
    return () => clearTimeout(timeout);
  }, [isCVExpanded]);

  return (
    <section id="about" ref={sectionRef} className="min-h-screen bg-stone-200 flex items-center px-8 md:px-20 py-24 relative">
      <div className="max-w-7xl mx-auto w-full z-10">
        <div className="mb-16">
          <h2 className="font-mono text-5xl md:text-6xl font-bold text-stone-950">
            <span className="text-stone-500 mr-2">01.</span>
            {done ? (
              <span>{FULL_TEXT}</span>
            ) : (
              <span className="relative inline-block">
                {/* Invisible text keeps the layout stable while typing */}
                <span className="invisible">{FULL_TEXT}</span>
                <span className="absolute inset-0 whitespace-pre">
                  {text}
                  <span
                    className="inline-block w-[3px] align-middle ml-1"
                    style={{
                      height: "0.85em",
                      background: "#0c0a09",
                      opacity: blink ? 1 : 0,
                      transition: "opacity 0.1s",
                    }}
                  />
                </span>
              </span>
            )}
          </h2>
          <div
            className={`w-full h-px bg-stone-300 mt-8 transition-transform duration-700 origin-left ${
              isVisible ? "scale-x-100 delay-100" : "scale-x-0"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-center">
          <div
            className={`space-y-8 text-justify text-stone-700 text-xl leading-relaxed transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-4"
            }`}
          >
            <p>
              I am currently pursuing a Master's degree in <span className="font-bold text-stone-950">Electrical and Computer Engineering</span> at <a href="https://tecnico.ulisboa.pt" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">Instituto Superior Técnico</a>, specializing in <span className="font-bold text-stone-950">Control, Robotics, and Artificial Intelligence</span>.
            </p>
            <p>
              Alongside my academic path, I have gained hands-on experience through multidisciplinary projects. I started in electric powertrains development at <a href="https://tlmoto.tecnico.ulisboa.pt/" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">TLMoto</a> and progressed to <span className="font-bold text-stone-950">Electrical Technical Director</span>, assuming <span className="font-bold text-stone-950">technical leadership</span> and <span className="font-bold text-stone-950">project management</span> responsibilities across the <span className="font-bold text-stone-950">electrical departments</span>.
            </p>
            <p>
              In parallel, I am involved in robotics research at <a href="https://isr.tecnico.ulisboa.pt/" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">ISR-Lisboa</a> through <a href="https://capture.isr.tecnico.ulisboa.pt/" target="_blank" rel="noopener noreferrer" className="font-bold text-stone-950 underline underline-offset-4 hover:text-stone-500 transition-colors">Project CAPTURE</a>, focusing on autonomous launch and capture maneuvers between UAVs. Driven by a commitment to advancing technology, I aim to build a career in <span className="font-bold text-stone-950">aerial robotics</span>, with a strong focus on <span className="font-bold text-stone-950">guidance, navigation, and control (GNC)</span> for autonomous flight systems.
            </p>
          </div>

          {/* Right Side: CV Thumbnail Card */}
          <div
            className={`flex justify-center lg:justify-end transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-8"
            }`}
          >
            <div
              onClick={() => setIsCVExpanded(true)}
              className="w-full max-w-[320px] aspect-[1/1.4] bg-white rounded-xl shadow-md border border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Top border highlight */}
              <div className="absolute top-0 w-full h-2 bg-stone-950 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-20" />
              
              {/* CSS Wireframe Fallback (Shows if image is missing) */}
              <div className="absolute inset-0 w-full h-full flex flex-col p-6 gap-3 z-0 pointer-events-none">
                <div className="w-2/3 h-5 bg-stone-200 rounded-sm mb-3" />
                <div className="w-1/3 h-3 bg-stone-300 rounded-sm mb-2" />
                <div className="w-full h-2 bg-stone-100 rounded-sm" />
                <div className="w-5/6 h-2 bg-stone-100 rounded-sm" />
                <div className="w-full h-2 bg-stone-100 rounded-sm" />
                <div className="w-4/6 h-2 bg-stone-100 rounded-sm mb-3" />
                <div className="w-1/3 h-3 bg-stone-300 rounded-sm mb-2" />
                <div className="w-full h-2 bg-stone-100 rounded-sm" />
                <div className="w-full h-2 bg-stone-100 rounded-sm" />
                <div className="w-5/6 h-2 bg-stone-100 rounded-sm" />
              </div>

              {/* Actual CV Image Preview (Overlays the wireframe if present) */}
              <img
                src="/CV_preview.png"
                alt="CV Preview"
                className="absolute inset-0 w-full h-full object-cover object-top z-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              {/* Static Label Badge */}
              <div className="absolute bottom-5 bg-stone-900/95 backdrop-blur-sm px-5 py-2 rounded-full shadow-md z-0 border border-stone-700 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                 <span className="font-mono text-base font-bold text-stone-100">Curriculum Vitae</span>
              </div>

              {/* Hover Overlay with Action Text */}
              <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-stone-100 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
                <h3 className="font-mono font-bold text-2xl mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Expand CV</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded CV Modal */}
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center px-4 transition-all duration-500 ${
          isCVExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCVExpanded(false)}
        />

        {/* Modal Window */}
        <div
          className={`relative bg-stone-100 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 delay-100 ${
            isCVExpanded ? "scale-100 translate-y-0" : "scale-95 translate-y-12"
          }`}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-stone-300 bg-stone-200">
            <h3 className="font-mono font-bold text-stone-950 text-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              Luis_Abrantes_CV.pdf
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="/CV.pdf"
                download="Luis_Abrantes_CV.pdf"
                className="font-mono font-bold px-4 py-2 bg-stone-950 text-stone-100 rounded-lg hover:bg-stone-700 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </a>
              <button
                onClick={() => setIsCVExpanded(false)}
                className="p-2 text-stone-500 hover:text-stone-950 hover:bg-stone-300 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Modal Body / PDF Preview */}
          <div className="flex-1 bg-stone-300 w-full p-2 md:p-6 relative flex items-center justify-center">
            {isCVExpanded && !showIframe && (
              <div className="absolute font-mono text-stone-500 flex flex-col items-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
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
    </section>
  );
}