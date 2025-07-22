"use client";
import { getAllMatches } from "@/services/match.service";

import React, { useEffect, useState } from "react";
import Spinner from "@/components/spinner/Spinner"; // Assuming you have a Spinner component

import Logo from "@/assets/logo-small.png";
import Image from "next/image";
import { MdPinDrop } from "react-icons/md";
import Link from "next/link";
const MatchsList = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatchs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMatches();
      if (response.success) {
        setMatchs(response.data?.slice(0, 3) || []);
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
    const time = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedDateShort = date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    return {
      dayName,
      date: formattedDateShort,
      time,
    };
  };

  useEffect(() => {
    fetchMatchs();
  }, []);

  return (
    <section className="md:px-8 px-4 w-full py-12">
      <h2 className="font-bebas-neue md:text-4xl text-2xl text-center">
        Prochains matchs
      </h2>
      <p className="font-lato text-[#7F7F7F] text-center md:text-lg text-base mt-2">
        Ne manquez pas l&apos;action – Réservez vos places dès maintenant !
      </p>

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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchs.map((match) => {
              const { dayName, date, time } = formatDate(match.date);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-black py-4 rounded-t-md">
                    <p className="font-lato text-center text-white font-semibold ">
                      {dayName}, {date} à {time}
                    </p>
                  </div>
                  <div className="px-4 mt-6">
                    <div className="flex justify-between items-center ">
                      <div className="flex items-center gap-2">
                        <Image src={Logo} alt="Logo" className="h-12 w-12 " />
                        <h3 className="font-bebas-neue text-xl text-black">
                          Megatoit
                        </h3>
                      </div>
                      <p className="font-bebas-neue text-xl text-black">VS</p>
                      <div className="flex items-center gap-2">
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
                    <p className="font-lato text-black rounded-md bg-[#D9D9D9] px-4 py-1 md:text-base text-sm">
                      Domicile
                    </p>
                  </div>
                  <div className="mt-6 flex justify-between items-center px-4">
                    <p className="font-bebas-neue text-black text-xl">
                      $ {match.price.toFixed(2)}
                    </p>
                    <p className="font-lato text-black  text-base">
                      places disponibles: {match.availableSeats}
                    </p>
                  </div>
                  <Link
                    href={`/matchs/${match.id}`}
                    className="block text-center bg-black text-white font-bebas-neue py-2 rounded-md mx-4 hover:bg-gray-800 transition-colors duration-300 mt-8 mb-6"
                  >
                    Réserver vos tickets
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-8">
            <Link
              href={"/matchs"}
              className=" text-center font-bebas-neue text-xl py-3 px-12 text-black border-black  border rounded-md "
            >
              <span>Voir tous les matchs</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default MatchsList;
