import React from "react";
import styles from "@/styles/HomeAbonnementSection.module.css"; // Adjust the path as necessary
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
const AbonnementSection = () => {
  return (
    <section className={styles.AbonnementSection}>
      <h2 className="font-bebas-neue md:text-4xl text-3xl text-center text-white">
        Abonement season
      </h2>
      <p className="font-lato  text-center md:text-lg text-base mt-2 text-white">
        Ne ratez pas l’intensité – Procurez-vous votre pass season dès
        aujourd’hui !
      </p>
      <div className="bg-[#101827] border-2 border-white mt-8 mx-auto md:w-1/3 w-full rounded-md py-6 px-8 ">
        <h3 className="text-center font-bebas-neue text-2xl text-white">
          Pass season
        </h3>
        <p className="text-center text-white text-lg mt-2 font-lato">
          Pour les fans ultimes
        </p>

        <h4 className="text-white text-2xl mt-10 font-semibold ">
          $160 / Saison
        </h4>
        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-white mr-2" />
          Tous les matchs à domicile
        </p>
        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-white mr-2" />
          Evenement exclusive
        </p>
        <Link
          href="/abonnement"
          className="mt-20 block text-center bg-white text-black text-xl  px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <span className="font-bebas-neue">Acheter maintenant</span>
        </Link>
      </div>
    </section>
  );
};

export default AbonnementSection;
