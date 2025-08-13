import React from "react";
import styles from "@/styles/MatchsBanner.module.css";
const AbonnementsBanner = () => {
  return (
    <section className={styles.banner}>
      <div>
        <h1 className="font-bebas-neue md:text-5xl text-3xl text-white text-center">
          Abonnements de saison
        </h1>
        <p className="text-white text-center  font-lato md:text-lg text-base mt-4 font-semibold w-[80%] mx-auto">
          Ne ratez pas l’intensité – Procurez-vous votre abonnement de saison
          2025-26 dès aujourd’hui !
        </p>
      </div>
    </section>
  );
};

export default AbonnementsBanner;
