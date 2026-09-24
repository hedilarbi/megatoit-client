import Link from "next/link";
import React from "react";
import Image from "next/image";
import styles from "@/styles/HomeBanner.module.css";

const HomeBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className={styles.heroBanner}>
        {/* --- MOBILE LAYOUT --- */}
        <div className="md:hidden relative z-10 w-full h-full flex flex-col items-center justify-evenly pb-4 pt-0 px-4">
          <h1 className="inline-flex items-center bg-black/85 border border-brand/50 px-4 py-1.5 sm:py-2.5 rounded-2xl shadow-lg backdrop-blur-sm">
            <span className="font-bebas-neue text-brand tracking-widest text-sm sm:text-lg uppercase text-center leading-tight">
              BSR DE TROIS-RIVIÈRES • BILLETTERIE OFFICIELLE
            </span>
          </h1>
          <Image
            src="/Logo-BSR-haute-resolution.png"
            alt="Logo BSR"
            width={400}
            height={400}
            priority
            className="w-48 sm:w-64 object-contain drop-shadow-xl"
          />
          <div className="flex flex-row flex-wrap justify-center items-center gap-2.5 sm:gap-3">
            <Link
              href="/calendrier"
              className="inline-flex justify-center items-center border-2 border-brand text-black px-4 py-1 min-w-[130px] sm:min-w-[160px] text-base sm:text-lg rounded-lg bg-brand hover:bg-brand-dark transition-all duration-300 hover:shadow-[0_0_20px_rgba(123,253,72,0.6)] transform hover:-translate-y-0.5"
            >
              <span className="font-bebas-neue text-center tracking-wide">
                Billets de match
              </span>
            </Link>
            <Link
              href="https://os.designunik.ca/boutique/bsr?fbclid=IwY2xjawUhArVwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMXNUSUdmSVlUR1NudHpMWXlzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeSHCBFyHxE8qQr9dz6lx-h6wCrPsCTUTZRXnkc_RPrZj8eYIXWoB9QOFNzIc_aem_pwX6aA9Of5eVXaHJlJSyZg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center border-2 border-brand text-white px-4 py-1 min-w-[130px] sm:min-w-[160px] text-base sm:text-lg rounded-lg bg-black/80 hover:bg-brand hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(123,253,72,0.6)] transform hover:-translate-y-0.5 backdrop-blur-sm"
            >
              <span className="font-bebas-neue text-center tracking-wide">
                Boutique en ligne
              </span>
            </Link>
          </div>
          <Image
            src="/Logo-LHSAAAQ-officiel.png"
            alt="Logo LHSAAAQ"
            width={300}
            height={200}
            priority
            className="h-16 sm:h-20 object-contain opacity-90"
          />
        </div>

        {/* --- DESKTOP LAYOUT --- */}
        <div className="hidden md:flex relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 h-full flex-row items-center justify-between py-8">
          
          {/* Gauche : Logo BSR */}
          <div className="flex-shrink-0">
            <Image
              src="/Logo-BSR-haute-resolution.png"
              alt="Logo BSR"
              width={500}
              height={500}
              priority
              className="w-56 lg:w-72 xl:w-80 object-contain drop-shadow-xl"
            />
          </div>

          {/* Centre : H1 et CTAs */}
          <div className="flex flex-col items-center justify-center gap-10 lg:gap-14 px-4">
            <h1 className="inline-flex items-center bg-black/85 border border-brand/50 px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm">
              <span className="font-bebas-neue text-brand tracking-widest text-xl lg:text-2xl xl:text-3xl uppercase text-center leading-tight">
                BSR DE TROIS-RIVIÈRES • BILLETTERIE OFFICIELLE
              </span>
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/calendrier"
                className="inline-flex justify-center items-center border-2 border-brand text-black px-6 lg:px-8 py-2 min-w-[180px] lg:min-w-[220px] text-xl lg:text-2xl rounded-xl bg-brand hover:bg-brand-dark transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,253,72,0.8)] transform hover:-translate-y-1"
              >
                <span className="font-bebas-neue text-center tracking-wide">
                  Billets de match
                </span>
              </Link>
              <Link
                href="https://os.designunik.ca/boutique/bsr?fbclid=IwY2xjawUhArVwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMXNUSUdmSVlUR1NudHpMWXlzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeSHCBFyHxE8qQr9dz6lx-h6wCrPsCTUTZRXnkc_RPrZj8eYIXWoB9QOFNzIc_aem_pwX6aA9Of5eVXaHJlJSyZg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center border-2 border-brand text-white px-6 lg:px-8 py-2 min-w-[180px] lg:min-w-[220px] text-xl lg:text-2xl rounded-xl bg-black/80 hover:bg-brand hover:text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,253,72,0.8)] transform hover:-translate-y-1 backdrop-blur-sm"
              >
                <span className="font-bebas-neue text-center tracking-wide">
                  Boutique en ligne
                </span>
              </Link>
            </div>
          </div>

          {/* Droite : Logo LHSAAAQ */}
          <div className="flex-shrink-0">
            <Image
              src="/Logo-LHSAAAQ-officiel.png"
              alt="Logo LHSAAAQ"
              width={400}
              height={300}
              priority
              className="h-20 lg:h-28 xl:h-32 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
