import Image from "next/image";
import React from "react";

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {logos.map((logo) => (
        <div key={logo} className="flex justify-center">
          <Image
            src={`/commenditaires/${logo}`}
            alt={logo}
            className="h-14 w-auto"
            width={56}
            height={56}
            priority
          />
        </div>
      ))}
    </div>
  );
};

export default page;
