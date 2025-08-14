"use client";
import { getOrderById } from "@/services/user.service";
import React, { useEffect } from "react";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const OrderComponent = ({ id }) => {
  const { user } = useAuth();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const fetchOrder = async () => {
    setLoading(true);

    try {
      const response = await getOrderById(id); // Assuming getOrderById is defined elsewhere

      if (response.success) {
        console.log("Order fetched successfully:", response.data);
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
  }, [id, user]);
  const formatDate = (timestamp) => {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;

    const date = new Date(milliseconds);

    const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
    let time = date.toTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    time = time.substring(0, 5); // Extracting only the time part (HH:MM)
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

  const formatFixDate = (timestamp) => {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;

    const date = new Date(milliseconds);

    const str = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Etc/GMT-1", // ← freeze at UTC
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });

    return {
      dayName,
      date: str,
    };
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] font-lato ">
      {order.match && (
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
            <p className="text-base text-gray-600 mt-1 md:text-lg capitalize">
              <span className="font-semibold capitalize">Date: </span>
              {formatFixDate(order.match.date).dayName},{" "}
              {formatFixDate(order.match.date).date}
            </p>
            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Stade: </span>
              {order.match.place}
            </p>
            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Nombre de tickets: </span>

              {order.tickets.length}
            </p>
            <p className="text-base text-gray-600 mt-1 md:text-lg">
              <span className="font-semibold">Total payé: </span>$
              {(order.amount / 100).toFixed(2)}
            </p>
            <p className=" text-black font-semibold mt-4 text-lg md:text-xl">
              Tickets :
            </p>

            {order.tickets.map((ticket, index) => (
              <div
                key={index}
                className="mt-2 border border-black rounded-md shadow-md p-3 flex justify-between items-center"
              >
                <p className="text-base text-gray-600 font-semibold">
                  Ticket N° {ticket.TicketCode}
                </p>
                <a
                  href={ticket.downloadUrl}
                  className="text-white bg-black rounded-md px-4 py-1 font-bebas-neue hover:underline"
                  target="_blank"
                >
                  Voir le ticket
                </a>
              </div>
            ))}
          </div>
        </>
      )}
      {order.abonnement && (
        <div className="mt-8 px-4 md:px-8">
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
            {formatDate(order.createdAt).dayName},{" "}
            {formatDate(order.createdAt).date} à{" "}
            {formatDate(order.createdAt).time}
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
