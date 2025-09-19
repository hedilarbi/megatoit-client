"use client";
import { getMatchByUid } from "@/services/match.service";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import AuthRequiredModal from "./AuthRequiredModal";
import { useAuth } from "@/context/AuthContext";

import Image from "next/image";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import { FaCalendarAlt } from "react-icons/fa";

import { IoMdPin } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { useRouter } from "next/navigation";
const MatchContent = ({ id }) => {
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketsError, setTicketsError] = useState(null);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const router = useRouter();

  const [ticketQuantity, setTicketQuantity] = useState(1);

  const fetchMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate fetching match data
      const response = await getMatchByUid(id);

      if (response.success) {
        setMatch(response.data);
      } else {
        setError("Failed to fetch match data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  const handleTicketReservation = () => {
    if (!user) {
      setShowAuthRequiredModal(true);
      return;
    }
    if (ticketQuantity > match.availableSeats) {
      setTicketsError("le nombre de tickets séléctionné est indisponible");
      return;
    }
    // const QUEBEC_CUTOFF_UTC_MS = Date.UTC(2025, 7, 29, 16, 0, 0);
    // console.log(Date.now(), QUEBEC_CUTOFF_UTC_MS);
    // if (Date.now() < QUEBEC_CUTOFF_UTC_MS) {
    //   alert("Les ventes ouvrent le 29/08/2025 à 12:00 .");
    //   return;
    // }
    router.push(`/checkout?matchId=${id}&quantity=${ticketQuantity}`);
    // Here you would
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);
  return (
    <>
      {showAuthRequiredModal && (
        <AuthRequiredModal setShowModal={setShowAuthRequiredModal} />
      )}

      <div className="">
        {loading && (
          <div className="flex h-screen w-screen justify-center items-center">
            <Spinner />
          </div>
        )}
        {error && (
          <p className="text-center text-red-400 font-lato text-lg ">{error}</p>
        )}
        {!loading && match ? (
          (() => {
            const { dayName, date } = formatDate(match.date);
            return (
              <div className="py-16 md:px-24 px-4 w-full ">
                {match.availableSeats <= 0 && (
                  <p className="text-center text-red-400 font-lato text-lg">
                    Tickets indisponible
                  </p>
                )}
                <h1 className="flex  md:text-2xl text-lg justify-center md:justify-start font-bold text-gray-800 items-center">
                  <Image
                    src={Logo}
                    alt="logo"
                    width={64}
                    height={64}
                    className="md:h-16 h-12 md:w-16 w-12"
                  />
                  <span className="ml-4">Mégatoit</span>
                  <span className="mx-4 font-bold ">VS</span>
                  <span className="mr-4">{match.opponent.name}</span>
                  <Image
                    src={match.opponent.imageUrl}
                    alt="logo"
                    width={64}
                    height={64}
                    className="md:h-16 h-12 md:w-16 w-12"
                  />
                </h1>
                {match.availableSeats <= 0 && (
                  <div className="text-red-500 font-semibold">
                    Aucun ticket disponible
                  </div>
                )}
                <div className="mt-8">
                  <div className="flex items-center ">
                    <FaCalendarAlt
                      className="inline mr-2"
                      color="#585858"
                      size={20}
                    />

                    <p className=" text-[#585858] md:text-lg text-base font-lato">
                      <span className="capitalize">{dayName},</span>{" "}
                      <span className="capitalize"> {date}</span>
                    </p>
                  </div>
                  <div className="flex items-center mt-4">
                    <IoMdPin
                      className="inline mr-2"
                      color="#585858"
                      size={20}
                    />

                    <p className=" text-[#585858] text-capitalize md:text-lg text-base font-lato">
                      {match.place}
                    </p>
                  </div>
                  <div className="md:w-1/2 w-full bg-[#D9D9D9] p-3 rounded-md mt-4">
                    <p className="text-black md:text-lg text-base font-lato">
                      Ne manquez pas ce match explosif entre Le Mégatoit et{" "}
                      {match.opponent.name} ! Vivez l&apos;intensité du hockey
                      LHSAAAQ en direct au {match.place} !
                    </p>
                  </div>
                </div>
                <div className="mt-8 border-[#949494] border p-8 bg-white rounded-md">
                  <h2 className="md:text-2xl text-lg font-bold text-gray-800 mb-4 font-lato">
                    Sélectionner le nombre de billets
                  </h2>
                  <div className="border border-[#949494] p-6 rounded-md mt-4">
                    <div className="flex justify-between flex-col md:flex-row gap-4 items-start ">
                      <div>
                        <h3 className="font-bebas-neue text-2xl">
                          Mégatoit vs {match.opponent.name}
                        </h3>
                        <p className="text-[#2E2E2E] font-lato text-lg mt-2 font-semibold">
                          ${match.price.toFixed(2)} par billet
                        </p>
                      </div>
                      <div className="flex items-center gap-5 mx-auto md:mx-0 ">
                        <button
                          className="cursor-pointer"
                          onClick={() => setTicketQuantity(ticketQuantity - 1)}
                          disabled={ticketQuantity <= 1}
                        >
                          <FiMinusCircle size={28} />
                        </button>
                        <span className="text-lg font-semibold font-lato ">
                          {ticketQuantity}
                        </span>
                        <button className="cursor-pointer">
                          <FaCirclePlus
                            onClick={() =>
                              setTicketQuantity(ticketQuantity + 1)
                            }
                            color="black"
                            size={28}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <p className="text-lg font-lato font-semibold">
                      Sous-total:
                    </p>

                    <span className="text-lg font-lato font-semibold text-[#5D5D5D]">
                      $ {(match.price * ticketQuantity).toFixed(2)}
                    </span>
                  </div>
                  {ticketsError && (
                    <p className="font-lato text-lg text-red-400 text-center my-2">
                      {ticketsError}
                    </p>
                  )}
                  <div className="mt-6">
                    {user ? (
                      <button
                        className="bg-black text-white font-bebas-neue py-2 px-4 rounded-md hover:bg-gray-800 transition-colors w-full text-lg cursor-pointer"
                        onClick={handleTicketReservation}
                      >
                        Achetez vos billets
                      </button>
                    ) : (
                      <button
                        className="bg-black text-white font-bebas-neue py-2 px-4 rounded-md hover:bg-gray-800 transition-colors w-full text-lg cursor-pointer"
                        onClick={() => setShowAuthRequiredModal(true)}
                      >
                        Achetez vos billets
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : !loading && error ? (
          <div className="text-center text-red-500 font-semibold">{error}</div>
        ) : null}
      </div>
    </>
  );
};

export default MatchContent;
