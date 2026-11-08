import { useState } from "react";
import { useInView } from "../hooks/useInView";
import SectionHeading from "./SectionHeading";

const DETAILS = [
  {
    label: "Location",
    value: "Lisbon, Portugal",
    href: null,
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    label: "Phone",
    value: "+351 961 831 311",
    href: "tel:+351961831311",
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    label: "Email",
    value: "luis.g.abrantes@gmail.com",
    href: "mailto:luis.g.abrantes@gmail.com",
    icon: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
];

export default function Contact() {
  const [sectionRef, isVisible] = useInView({ threshold: 0.05 });
  const [formStatus, setFormStatus] = useState("idle"); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");

    const form = e.target;
    const formData = new FormData(form);
    formData.append("access_key", "ef130f82-54f9-42a3-98d6-a6db6eedfa77");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setFormStatus("success");
        form.reset();
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="min-h-screen bg-stone-200 px-8 md:px-20 py-24 relative overflow-hidden flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full z-10">
        <SectionHeading number="03." title="Contact Me" isVisible={isVisible} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact information */}
          <div
            className={`flex flex-col transition-all duration-1000 lg:pt-4 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            <h3 className="font-mono text-4xl font-bold text-stone-950 mb-6">Let's Connect</h3>
            <p className="text-stone-700 text-xl leading-relaxed mb-12 max-w-md">
              I am currently open to new opportunities and exciting projects. Feel free to reach out
              if you want to collaborate, have a question, or simply want to connect!
            </p>

            <div className="flex flex-col gap-8">
              {DETAILS.map(({ label, value, href, icon }) => (
                <div key={label} className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-stone-950 text-stone-100 flex items-center justify-center rounded-2xl group-hover:scale-110 group-hover:bg-stone-800 transition-all duration-300 shadow-lg shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-mono font-bold uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="text-xl font-medium text-stone-950 hover:text-stone-600 transition-colors break-all">
                        {value}
                      </a>
                    ) : (
                      <p className="text-xl font-medium text-stone-950">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div
            className={`bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-stone-200 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-mono text-sm font-bold text-stone-600 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="Name"
                  required
                  autoComplete="name"
                  className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-mono text-sm font-bold text-stone-600 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="Email"
                  required
                  autoComplete="email"
                  className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="font-mono text-sm font-bold text-stone-600 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  id="message"
                  name="Message"
                  required
                  rows="5"
                  className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all resize-none"
                  placeholder="Hello Luís..."
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === "submitting" || formStatus === "success"}
                className={`mt-2 font-mono font-bold text-lg py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
                  formStatus === "success"
                    ? "bg-green-600 text-white"
                    : formStatus === "error"
                      ? "bg-red-600 text-white"
                      : "bg-stone-950 text-stone-100 hover:bg-stone-800 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                }`}
              >
                <span>
                  {formStatus === "submitting"
                    ? "Sending..."
                    : formStatus === "success"
                      ? "Message Sent!"
                      : formStatus === "error"
                        ? "Error! Try Again"
                        : "Send Message"}
                </span>
                {(formStatus === "idle" || formStatus === "error") && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
                {formStatus === "success" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
