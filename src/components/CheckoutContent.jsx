"use client";
import { useAuth } from "@/context/AuthContext";
import { getMatchByTitle, getMatchByUid } from "@/services/match.service";
import { getAllTaxes } from "@/services/taxes.service";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import { IoMdPin } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import { getUserDocument } from "@/services/user.service";
import { getAbonementById } from "@/services/abonement.service";
const CheckoutContent = ({ matchId, quantity, abonnementId }) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [date, setDate] = useState(null);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [abonnement, setAbonnement] = useState(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      if (matchId) {
        const [matchResponse, taxesResponse, userResponse] = await Promise.all([
          getMatchByUid(matchId),
          getAllTaxes(),
          getUserDocument(user?.uid || ""),
        ]);
        if (matchResponse.success) {
          setMatch(matchResponse.data);
          if (matchResponse.data.availableSeats < quantity) {
            setError("Nombre de tickets séléctionné est indisponible");
          }
          const { dayName, date, time } = formatDate(matchResponse.data.date);
          setDate({ dayName, date, time });
        }
        if (userResponse) {
          setUserData(userResponse);
        }
        if (taxesResponse.success && taxesResponse.data && matchResponse.data) {
          const TaxesList = taxesResponse.data.map((tax) => ({
            name: tax.nom,
            percentage: tax.valeur,
            value: (quantity * matchResponse.data.price * tax.valeur) / 100,
          }));
          setTotal(
            quantity * matchResponse.data.price +
              TaxesList.reduce((acc, tax) => acc + tax.value, 0)
          );
          setTaxes(TaxesList);
        }
      }
      if (abonnementId) {
        const [abonnementResponse, taxesResponse, userResponse] =
          await Promise.all([
            getAbonementById(abonnementId),
            getAllTaxes(),
            getUserDocument(user?.uid || ""),
          ]);
        if (abonnementResponse.success) {
          setAbonnement(abonnementResponse.data);
        }
        if (userResponse) {
          setUserData(userResponse);
        }
        if (
          taxesResponse.success &&
          taxesResponse.data &&
          abonnementResponse.data
        ) {
          const TaxesList = taxesResponse.data.map((tax) => ({
            name: tax.nom,
            percentage: tax.valeur,
            value: (abonnementResponse.data.price * tax.valeur) / 100,
          }));
          console.log(TaxesList);
          setTotal(
            abonnementResponse.data.price +
              TaxesList.reduce((acc, tax) => acc + tax.value, 0)
          );
          setTaxes(TaxesList);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
      return;
    }
  }, [user]);

  useEffect(() => {
    if (((matchId && quantity) || abonnementId) && user) {
      fetchData();
    }
  }, [matchId, user, abonnementId]);
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

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="pt-16 md:px-24 px-4 w-full">
      {error && (
        <p className="text-center font-lato text-xl text-red-400 font-semibold my-4">
          {error}
        </p>
      )}
      {match && (
        <div>
          <div className="border-b border-black pb-10">
            <h1 className="flex  md:text-2xl text-lg justify-center md:justify-start font-bold text-gray-800 items-center font-bebas-neue">
              <Image
                src={Logo}
                alt="logo"
                width={64}
                height={64}
                className="md:h-16 h-12 md:w-16 w-12"
              />
              <span className="ml-4">Megatoit</span>
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

                <p className=" text-[#585858] md:text-lg text-base font-lato">
                  <span className="capitalize">{date.dayName},</span>{" "}
                  <span className="capitalize"> {date.date}</span>{" "}
                  <span> à </span>
                  <span>{date.time}</span>
                </p>
              </div>
              <div className="flex items-center mt-4">
                <IoMdPin className="inline mr-2" color="#585858" size={20} />

                <p className=" text-[#585858] text-capitalize md:text-lg text-base font-lato">
                  {match.place}
                </p>
              </div>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Résumé de la commande
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white flex justify-between">
              <p className="font-lato text-gray-600 font-semibold">
                {quantity} x tickets Megatoit vs {match.opponent.name}
              </p>
              <p className="font-lato text-gray-800 font-semibold">
                ${match.price.toFixed(2)} x {quantity} = $
                {(match.price * quantity).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Vos Informations
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white flex justify-between">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col">
                  <label
                    htmlFor="fullName"
                    className="text-gray-700 font-semibold mb-2"
                  >
                    Nom et Prénom
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Entrez votre nom et prénom"
                    readOnly
                    value={userData ? userData.userName : ""}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="text-gray-700 font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData ? userData.email : ""}
                    readOnly
                    placeholder="Entrez votre email"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Récapitulatif
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white ">
              <div className="flex justify-between w-full font-lato text-base">
                <p className="font-semibold">Sous-total</p>
                <p>${(match.price * quantity).toFixed(2)}</p>
              </div>
              {taxes.map((tax, index) => (
                <div
                  key={index}
                  className="flex justify-between w-full font-lato text-base"
                >
                  <p className="font-semibold uppercase">
                    {tax.name} ({tax.percentage}%)
                  </p>
                  <p>${tax.value.toFixed(2)}</p>
                </div>
              ))}
              <div className="flex justify-between w-full font-lato text-base mt-4">
                <p className="font-semibold">Total</p>
                <p className="text-lg font-bold">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="py-10 ">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Paiement
            </h2>
            <PaymentForm
              amount={total.toFixed(2)}
              userId={user.uid}
              quantity={quantity}
              matchId={match ? matchId : ""}
              abonnementId={abonnementId}
              abonnementPrice={abonnement ? abonnement.price : 0}
              ticketPrice={match ? match.price : 0}
            />
          </div>
        </div>
      )}
      {abonnement && (
        <div>
          <div className="border-b border-black pb-10">
            <h1 className="flex  md:text-2xl text-lg justify-center md:justify-start font-bold text-gray-800 items-center font-bebas-neue">
              {abonnement.title}
            </h1>
            <div className="mt-8">
              <div className="flex items-center ">
                <FaCalendarAlt
                  className="inline mr-2"
                  color="#585858"
                  size={20}
                />

                <p className=" text-[#585858] md:text-lg text-base font-lato">
                  saison ({abonnement.season})
                </p>
              </div>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Résumé de la commande
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white flex justify-between">
              <p className="font-lato text-gray-600 font-semibold">
                1 x Abonnement saison {abonnement.season}
              </p>
              <p className="font-lato text-gray-800 font-semibold">
                ${abonnement.price.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Vos Informations
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white flex justify-between">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col">
                  <label
                    htmlFor="fullName"
                    className="text-gray-700 font-semibold mb-2"
                  >
                    Nom et Prénom
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Entrez votre nom et prénom"
                    readOnly
                    value={userData ? userData.userName : ""}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="text-gray-700 font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData ? userData.email : ""}
                    readOnly
                    placeholder="Entrez votre email"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Récapitulatif
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white ">
              <div className="flex justify-between w-full font-lato text-base">
                <p className="font-semibold">Sous-total</p>
                <p>${abonnement.price.toFixed(2)}</p>
              </div>
              {taxes.map((tax, index) => (
                <div
                  key={index}
                  className="flex justify-between w-full font-lato text-base"
                >
                  <p className="font-semibold uppercase">
                    {tax.name} ({tax.percentage}%)
                  </p>
                  <p>${tax.value.toFixed(2)}</p>
                </div>
              ))}
              <div className="flex justify-between w-full font-lato text-base mt-4">
                <p className="font-semibold">Total</p>
                <p className="text-lg font-bold">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="py-10 ">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Paiement
            </h2>
            <PaymentForm
              amount={total.toFixed(2)}
              userId={user.uid}
              quantity={quantity}
              matchId={match ? matchId : ""}
              abonnementId={abonnementId}
              abonnementPrice={abonnement ? abonnement.price : 0}
              ticketPrice={match ? match.price : 0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutContent;
