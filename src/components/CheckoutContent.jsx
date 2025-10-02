"use client";
import { useAuth } from "@/context/AuthContext";
import { getMatchByUid, verifyPromoCode } from "@/services/match.service";
import { getAllTaxes } from "@/services/taxes.service";
import { getUserDocument } from "@/services/user.service";
import { getAbonementById } from "@/services/abonement.service";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";
import Spinner from "./spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-small.png";
import { IoMdPin } from "react-icons/io";
import { FaCalendarAlt, FaCheck } from "react-icons/fa";
import axios from "axios";

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

const CheckoutContent = ({ matchId, quantity, abonnementId }) => {
  const [match, setMatch] = useState(null);
  const [abonnement, setAbonnement] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [treatingOrder, setTreatingOrder] = useState(false);

  const [error, setError] = useState(null);

  const [taxes, setTaxes] = useState([]);
  const [total, setTotal] = useState(0);

  const [date, setDate] = useState(null);

  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);

  const [confirmed, setConfirmed] = useState(false);

  const [code, setCode] = useState("");
  const [codeData, setCodeData] = useState(null);
  const [codeIsValid, setCodeIsValid] = useState(true);
  const [codeError, setCodeError] = useState(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (matchId) {
        const [matchResponse, taxesResponse, userResponse] = await Promise.all([
          getMatchByUid(matchId),
          getAllTaxes(),
          getUserDocument(user?.uid || ""),
        ]);

        if (matchResponse.success) {
          const m = matchResponse.data;
          setMatch(m);

          if (m.availableSeats < quantity) {
            setError("Nombre de billets séléctionné est indisponible");
          }

          const { dayName, date } = formatDate(m.date);
          setDate({ dayName, date });

          if (taxesResponse.success && taxesResponse.data) {
            const TaxesList = taxesResponse.data.map((tax) => ({
              name: tax.nom,
              percentage: tax.valeur,
              value: (quantity * m.price * tax.valeur) / 100,
            }));
            setTaxes(TaxesList);
            setTotal(
              quantity * m.price +
                TaxesList.reduce((acc, tax) => acc + tax.value, 0)
            );
          }
        } else {
          setError("Match introuvable");
        }

        if (userResponse) setUserData(userResponse);
        else setError("Utilisateur non trouvé");
      }

      if (abonnementId) {
        const [abonnementResponse, taxesResponse, userResponse] =
          await Promise.all([
            getAbonementById(abonnementId),
            getAllTaxes(),
            getUserDocument(user?.uid || ""),
          ]);

        if (abonnementResponse.success) {
          const a = abonnementResponse.data;
          setAbonnement(a);

          if (taxesResponse.success && taxesResponse.data) {
            const TaxesList = taxesResponse.data.map((tax) => ({
              name: tax.nom,
              percentage: tax.valeur,
              value: (a.price * tax.valeur) / 100,
            }));
            setTaxes(TaxesList);
            setTotal(a.price + TaxesList.reduce((acc, t) => acc + t.value, 0));
          }
        } else {
          setError("Abonnement introuvable");
        }

        if (userResponse) setUserData(userResponse);
        else setError("Utilisateur non trouvé");
      }
    } catch (e) {
      console.error("Error fetching data:", e);
      setError("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (((matchId && quantity) || abonnementId) && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, abonnementId, user]);

  const verifyCode = async () => {
    setCodeError(null);
    try {
      const response = await verifyPromoCode(code, user.uid);

      if (response.success) {
        setCodeIsValid(true);
        setCodeData(response.data);

        if (abonnement) {
          let newSubtotal = abonnement.price;
          if (response.data.type === "percent") {
            newSubtotal = abonnement.price * (1 - response.data.percent / 100);
          } else if (response.data.type === "amount") {
            newSubtotal = Math.max(0, abonnement.price - response.data.amount);
          }
          const newTaxes = taxes.map((tax) => ({
            ...tax,
            value: (newSubtotal * tax.percentage) / 100,
          }));
          setTaxes(newTaxes);
          setTotal(
            newSubtotal + newTaxes.reduce((acc, tax) => acc + tax.value, 0)
          );
        }

        if (match) {
          let newSubtotal = match.price * quantity;
          if (response.data.type === "percent") {
            newSubtotal =
              match.price * quantity * (1 - response.data.percent / 100);
          } else if (response.data.type === "amount") {
            newSubtotal = Math.max(
              0,
              match.price * quantity - response.data.amount
            );
          }
          const newTaxes = taxes.map((tax) => ({
            ...tax,
            value: (newSubtotal * tax.percentage) / 100,
          }));
          setTaxes(newTaxes);
          setTotal(
            newSubtotal + newTaxes.reduce((acc, tax) => acc + tax.value, 0)
          );
        }
      } else {
        setCodeIsValid(false);
        setCodeError(response.error);
      }
    } catch (e) {
      console.error("Error verifying code:", e);
      setCodeIsValid(false);
      setCodeError("An error occurred while verifying the code");
    }
  };

  const removeCode = () => {
    setCode("");
    setCodeData(null);
    setCodeIsValid(true);
    setCodeError(null);

    if (abonnement) {
      const subtotal = abonnement.price;
      const newTaxes = taxes.map((tax) => ({
        ...tax,
        value: (subtotal * tax.percentage) / 100,
      }));
      setTaxes(newTaxes);
      setTotal(subtotal + newTaxes.reduce((acc, tax) => acc + tax.value, 0));
    }

    if (match) {
      const subtotal = match.price * quantity;
      const newTaxes = taxes.map((tax) => ({
        ...tax,
        value: (subtotal * tax.percentage) / 100,
      }));
      setTaxes(newTaxes);
      setTotal(subtotal + newTaxes.reduce((acc, tax) => acc + tax.value, 0));
    }
  };

  const processOrder = async () => {
    try {
      setTreatingOrder(true);
      const response = await axios.post("/api/process-free-order", {
        userId: user.uid,
        matchId: match ? matchId : null,
        quantity: match ? quantity : null,
        ticketPrice: match ? match.price : null,
        abonnementId: abonnement ? abonnementId : null,
        abonnementPrice: abonnement ? abonnement.price : null,
        amount: total,
        promoCodeId: codeData ? codeData.id : null,
      });
      if (response.status === 200) {
        const orderId = response.data.data;
        router.push(`/commande-reussi?orderId=${orderId}`);
      }
    } catch (e) {
      console.error("Error processing order:", e);
      setError("An error occurred while processing your order");
    } finally {
      setTreatingOrder(false);
    }
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
      <div className="h-screen flex flex-col justify-center items-center gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
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
            <h1 className="flex md:text-2xl text-lg justify-center md:justify-start font-bold text-gray-800 items-center font-bebas-neue">
              <Image
                src={Logo}
                alt="logo"
                width={64}
                height={64}
                className="md:h-16 h-12 md:w-16 w-12"
              />
              <span className="ml-4 uppercase">Mégatoit</span>
              <span className="mx-4 font-bold">VS</span>
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
              <div className="flex items-center">
                <FaCalendarAlt
                  className="inline mr-2"
                  color="#585858"
                  size={20}
                />
                <p className="text-[#585858] md:text-lg text-base font-lato">
                  {(() => {
                    const d = formatDate(match.date);
                    return (
                      <>
                        <span className="uppercase">{d.dayName},</span>{" "}
                        <span className="uppercase">{d.date}</span>
                      </>
                    );
                  })()}
                </p>
              </div>

              <div className="flex items-center mt-4">
                <IoMdPin className="inline mr-2" color="#585858" size={20} />
                <p className="text-[#585858] text-capitalize md:text-lg text-base font-lato uppercase">
                  {match.place}
                </p>
              </div>
            </div>
          </div>

          <div className="py-10 border-b border-black">
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
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
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Code Promo (optionnel)
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white">
              <div className="flex justify-between gap-4">
                <input
                  type="text"
                  name="promoCode"
                  id="promoCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`border border-gray-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black ${
                    codeIsValid ? "" : "border-red-500"
                  }`}
                  placeholder="Entrez votre code promo"
                />
                {!codeData && (
                  <button
                    onClick={verifyCode}
                    className="text-white py-2 px-6 bg-black rounded-md text-xl font-bebas-neue cursor-pointer"
                  >
                    Appliquer
                  </button>
                )}
                {codeData && (
                  <button
                    onClick={removeCode}
                    className="text-white py-2 px-6 bg-red-500 rounded-md text-xl font-bebas-neue cursor-pointer"
                  >
                    Enlever
                  </button>
                )}
              </div>

              {codeError && (
                <p className="text-red-500 mt-2 font-lato font-semibold">
                  {codeError}
                </p>
              )}
              {codeIsValid && codeData && (
                <p className="text-green-500 mt-2 font-lato font-semibold">
                  Code promo appliqué:{" "}
                  {codeData.type === "percent"
                    ? `${codeData.percent}% de réduction`
                    : `$${codeData.amount} de réduction`}
                </p>
              )}
            </div>
          </div>

          <div className="py-10 border-b border-black">
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
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
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue uppercase">
              Récapitulatif
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white">
              <div className="flex justify-between w-full font-lato text-base">
                <p className="font-semibold uppercase">Sous-total</p>
                <p>${(match.price * quantity).toFixed(2)}</p>
              </div>

              {codeIsValid && codeData && (
                <div className="flex justify-between w-full font-lato text-base">
                  <p className="font-semibold uppercase">Réduction</p>
                  <p>
                    {codeData.type === "percent"
                      ? `-$${(
                          (match.price * quantity * codeData.percent) /
                          100
                        ).toFixed(2)}`
                      : `-$${parseFloat(codeData.amount).toFixed(2)}`}
                  </p>
                </div>
              )}

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

          {!confirmed && (
            <button
              onClick={() => setConfirmed(true)}
              className="text-white w-full p-5 bg-black mt-4 rounded-md font-bold text-xl disabled:opacity-50 disabled:animate-pulse font-bebas-neue cursor-pointer"
            >
              Confirmer la commande
            </button>
          )}

          {confirmed && total === 0 && codeData && (
            <button
              onClick={processOrder}
              disabled={treatingOrder}
              className="text-white w-full p-5 bg-black mt-4 rounded-md font-bold text-xl disabled:opacity-50 disabled:animate-pulse font-bebas-neue cursor-pointer"
            >
              {treatingOrder ? "Traitement..." : "Traiter ma commande"}
            </button>
          )}

          {confirmed && total > 0 && (
            <div className="py-10">
              <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
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
                userName={userData ? userData.userName : ""}
                email={userData ? userData.email : ""}
                codeId={codeData?.id || null}
              />
            </div>
          )}
        </div>
      )}

      {abonnement && (
        <div>
          <div className="border-b border-black pb-10">
            <h1 className="flex md:text-2xl text-lg uppercase justify-center md:justify-start font-bold text-gray-800 items-center font-bebas-neue">
              {abonnement.title}
            </h1>

            <div className="bg-white p-4 rounded-md mt-4">
              <p className="font-lato text-black text-base uppercase">
                <FaCheck className="inline text-black mr-2" />
                13 matchs de saison régulière
              </p>
              <p className="font-lato text-black text-base mt-2 uppercase">
                <FaCheck className="inline text-black mr-2" />1 match présaison
              </p>
              <p className="font-lato text-black text-base mt-2 uppercase">
                <FaCheck className="inline text-black mr-2" />1 consommation
                gratuite par match
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center">
                <FaCalendarAlt
                  className="inline mr-2"
                  color="#585858"
                  size={20}
                />
                <p className="text-[#585858] md:text-lg text-base font-lato uppercase">
                  saison {abonnement.season}
                </p>
              </div>
            </div>
          </div>

          <div className="py-10 border-b border-black">
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
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
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Code Promo (optionnel)
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white">
              <div className="flex justify-between gap-4">
                <input
                  type="text"
                  name="promoCode"
                  id="promoCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`border border-gray-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-black ${
                    codeIsValid ? "" : "border-red-500"
                  }`}
                  placeholder="Entrez votre code promo"
                />
                {!codeData && (
                  <button
                    onClick={verifyCode}
                    className="text-white py-2 px-6 bg-black rounded-md text-xl font-bebas-neue cursor-pointer"
                  >
                    Appliquer
                  </button>
                )}
                {codeData && (
                  <button
                    onClick={removeCode}
                    className="text-white py-2 px-6 bg-red-500 rounded-md text-xl font-bebas-neue cursor-pointer"
                  >
                    Enlever
                  </button>
                )}
              </div>

              {codeError && (
                <p className="text-red-500 mt-2 font-lato font-semibold">
                  {codeError}
                </p>
              )}
              {codeIsValid && codeData && (
                <p className="text-green-500 mt-2 font-lato font-semibold">
                  Code promo appliqué:{" "}
                  {codeData.type === "percent"
                    ? `${codeData.percent}% de réduction`
                    : `$${codeData.amount} de réduction`}
                </p>
              )}
            </div>
          </div>

          <div className="py-10 border-b border-black">
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
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
            <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
              Récapitulatif
            </h2>
            <div className="border border-gray-300 rounded-md p-4 mt-4 bg-white">
              <div className="flex justify-between w-full font-lato text-base">
                <p className="font-semibold uppercase">Sous-total</p>
                <p>${abonnement.price.toFixed(2)}</p>
              </div>

              {codeIsValid && codeData && (
                <div className="flex justify-between w-full font-lato text-base">
                  <p className="font-semibold uppercase">Réduction</p>
                  <p>
                    {codeData.type === "percent"
                      ? `-$${(
                          (abonnement.price * codeData.percent) /
                          100
                        ).toFixed(2)}`
                      : `-$${parseFloat(codeData.amount).toFixed(2)}`}
                  </p>
                </div>
              )}

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

          {!confirmed && (
            <button
              onClick={() => setConfirmed(true)}
              className="text-white mt-4 w-full p-5 bg-black rounded-md font-bold text-xl disabled:opacity-50 disabled:animate-pulse font-bebas-neue cursor-pointer"
            >
              Confirmer la commande
            </button>
          )}

          {confirmed && total === 0 && codeData && (
            <button
              onClick={processOrder}
              disabled={treatingOrder}
              className="text-white w-full p-5 bg-black mt-4 rounded-md font-bold text-xl disabled:opacity-50 disabled:animate-pulse font-bebas-neue cursor-pointer"
            >
              {treatingOrder ? "Traitement..." : "Traiter ma commande"}
            </button>
          )}

          {confirmed && total > 0 && (
            <div className="py-10">
              <h2 className="md:text-2xl text-lg font-bold text-gray-800 font-bebas-neue">
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
                userName={userData ? userData.userName : ""}
                email={userData ? userData.email : ""}
                codeId={codeData?.id || null}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutContent;
