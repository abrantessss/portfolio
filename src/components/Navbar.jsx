import { useState, useEffect } from "react";

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full flex justify-center pt-4 px-4 z-30">
        <div
          className={`flex items-center justify-between w-[60%] px-7 py-4 rounded-2xl transition-all duration-400 ${
            scrolled
              ? "bg-stone-950/80 backdrop-blur-md text-stone-100"
              : "bg-stone-100/0 text-stone-950"
          }`}
        >
          <a href="#intro" onClick={(e) => {e.preventDefault(); document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" });}} className="font-bold font-mono tracking-tight text-[18px] no-underline hover:opacity-75 transition-opacity" style={{ color: "inherit" }}>
            @abrantess_
          </a>
          <div className="flex items-center gap-25 font-bold">
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
            className="font-mono text-[18px] cursor-pointer opacity-75 hover:opacity-100 transition-opacity no-underline"
            style={{ color: "inherit" }}
          >
            About
          </a>
          <a
            href="#projects"
            onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
            className="font-mono text-[18px] cursor-pointer opacity-75 hover:opacity-100 transition-opacity no-underline"
            style={{ color: "inherit" }}
          >
            Projects
          </a>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
            className={`font-mono text-[18px] border rounded-lg px-3 cursor-pointer hover:opacity-65 transition-all duration-500 ${
              scrolled
                ? "bg-stone-100 text-stone-950 border-stone-100"
                : "bg-stone-950 text-stone-100 border-stone-950"
            }`}
          >
            Contact me
          </button>
        </div>
      </div>
    </div>
  );
}