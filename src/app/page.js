"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const target = new Date("2025-10-31T16:30:00").getTime(); // Oct 31 2025 1:00 PM

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setIsLive(true);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({ d, h, m, s });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 drop-shadow-lg animate-fadeIn">
          CSBS Class Portal
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl font-light mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
          Your hub for{" "}
          <span className="font-bold text-yellow-300">communication</span>,{" "}
          <span className="font-bold text-pink-300">study materials</span>, and{" "}
          <span className="font-bold text-cyan-300">announcements</span>.
        </p>

        {/* Countdown or Live */}
        {isLive ? (
          <div className="flex flex-col items-center space-y-6 animate-fadeIn">
            <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              We Are Live!
            </p>
            <a
              href="#"
              className="px-10 py-4 bg-white text-purple-700 font-bold rounded-full shadow-xl hover:scale-105 transition-all duration-300"
            >
              Enter Portal
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto animate-fadeInUp">
            {["d", "h", "m", "s"].map((unit) => (
              <div
                key={unit}
                className="group relative p-6 md:p-8 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50"
              >
                <div className="text-4xl md:text-5xl font-bold text-white">
                  {String(timeLeft[unit]).padStart(2, "0")}
                </div>
                <div className="mt-2 text-sm md:text-base uppercase tracking-wider text-white/70">
                  {unit === "d" ? "Days" : unit === "h" ? "Hours" : unit === "m" ? "Minutes" : "Seconds"}
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            ))}
          </div>
        )}

        {/* Launch info */}
        <p className="mt-12 text-base md:text-lg text-white/80">
          Launching on{" "}
          <span className="font-bold text-yellow-300">
            October 31, 2025 at 4:30 PM
          </span>{" "}
          🎉
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-white/50 text-xs md:text-sm">
        © {new Date().getFullYear()} CSBS Department • Built with ❤️ using Next.js & Tailwind
      </footer>
    </main>
  );
}