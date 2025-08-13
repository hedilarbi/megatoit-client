import Image from "next/image";
import React from "react";
import styles from "@/styles/MatchsBanner.module.css";
const page = () => {
  const logos = [
    "antidote.jpeg",
    "Atelier-QG.png",
    "Courteau.png",
    "Groupe-chantier-lesage.png",
    "GroupeCTR.png",
    "HE.png",
    "Mega-toit.png",
    "PP_gradient_fondblanc.png",
    "immo3r.jpg",
    "MaisonDebauche.png",
    "Sévignyepoxy.png",
    "SPHERE.png",
  ];
  return (
    <div className="pb-20">
      <section className={styles.banner}>
        <div>
          <h1 className="font-bebas-neue md:text-6xl text-3xl text-white text-center">
            NOS PARTENAIRES
          </h1>
        </div>
      </section>
      <div className="grid grid-cols-2 md:grid-cols-3  gap-14 p-4 mt-10">
        {logos.map((logo) => (
          <div key={logo} className="flex justify-center">
            <Image
              src={`/commenditaires/${logo}`}
              alt={logo}
              className=" w-auto"
              width={100}
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
