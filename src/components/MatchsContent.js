"use client";
import { getAllMatchsList } from "@/services/match.service";

import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png";
import { MdPinDrop } from "react-icons/md";
import Link from "next/link";
const MatchsContent = () => {
  const [matchs, setMatchs] = useState([]);
  const [matchsList, setMatchsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState("Tous");
  const fetchMatchs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMatchsList();

      if (response.success) {
        setMatchsList(response.data);
      } else {
        setError(response.error);
        console.error("Error fetching matchs:", response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching matchs:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;

    const date = new Date(milliseconds);

    const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const str = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Etc/GMT-1", // ← freeze at UTC
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    return {
      dayName,
      date: str,
    };
  };

  useEffect(() => {
    fetchMatchs();
  }, []);

  useEffect(() => {
    if (type === "Tous") {
      setMatchs(matchsList);
    } else {
      const filteredMatchs = matchsList.filter((match) => match.type === type);
      setMatchs(filteredMatchs);
    }
  }, [type, matchsList]);

  return (
    <section className="w-[95%] mx-auto bg-[#E7E7E7] ">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          <p>Erreur lors du chargement des matchs : {error}</p>
        </div>
      ) : (
        <div>
          <div className="bg-white flex items-center px-4 py-4 border border-black font-bebas-neue text-lg">
            <button
              onClick={() => setType("Tous")}
              className={`cursor-pointer ${type === "Tous" ? "underline" : ""}`}
            >
              Tous les matchs
            </button>

            <button
              className={`ml-4 cursor-pointer ${
                type === "Domicile" ? "underline" : ""
              }`}
              onClick={() => setType("Domicile")}
            >
              Matchs à domicile
            </button>
            <button
              className={`ml-4 cursor-pointer ${
                type === "Éxtérieur" ? "underline" : ""
              }`}
              onClick={() => setType("Éxtérieur")}
            >
              Matchs à l&apos;extérieur
            </button>
          </div>
          <div className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-4">
            {matchs.map((match) => {
              const { dayName, date } = formatDate(match.date);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-black py-4 rounded-t-md">
                    <p className="font-lato text-center text-white font-semibold ">
                      {dayName}, {date}
                    </p>
                  </div>
                  <div className="px-4 mt-6">
                    <div
                      className={`flex justify-between items-center ${
                        match.type === "Domicile" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          match.type === "Domicile" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Image src={Logo} alt="Logo" className="h-12 w-12 " />
                        <h3 className="font-bebas-neue text-xl text-black">
                          Megatoit
                        </h3>
                      </div>
                      <p className="font-bebas-neue text-xl text-black">VS</p>
                      <div
                        className={`flex items-center gap-2 ${
                          match.type === "Domicile" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <h3 className="font-bebas-neue text-xl text-black">
                          {match.opponent.name}
                        </h3>
                        <Image
                          src={match.opponent.imageUrl}
                          alt="Logo"
                          className="h-12 w-12 "
                          width={48}
                          height={48}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center px-4">
                    <p className="font-lato text-gray-600 text-sm md:text-base">
                      <MdPinDrop className="inline mr-1" size={24} />
                      {match.place}
                    </p>
                  </div>
                  <div className="flex  justify-between px-4 mt-4">
                    <p className="font-lato text-black rounded-md bg-[#D9D9D9] px-4 py-1 md:text-base text-sm ">
                      {match.type}
                    </p>
                    {match.category !== "Ligue" && (
                      <p className="font-lato text-black rounded-md bg-[#D9D9D9] px-4 py-1 md:text-base text-sm ">
                        {match.category}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-center px-4">
                    {/* {match.type === "Domicile" && (
                      <p className="font-bebas-neue text-black text-xl">
                        $ {match.price.toFixed(2)}
                      </p>
                    )} */}
                  </div>
                  {match.type === "Domicile" && (
                    <Link
                      href={`/calendrier/${match.id}`}
                      className="block text-center bg-black text-white font-bebas-neue py-2 rounded-md mx-4 hover:bg-gray-800 transition-colors duration-300 mt-4 mb-6"
                    >
                      Achetez vos billets
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default MatchsContent;
