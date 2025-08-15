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
    if (box) {
      box.scrollLeft = 0; // Reset scroll position
      const scrollWidth = box.scrollWidth - box.clientWidth;
      let scrollAmount = 0;
      let direction = 1; // 1 for right, -1 for left
      const scrollStep = 1; // Smaller step for smoother scroll
      let animationFrame;

      const animateScroll = () => {
        if (direction === 1) {
          if (scrollAmount < scrollWidth) {
            box.scrollLeft += scrollStep;
            scrollAmount += scrollStep;
          } else {
            direction = -1;
          }
        } else {
          if (scrollAmount > 0) {
            box.scrollLeft -= scrollStep;
            scrollAmount -= scrollStep;
          } else {
            direction = 1;
          }
        }
        animationFrame = requestAnimationFrame(animateScroll);
      };

      animationFrame = requestAnimationFrame(animateScroll);

      return () => cancelAnimationFrame(animationFrame); // Cleanup on unmount
    }
  }, []);
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white text-white py-4 shadow-md">
      {/* Mobile: auto ping-pong with pauses */}
      <div
        className="md:hidden  overflow-x-auto scrollbar-none  px-4"
        ref={boxRef}
      >
        <div className=" flex gap-3  items-center ">
          {LOGOS.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              className="w-auto h-14"
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
