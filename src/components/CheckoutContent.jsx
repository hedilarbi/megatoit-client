"use client";
import { useAuth } from "@/context/AuthContext";
import { getMatchByUid } from "@/services/match.service";
import { getAllTaxes } from "@/services/taxes.service";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import { IoMdPin } from "react-icons/io";
import { FaCalendarAlt, FaCheck } from "react-icons/fa";
import { getUserDocument } from "@/services/user.service";
import { getAbonementById } from "@/services/abonement.service";
const CheckoutContent = ({ matchId, quantity, abonnementId }) => {
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [date, setDate] = useState(null);
  const [total, setTotal] = useState(0);
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [abonnement, setAbonnement] = useState(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (matchId) {
        const [matchResponse, taxesResponse, userResponse] = await Promise.all([
          getMatchByUid(matchId),
          getAllTaxes(),
          getUserDocument(user?.uid || ""),
        ]);
        if (matchResponse.success) {
          setMatch(matchResponse.data);
          if (matchResponse.data.availableSeats < quantity) {
            setError("Nombre de billets séléctionné est indisponible");
          }
          const { dayName, date } = formatDate(matchResponse.data.date);
          setDate({ dayName, date });
        }
        if (userResponse) {
          setUserData(userResponse);
        } else {
          setError("Utilisateur non trouvé");
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
      return;
    }
  }, [user, loading]);

  useEffect(() => {
    if (((matchId && quantity) || abonnementId) && user) {
      fetchData();
    }
  }, [matchId, user, abonnementId, error]);
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

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => setError(null)}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }
  return (
    <div className="pt-16 md:px-24 px-4 w-full">
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
              <span className="ml-4 uppercase">Mégatoit</span>
              <span className="mx-4 font-bold ">VS</span>
              <span className="mr-4 uppercase">{match.opponent.name}</span>
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
                  <span className="uppercase">{date.dayName},</span>{" "}
                  <span className="uppercase"> {date.date}</span>
                </p>
              </div>
              <div className="flex items-center mt-4">
                <IoMdPin className="inline mr-2" color="#585858" size={20} />

                <p className=" text-[#585858] text-capitalize md:text-lg text-base font-lato uppercase">
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
              <p className="font-lato text-gray-600 font-semibold uppercase">
                {quantity} x billet(s) Mégatoit vs {match.opponent.name}
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
                    PRÉNOM ET NOM
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
                    COURRIEL
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
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue uppercase">
              Récapitulatif
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white ">
              <div className="flex justify-between w-full font-lato text-base">
                <p className="font-semibold uppercase">Sous-total</p>
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
                <p className="font-semibold uppercase">Total</p>
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
            <h1 className="flex  md:text-2xl text-lg uppercase justify-center md:justify-start font-bold text-gray-800 items-center font-bebas-neue">
              {abonnement.title}
            </h1>
            <div className="bg-white p-4 rounded-md mt-4">
              <p className="font-lato text-black text-base  uppercase">
                <FaCheck className="inline text-black mr-2" />
                13 matchs de saison régulière
              </p>
              <p className="font-lato text-black text-base mt-2 uppercase">
                <FaCheck className="inline text-black mr-2" />1 match présaison
              </p>
              <p className="font-lato text-black text-base mt-2 uppercase">
                <FaCheck className="inline text-black mr-2" />1 consomation
                gratuite par match
              </p>
            </div>

            <div className="mt-4">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-sm flex items-start gap-2">
                <span className="font-bold mr-2">Note:</span>
                <span>
                  Ce billet de saison donne droit à l’accès à tous les matchs de
                  la saison régulière du MégaToit de Trois-Rivières. Il est
                  unique et incessible. Sa présentation est obligatoire à chaque
                  entrée au Colisée Jean-Guy Talbot.
                </span>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center ">
                <FaCalendarAlt
                  className="inline mr-2"
                  color="#585858"
                  size={20}
                />

                <p className=" text-[#585858] md:text-lg text-base font-lato uppercase">
                  saison {abonnement.season}
                </p>
              </div>
            </div>
          </div>
          <div className="py-10 border-b border-black">
            <h2 className="f md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Résumé de la commande
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white flex justify-between">
              <p className="font-lato text-gray-600 font-semibold uppercase">
                1 x Abonnement de saison RÉGULIÈRE ({abonnement.season})
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
                    className="text-gray-700 font-semibold mb-2 uppercase"
                  >
                    Prénom et Nom
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
                    className="text-gray-700 font-semibold mb-2 uppercase"
                  >
                    Courriel
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
                <p className="font-semibold uppercase">Sous-total</p>
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
                <p className="font-semibold uppercase">Total</p>
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
              userId={user?.uid}
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
