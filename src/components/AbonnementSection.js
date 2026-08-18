"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/HomeAbonnementSection.module.css";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
import { getAllAbonements } from "@/services/abonement.service";
import {
  getEffectiveSubscriptionPrice,
  isSubscriptionPreSaleActive,
} from "@/utils/subscriptionUtils";

const AbonnementSection = () => {
  const [abonnement, setAbonnement] = useState(null);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await getAllAbonements();
        if (res.success && res.data && res.data.length > 0) {
          setAbonnement(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSub();
  }, []);

  const isPreSale = isSubscriptionPreSaleActive();
  const effectivePrice = abonnement
    ? getEffectiveSubscriptionPrice(abonnement)
    : isPreSale
      ? 160
      : 200;

  return (
    <section className={styles.AbonnementSection}>
      <h2 className="font-bebas-neue md:text-4xl text-3xl text-center text-white">
        Abonnement de saison {abonnement?.season || "2026-27"}
      </h2>

      <div className="bg-black border-2 border-brand mt-8 mx-auto md:w-1/3 w-full rounded-md py-6 px-8 shadow-[0_12px_40px_rgba(123,253,72,0.18)]">
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <h4 className="text-brand text-3xl font-bold font-bebas-neue">
              ${effectivePrice} / Saison
            </h4>
            {isPreSale && abonnement?.price && Number(abonnement.price) > effectivePrice && (
              <span className="line-through text-gray-500 font-bebas-neue text-lg">
                ${Number(abonnement.price)}
              </span>
            )}
          </div>
          {isPreSale && (
            <p className="text-xs text-brand/80 font-lato mt-1 font-semibold uppercase tracking-wider">
              Prix prévente jusqu&apos;au 6 septembre 2026
            </p>
          )}
        </div>

        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-brand mr-2" />
          13 matchs de saison régulière
        </p>
        <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-brand mr-2" />1 match présaison
        </p>
        {/* <p className="font-lato text-white text-lg mt-4">
          <FaCheck className="inline text-brand mr-2" />1 consommation gratuite
          par match
        </p> */}
        <Link
          href="/abonnement-saison"
          className="mt-12 block text-center bg-brand text-black text-xl px-6 py-2 rounded-md hover:bg-brand-dark transition-colors"
        >
          <span className="font-bebas-neue">Achetez maintenant</span>
        </Link>
      </div>
    </section>
  );
};

export default AbonnementSection;
