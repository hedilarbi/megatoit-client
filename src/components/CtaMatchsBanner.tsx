import Link from "next/link";
import React from "react";
import { FaTicketAlt } from "react-icons/fa";

const CtaMatchsBanner = () => {
  return (
    <section className="w-[95%] mx-auto relative overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] mt-12 mb-12">
      {/* Background Gradient & Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-0"></div>
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-brand/20 blur-[100px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[200px] h-[200px] bg-brand/10 blur-[80px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row gap-8 justify-between items-center border border-white/10 rounded-2xl">
        <div className="text-center md:text-left">
          <h2 className="text-white font-bebas-neue text-4xl md:text-5xl tracking-wide mb-3">
            ABONNEZ-VOUS POUR LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#a3ff78]">SAISON</span>
          </h2>
          <p className="text-gray-300 font-lato text-lg md:text-xl max-w-2xl leading-relaxed">
            Ne manquez aucune minute de l&apos;action. Accédez à tous les matchs réguliers, profitez d&apos;avantages exclusifs et vivez chaque rencontre intensément.
          </p>
        </div>
        
        <Link
          href={"/abonnement-saison"}
          className="shrink-0 flex items-center justify-center gap-3 bg-brand text-black text-xl md:text-2xl px-10 py-5 rounded-xl font-bebas-neue tracking-wider hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(123,253,72,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.4)]"
        >
          <FaTicketAlt />
          Acheter mon abonnement
        </Link>
      </div>
    </section>
  );
};

export default CtaMatchsBanner;
