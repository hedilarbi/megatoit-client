// import AbonnementContent from "@/components/AbonnementContent";
// import AbonnementsBanner from "@/components/AbonnementsBanner";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="bg-[#F8F8F8]">
      {/* <AbonnementsBanner />
      <AbonnementContent /> */}

      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center"></div>
      <h1 className="text-2xl font-semibold mb-4">
        Désolé — ce n&apos;est plus disponible
      </h1>
      <p className="text-gray-600 mb-6">
        Cette offre n&apos;est plus disponible actuellement.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Accueil
        </Link>
        <a
          href="/contact"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          Nous contacter
        </a>
      </div>
    </div>
  );
};

export default page;
