import React from "react";
import styles from "@/styles/MatchsBanner.module.css"; // Assuming you have a CSS module for styles

const MatchsBanner = () => {
  return (
    <section className={styles.banner}>
      <div>
        <h1 className="font-bebas-neue md:text-5xl text-3xl text-white text-center">
          Matchs à venir
        </h1>
        <p className="text-white text-center  font-lato md:text-lg text-base mt-4 font-semibold w-[80%] mx-auto">
          Réservez vos billets pour les prochains matchs de l&apos;équipe
          Megatoit et vivez des moments inoubliables
        </p>
      </div>
    </section>
  );
};

export default MatchsBanner;
