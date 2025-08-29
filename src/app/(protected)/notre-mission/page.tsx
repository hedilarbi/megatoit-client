import AboutBanner from "@/components/AboutBanner";

import React from "react";

import { FaHandRock, FaUsers } from "react-icons/fa";
import { GiTrophyCup } from "react-icons/gi";
import VideoSection from "@/components/VideoSection";
import Link from "next/link";
import { BsFillTicketPerforatedFill } from "react-icons/bs";
import { IoDiamond } from "react-icons/io5";
const page = () => {
  return (
    <div className="pb-20">
      <AboutBanner />
      <div className="mt-14 flex md:flex-row flex-col items-center justify-between gap-4 w-full md:w-[95%] mx-auto px-4">
        <div className="md:w-1/2 w-full">
          <h2 className="font-bebas-neue md:text-5xl text-3xl text-black ">
            Mission de l’équipe – Le Mégatoit de Trois-Rivières
          </h2>
          <p className="mt-4 text-gray-700 font-lato text-lg font-semibold">
            Offrir un hockey compétitif, robuste, spectaculaire et passionnant
            au sein de la LHSAAAQ, en représentant fièrement la ville de
            Trois-Rivières et ses partisans. Soutenus par nos précieux
            partenaires et commanditaires, nous créons un environnement où
            l’excellence sportive et le respect se traduisent autant sur la
            glace que dans la communauté. Ensemble, faisons rayonner notre
            équipe et notre région, tout en offrant une vitrine dynamique à ceux
            qui croient en notre succès. Bonne saison 2025 à tous!
          </p>
        </div>
        <div className="md:w-1/2 w-full">
          <VideoSection />
        </div>
      </div>
      <div className="mt-14 bg-black text-white py-8 px-6  w-full md:w-[95%] mx-auto">
        <h2 className="font-bebas-neue md:text-5xl text-3xl text-center ">
          nos valeurs
        </h2>
        <p className="font-semibold font-lato text-lg mt-4 text-center">
          ROAD TO THE CUP!
        </p>
        <div className="mt-10 flex md:flex-row flex-col md:px-20 justify-center items-center gap-8">
          <div className="flex-1 flex flex-col items-center bg-[#101827] px-4 py-8 rounded-md w-full">
            <div className="bg-white flex p-3 rounded-full justify-center items-center">
              <FaHandRock color="black" size={22} />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              Passion
            </h3>
          </div>
          <div className="flex-1 flex flex-col items-center bg-[#101827] px-4 py-8 rounded-md w-full">
            <div className="bg-white flex p-3 rounded-full justify-center items-center">
              <FaUsers color="black" size={22} />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              Engagement
            </h3>
          </div>
          <div className="flex-1 flex flex-col items-center bg-[#101827] px-4 py-8 rounded-md w-full">
            <div className="bg-white flex p-3 rounded-full justify-center items-center">
              <GiTrophyCup color="black" size={22} />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              Désire de vaincre
            </h3>
          </div>
        </div>
      </div>
      <div className="mt-14   py-8 px-6  w-full md:w-[95%] mx-auto">
        {/* <h2 className="font-bebas-neue md:text-5xl text-3xl text-center ">
          Notre Équipe
        </h2> */}
        {/* <p className="font-semibold font-lato text-lg mt-4 text-center">
          Rencontrez les personnes qui font battre le cœur de Megatoit
        </p> */}
        {/* <div className="mt-10 flex md:flex-row flex-col md:px-20 justify-center items-center gap-8">
          <div className="flex-1 flex flex-col items-center bg-[#f3f4f6] px-4 py-8 rounded-md">
            <div className="bg-white flex w-30 h-30 rounded-full justify-center items-center">
              <Image
                src={Avatar}
                alt="Team Member"
                className="w-full h-full rounded-full"
                width={80}
                height={80}
              />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              John Doe
            </h3>
            <h4 className="font-lato font-bold mt-1 text-lg text-center text-gray-500">
              Entraîneur Principal
            </h4>
            <p className="text-center font-lato mt-3 font-semibold">
              15 ans d&apos;expérience dans le hockey professionnel. Marc guide
              notre équipe avec passion et expertise.
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center bg-[#f3f4f6] px-4 py-8 rounded-md">
            <div className="bg-white flex w-30 h-30 rounded-full justify-center items-center">
              <Image
                src={Avatar}
                alt="Team Member"
                className="w-full h-full rounded-full"
                width={80}
                height={80}
              />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              John Doe
            </h3>
            <h4 className="font-lato font-bold mt-1 text-lg text-center text-gray-500">
              Entraîneur Principal
            </h4>
            <p className="text-center font-lato mt-3 font-semibold">
              15 ans d&apos;expérience dans le hockey professionnel. Marc guide
              notre équipe avec passion et expertise.
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center bg-[#f3f4f6] px-4 py-8 rounded-md">
            <div className="bg-white flex w-30 h-30 rounded-full justify-center items-center">
              <Image
                src={Avatar}
                alt="Team Member"
                className="w-full h-full rounded-full"
                width={80}
                height={80}
              />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              John Doe
            </h3>
            <h4 className="font-lato font-bold mt-1 text-lg text-center text-gray-500">
              Entraîneur Principal
            </h4>
            <p className="text-center font-lato mt-3 font-semibold">
              15 ans d&apos;expérience dans le hockey professionnel. Marc guide
              notre équipe avec passion et expertise.
            </p>
          </div>
        </div> */}
        <div className="mt-14 bg-black text-white py-8 px-6  w-full md:w-[95%] mx-auto">
          <h2 className="font-bebas-neue md:text-5xl text-3xl text-center ">
            Rejoignez l&apos;Aventure Mégatoit
          </h2>
          <p className="font-semibold font-lato text-lg mt-4 text-center">
            Venez encourager notre équipe et vivez l&apos;émotion du hockey
            comme jamais auparavant
          </p>
          <div className="mt-10 flex md:flex-row flex-col md:px-20 justify-center items-center gap-8">
            <Link
              href={"/calendrier"}
              className="bg-black border border-white rounded-md  flex justify-center items-center text-white font-bebas-neue text-xl px-6 py-2  transition-colors gap-3"
            >
              <BsFillTicketPerforatedFill />
              <span>Achetez des billets</span>
            </Link>
            <Link
              href={"/abonnement-saison"}
              className="bg-white border border-black rounded-md  flex justify-center items-center text-black font-bebas-neue text-xl px-6 py-2  transition-colors gap-3"
            >
              <IoDiamond />
              <span>Achetez un abonnement</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
