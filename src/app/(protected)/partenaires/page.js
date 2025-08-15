import Image from "next/image";
import React from "react";
import styles from "@/styles/MatchsBanner.module.css";
const page = () => {
  const logos = [
    "Antidote.jpg",
    "AtelierQG.jpg",
    "Courteau.jpg",
    "GroupeChartierLesage.jpg",
    "GroupeCTR.jpg",
    "HE.jpg",
    "immo3r.jpg",
    "MegaToit.jpg",
    "PowerPlay.jpg",
    "MaisonDebauche.jpg",
    "SevignyEpoxy.jpg",
    "SphereExtermination.jpg",
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-14 px-14 mt-10 items-center justify-between ">
        {logos.map((logo) => (
          <div key={logo} className="flex justify-center items-center">
            <Image
              src={`/commenditaires/${logo}`}
              alt={logo}
              className="w-auto h-auto  object-contain"
              width={180}
              height={50}
              priority
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
