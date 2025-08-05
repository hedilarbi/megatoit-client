import React from "react";
import styles from "@/styles/CallToActionBanner.module.css"; // Assuming you have a CSS module for styling
import Link from "next/link";
const CallToActionBanner = () => {
  return (
    <section className={styles.ctaBanner}>
      <h2 className="font-bebas-neue md:text-4xl text-2xl text-center text-white">
        Prêt à vivre l&apos;expérience Avec Megatoit hockey?
      </h2>
      <p className="font-lato  text-center md:text-lg text-base mt-2 text-white">
        Rejoignez des milliers de fans pour encourager notre équipe cette saison
        !
      </p>
      <div className="flex justify-center">
        <Link
          href={"/matchs"}
          className="mt-8  text-center bg-white text-black text-xl px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <span className="font-bebas-neue">Acheter des tickets</span>
        </Link>
      </div>
    </section>
  );
};

export default CallToActionBanner;
