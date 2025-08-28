// src/components/CountDownVendredi.js
"use client";

import { useEffect, useState } from "react";
import { DateTime } from "luxon";

const ZONE_QUEBEC = "America/Toronto"; // fuseau horaire du Québec

function nextFridayNoon(zone = ZONE_QUEBEC) {
  const now = DateTime.now().setZone(zone); // maintenant en heure du Québec
  let target = now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

  // Vendredi = 5 dans Luxon (lun=1, dim=7)
  const daysUntilFriday = (5 - now.weekday + 7) % 7; // 0..6
  target = target.plus({ days: daysUntilFriday });

  // Si on est déjà vendredi mais après 12:00, prendre vendredi prochain
  if (daysUntilFriday === 0 && now > target) {
    target = target.plus({ weeks: 1 });
  }
  return target;
}

const CountDownVendredi = () => {
  // ——— Option B: placeholder SSR + activer après le mount ———
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);

    const tick = () => {
      const nowQuebec = DateTime.now().setZone(ZONE_QUEBEC);
      let target = nextFridayNoon();

      // Diff initiale
      let diffObj = target
        .diff(nowQuebec, ["days", "hours", "minutes", "seconds"])
        .toObject();

      // Si on a dépassé, repartir sur le vendredi suivant
      if ((diffObj.seconds ?? 0) < 0) {
        target = nextFridayNoon();
        diffObj = target
          .diff(nowQuebec, ["days", "hours", "minutes", "seconds"])
          .toObject();
      }

      const d = Math.max(0, Math.floor(diffObj.days ?? 0));
      const h = Math.max(0, Math.floor(diffObj.hours ?? 0));
      const m = Math.max(0, Math.floor(diffObj.minutes ?? 0));
      const s = Math.max(0, Math.floor(diffObj.seconds ?? 0));

      setLeft({ d, h, m, s });
    };

    // premier calcul + intervalle
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  // === Rendu SSR / première peinture client : squelette stable (évite mismatch) ===
  if (!mounted) {
    return (
      <div
        className="flex flex-col items-center gap-2 bg-black text-white py-10 px-10 shadow-lg"
        aria-busy="true"
      >
        <p className="md:text-3xl font-bebas-neue text-lg text-white text-center">
          Vendredi 29 Août dès 12h00 : Ouverture de la billetterie!
        </p>
        <div className="flex items-center gap-2 font-bold tracking-wider md:text-5xl font-bebas-neue text-lg">
          <span>0</span>
          <span className="text-base font-medium">j</span>
          <span>00</span>
          <span className="text-base font-medium">h</span>
          <span>00</span>
          <span className="text-base font-medium">m</span>
          <span>00</span>
          <span className="text-base font-medium">s</span>
        </div>
      </div>
    );
  }

  // Cacher le bloc si on est exactement à 0 (optionnel)
  if (left.d === 0 && left.h === 0 && left.m === 0 && left.s === 0) {
    return null;
  }

  // === Rendu live après mount ===
  return (
    <div
      className="flex flex-col items-center gap-2 bg-black text-white py-10 px-10 shadow-lg"
      role="timer"
      aria-live="off"
      suppressHydrationWarning
    >
      <p className="md:text-3xl font-bebas-neue text-lg text-white text-center">
        Vendredi 29 Août dès 12h00 : Ouverture de la billetterie!
      </p>
      <div className="flex items-center gap-2 font-bold tracking-wider md:text-5xl font-bebas-neue text-lg">
        <span>{left.d}</span>
        <span className="text-base font-medium">j</span>
        <span>{pad(left.h)}</span>
        <span className="text-base font-medium">h</span>
        <span>{pad(left.m)}</span>
        <span className="text-base font-medium">m</span>
        <span>{pad(left.s)}</span>
        <span className="text-base font-medium">s</span>
      </div>
    </div>
  );
};

export default CountDownVendredi;
