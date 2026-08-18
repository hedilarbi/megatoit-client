import Link from "next/link";
import React from "react";
import styles from "@/styles/HomeBanner.module.css";

const HomeBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className={styles.heroBanner}>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center h-full flex flex-col items-center pt-2 md:pt-4">
          
          {/* H1 badge pill element */}
          <h1 className="inline-flex items-center bg-black/85 border border-brand/50 px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
            <span className="font-bebas-neue text-brand tracking-widest text-[11px] sm:text-base md:text-xl uppercase whitespace-nowrap">
              BSR DE TROIS-RIVIÈRES • BILLETTERIE OFFICIELLE
            </span>
          </h1>

          {/* Action Button shifted down slightly */}
          <div className="my-auto translate-y-4 md:translate-y-7 flex justify-center items-center">
            <Link
              href="/calendrier"
              className="inline-block border-2 border-brand text-black px-10 py-1.5 sm:px-16 md:px-24 md:py-2 min-w-[240px] sm:min-w-[300px] md:min-w-[380px] text-lg md:text-2xl rounded-xl bg-brand hover:bg-brand-dark transition-all duration-300 shadow-[0_0_25px_rgba(123,253,72,0.5)] hover:shadow-[0_0_40px_rgba(123,253,72,0.8)] transform hover:-translate-y-0.5"
            >
              <span className="font-bebas-neue text-center tracking-wide">
                Billets de match
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
