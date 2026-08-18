"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/HomeAbonnementSection.module.css";
import { FaCheck, FaTicketAlt } from "react-icons/fa";
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
    <section className={`${styles.AbonnementSection} overflow-hidden rounded-[2rem] shadow-2xl relative group`}>
      {/* Dark overlay for better readability on the background image */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 z-0"></div>

      {/* Decorative neon glow blob */}
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-brand/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Left Column - Copy & CTA */}
        <div className="flex-1 text-left">
          <h2 className="font-bebas-neue text-5xl md:text-7xl text-white leading-none mb-4 uppercase">
            Vivez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#a3ff78]">saison {abonnement?.season || "2026-27"}</span>
            <br />AU CŒUR DE L’ACTION
          </h2>

          <p className="font-lato text-gray-300 text-lg md:text-lg max-w-xl mb-8 leading-relaxed">
            Réservez votre abonnement de saison dès maintenant et profitez d&apos;avantages exclusifs.
            <br />
            Du hockey intense, une ambiance électrisante. Votre BSR !
          </p>

          <Link
            href="/abonnement-saison"
            className="hidden lg:inline-flex items-center gap-3 bg-brand text-black text-xl px-8 py-4 rounded-xl font-bebas-neue tracking-wide hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(123,253,72,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.4)]"
          >
            <FaTicketAlt />
            Réserver mon abonnement
          </Link>
        </div>

        {/* Right Column - Pricing Card (Glassmorphism) */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-brand/50 transition-colors duration-500 overflow-hidden">

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-70"></div>

            <div className="text-center mb-8">
              <h3 className="font-lato text-white uppercase tracking-widest text-sm font-bold mb-2">Passe de saison</h3>
              <div className="flex items-center justify-center gap-3">
                <h4 className="text-white text-6xl font-bold font-bebas-neue tracking-tight">
                  ${effectivePrice}
                </h4>
                {isPreSale && abonnement?.price && Number(abonnement.price) > effectivePrice && (
                  <div className="flex flex-col items-start">
                    <span className="line-through text-gray-500 font-bebas-neue text-2xl">
                      ${Number(abonnement.price)}
                    </span>
                    <span className="text-brand text-xs font-bold uppercase tracking-wider bg-brand/10 px-2 py-0.5 rounded-sm">
                      Économisez ${(Number(abonnement.price) - effectivePrice).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
              {isPreSale && (
                <p className="text-sm text-gray-400 font-lato mt-4">
                  Offre valable jusqu&apos;au <strong className="text-white">6 septembre 2026</strong>.
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-brand/20 p-1.5 rounded-full">
                  <FaCheck className="text-brand text-sm" />
                </div>
                <div>
                  <p className="font-lato text-white font-medium">13 matchs de saison régulière</p>
                  <p className="font-lato text-gray-400 text-sm">Place garantie à chaque rencontre.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-brand/20 p-1.5 rounded-full">
                  <FaCheck className="text-brand text-sm" />
                </div>
                <div>
                  <p className="font-lato text-white font-medium">1 match présaison</p>
                  <p className="font-lato text-gray-400 text-sm">Découvrez l&apos;équipe en avant-première.</p>
                </div>
              </div>
            </div>

            <Link
              href="/abonnement-saison"
              className="lg:hidden flex items-center justify-center gap-3 w-full bg-brand text-black text-xl px-6 py-4 rounded-xl font-bebas-neue tracking-wide hover:bg-white transition-all shadow-[0_5px_20px_rgba(123,253,72,0.3)]"
            >
              <FaTicketAlt />
              Acheter maintenant
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AbonnementSection;
