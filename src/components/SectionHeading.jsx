/**
 * Numbered section heading whose title types itself in when scrolled into view.
 *
 * The typing and the caret are CSS animations (see `.typewriter` in index.css),
 * so this renders once and then costs nothing — no interval, no state per
 * character.
 */
export default function SectionHeading({ number, title, isVisible }) {
  // Stop the caret shortly after the last character lands.
  const blinks = Math.ceil((title.length * 0.13 + 0.7) / 1.06);

  return (
    <div className="mb-12">
      <h2 className="font-mono text-[10vw] sm:text-5xl md:text-6xl font-bold text-stone-950 whitespace-nowrap">
        <span className="text-stone-400 mr-2">{number}</span>
        <span
          className={`typewriter ${isVisible ? "typewriter--run" : ""}`}
          style={{ "--n": title.length, "--blinks": blinks }}
        >
          {title}
        </span>
      </h2>
      <div
        className={`w-full h-px bg-stone-300 mt-8 transition-transform duration-700 origin-left ${
          isVisible ? "scale-x-100 delay-100" : "scale-x-0"
        }`}
      />
    </div>
  );
}
