"use client";
import Spinner from "@/components/spinner/Spinner";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument, getUserOrders } from "@/services/user.service";
import Image from "next/image";
import React, { useEffect } from "react";
// import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import Link from "next/link";
import { useRouter } from "next/navigation";

/** Firestore Timestamp | Date | string | millis -> JS Date */
function toJSDate(dateLike) {
  if (!dateLike) return null;

  // Firestore Timestamp shape { seconds, nanoseconds }
  if (
    typeof dateLike === "object" &&
    typeof dateLike.seconds === "number" &&
    typeof dateLike.nanoseconds === "number"
  ) {
    const ms = dateLike.seconds * 1000 + Math.floor(dateLike.nanoseconds / 1e6);
    return new Date(ms);
  }

  // Firestore Timestamp with toDate()
  if (dateLike && typeof dateLike.toDate === "function") {
    return dateLike.toDate();
  }

  // JS Date | ISO string | millis
  try {
    return dateLike instanceof Date ? dateLike : new Date(dateLike);
  } catch {
    return null;
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return { dayName: "", date: "" };
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
/** Your old local formatter for "Acheté le" etc. (kept as-is) */
function formatLocalDate(timestamp) {
  if (!timestamp) return { dayName: "", date: "", time: "" };
  const d = toJSDate(timestamp);
  if (!d || isNaN(d.getTime())) return { dayName: "", date: "", time: "" };

  const dayName = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDateShort = d.toLocaleDateString("fr-FR", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return {
    dayName,
    date: formattedDateShort,
    time,
  };
}

const Profil = () => {
  const { user, loading } = useAuth();
  const [userData, setUserData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [orders, setOrders] = React.useState([]);
  const [ticketsCount, setTicketsCount] = React.useState(0);
  const [abonnementCount, setAbonnementCount] = React.useState(0);
  const [filterType, setFilterType] = React.useState("tickets");
  const [content, setContent] = React.useState([]);
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [ordersResponse, userDocumentResponse] = await Promise.all([
        getUserOrders(user?.uid || ""),
        getUserDocument(user?.uid || ""),
      ]);
      if (userDocumentResponse) {
        setUserData(userDocumentResponse);
      } else {
        setError("Aucun utilisateur trouvé.");
      }
      if (ordersResponse) {
        const sortOrders = (items) => {
          return [...items].sort((a, b) => {
            const dateA = toJSDate(a.createdAt)?.getTime() || 0;
            const dateB = toJSDate(b.createdAt)?.getTime() || 0;
            return dateB - dateA;
          });
        };

        const sortedOrders = sortOrders(ordersResponse);
        setOrders(sortedOrders);

        const totalAbonnements = sortedOrders.reduce((acc, order) => {
          return acc + (order.abonnementId ? order.quantity || 1 : 0);
        }, 0);
        setAbonnementCount(totalAbonnements);

        const totalTickets = sortedOrders.reduce((acc, order) => {
          return acc + (order.tickets?.length || 0);
        }, 0);
        setTicketsCount(totalTickets);

        if (filterType === "tickets") {
          const tickets = sortedOrders.filter((order) => order.matchId);
          setContent(tickets);
        } else if (filterType === "abonnements") {
          const abonnements = sortedOrders.filter((order) => order.abonnementId);
          setContent(abonnements);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        err
      );
      setError("Impossible de charger les données utilisateur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    const sortOrders = (items) => {
      return [...items].sort((a, b) => {
        const dateA = toJSDate(a.createdAt)?.getTime() || 0;
        const dateB = toJSDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      });
    };

    if (type === "tickets") {
      const tickets = sortOrders(
        orders.filter((order) => order.matchId)
      );
      setContent(tickets);
    } else if (type === "abonnements") {
      const abonnements = sortOrders(
        orders.filter((order) => order.abonnementId)
      );
      setContent(abonnements);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchUserData();
    }
    if (!user && !loading) {
      router.replace("/connexion");
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] font-lato">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-[#F7F7F7] font-lato ">
      {!userData ? (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || "Aucun utilisateur trouvé."}
        </div>
      ) : (
        <div className="">
          <div className="bg-black flex justify-center py-6  items-center">
            <div className="text-white text-center  ">
              <h2 className="font-semibold text-2xl">{userData.userName}</h2>
              <h3 className="mt-2 ">{userData.email}</h3>
              <div className="text-sm mt-2 flex gap-3 flex-wrap justify-center">
                <p>membre depuis {formatLocalDate(userData.createdAt).date}</p>
                <p>|</p>
                <p> {ticketsCount} billets achetés</p>
                <p>|</p>
                <p> {abonnementCount} abonnements achetés</p>
              </div>
            </div>
          </div>

          <div className="">
            <div className="flex bg-white p-6 rounded-md font-bebas-neue text-xl shadow-md  gap-4">
              <button
                className={`${
                  filterType === "tickets" && "underline"
                } cursor-pointer`}
                onClick={() => handleFilterChange("tickets")}
              >
                Billets
              </button>
              <button
                className={`${
                  filterType === "abonnements" && "underline"
                } cursor-pointer`}
                onClick={() => handleFilterChange("abonnements")}
              >
                Abonnements
              </button>
            </div>

            {filterType === "tickets" && (
              <div className="p-3">
                {content.length === 0 ? (
                  <p>Aucun billet trouvé.</p>
                ) : (
                  content.map((order) => {
                    const matchD = formatDate(order?.match?.date); // <-- QUÉBEC-FIXED
                    const createdD = formatLocalDate(order.createdAt); // <-- local as before
                    const isHome = order?.match?.type === "Domicile";

                    const homeTeamName =
                      order?.match?.homeTeam?.name || "BSR DE TROIS-RIVIÈRES";
                    const homeTeamImageUrl =
                      order?.match?.homeTeam?.imageUrl || "/logo-big.jpeg";

                    const opponentName = order?.match?.opponent?.name || "";
                    const opponentImageUrl = order?.match?.opponent?.imageUrl || "";

                    // Domicile => Opponent on Left, Trois-Rivières on Right
                    // Non Domicile => Trois-Rivières on Left, Opponent on Right
                    const leftTeamName = isHome ? opponentName : homeTeamName;
                    const leftTeamLogo = isHome ? opponentImageUrl : homeTeamImageUrl;

                    const rightTeamName = isHome ? homeTeamName : opponentName;
                    const rightTeamLogo = isHome ? homeTeamImageUrl : opponentImageUrl;

                    return (
                      <div
                        key={order.id}
                        className="bg-white p-4 mb-4 rounded-md shadow-md"
                      >
                        <div className="flex justify-between items-center w-full">
                          {/* Équipe 1 (Gauche - 50% centré) */}
                          <div className="flex-1 min-w-0 flex items-center justify-center gap-2 text-center">
                            {leftTeamLogo && (
                              <Image
                                src={leftTeamLogo}
                                alt="Logo Equipe Gauche"
                                className="h-12 w-12 flex-shrink-0 object-contain"
                                width={48}
                                height={48}
                              />
                            )}
                            <h3 className="font-bebas-neue text-lg md:text-xl text-black line-clamp-2 break-words leading-tight text-center">
                              {leftTeamName}
                            </h3>
                          </div>

                          {/* VS (Centre) */}
                          <p className="font-bebas-neue text-xl text-black mx-2 flex-shrink-0">
                            VS
                          </p>

                          {/* Équipe 2 (Droite - 50% centré) */}
                          <div className="flex-1 min-w-0 flex items-center justify-center gap-2 text-center">
                            <h3 className="font-bebas-neue text-lg md:text-xl text-black line-clamp-2 break-words leading-tight text-center">
                              {rightTeamName}
                            </h3>
                            {rightTeamLogo && (
                              <Image
                                src={rightTeamLogo}
                                alt="Logo Equipe Droite"
                                className="h-12 w-12 flex-shrink-0 object-contain"
                                width={48}
                                height={48}
                              />
                            )}
                          </div>
                        </div>

                        {/* Match date - Québec fixed */}
                        <p className="text-sm text-gray-600 mt-2 capitalize">
                          <span className="font-semibold">Date du match: </span>
                          {matchD.dayName}, {matchD.date}
                        </p>

                        <p className="text-sm text-gray-600 capitalize">
                          <span className="font-semibold">
                            Nombre de billets:{" "}
                          </span>
                          {order?.tickets?.length}
                        </p>

                        <p className="text-sm text-gray-600 capitalize">
                          <span className="font-semibold">Total payé: </span>$
                          {(order?.amount / 100).toFixed(2)}
                        </p>

                        <div className="flex justify-between items-center ">
                          {/* Created at - local */}
                          <p className="text-sm text-gray-600 mt-1 capitalize">
                            <span className="font-semibold ">Acheté le:</span>{" "}
                            {createdD.dayName}, {createdD.date} à{" "}
                            {createdD.time}
                          </p>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <Link
                            href={`/profil/achats/${order.id}`}
                            className="bg-black font-bebas-neue text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
                          >
                            Voir les billets
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {filterType === "abonnements" && (
              <div className="p-3">
                {content.length === 0 ? (
                  <p>Aucun abonnement trouvé.</p>
                ) : (
                  content.map((order) => {
                    const createdD = formatLocalDate(order.createdAt);
                    const abonnementTitle =
                      order.abonnement?.title || "Abonnement indisponible";
                    const abonnementSeason = order.abonnement?.season
                      ? ` (${order.abonnement.season})`
                      : "";
                    return (
                      <div
                        key={order.id}
                        className="bg-white p-4 mb-4 rounded-md shadow-md"
                      >
                        <h3 className="font-bebas-neue text-xl text-black">
                          {order.quantity || order.subscriptionIds?.length || 1} x{" "}
                          {abonnementTitle}
                          {abonnementSeason}
                        </h3>

                        {!order.abonnement && (
                          <p className="mt-1 text-sm text-amber-700">
                            Les informations de ce produit ne sont plus disponibles.
                          </p>
                        )}

                        <p className="text-sm text-gray-600 mt-1 capitalize">
                          <span className="font-semibold mr-1">Acheté le:</span>
                          {createdD.dayName}, {createdD.date} à {createdD.time}
                        </p>
                        <div className="flex justify-between items-center capitalize">
                          <p className="text-sm text-gray-600 ">
                            <span className="font-semibold mr-1">
                              Total payé:
                            </span>
                            ${(order.amount / 100).toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <Link
                            href={`/profil/achats/${order.id}`}
                            className="bg-black font-bebas-neue text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
                          >
                            Voir l&apos;abonnement
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;
