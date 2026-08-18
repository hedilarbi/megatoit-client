import Link from "next/link";
import React from "react";
import styles from "@/styles/HomeBanner.module.css";

const HomeBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className={styles.heroBanner}>
        {/* --- MOBILE LAYOUT --- */}
        <div className="md:hidden relative z-10 w-full h-full flex flex-col items-center justify-evenly pb-4 pt-0 px-4">
          <h1 className="inline-flex items-center bg-black/85 border border-brand/50 px-5 py-2 sm:py-3 rounded-2xl shadow-lg backdrop-blur-sm">
            <span className="font-bebas-neue text-brand tracking-widest text-sm sm:text-xl uppercase text-center leading-tight">
              BSR DE TROIS-RIVIÈRES • BILLETTERIE OFFICIELLE
            </span>
          </h1>
          <img
            src="/Logo-BSR-haute-resolution.png"
            alt="Logo BSR"
            className="w-48 sm:w-64 object-contain drop-shadow-xl"
          />
          <Link
            href="/calendrier"
            className="inline-flex justify-center items-center border-2 border-brand text-black px-6 py-1.5 sm:px-10 min-w-[200px] sm:min-w-[240px] text-lg rounded-xl bg-brand hover:bg-brand-dark transition-all duration-300 hover:shadow-[0_0_25px_rgba(123,253,72,0.6)] transform hover:-translate-y-0.5"
          >
            <span className="font-bebas-neue text-center tracking-wide">
              Billets de match
            </span>
          </Link>
          <img
            src="/Logo-LHSAAAQ-officiel.png"
            alt="Logo LHSAAAQ"
            className="h-16 sm:h-20 object-contain opacity-90"
          />
        </div>

        {/* --- DESKTOP LAYOUT --- */}
        <div className="hidden md:flex relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 h-full flex-row items-center justify-between py-8">
          
          {/* Gauche : Logo BSR */}
          <div className="flex-shrink-0">
            <img
              src="/Logo-BSR-haute-resolution.png"
              alt="Logo BSR"
              className="w-56 lg:w-72 xl:w-80 object-contain drop-shadow-xl"
            />
          </div>

          {/* Centre : H1 et CTA */}
          <div className="flex flex-col items-center justify-center gap-12 lg:gap-16 px-4">
            <h1 className="inline-flex items-center bg-black/85 border border-brand/50 px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
              <span className="font-bebas-neue text-brand tracking-widest text-xl lg:text-2xl xl:text-3xl uppercase text-center leading-tight">
                BSR DE TROIS-RIVIÈRES • BILLETTERIE OFFICIELLE
              </span>
            </h1>
            <Link
              href="/calendrier"
              className="inline-flex justify-center items-center border-2 border-brand text-black px-12 py-2 min-w-[280px] lg:min-w-[340px] text-2xl lg:text-3xl rounded-xl bg-brand hover:bg-brand-dark transition-all duration-300 hover:shadow-[0_0_40px_rgba(123,253,72,0.8)] transform hover:-translate-y-1"
            >
              <span className="font-bebas-neue text-center tracking-wide">
                Billets de match
              </span>
            </Link>
          </div>

          {/* Droite : Logo LHSAAAQ */}
          <div className="flex-shrink-0">
            <img
              src="/Logo-LHSAAAQ-officiel.png"
              alt="Logo LHSAAAQ"
              className="h-20 lg:h-28 xl:h-32 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
