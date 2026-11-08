import { useEffect, useRef, useState } from "react";

const FULL = "Luís Abrantes";
const PLAIN = "Luís "; // typed in the regular weight; the surname is black
const BALL_R = 144;

/**
 * The hero name types itself out, then walks the caret back to fix "Luis" into
 * "Luís". Too stateful for a CSS animation, so it stays in JS — but it runs
 * once and then stops. The caret blink itself is CSS (see `.caret`).
 */
function useNameAnimation() {
  // Decided once, at mount, so the reduced-motion case starts already finished
  // instead of being corrected by an effect.
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [text, setText] = useState(() => (reduced ? FULL : ""));
  const [cursorPos, setCursorPos] = useState(() => (reduced ? FULL.length : 0));
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const typed = "Luis Abrantes";

    async function run() {
      for (let i = 1; i <= typed.length; i++) {
        if (cancelled) return;
        setText(typed.slice(0, i));
        setCursorPos(i);
        await sleep(70);
      }
      await sleep(1000);
      for (let pos = typed.length; pos > 2; pos--) {
        if (cancelled) return;
        setCursorPos(pos);
        await sleep(80);
      }
      await sleep(200);
      if (cancelled) return;
      setText("Lu" + typed.slice(3));
      setCursorPos(2);
      await sleep(150);
      if (cancelled) return;
      setText(FULL);
      setCursorPos(3);
      await sleep(500);
      if (!cancelled) setDone(true);
    }

    const t = setTimeout(run, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduced]);

  return { text, cursorPos, done };
}

/** True only where the pointer can actually drive the reveal effect. */
function useSupportsReveal() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setSupported(fine.matches && calm.matches);

    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  return supported;
}

export default function Intro() {
  const reveal = useSupportsReveal();
  const { text, cursorPos, done } = useNameAnimation();

  const sectionRef = useRef(null);
  const navRef = useRef(null);
  const ballRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!reveal || !section) return;

    const ball = { x: 300, y: 250, vx: 3.2, vy: 2.5 };
    const mouse = { x: -9999, y: -9999 };

    // Layout is cached and refreshed only when it can actually change, so the
    // animation loop never forces a reflow.
    let left = 0;
    let top = 0;
    let width = 0;
    let height = 0;

    const measure = () => {
      const rect = section.getBoundingClientRect();
      left = rect.left;
      top = rect.top;
      width = rect.width;
      height = rect.height;
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    const onMouseMove = (e) => {
      mouse.x = e.clientX - left;
      mouse.y = e.clientY - top;
    };
    section.addEventListener("mousemove", onMouseMove, { passive: true });

    let visible = true;
    let frame = null;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && frame === null) {
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(section);

    // Remember the last values written so identical frames skip the style
    // write entirely — a clip-path change repaints the whole clipped layer.
    let lastX = null;
    let lastY = null;
    let navCleared = false;

    function tick() {
      if (!visible) {
        frame = null; // pause until the section scrolls back in
        return;
      }

      const dx = ball.x - mouse.x;
      const dy = ball.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < BALL_R && dist > 0) {
        ball.vx += dx / dist;
        ball.vy += dy / dist;
      }

      // Constant speed, direction only.
      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed > 0) {
        ball.vx /= speed;
        ball.vy /= speed;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - BALL_R < 0) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + BALL_R > width) {
        ball.x = width - BALL_R;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - BALL_R < 0) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
      }
      if (ball.y + BALL_R > height) {
        ball.y = height - BALL_R;
        ball.vy = -Math.abs(ball.vy);
      }

      // Whole pixels: sub-pixel clip-path changes repaint for no visible gain.
      const x = Math.round(ball.x);
      const y = Math.round(ball.y);

      if (x !== lastX || y !== lastY) {
        lastX = x;
        lastY = y;

        if (ballRef.current) {
          ballRef.current.style.transform = `translate3d(${x - BALL_R}px, ${y - BALL_R}px, 0)`;
        }
        if (overlayRef.current) {
          overlayRef.current.style.clipPath = `circle(${BALL_R}px at ${x}px ${y}px)`;
        }

        // The navbar is fixed, so its clip is in viewport coordinates. Only
        // repaint it while the circle can actually reach the bar.
        if (navRef.current) {
          const viewportY = y + top;
          if (viewportY < 96 + BALL_R) {
            navRef.current.style.clipPath = `circle(${BALL_R}px at ${x + left}px ${viewportY}px)`;
            navCleared = false;
          } else if (!navCleared) {
            navRef.current.style.clipPath = "circle(0px at -200px -200px)";
            navCleared = true;
          }
        }
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      section.removeEventListener("mousemove", onMouseMove);
    };
  }, [reveal]);

  // Split the typed text around the caret, and around the regular/black boundary.
  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);
  const plainEnd = PLAIN.length;
  const beforePlain = before.slice(0, Math.min(before.length, plainEnd));
  const beforeBold = before.length > plainEnd ? before.slice(plainEnd) : "";
  const afterPlain =
    after.length > 0 && before.length < plainEnd ? after.slice(0, plainEnd - before.length) : "";
  const afterBold =
    before.length >= plainEnd ? after : after.slice(Math.max(0, plainEnd - before.length));

  const textBlock = (light) => (
    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
      <p className="font-mono text-base md:text-lg lg:text-xl tracking-widest uppercase mb-4 md:mb-6 text-stone-400">
        Hi there,
      </p>
      <h1
        className="font-mono mb-4 md:mb-6 text-[11vw] sm:text-[4.5rem] leading-[1.1] md:text-7xl lg:text-[6.5rem] whitespace-nowrap"
        style={{ color: light ? "#f5f5f4" : "#0c0a09" }}
      >
        I'm <br />
        {done ? (
          <span>
            {PLAIN}
            <span className="font-bold">Abrantes</span>
          </span>
        ) : (
          <span className="relative inline-block">
            {/* Invisible full name reserves the final width so nothing reflows. */}
            <span className="invisible" aria-hidden="true">
              {PLAIN}
              <span className="font-bold">Abrantes</span>
            </span>
            <span className="absolute inset-0 whitespace-pre">
              {beforePlain}
              <span className="font-bold">{beforeBold}</span>
              <span className="caret" />
              {afterPlain}
              <span className="font-bold">{afterBold}</span>
            </span>
          </span>
        )}
      </h1>
      <p
        className="font-mono text-sm md:text-lg lg:text-xl leading-relaxed max-w-xl uppercase"
        style={{ color: light ? "#a8a29e" : "#78716c" }}
      >
        MSc Student in{" "}
        <span className="font-bold" style={{ color: light ? "#e7e5e4" : "#292524" }}>
          Electrical and Computer Engineering
        </span>{" "}
        at{" "}
        <a
          href="https://tecnico.ulisboa.pt"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline underline-offset-4 transition-all"
          style={{ color: light ? "#e7e5e4" : "#292524", textDecorationColor: light ? "#78716c" : "#a8a29e" }}
        >
          Instituto Superior Técnico
        </a>
      </p>
      <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-8 lg:gap-12 mt-6 md:mt-8 pointer-events-auto">
        <a
          href="https://linkedin.com/in/luís-abrantes/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono font-bold no-underline transition-all duration-300 ${
            light
              ? "bg-stone-100 text-stone-900 hover:bg-stone-300"
              : "bg-stone-900 text-stone-100 hover:bg-stone-700 hover:shadow-lg"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          LinkedIn
        </a>
        <a
          href="https://github.com/abrantessss"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono font-bold border-2 no-underline transition-all duration-300 ${
            light
              ? "border-stone-100 text-stone-100 hover:bg-stone-100 hover:text-stone-900"
              : "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-stone-100"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.17a5.1 5.1 0 0 0-1.4-3.5 4.6 4.6 0 0 0-.1-3.5s-1.1-.35-3.5 1.36a11.5 11.5 0 0 0-6 0C7.1 1.5 6 1.85 6 1.85a4.6 4.6 0 0 0-.1 3.5 5.1 5.1 0 0 0-1.4 3.5c0 5.72 3.35 6.79 6.5 7.17A4.8 4.8 0 0 0 10 18v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );

  const photoBlock = (light) => (
    <div className="relative z-10 shrink-0 mt-12 lg:mt-0">
      <div
        className="w-64 h-72 md:w-80 md:h-96 lg:w-[344px] lg:h-[408px] rounded-lg overflow-hidden"
        style={{ boxShadow: light ? "4px 4px 0px #a8a29eaa" : "4px 4px 0px #1c1917aa" }}
      >
        <img
          src="/SelfTL-344.webp"
          srcSet="/SelfTL-344.webp 344w, /SelfTL-688.webp 688w"
          sizes="(min-width: 1024px) 344px, (min-width: 768px) 320px, 256px"
          width="344"
          height="408"
          alt={light ? "" : "Luís Abrantes"}
          aria-hidden={light ? "true" : undefined}
          fetchPriority={light ? "low" : "high"}
          decoding="async"
          className="w-full h-full object-cover"
          style={{ filter: light ? "invert(1)" : "none" }}
        />
      </div>
    </div>
  );

  return (
    <div>
      {/* Light copy of the navbar, revealed only where the ball overlaps it. */}
      {reveal && (
        <div
          ref={navRef}
          aria-hidden="true"
          className="fixed top-0 left-0 w-full flex justify-center pt-4 px-4 z-[55] pointer-events-none"
          style={{ clipPath: "circle(0px at -200px -200px)", willChange: "clip-path" }}
        >
          <div className="flex items-center justify-between w-[95%] md:w-[80%] lg:w-[60%] px-5 md:px-7 py-3 md:py-4 rounded-2xl bg-transparent text-stone-100">
            <span className="font-bold font-mono tracking-tight text-base md:text-[18px]">
              @abrantess_
            </span>
            <div className="hidden sm:flex items-center gap-4 md:gap-8 lg:gap-16 font-bold">
              <span className="font-mono text-sm md:text-[18px] opacity-75">About</span>
              <span className="font-mono text-sm md:text-[18px] opacity-75">Projects</span>
            </div>
            <span className="font-mono text-sm md:text-[18px] border rounded-lg px-2 md:px-3 py-1 md:py-1.5 bg-stone-100 text-stone-950 border-stone-100">
              Contact me
            </span>
          </div>
        </div>
      )}

      <div
        id="intro"
        ref={sectionRef}
        className="min-h-screen bg-stone-100 flex items-center justify-center px-6 lg:px-20 pt-28 pb-12 relative overflow-hidden"
      >
        {reveal && (
          <div
            ref={ballRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: BALL_R * 2,
              height: BALL_R * 2,
              borderRadius: "50%",
              background: "#1c1917",
              transform: "translate3d(-9999px, -9999px, 0)",
              willChange: "transform",
              zIndex: 20,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Base (dark-on-light) layer */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-8 lg:gap-16">
          {textBlock(false)}
          {photoBlock(false)}
        </div>

        {/* Inverted layer, revealed through the ball */}
        {reveal && (
          <div
            ref={overlayRef}
            aria-hidden="true"
            className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center px-6 lg:px-20 pt-28 pb-12"
            style={{
              clipPath: "circle(0px at -200px -200px)",
              background: "#1c1917",
              willChange: "clip-path",
              contain: "paint",
            }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-8 lg:gap-16">
              {textBlock(true)}
              {photoBlock(true)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
