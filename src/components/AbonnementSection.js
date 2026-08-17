import React from "react";
import styles from "@/styles/HomeAbonnementSection.module.css"; // Adjust the path as necessary
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
const AbonnementSection = () => {
  return (
    <section className={styles.AbonnementSection}>
      <h2 className="font-bebas-neue md:text-4xl text-3xl text-center text-white">
        Abonnement de saison 2026-27
      </h2>

      <div className="bg-black border-2 border-brand mt-8 mx-auto md:w-1/3 w-full rounded-md py-6 px-8 shadow-[0_12px_40px_rgba(123,253,72,0.18)]">
        <h4 className="text-brand text-2xl mt-10 font-semibold">
          $160 / Saison
        </h4>

        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-brand mr-2" />
          13 matchs de saison régulière
        </p>
        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-brand mr-2" />1 match présaison
        </p>
        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-brand mr-2" />1 consommation gratuite
          par match
        </p>
        <Link
          href="/abonnement-saison"
          className="mt-20 block text-center bg-brand text-black text-xl px-6 py-2 rounded-md hover:bg-brand-dark transition-colors"
        >
          <span className="font-bebas-neue">Achetez maintenant</span>
        </Link>
      </div>
    </section>
  );
};

export default AbonnementSection;
