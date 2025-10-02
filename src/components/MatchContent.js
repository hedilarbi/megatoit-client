"use client";
import { getMatchByUid } from "@/services/match.service";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import AuthRequiredModal from "./AuthRequiredModal";
import { useAuth } from "@/context/AuthContext";

import Image from "next/image";
import Logo from "@/assets/logo-small.png";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { useRouter } from "next/navigation";

const QUEBEC_TZ = "America/Toronto"; // freeze display & logic to Québec local time

// ---- Helpers: Time-zone-safe comparisons without extra libs ----
function toJSDateFromFirestore(ts) {
  if (!ts) return new Date(NaN);
  if (ts?.seconds != null && ts?.nanoseconds != null) {
    const ms = ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1_000_000);
    return new Date(ms);
  }
  if (typeof ts?.toDate === "function") return ts.toDate();
  return ts instanceof Date ? ts : new Date(ts);
}

/** Extract Y/M/D/H/M/S as numbers as seen in America/Toronto */
function getQuebecParts(d) {
  const parts = new Intl.DateTimeFormat("fr-CA", {
    timeZone: QUEBEC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const pick = (t) => Number(parts.find((p) => p.type === t)?.value ?? "0");

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second"),
  };
}

/** Strict numeric tuple compare: return +1 if a>b, -1 if a<b, 0 if equal */
function compareParts(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  if (a.day !== b.day) return a.day - b.day;
  if (a.hour !== b.hour) return a.hour - b.hour;
  if (a.minute !== b.minute) return a.minute - b.minute;
  if (a.second !== b.second) return a.second - b.second;
  return 0;
}

/** now(Quebec) > matchDate(Quebec) @ 23:59:59 ?  (numeric compare, no string) */
function isExpiredAtEndOfDayQuebec(matchTs) {
  const matchDate = toJSDateFromFirestore(matchTs);
  if (isNaN(matchDate.getTime())) return false; // invalid -> don't block

  const nowParts = getQuebecParts(new Date());
  const mParts = getQuebecParts(matchDate);

  const boundary = {
    year: mParts.year,
    month: mParts.month,
    day: mParts.day,
    hour: 23,
    minute: 59,
    second: 59,
  };

  return compareParts(nowParts, boundary) > 0;
}

// ---- Display formatting (Québec) ----
const formatDate = (timestamp) => {
  const milliseconds =
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  const date = new Date(milliseconds);
  const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const str = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Etc/GMT-1",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return { dayName, date: str };
};
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
      const response = await getMatchByUid(id);
      if (response.success) setMatch(response.data);
      else setError("Failed to fetch match data");
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketReservation = () => {
    if (!user) {
      setShowAuthRequiredModal(true);
      return;
    }
    if (ticketQuantity > match.availableSeats) {
      setTicketsError("Le nombre de tickets sélectionné est indisponible");
      return;
    }
    if (isExpiredAtEndOfDayQuebec(match.date)) {
      setTicketsError("La vente de billets pour ce match est terminée");
      return;
    }
    router.push(`/checkout?matchId=${id}&quantity=${ticketQuantity}`);
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const expired = match ? isExpiredAtEndOfDayQuebec(match.date) : false;

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
                    Tickets indisponibles
                  </p>
                )}

                <h1 className="flex md:text-2xl text-lg justify-center md:justify-start font-bold text-gray-800 items-center">
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

                <div className="mt-8">
                  <div className="flex items-center ">
                    <FaCalendarAlt
                      className="inline mr-2"
                      color="#585858"
                      size={20}
                    />
                    <p className="text-[#585858] md:text-lg text-base font-lato">
                      <span className="capitalize">{dayName},</span>{" "}
                      <span className="capitalize">{date}</span>
                    </p>
                  </div>

                  <div className="flex items-center mt-4">
                    <IoMdPin
                      className="inline mr-2"
                      color="#585858"
                      size={20}
                    />
                    <p className="text-[#585858] text-capitalize md:text-lg text-base font-lato">
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
                          onClick={() =>
                            setTicketQuantity((q) => Math.max(1, q - 1))
                          }
                          disabled={ticketQuantity <= 1}
                        >
                          <FiMinusCircle size={28} />
                        </button>
                        <span className="text-lg font-semibold font-lato ">
                          {ticketQuantity}
                        </span>
                        <button
                          className="cursor-pointer"
                          onClick={() => setTicketQuantity((q) => q + 1)}
                        >
                          <FaCirclePlus color="black" size={28} />
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

                  {/* ---- Hide the purchase button if Québec is past match day 23:59 ---- */}
                  <div className="mt-6">
                    {!expired ? (
                      user ? (
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
                      )
                    ) : (
                      <div className="text-center text-[#9b1c1c] font-semibold">
                        Vente terminée
                      </div>
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
