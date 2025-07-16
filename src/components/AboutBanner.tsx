import React from "react";
import styles from "@/styles/MatchsBanner.module.css"; // Assuming you have a CSS module for styles

const AboutBanner = () => {
  return (
    <section className={styles.banner}>
      <div>
        <h1 className="font-bebas-neue md:text-6xl text-3xl text-white text-center">
          À PROPOS DE <br />
          MEGATOIT
        </h1>
        <p className="text-white text-center  font-lato md:text-xl text-base mt-4 font-semibold w-[80%] mx-auto">
          Découvrez l&apos;histoire, les valeurs et l&apos;esprit d&apos;équipe
          qui font de Megatoit une force redoutable sur la glace
        </p>
      </div>
    </section>
  );
};

export default AboutBanner;
