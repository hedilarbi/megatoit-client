"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

const LOGOS = [
  { src: "/commenditaires/GroupeCTR.jpg", alt: "Groupe CTR" },
  { src: "/commenditaires/immo3r.jpg", alt: "Immo3R" },
  { src: "/commenditaires/MaisonDebauche.jpg", alt: "Maison Debauche" },
  { src: "/commenditaires/HE.jpg", alt: "HE" },
  { src: "/commenditaires/MegaToit.jpg", alt: "Mega Toit" },
  { src: "/commenditaires/SphereExtermination.jpg", alt: "Sphere" },
];

export default function SponsorsBar() {
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    // --- config ---
    const SPEED_PX_PER_SEC = 40; // adjust if you want
    const EDGE_PAUSE_MS = 1200;

    // --- state ---
    let rafId = 0;
    let direction = 1; // 1 -> right, -1 -> left
    let lastTs = 0;
    let maxScroll = 0;
    let pauseUntil = 0;
    let isInteracting = false;

    // Ensure we don't fight browser momentum scrolling
    box.style.scrollBehavior = "auto";
    // Slightly reduce iOS inertia effect
    box.style.webkitOverflowScrolling = "auto";

    const measure = () => {
      const newMax = Math.max(0, box.scrollWidth - box.clientWidth);
      maxScroll = newMax;
      if (box.scrollLeft > maxScroll) box.scrollLeft = maxScroll;
    };

    // Recompute when layout/content changes
    const ro = new ResizeObserver(measure);
    ro.observe(box);

    // Recompute once images have loaded
    const imgs = box.querySelectorAll("img");
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", measure, { once: true });
    });

    // Initial measure after a tick (lets Next/Image lay out)
    const initialMeasure = requestAnimationFrame(measure);

    // Pause on user interaction; resume after
    const onPointerDown = () => {
      isInteracting = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const onPointerUp = () => {
      isInteracting = false;
      lastTs = 0; // reset time step
      pauseUntil = performance.now() + EDGE_PAUSE_MS; // small grace pause
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      // If the user is scrolling, keep animation paused and resync naturally
      if (isInteracting) lastTs = 0;
    };

    box.addEventListener("pointerdown", onPointerDown, { passive: true });
    box.addEventListener("pointerup", onPointerUp, { passive: true });
    box.addEventListener("pointercancel", onPointerUp, { passive: true });
    box.addEventListener("scroll", onScroll, { passive: true });

    const tick = (ts) => {
      if (isInteracting) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Edge pauses
      if (ts < pauseUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000; // seconds
      lastTs = ts;

      // Advance by time-based speed
      const next = box.scrollLeft + direction * SPEED_PX_PER_SEC * dt;

      if (next <= 0) {
        box.scrollLeft = 0;
        direction = 1;
        pauseUntil = ts + EDGE_PAUSE_MS;
      } else if (next >= maxScroll) {
        box.scrollLeft = maxScroll;
        direction = -1;
        pauseUntil = ts + EDGE_PAUSE_MS;
      } else {
        box.scrollLeft = next;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(initialMeasure);
      ro.disconnect();
      box.removeEventListener("pointerdown", onPointerDown);
      box.removeEventListener("pointerup", onPointerUp);
      box.removeEventListener("pointercancel", onPointerUp);
      box.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white text-white py-4 shadow-md">
      {/* Mobile: auto ping-pong with pauses */}
      <div
        className="md:hidden overflow-x-auto scrollbar-none px-4 touch-pan-x select-none"
        ref={boxRef}
      >
        <div className="flex gap-3 items-center">
          {LOGOS.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              className="w-auto h-10"
              width={200}
              height={100}
              priority
            />
          ))}
        </div>
      </div>

      {/* Desktop: 6 logos fixed */}
      <div className="hidden md:flex justify-between items-center px-10 py-4">
        {LOGOS.map((logo) => (
          <Image
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            className="h-14 w-auto"
            width={200}
            height={100}
            priority
          />
        ))}
      </div>
    </div>
  );
}
