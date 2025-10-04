"use client";
import { getAllMatchsList } from "@/services/match.service";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png";
import { MdPinDrop } from "react-icons/md";
import Link from "next/link";
import { DateTime } from "luxon";

/** ---- League timezone only for visibility cutoff (not for display) ---- */
const LEAGUE_TZ = "America/Toronto";

/** Parse and KEEP the original wall-clock time / offset/zone from the value */
function toDateTimePreserve(dateLike) {
  if (!dateLike) return null;

  if (typeof dateLike === "string") {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateLike);
    return isDateOnly
      ? DateTime.fromISO(dateLike) // stays "naive" at 00:00, no conversion
      : DateTime.fromISO(dateLike, { setZone: true }); // respect embedded offset/zone
  }

  if (dateLike instanceof Date) {
    return DateTime.fromJSDate(dateLike); // no forced setZone
  }

  if (dateLike && typeof dateLike.toDate === "function") {
    // Firestore Timestamp -> JS Date
    return DateTime.fromJSDate(dateLike.toDate());
  }

  if (dateLike && typeof dateLike.seconds === "number") {
    // Serialized Firestore Timestamp {seconds, nanoseconds}
    const ms =
      dateLike.seconds * 1000 + Math.floor((dateLike.nanoseconds || 0) / 1e6);
    return DateTime.fromMillis(ms);
  }

  return null;
}

/** Visible until the END of the match DAY in Québec (23:59:59.999) */
function isMatchVisibleForAll(matchDateLike) {
  const dt = toDateTimePreserve(matchDateLike);
  if (!dt || !dt.isValid) return false;

  const endOfDayInQuebec = DateTime.fromObject(
    { year: dt.year, month: dt.month, day: dt.day },
    { zone: LEAGUE_TZ }
  ).endOf("day");

  const nowInQuebec = DateTime.now().setZone(LEAGUE_TZ);
  return nowInQuebec <= endOfDayInQuebec;
}

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
        // 1) Hide matches that are past end-of-day in Québec
        const visible = (response.data || []).filter((match) =>
          isMatchVisibleForAll(match.date)
        );

        // 2) Sort by the stored time as-is (no timezone conversion)
        visible.sort((a, b) => {
          const da = toDateTimePreserve(a.date);
          const db = toDateTimePreserve(b.date);
          return (da?.toMillis() ?? 0) - (db?.toMillis() ?? 0);
        });

        setMatchsList(visible);
      } else {
        setError(response.error || "Erreur inconnue");
        console.error("Error fetching matchs:", response.error);
      }
    } catch (err) {
      setError(err?.message || "An error occurred");
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
                type === "À l'étranger" ? "underline" : ""
              }`}
              onClick={() => setType("À l'étranger")}
            >
              Matchs à l&apos;étranger
            </button>
          </div>

          <div className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-4">
            {matchs.map((match) => {
              const { dayName, date } = formatDate(match.date);
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 pb-6"
                >
                  <div className="bg-black py-4 rounded-t-md">
                    <p className="font-lato text-center text-white font-semibold capitalize ">
                      {dayName}, {date} {/* EXACT stored wall time */}
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
                          Mégatoit
                        </h3>
                      </div>
                      <p className="font-bebas-neue text-xl text-black">VS</p>
                      <div
                        className={`flex items-center gap-2 ${
                          match.type === "Domicile" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <h3 className="font-bebas-neue text-xl text-black">
                          {match?.opponent?.name}
                        </h3>
                        {match?.opponent?.imageUrl ? (
                          <Image
                            src={match.opponent.imageUrl}
                            alt="Logo"
                            className="h-12 w-12 "
                            width={48}
                            height={48}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center px-4">
                    <p className="font-lato text-gray-600 text-sm md:text-base">
                      <MdPinDrop className="inline mr-1" size={24} />
                      {match.place}
                    </p>
                  </div>
                  <div className="flex justify-between px-4 mt-4">
                    <p className="font-lato text-black rounded-md bg-[#D9D9D9] px-4 py-1 md:text-base text-xs uppercase ">
                      {match.type}
                    </p>
                    {match.category !== "Ligue" && (
                      <p className="font-lato text-black rounded-md bg-[#D9D9D9] px-4 py-1 md:text-base text-xs ">
                        {match.category}
                      </p>
                    )}
                  </div>

                  {match.type === "Domicile" && (
                    <Link
                      href={`/calendrier/${match.id}`}
                      className="block text-center bg-black text-white font-bebas-neue py-2 rounded-md mx-4 hover:bg-gray-800 transition-colors duration-300 mt-4 "
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
