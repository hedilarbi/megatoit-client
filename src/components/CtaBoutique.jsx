import Link from "next/link";
import React from "react";

const CtaBoutique = () => {
  return (
    <section className="w-[95%] mx-auto p-8 bg-black rounded-md flex md:flex-row flex-col gap-8 justify-between items-center  ">
      <div>
        <h2 className="text-white font-bebas-neue text-2xl text-center md:text-left">
          Montre tes couleurs, vis la passion !
        </h2>
        <p className="text-white font-lato text-lg mt-2 text-center md:text-left">
          Équipe-toi comme un vrai supporter ! Découvre les maillots,<br></br>
          accessoires et tenues officielles de ton équipe préférée.
        </p>
      </div>
      <Link
        href="https://megatoit.atelierqg.com/"
        target="_blank"
        className="bg-white rounded-md text-black px-12 py-2  font-bebas-neue text-lg text-center"
      >
        Aller à la boutique
      </Link>
    </section>
  );
};

export default CtaBoutique;
