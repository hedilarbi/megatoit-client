import AbonnementSection from "@/components/AbonnementSection";

import HomeBanner from "@/components/HomeBanner";
import MatchsList from "@/components/MatchsList";
import CountDownVendredi from "@/components/CountDownVendredi";
import FacebookFeed from "@/components/FacebookFeed";
export const metadata = {
  title: "Accueil",
  description:
    "Bienvenue sur la page d'accueil de notre application de billetterie de Le Mégatoit Hockey. Découvrez les derniers matchs, abonnez-vous pour la saison et restez informé des événements à venir.",
  keywords: "billetterie, hockey, LE MÉGATOIT, abonnements, matchs",
  openGraph: {
    title: "Accueil - LE MÉGATOIT HOCKEY",
    description:
      "Découvrez les derniers matchs et abonnements de LE MÉGATOIT HOCKEY.",
    url: "https://lemegatoit.com",
  },
};

export default function Home() {
  return (
    <div className="pb-20">
      <HomeBanner />
      <CountDownVendredi />
      <MatchsList />
      {/* <Commenditaires /> */}
      <AbonnementSection />
      {/* <CallToActionBanner /> */}
      <FacebookFeed />
    </div>
  );
}
