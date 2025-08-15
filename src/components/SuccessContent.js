"use client";
import { getOrderByIntent } from "@/services/match.service";
import React from "react";
import Spinner from "./spinner/Spinner";
import { FaCircleCheck } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { IoPrintSharp } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import { BsFillTicketPerforatedFill } from "react-icons/bs";
import { RiHome2Fill } from "react-icons/ri";
import { IoMail } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";

const SuccessContent = ({ paymentIntentId }) => {
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const [date, setDate] = React.useState(null);

  const fetchOrder = async () => {
    setLoading(true);

    try {
      const response = await getOrderByIntent(paymentIntentId);
      if (response.success) {
        setOrder(response.data);
        if (response.data.match) {
          const { dayName, date } = formatDate(response.data.match.date);
          setDate({
            dayName,
            date,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching order:", err);
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

  React.useEffect(() => {
    fetchOrder();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="md:w-[70%] w-full mx-auto shadow-lg rounded-md">
        <div className="bg-[#22C55D] flex flex-col justify-center items-center gap-3 py-14 rounded-t-md">
          <FaCircleCheck className="text-white text-6xl" />
          <h1 className="font-lato text-xl text-white font-semibold">
            Achat confirmé !
          </h1>
          <p className="font-lato text-lg text-white">
            Votre commande a été traitée avec succès
          </p>
        </div>
        <div className="bg-white px-6 py-10 rounded-b-md">
          <h2 className="font-lato text-lg text-black mb-4 font-semibold text-center">
            Merci pour votre achat !{" "}
            {order.match
              ? "Vos billets ont été envoyés"
              : "Votre abonnement a été envoyé"}{" "}
            à votre adresse email.
          </h2>
          <p className="font-lato text-base text-center">
            Vérifiez votre boîte de réception et vos spams si nécessaire.
          </p>
          <div className="mt-8 border border-gray-300 p-6 rounded-md">
            <h3 className="font-lato text-[#414A5A] font-semibold text-lg">
              Résumé de votre commande
            </h3>

            <div className="mt-8">
              {order.match && (
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <p className="font-lato text-base text-[#414A5A]">Match</p>
                  <p>
                    Mégatoit vs{" "}
                    {order.match?.opponent?.name || "Adversaire inconnu"}
                  </p>
                </div>
              )}
              {order.abonnement && (
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <p className="font-lato text-base text-[#414A5A]">
                    Abonnement
                  </p>
                  <p>{order.abonnement.title}</p>
                </div>
              )}
              {order.match && (
                <div className="flex justify-between items-center  pb-4 border-b border-gray-300 mt-4">
                  <p className="font-lato text-base text-[#414A5A]">Date</p>
                  <p>
                    <span className="capitalize">{date.dayName},</span>{" "}
                    <span className="capitalize"> {date.date}</span>
                  </p>
                </div>
              )}
              {order.abonnement && (
                <div className="flex justify-between items-center  pb-4 border-b border-gray-300 mt-4">
                  <p className="font-lato text-base text-[#414A5A]">Saison</p>
                  <p>{order.abonnement.season}</p>
                </div>
              )}
              {order.match && (
                <div className="flex justify-between items-center  pb-4 border-b border-gray-300 mt-4 ">
                  <p className="font-lato text-base text-[#414A5A]">Stade</p>
                  <p>{order.match.place}</p>
                </div>
              )}
              <div className="flex justify-between items-center mb-4 mt-4">
                <p className="font-lato text-base text-[#414A5A]">Total payé</p>
                <p>${(order.amount / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#ececec] rounded-md p-6 mt-10">
            <h4 className="font-lato font-semibold text-lg">
              Prochaine étapes
            </h4>
            <div className="flex mb-3 mt-4">
              <IoMdMail className="text-[#0CA5E9] text-2xl mr-2" />
              <p className="font-lato text-[#414A5A]">
                Vérifier votre email pour récupérer vos billets électronique
              </p>
            </div>
            <div className="flex mb-3">
              <IoPrintSharp className="text-[#0CA5E9] text-2xl mr-2" />
              <p className="font-lato text-[#414A5A]">
                Imprimez vos billets ou présentez-les sur votre smartphone le
                jour du match
              </p>
            </div>
            <div className="flex ">
              <FaCalendarAlt className="text-[#0CA5E9] text-2xl mr-2" />
              <p className="font-lato text-[#414A5A]">
                Ajoutez l&apos;événement à votre calendrier pour ne pas
                l&apos;oublier
              </p>
            </div>
          </div>
          <div className="flex md:flex-row flex-col gap-4 justify-center mt-8 md:gap-8">
            <Link
              href={"/profil"}
              className="bg-black flex text-white rounded-md justify-center items-center gap-4 py-2 font-bebas-neue px-5"
            >
              <BsFillTicketPerforatedFill />
              <span>voir mes billets</span>
            </Link>
            <Link
              href={"/"}
              className="bg-white flex text-black border border-black rounded-md justify-center items-center gap-4 py-2 font-bebas-neue px-5"
            >
              <RiHome2Fill />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>
        </div>
      </div>
      <div className=" mt-10">
        <p className="text-center font-lato text-xl font-semibold">
          Besoin d&apos;aide ?
        </p>
        <p className="text-center font-lato text-lg mt-2 text-[#374151]">
          Si vous n&apos;avez pas reçu vos billets ou si vous avez des
          questions, contactez notre service client.
        </p>
        <div className="flex justify-center items-center gap-10 mt-8 ">
          <div className="flex gap-2 items-center text-[#0CA5E9]">
            <IoMail size={20} />
            <p className="font-lato font-semibold">support@lemegatoit.com</p>
          </div>
          <div className="flex gap-2 items-center text-[#0CA5E9]">
            <FaPhoneAlt size={20} />
            <p className="font-lato font-semibold">12 12 12 12 12 12</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessContent;
