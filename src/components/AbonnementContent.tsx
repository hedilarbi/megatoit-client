"use client";
import { getAllAbonements } from "@/services/abonement.service";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import { useRouter } from "next/navigation";

const AbonnementContent = () => {
  const [abonnements, setAbonnements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchAbonnements = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getAllAbonements();
      if (response.success) {
        console.log(response.data);
        setAbonnements(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.log(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAbonnements();
  }, []);
  const handleBuy = (id) => {
    router.push(`/checkout?abonnementId=${id}`);
  };
  return (
    <div className="mt-10">
      <h2 className="font-bebas-neue text-3xl text-center">Nos abonnements</h2>
      {isLoading ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div className="pb-30 w-[80%] mx-auto mt-10">
          {abonnements.map((abonnement) => (
            <div
              className="flex md:flex-row flex-col p-4 border-gray-300 gap-4 rounded-md border items-center justify-between shadow-md"
              key={abonnement.id}
            >
              <div>
                <h3 className="font-bebas-neue text-2xl ">
                  {abonnement.title} ( {abonnement.season})
                </h3>

                <p className="text-gray-600 font-bebas-neue text-2xl mt-3">
                  ${abonnement.price.toFixed(2)}
                </p>
              </div>
              <button
                className="font-bebas-neue rounded-md bg-black text-white py-1 px-6 text-xl text-center cursor-pointer"
                onClick={() => handleBuy(abonnement.id)}
              >
                Acheter l&apos;abonnement
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AbonnementContent;
