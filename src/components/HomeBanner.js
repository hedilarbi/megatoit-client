import Link from "next/link";
import React from "react";
import styles from "@/styles/HomeBanner.module.css"; // Assuming you have a CSS module for styles

const HomeBanner = () => {
  return (
    <section className={styles.heroBanner}>
      <div>
        <h1 className="font-bebas-neue md:text-5xl text-3xl text-white text-center">
          Billeterie officielle <br /> megatoit hockey
        </h1>
        <p className="text-white text-center  font-lato md:text-lg text-base mt-4 font-semibold w-[80%] mx-auto">
          Plongez dans l’intensité du hockey professionnel. Obtenez vos billets
          dès maintenant pour la saison la plus captivante jamais vue.
        </p>
        <div className="flex flex-col md:flex-row  md:gap-8 gap-4 md:justify-center items-center  mt-8">
          <Link
            href="/matchs"
            className=" border border-white hover:border-black text-black hover:text-white px-10 text-lg py-1 rounded-md bg-white hover:bg-black  transition-colors   "
          >
            <span className="font-bebas-neue text-center">
              Acheter des billets
            </span>
          </Link>
          <Link
            href="/abonnements"
            className=" border border-white text-white hover:text-black px-10 text-lg py-1 rounded-md bg-black hover:bg-white  transition-colors  "
          >
            <span className="font-bebas-neue text-center">
              Abonnement de saison
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
