"use client";
import { getAllAbonements } from "@/services/abonement.service";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import { useRouter } from "next/navigation";
import AuthRequiredModal from "./AuthRequiredModal";
import { useAuth } from "@/context/AuthContext";

import {
  getEffectiveSubscriptionPrice,
  isSubscriptionPreSaleActive,
} from "@/utils/subscriptionUtils";

const AbonnementContent = () => {
  const { user } = useAuth();
  const [abonnements, setAbonnements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const router = useRouter();

  const fetchAbonnements = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAbonements();
      if (response.success) {
        setAbonnements(response.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAbonnements();
  }, []);
  const handleBuy = (id) => {
    if (!user) {
      setShowAuthRequiredModal(true);
      return;
    }
    router.push(`/checkout?abonnementId=${id}`);
  };
  return (
    <div className="mt-10">
      {showAuthRequiredModal && (
        <AuthRequiredModal setShowModal={setShowAuthRequiredModal} />
      )}

      {isLoading ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div className="pb-30 w-[80%] mx-auto mt-10">
          {abonnements.map((abonnement) => {
            const effectivePrice = getEffectiveSubscriptionPrice(abonnement);
            const isPreSale =
              isSubscriptionPreSaleActive() &&
              abonnement.reducedPrice &&
              Number(abonnement.reducedPrice) > 0;

            return (
              <div
                className="flex md:flex-row flex-col p-4 border-gray-300 gap-4 rounded-md border items-center justify-between shadow-md"
                key={abonnement.id}
              >
                <div>
                  <h3 className="font-bebas-neue text-2xl ">
                    {abonnement.title} ({abonnement.season})
                  </h3>
                  <p className="text-gray-600 font-bebas-neue text-lg mt-2">
                    {abonnement.description}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <p className="text-brand-dark font-bebas-neue text-3xl font-bold">
                        ${effectivePrice.toFixed(2)}
                      </p>
                      {isPreSale && (
                        <span className="line-through text-gray-400 font-bebas-neue text-xl">
                          ${Number(abonnement.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {isPreSale && (
                      <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        Offre valable jusqu&apos;au 6 septembre 2026
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="font-bebas-neue rounded-md bg-brand hover:bg-brand-dark text-black py-1 px-6 text-xl text-center cursor-pointer transition-colors"
                  onClick={() => handleBuy(abonnement.id)}
                >
                  Achetez l&apos;abonnement
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AbonnementContent;
