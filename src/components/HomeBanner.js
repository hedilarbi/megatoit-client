import Link from "next/link";
import React from "react";
import styles from "@/styles/HomeBanner.module.css"; // Assuming you have a CSS module for styles

const HomeBanner = () => {
  return (
    <section className={styles.heroBanner}>
      <div>
        <h1 className="font-bebas-neue md:text-5xl text-3xl text-white text-center">
          Billeterie en ligne
        </h1>

        <div className="flex flex-col md:flex-row  md:gap-8 gap-4 md:justify-center items-center  mt-8">
          <Link
            href="/calendrier"
            className=" border border-white hover:border-black text-black hover:text-white px-10 text-lg py-1 rounded-md bg-white hover:bg-black  transition-colors   "
          >
            <span className="font-bebas-neue text-center">
              Billets de match
            </span>
          </Link>
          <Link
            href="/abonnement-saison"
            className=" border border-white text-white hover:text-black px-10 text-lg py-1 rounded-md bg-black hover:bg-white  transition-colors  "
          >
            <span className="font-bebas-neue text-center">
              Abonnement de saison 2025-26
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
