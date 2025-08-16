import Link from "next/link";
import React from "react";

const CtaMatchsBanner = () => {
  return (
    <section className="w-[95%] mx-auto p-8 bg-black rounded-b-md flex md:flex-row flex-col gap-8 justify-between items-center  ">
      <div>
        <h2 className="text-white font-bebas-neue text-2xl">
          ABONNEZ-VOUS POUR LA SAISON
        </h2>
        <p className="text-white font-lato text-lg mt-2">
          Accédez à tous les matchs réguliers et bénéficiez d&apos;avantages
          exclusifs
        </p>
      </div>
      <Link
        href={"/abonnements"}
        className="bg-white rounded-md text-black px-12 py-2  font-bebas-neue text-lg text-center"
      >
        Achetez un abonnement
      </Link>
    </section>
  );
};

export default CtaMatchsBanner;
