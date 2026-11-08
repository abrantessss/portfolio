import { useEffect, useState } from "react";

const LINKS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      // Coalesce bursts of scroll events into one read per frame, and keep the
      // listener passive so it never blocks scrolling.
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 200);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center pt-4 px-4 z-30">
      <div
        className={`flex items-center justify-between w-[95%] md:w-[80%] lg:w-[60%] px-5 md:px-7 py-3 md:py-4 rounded-2xl transition-all duration-400 ${
          scrolled ? "bg-stone-950/80 backdrop-blur-md text-stone-100" : "bg-stone-100/0 text-stone-950"
        }`}
      >
        <a
          href="#intro"
          className="font-bold font-mono tracking-tight text-base md:text-[18px] no-underline hover:opacity-75 transition-opacity"
          style={{ color: "inherit" }}
        >
          @abrantess_
        </a>

        <div className="hidden sm:flex items-center gap-4 md:gap-8 lg:gap-16 font-bold">
          {LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-mono text-sm md:text-[18px] opacity-75 hover:opacity-100 transition-opacity no-underline"
              style={{ color: "inherit" }}
            >
              {label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className={`font-mono text-sm md:text-[18px] border rounded-lg px-2 md:px-3 py-1 md:py-1.5 no-underline hover:opacity-65 transition-all duration-500 ${
            scrolled
              ? "bg-stone-100 text-stone-950 border-stone-100"
              : "bg-stone-950 text-stone-100 border-stone-950"
          }`}
        >
          Contact me
        </a>
      </div>
    </nav>
  );
}
