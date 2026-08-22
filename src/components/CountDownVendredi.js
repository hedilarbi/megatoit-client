// src/components/CountDownVendredi.js
"use client";

import { useEffect, useState } from "react";
import { DateTime } from "luxon";

const ZONE_QUEBEC = "America/Toronto"; // fuseau horaire du Québec

// Date d'ouverture : instant fixe ancré sur l'heure du Québec.
const TARGET = DateTime.fromObject(
  { year: 2026, month: 9, day: 25, hour: 20, minute: 0, second: 0, millisecond: 0 },
  { zone: ZONE_QUEBEC }
);

const LABEL = "MATCH D'OUVERTURE : VENDREDI 25 SEPTEMBRE À 20H00";

const TARGET_MS = TARGET.toMillis();

function remaining() {
  const totalSeconds = Math.floor((TARGET_MS - Date.now()) / 1000);
  if (totalSeconds <= 0) return null; // ouverture passée

  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

const CountDownVendredi = () => {
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setMounted(true);

    const tick = () => {
      const value = remaining();
      if (!value) {
        setExpired(true);
        return;
      }
      setLeft(value);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  const renderSkeleton = () => (
    <div className="flex items-center justify-center gap-1 md:gap-4 font-bold tracking-wider md:text-5xl text-2xl font-bebas-neue text-brand w-full max-w-full">
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center">
          0
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Jours</span>
      </div>
      <span className="text-brand/50 pb-4 md:pb-6 text-xl md:text-4xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center">
          00
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Heures</span>
      </div>
      <span className="text-brand/50 pb-4 md:pb-6 text-xl md:text-4xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center">
          00
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Minutes</span>
      </div>
      <span className="text-brand/50 pb-4 md:pb-6 text-xl md:text-4xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center">
          00
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Secondes</span>
      </div>
    </div>
  );

  const renderLive = () => (
    <div className="flex items-center justify-center gap-1 md:gap-4 font-bold tracking-wider md:text-5xl text-2xl font-bebas-neue text-brand w-full max-w-full">
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center transition-all duration-300">
          {left.d}
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Jours</span>
      </div>
      <span className="text-brand/50 pb-4 md:pb-6 text-xl md:text-4xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center transition-all duration-300">
          {pad(left.h)}
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Heures</span>
      </div>
      <span className="text-brand/50 pb-4 md:pb-6 text-xl md:text-4xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center transition-all duration-300">
          {pad(left.m)}
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Minutes</span>
      </div>
      <span className="text-brand/50 pb-4 md:pb-6 text-xl md:text-4xl">:</span>
      <div className="flex flex-col items-center">
        <span className="bg-black/85 border border-brand/50 px-2 py-2 md:px-6 md:py-4 rounded-xl shadow-[0_0_15px_rgba(123,253,72,0.4)] backdrop-blur-sm min-w-[55px] md:min-w-[90px] text-center transition-all duration-300">
          {pad(left.s)}
        </span>
        <span className="text-[10px] md:text-sm font-lato font-medium mt-1 md:mt-2 text-white/80 tracking-widest uppercase">Secondes</span>
      </div>
    </div>
  );

  if (expired && mounted) {
    return null;
  }

  return (
    <div className="w-[95%] md:w-full max-w-5xl mx-auto relative py-6 md:py-10 px-2 md:px-4 overflow-hidden bg-[#0a0a0a] border border-brand/40 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 w-full">
        <h2 className="inline-flex items-center bg-black/85 border border-brand/50 px-6 py-2 md:py-3 rounded-2xl shadow-[0_0_20px_rgba(123,253,72,0.2)] backdrop-blur-sm">
          <span className="font-bebas-neue text-brand tracking-widest text-lg sm:text-xl md:text-3xl uppercase text-center leading-tight">
            {LABEL}
          </span>
        </h2>
        
        <div role="timer" aria-live="off" suppressHydrationWarning>
          {!mounted ? renderSkeleton() : renderLive()}
        </div>
      </div>
    </div>
  );
};

export default CountDownVendredi;
