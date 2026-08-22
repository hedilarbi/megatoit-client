// import AbonnementSection from "@/components/AbonnementSection";

import HomeBanner from "@/components/HomeBanner";
import MatchsList from "@/components/MatchsList";
import CountDownVendredi from "@/components/CountDownVendredi";
import FacebookFeed from "@/components/FacebookFeed";
// import CtaBoutique from "@/components/CtaBoutique";
import AbonnementSection from "@/components/AbonnementSection";
export const metadata = {
  title: "Accueil",
  description:
    "Bienvenue sur la page d'accueil de notre application de billetterie de BSR DE TROIS-RIVIÈRES Hockey. Découvrez les derniers matchs, abonnez-vous pour la saison et restez informé des événements à venir.",
  keywords: "billetterie, hockey, BSR DE TROIS-RIVIÈRES, abonnements, matchs",
  openGraph: {
    title: "Accueil - BSR DE TROIS-RIVIÈRES HOCKEY",
    description:
      "Découvrez les derniers matchs et abonnements de BSR DE TROIS-RIVIÈRES HOCKEY.",
    url: "https://bsr3r.com",
  },
};

export default function Home() {
  return (
    <div className="pb-20">
      <div className="relative mb-48 md:mb-56">
        <HomeBanner />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 md:-bottom-8 translate-y-1/2 w-full z-20 flex justify-center px-4 md:px-0">
          <CountDownVendredi />
        </div>
      </div>
      <AbonnementSection />
      <MatchsList />
      {/* <Commenditaires /> */}
      {/* <CtaBoutique /> */}

      <FacebookFeed />
    </div>
  );
}
