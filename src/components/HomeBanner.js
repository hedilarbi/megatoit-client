import Link from "next/link";
import React from "react";
import styles from "@/styles/HomeBanner.module.css";

const HomeBanner = () => {
  return (
    <>
      <section className="relative">
        <div className={styles.heroBanner}>
          <div>
            <h1 className="font-bebas-neue md:text-7xl text-5xl text-white text-center tracking-wider">
              BILLETTERIE en ligne
            </h1>

            <div className="flex flex-col md:flex-row md:gap-8 gap-4 md:justify-center items-center mt-10">
              <Link
                href="/calendrier"
                className="border-2 border-brand text-black px-12 py-3 text-2xl rounded-lg bg-brand hover:bg-brand-dark transition-colors shadow-lg"
              >
                <span className="font-bebas-neue text-center tracking-wide">
                  Billets de match
                </span>
              </Link>
              <Link
                href="https://megatoit.atelierqg.com/"
                target="_blank"
                className="border-2 border-brand text-brand hover:text-black px-12 py-3 text-2xl rounded-lg bg-black hover:bg-brand transition-colors shadow-lg"
              >
                <span className="font-bebas-neue text-center tracking-wide">
                  Boutique en ligne
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeBanner;
