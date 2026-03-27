import { useState, useEffect } from "react";

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Navbar */}
      <div className={`fixed top-0 left-0 w-full flex justify-center transition-colors duration-500 z-50 ${scrolled ? "bg-black text-white" : "bg-white text-black"}`}>
        <div className="flex items-center justify-between w-full md:w-[50%] px-10 py-10">
          <span className="flex items-center gap-1 font-bold font-smooch tracking-tight cursor-pointer">
            <span className="text-[30px]">@abrantess_</span>
          </span>
          <div className="flex items-center gap-10 font-bold">
            <span className="font-smooch text-[30px] cursor-pointer opacity-80 hover:opacity-100 transition-opacity">About</span>
            <span className="font-smooch text-[30px] cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Projects</span>
          </div>
          <button className="font-smooch text-[30px] border border-current rounded-lg px-2 cursor-pointer hover:opacity-70 transition-opacity">
            Contact me
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-32">
        <p className="text-gray-400 text-sm tracking-widest uppercase mb-4">Scroll down to see the navbar change</p>
        <div className="w-px h-12 bg-gray-300 animate-bounce" />
      </div>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl font-smooch text-gray-500">Keep scrolling...</p>
      </div>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-2xl font-smooch text-gray-500">You made it to the bottom.</p>
      </div>
    </div>
  );
}