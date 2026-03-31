import { useState, useEffect, useRef } from "react";

function useNameAnimation() {
  const FULL = "Luis Abrantes";
  const [text, setText] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    async function run() {
      for (let i = 1; i <= FULL.length; i++) {
        if (cancelled) return;
        setText(FULL.slice(0, i));
        setCursorPos(i);
        await sleep(70);
      }
      await sleep(1000);
      for (let pos = FULL.length; pos > 2; pos--) {
        if (cancelled) return;
        setCursorPos(pos);
        await sleep(80);
      }
      await sleep(200);
      setText("Lu" + FULL.slice(3));
      setCursorPos(2);
      await sleep(150);
      setText("Luí" + FULL.slice(3));
      setCursorPos(3);
      await sleep(150);
      await sleep(300);
      if (!cancelled) setDone(true);
    }

    const t = setTimeout(run, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  return { text, cursorPos, done };
}

const BALL_R = 144;

export default function Intro() {
  const { text, cursorPos, done } = useNameAnimation();
  const nameRef = useRef(null);
  const sectionRef = useRef(null);
  const navRef = useRef(null);
  const ballRef = useRef(null);
  const overlayRef = useRef(null);
  const [blink, setBlink] = useState(true);

  const luis = "Luís ";
  const luisEnd = luis.length;

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !frame) {
        tick(); // Restart loop when scrolled back into view
      }
    });
    observer.observe(section);

    const ball = { x: 300, y: 250, vx: 3.2, vy: 2.5 };
    const mouse = { x: -999, y: -999 };
    let frame;

    function onMouseMove(e) {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    section.addEventListener("mousemove", onMouseMove);

    function tick() {
      if (!isVisible) {
        frame = null; // Pause the physics loop
        return;
      }

      const rect = section.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const v = 1;

      const dx = ball.x - mouse.x;
      const dy = ball.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 144 && dist > 0) {
        const force = 1;
        ball.vx += (dx / dist) * force;
        ball.vy += (dy / dist) * force;
      }

      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > v) { ball.vx = (ball.vx / speed) * v; ball.vy = (ball.vy / speed) * v; }
      if (speed < v && speed > 0) { ball.vx = (ball.vx / speed) * v; ball.vy = (ball.vy / speed) * v; }

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }
      if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy = -Math.abs(ball.vy); }

      // Apply directly to DOM nodes without triggering React re-renders!
      if (ballRef.current) {
        ballRef.current.style.left = `${ball.x - BALL_R}px`;
        ballRef.current.style.top = `${ball.y - BALL_R}px`;
      }
      if (overlayRef.current) {
        const clip = `circle(${BALL_R}px at ${ball.x}px ${ball.y}px)`;
        overlayRef.current.style.clipPath = clip;
        overlayRef.current.style.WebkitClipPath = clip;
      }
      if (navRef.current) {
        const pageX = ball.x + rect.left;
        const pageY = ball.y + rect.top;
        const navClip = `circle(${BALL_R}px at ${pageX}px ${pageY}px)`;
        navRef.current.style.clipPath = navClip;
        navRef.current.style.WebkitClipPath = navClip;
      }

      frame = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      section.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
    };
  }, []);

  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);
  const beforePlain = before.slice(0, Math.min(before.length, luisEnd));
  const beforeBold = before.length > luisEnd ? before.slice(luisEnd) : "";
  const afterPlain = after.length > 0 && before.length < luisEnd
    ? after.slice(0, luisEnd - before.length) : "";
  const afterBold = before.length >= luisEnd
    ? after : after.slice(Math.max(0, luisEnd - before.length));

  const textBlock = (light) => (
    <div className="flex-1">
      <p className="font-mono text-xl tracking-widest uppercase mb-6"
        style={{ color: light ? "#a8a29e" : "#a8a29e" }}>
        Hi there,
      </p>
      <h1 className="font-mono leading-none mb-6" style={{ fontSize: "6.5rem", color: light ? "#f5f5f4" : "#0c0a09" }}>
        I'm <br />
        {done ? (
          <span ref={!light ? nameRef : undefined}>
            {luis}<span className="font-black">Abrantes</span>
          </span>
        ) : (
          <span className="relative inline-block" ref={!light ? nameRef : undefined}>
            <span className="invisible">{luis}<span className="font-black">Abrantes</span></span>
            <span className="absolute inset-0 whitespace-pre">
              {beforePlain}
              <span className="font-black">{beforeBold}</span>
              <span className="inline-block w-[3px] align-middle"
                style={{ height: "0.85em", background: light ? "#f5f5f4" : "#0c0a09", opacity: blink ? 1 : 0, transition: "opacity 0.1s" }} />
              {afterPlain}
              <span className="font-black">{afterBold}</span>
            </span>
          </span>
        )}
      </h1>
      <p className="font-mono text-xl leading-relaxed max-w-xl uppercase"
        style={{ color: light ? "#a8a29e" : "#78716c" }}>
        MSc Student in{" "}
        <span className="font-bold" style={{ color: light ? "#e7e5e4" : "#292524" }}>
          Electrical and Computer Engineering
        </span>{" "}
        at{" "}
        <a href="https://tecnico.ulisboa.pt" target="_blank" rel="noopener noreferrer"
          className="font-bold underline underline-offset-4 transition-all"
          style={{ color: light ? "#e7e5e4" : "#292524", textDecorationColor: light ? "#78716c" : "#a8a29e" }}>
          Instituto Superior Técnico
        </a>
      </p>
      <div className="flex gap-12 mt-8 pointer-events-auto">
        <a
          href="https://linkedin.com/in/luís-abrantes/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono font-bold transition-all duration-300 ${
            light
              ? "bg-stone-100 text-stone-900 hover:bg-stone-300"
              : "bg-stone-900 text-stone-100 hover:bg-stone-700 hover:shadow-lg"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
          </svg>
          LinkedIn
        </a>
        <a
          href="https://github.com/abrantessss"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono font-bold border-2 transition-all duration-300 ${
            light
              ? "border-stone-100 text-stone-100 hover:bg-stone-100 hover:text-stone-900"
              : "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-stone-100"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.17a5.1 5.1 0 0 0-1.4-3.5 4.6 4.6 0 0 0-.1-3.5s-1.1-.35-3.5 1.36a11.5 11.5 0 0 0-6 0C7.1 1.5 6 1.85 6 1.85a4.6 4.6 0 0 0-.1 3.5 5.1 5.1 0 0 0-1.4 3.5c0 5.72 3.35 6.79 6.5 7.17A4.8 4.8 0 0 0 10 18v4"/>
            <path d="M9 18c-4.51 2-5-2-7-2"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );

  return (
    <div>
      {/* Navbar light overlay — clipped to ball, only when not scrolled */}
      <div
        ref={navRef}
        className="fixed top-0 left-0 w-full flex justify-center pt-4 px-4 z-[55] pointer-events-none"
        style={{ clipPath: `circle(0px at -200px -200px)`, WebkitClipPath: `circle(0px at -200px -200px)` }}
      >
      <div className="flex items-center justify-between w-[60%] px-7 py-4 rounded-2xl bg-transparent text-stone-100">
        <span className="font-bold font-mono tracking-tight text-[18px]">
          @abrantess_
        </span>

        <div className="flex items-center gap-25 font-bold">
          <a
            href="#about"
            className="font-mono text-[18px] opacity-75 no-underline"
            style={{ color: "inherit" }}
          >
            About
          </a>
          <a
            href="#projects"
            className="font-mono text-[18px] opacity-75 no-underline"
            style={{ color: "inherit" }}
          >
            Projects
          </a>
        </div>

        <button 
          onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
          className="font-mono text-[18px] border rounded-lg px-3 bg-stone-100 text-stone-950 border-stone-100 cursor-pointer pointer-events-auto hover:opacity-75 transition-opacity"
        >
          Contact me
        </button>
      </div>
    </div>

      <div
        id="intro"
        ref={sectionRef}
        className="min-h-screen bg-stone-100 flex items-center px-20 pt-24 pb-12 relative overflow-hidden gap-16"
      >
        {/* Ball */}
        <div
          ref={ballRef}
          style={{
          position: "absolute",
          width: BALL_R * 2, height: BALL_R * 2,
          borderRadius: "50%",
          background: "#1c1917",
          left: -999, top: -999,
          zIndex: 20, pointerEvents: "none",
        }} />

        {/* Base text */}
        {textBlock(false)}

        {/* Clipped light overlay */}
        <div
          ref={overlayRef}
          style={{
          position: "absolute", inset: 0, zIndex: 25,
          clipPath: `circle(0px at -200px -200px)`, WebkitClipPath: `circle(0px at -200px -200px)`,
          pointerEvents: "none",
          display: "flex", alignItems: "center",
          paddingLeft: "5rem", paddingRight: "5rem",
          paddingTop: "6rem", paddingBottom: "3rem",
          gap: "4rem",
          background: "#1c1917",
        }}>
          {textBlock(true)}
          {/* Photo negative */}
          <div className="flex-shrink-0 self-center px-50" style={{ paddingLeft: "12.5rem" }}>
            <div className="w-86 h-102 rounded-lg overflow-hidden" style={{ boxShadow: "4px 4px 0px #a8a29eaa" }}>
              <img
                src="/SelfTL.png"
                alt="Luís Abrantes"
                className="w-full h-full object-cover"
                style={{ filter: "invert(1)" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          </div>
        </div>

        {/* Photo normal */}
        <div className="relative z-10 flex-shrink-0 self-center px-50">
          <div className="w-86 h-102 rounded-lg overflow-hidden flex items-center justify-center" style={{ boxShadow: "4px 4px 0px #1c1917aa" }}>
            <img
              src="/SelfTL.png"
              alt="Luís Abrantes"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}