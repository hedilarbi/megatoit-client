"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
const Commenditaires = () => {
  const logos = [
    "antidote.jpeg",
    "Atelier-QG.png",
    "Courteau.png",
    "Groupe-chantier-lesage.png",
    "GroupeCTR.png",
    "HE.png",
    "Mega-toit.png",
    "PP_gradient_fondblanc.png",
    "immo3r.jpg",
    "MaisonDebauche.png",
    "Sévignyepoxy.png",
    "SPHERE.png",
  ];

  // 1 logo sur mobile, 4 sur desktop
  const [visibleSlides, setVisibleSlides] = useState(1);
  useEffect(() => {
    const update = () => setVisibleSlides(window.innerWidth >= 768 ? 4 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = logos.length - visibleSlides;
  const [currentIndex, setCurrentIndex] = useState(0);

  // navigation manuelle
  const prevSlide = () => setCurrentIndex((i) => (i === 0 ? maxIndex : i - 1));
  const nextSlide = () => setCurrentIndex((i) => (i === maxIndex ? 0 : i + 1));

  // autoplay : on passe au slide suivant toutes les 2 sec
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((i) => (i === maxIndex ? 0 : i + 1));
    }, 2000);
    return () => clearInterval(intervalId);
  }, [maxIndex]);

  // calcul du décalage : 1 slide = 100/visibleSlides %
  const shift = (currentIndex * 100) / visibleSlides;

  return (
    <div className="mt-20">
      <h2 className="text-center md:text-4xl text-3xl font-bebas-neue  mb-6">
        Nos Commenditaires
      </h2>
      <div className="carousel-container">
        <button className="nav left" onClick={prevSlide}>
          <FaChevronLeft />
        </button>
        <div className="carousel-window">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${shift}%)` }}
          >
            {logos.map((file, i) => (
              <div className="slide" key={i}>
                <Image
                  src={`/commenditaires/${file}`}
                  alt={`Logo ${i + 1}`}
                  width={160}
                  height={160}
                  style={{
                    objectFit: "contain",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <button className="nav right" onClick={nextSlide}>
          <FaChevronRight />
        </button>

        <style jsx>{`
          .carousel-container {
            position: relative;
            width: 100%;
            max-width: 1200px;
            margin: auto;
            display: flex;
            align-items: center;
            padding: 0 1rem;
          }
          .carousel-window {
            overflow: hidden;
            width: 100%;
          }
          .carousel-track {
            display: flex;
            transition: transform 0.5s ease-in-out;
          }
          .slide {
            flex: 0 0 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
          }
          @media (min-width: 768px) {
            .slide {
              flex: 0 0 25%;
            }
          }
          .nav {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            user-select: none;
            z-index: 1;
          }
          .nav.left {
            margin-right: 0.5rem;
          }
          .nav.right {
            margin-left: 0.5rem;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Commenditaires;
