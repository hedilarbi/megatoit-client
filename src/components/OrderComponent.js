"use client";
import { getOrderById } from "@/services/user.service";
import React, { useEffect } from "react";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";

/* ========= Québec-fixed match date formatter ========= */
const QUEBEC_TZ = "America/Toronto";

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

/** Match date in Québec time: { dayName, date } -> "vendredi", "10 octobre 2025 à 15:30" */
function formatMatchDateQuebec(timestamp) {
  const d = toJSDate(timestamp);
  if (!d || isNaN(d.getTime())) return { dayName: "", date: "" };

  const dayName = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone: QUEBEC_TZ,
  }).format(d);

  const datePart = new Intl.DateTimeFormat("fr-FR", {
    timeZone: QUEBEC_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("fr-FR", {
    timeZone: QUEBEC_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return {
    dayName, // e.g. "vendredi"
    date: `${datePart} à ${timePart}`, // e.g. "10 octobre 2025 à 15:30"
  };
}

/** Local-style formatting for created/paid dates (kept similar to your original) */
function formatLocalDate(timestamp) {
  const d = toJSDate(timestamp);
  if (!d || isNaN(d.getTime())) return { dayName: "", date: "", time: "" };

  const dayName = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

const OrderComponent = ({ id }) => {
  const { user } = useAuth();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrder();
    } else {
      router.push("/connexion");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] font-lato ">
      <button
        className="bg-black text-white p-3 rounded-full ml-4 mb-4 cursor-pointer"
        onClick={() => router.back()}
      >
        <FaArrowLeftLong />
      </button>

      {order?.match && (
        <>
          <div className="flex justify-center ">
            <div className="flex justify-between items-center ">
              <div className="flex items-center gap-2">
                <Image src={Logo} alt="Logo" className="h-16 w-20 " />
                <h3 className="font-bebas-neue text-xl text-black">Mégatoit</h3>
              </div>
              <p className="font-bebas-neue text-xl text-black mx-3">VS</p>
              <div className="flex items-center gap-2">
                <h3 className="font-bebas-neue text-xl text-black">
                  {order.match.opponent.name}
                </h3>
                <Image
                  src={order.match.opponent.imageUrl}
                  alt="Logo"
                  className="h-16 w-16 "
                  width={48}
                  height={48}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 px-4 md:px-8">
            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Match: </span>
              Mégatoit vs {order.match.opponent.name}
            </p>

            {/* --- Match date (Québec-fixed) --- */}
            <p className="text-base text-gray-600 mt-1 md:text-lg capitalize">
              <span className="font-semibold capitalize">Date: </span>
              {(() => {
                const d = formatMatchDateQuebec(order.match.date);
                return (
                  <>
                    {d.dayName}, {d.date}
                  </>
                );
              })()}
            </p>

            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Stade: </span>
              {order.match.place}
            </p>

            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Nombre de billets: </span>
              {order.tickets.length}
            </p>

            {order.promoCode && (
              <p className="text-base text-gray-600 mt-1 md:text-lg">
                <span className="font-semibold">Réduction: </span>
                {order.promoCode.type === "percent"
                  ? `${order.promoCode.percent}%`
                  : `$${parseFloat(order.promoCode.amount).toFixed(2)}`}{" "}
              </p>
            )}

            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Total payé: </span>$
              {(order.amount / 100).toFixed(2)}
            </p>

            <p className=" text-black font-semibold mt-4 text-lg md:text-xl">
              Billets :
            </p>

            {order.tickets.map((ticket, index) => (
              <div
                key={index}
                className="mt-2 border border-black rounded-md shadow-md p-3 flex justify-between items-center"
              >
                <p className="text-base text-gray-600 font-semibold">
                  Billet N° {ticket.TicketCode}
                </p>
                <a
                  href={ticket.downloadUrl}
                  className="text-white bg-black rounded-md px-4 py-1 font-bebas-neue hover:underline"
                  target="_blank"
                >
                  Voir le billet
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      {order?.abonnement && (
        <div className=" px-4 md:px-8">
          <h3 className="font-lato text-[#414A5A] font-semibold text-2xl text-center">
            Abonnement
          </h3>
          <p className="text-base text-gray-600 mt-1 md:text-lg">
            <span className="font-semibold capitalize">Titre: </span>
            {order.abonnement.title}
          </p>
          <p className="text-base text-gray-600 mt-1 md:text-lg">
            <span className="font-semibold capitalize">Saison: </span>
            {order.abonnement.season}
          </p>
          <p className="text-base text-gray-600 mt-1 md:text-lg">
            <span className="font-semibold capitalize">
              Date d&apos;achat:{" "}
            </span>
            {(() => {
              const d = formatLocalDate(order.createdAt);
              return (
                <>
                  {d.dayName}, {d.date} à {d.time}
                </>
              );
            })()}
          </p>
          {order.promoCode && (
            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Réduction: </span>
              {order.promoCode.type === "percent"
                ? `${order.promoCode.percent}%`
                : `$${parseFloat(order.promoCode.amount).toFixed(2)}`}{" "}
            </p>
          )}
          <p className="text-base text-gray-600 mt-1 md:text-lg">
            <span className="font-semibold">Total payé: </span>$
            {(order.amount / 100).toFixed(2)}
          </p>
          <div className="mt-4 border border-black rounded-md shadow-md p-3 flex justify-between items-center ">
            <p className="text-base text-gray-600 font-semibold">
              Abonnement N° {order.subscription.code}
            </p>
            <a
              href={order.subscription.downloadUrl}
              className="text-white bg-black rounded-md px-4 py-1 font-bebas-neue hover:underline"
              target="_blank"
            >
              Voir l&apos;abonnement
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderComponent;
