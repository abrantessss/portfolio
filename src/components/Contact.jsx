import { useState, useEffect, useRef } from "react";

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);
  const [formStatus, setFormStatus] = useState("idle"); // idle, submitting, success, error
  const sectionRef = useRef(null);

  const FULL_TEXT = "Contact Me";

  // Detect when the section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    
    const formData = new FormData(e.target);
    formData.append("access_key", "ef130f82-54f9-42a3-98d6-a6db6eedfa77");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setFormStatus("success");
        e.target.reset(); // Clear the form fields
      } else {
        setFormStatus("error");
      }
    } catch (error) {
      setFormStatus("error");
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="min-h-screen bg-stone-200 px-8 md:px-20 py-24 relative overflow-hidden flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full z-10">
        
        {/* Typewriter Title */}
        <div className="mb-16">
          <h2 className="font-mono text-[10vw] sm:text-5xl md:text-6xl font-bold text-stone-950 whitespace-nowrap">
            <span className="text-stone-500 mr-2">03.</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Information */}
          <div className={`flex flex-col transition-all duration-1000 lg:pt-4 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
            <h3 className="font-mono text-4xl font-bold text-stone-950 mb-6">Let's Connect</h3>
            <p className="text-stone-700 text-xl leading-relaxed mb-12 max-w-md">
              I am currently open to new opportunities and exciting projects. Feel free to reach out if you want to collaborate, have a question, or simply want to connect!
            </p>

            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-5 group cursor-default">
                <div className="w-14 h-14 bg-stone-950 text-stone-100 flex items-center justify-center rounded-2xl group-hover:scale-110 group-hover:bg-stone-800 transition-all duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-mono font-bold uppercase tracking-widest mb-1">Location</p>
                  <p className="text-xl font-medium text-stone-950 hover:text-stone-600 transition-colors">Lisbon, Portugal</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group cursor-default">
                <div className="w-14 h-14 bg-stone-950 text-stone-100 flex items-center justify-center rounded-2xl group-hover:scale-110 group-hover:bg-stone-800 transition-all duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-mono font-bold uppercase tracking-widest mb-1">Phone</p>
                  <a href="tel:+351961831311" className="text-xl font-medium text-stone-950 hover:text-stone-600 transition-colors">+351 961 831 311</a>
                </div>
              </div>

              <div className="flex items-center gap-5 group cursor-default">
                <div className="w-14 h-14 bg-stone-950 text-stone-100 flex items-center justify-center rounded-2xl group-hover:scale-110 group-hover:bg-stone-800 transition-all duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-mono font-bold uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:luis.g.abrantes@gmail.com" className="text-xl font-medium text-stone-950 hover:text-stone-600 transition-colors">luis.g.abrantes@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-stone-200 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-mono text-sm font-bold text-stone-600 uppercase tracking-wider">Name</label>
                <input type="text" id="name" name="Name" required className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all" placeholder="John Doe" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-mono text-sm font-bold text-stone-600 uppercase tracking-wider">Email</label>
                <input type="email" id="email" name="Email" required className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all" placeholder="john@example.com" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="font-mono text-sm font-bold text-stone-600 uppercase tracking-wider">Message</label>
                <textarea id="message" name="Message" required rows="5" className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all resize-none" placeholder="Hello Luís..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={formStatus === "submitting" || formStatus === "success"}
                className={`mt-2 font-mono font-bold text-lg py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  formStatus === "success" 
                    ? "bg-green-600 text-white" 
                    : formStatus === "error"
                    ? "bg-red-600 text-white"
                    : "bg-stone-950 text-stone-100 hover:bg-stone-800 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                }`}
              >
                <span>
                  {formStatus === "submitting" ? "Sending..." : formStatus === "success" ? "Message Sent!" : formStatus === "error" ? "Error! Try Again" : "Send Message"}
                </span>
                {(formStatus === "idle" || formStatus === "error") && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
                {formStatus === "success" && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}