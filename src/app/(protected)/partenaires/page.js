import Image from "next/image";
import React from "react";
import styles from "@/styles/MatchsBanner.module.css";
const page = () => {
  const logos = [
    "LSC.jpeg",
    "01_SPB_Equipements.png",
    "02_Equipe_Bruneau_Cote_REMAX.png",
    "03_Rooftop_Trois-Rivieres.png",
    "04_Godcher_Racing_Team.png",
    "05_Fugere_St-Louis_CPA.png",
    "06_Joyal_et_Fils.png",
    "07_Sherwin-Williams.png",
    "08_Peinture_Robert_Dupont.png",
    "09_Casse-Croute_Courteau.png",
    "immo3r.jpg",
    "11_Sphere_Extermination.png",
    "10_Phylexpert.png",
    "designunik.jpeg",
  ];
  return (
    <div className="pb-20">
      <section className={styles.banner}>
        <div>
          <h1 className="font-bebas-neue md:text-6xl text-3xl text-white text-center">
            NOS PRÉCIEUX PARTENAIRES
          </h1>
        </div>
      </section>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-14 px-14 mt-10 items-center justify-between ">
        {logos.map((logo) => (
          <div key={logo} className="flex justify-center items-center">
            <Image
              src={`/Logos_PNG_Fond_Blanc/${logo}`}
              alt={logo}
              className={`w-auto object-contain ${logo === '10_Phylexpert.png' ? 'h-12' : 'h-16'}`}
              width={250}
              height={100}
              priority
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
