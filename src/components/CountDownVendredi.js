"use client";

import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";

const ZONE_QUEBEC = "America/Toronto"; // fuseau horaire du Québec

function nextFridayNoon(zone = ZONE_QUEBEC) {
  // now in Quebec time
  const now = DateTime.now().setZone(zone);

  // Vendredi = 5 dans Luxon (lun=1, dim=7)
  let target = now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

  // Amener target au prochain vendredi 12:00
  const daysUntilFriday = (5 - now.weekday + 7) % 7; // 0..6
  target = target.plus({ days: daysUntilFriday });

  // Si on est déjà vendredi mais après 12:00, prendre vendredi prochain
  if (daysUntilFriday === 0 && now > target) {
    target = target.plus({ weeks: 1 });
  }

  return target;
}

const CountDownVendredi = () => {
  const [now, setNow] = useState(DateTime.now());
  const target = useMemo(() => nextFridayNoon(), []);

  // Recalcule le temps restant chaque seconde
  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Convertir le "now" au fuseau Québec pour une différence fiable
  const nowQuebec = now.setZone(ZONE_QUEBEC);
  let diff = target
    .diff(nowQuebec, ["days", "hours", "minutes", "seconds"])
    .toObject();

  // Si on a dépassé, repart sur le vendredi suivant automatiquement
  if ((diff.seconds ?? 0) < 0) {
    const next = nextFridayNoon();
    diff = next
      .diff(nowQuebec, ["days", "hours", "minutes", "seconds"])
      .toObject();
  }

  const d = Math.max(0, Math.floor(diff.days ?? 0));
  const h = Math.max(0, Math.floor(diff.hours ?? 0));
  const m = Math.max(0, Math.floor(diff.minutes ?? 0));
  const s = Math.max(0, Math.floor(diff.seconds ?? 0));

  const pad = (n) => String(n).padStart(2, "0");

  if (
    nowQuebec.year === target.year &&
    nowQuebec.month === target.month &&
    nowQuebec.day === target.day &&
    nowQuebec.hour === 12 &&
    nowQuebec.minute === 0
  ) {
    return null;
  }

  return (
    <div className=" flex flex-col items-center gap-2 bg-black text-white   py-10 px-10    shadow-lg">
      <p className="md:text-3xl font-bebas-neue text-lg  text-white text-center">
        Lancement des ventes des billets de match le vendredi à midi!
      </p>
      <div className="flex items-center gap-2  font-bold tracking-wider md:text-5xl font-bebas-neue text-lg">
        <span>{d}</span>
        <span className="text-base font-medium">j</span>
        <span>{pad(h)}</span>
        <span className="text-base font-medium">h</span>
        <span>{pad(m)}</span>
        <span className="text-base font-medium">m</span>
        <span>{pad(s)}</span>
        <span className="text-base font-medium">s</span>
      </div>
    </div>
  );
};

export default CountDownVendredi;
