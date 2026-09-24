import Link from "next/link";
import React from "react";

const CtaBoutique = () => {
  return (
    <section className="w-[95%] mx-auto p-8 bg-black border-l-4 border-brand rounded-md flex md:flex-row flex-col gap-8 justify-between items-center mt-12">
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
        href="https://os.designunik.ca/boutique/bsr?fbclid=IwY2xjawUhArVwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMXNUSUdmSVlUR1NudHpMWXlzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeSHCBFyHxE8qQr9dz6lx-h6wCrPsCTUTZRXnkc_RPrZj8eYIXWoB9QOFNzIc_aem_pwX6aA9Of5eVXaHJlJSyZg"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brand hover:bg-brand-dark transition-colors rounded-md text-black px-12 py-2 font-bebas-neue text-lg text-center"
      >
        Aller à la boutique
      </Link>
    </section>
  );
};

export default CtaBoutique;
