import AbonnementSection from "@/components/AbonnementSection";
import CallToActionBanner from "@/components/CallToActionBanner";
import HomeBanner from "@/components/HomeBanner";
import MatchsList from "@/components/MatchsList";

export const metadata = {
  title: "Accueil",
  description:
    "Bienvenue sur la page d'accueil de notre application de billetterie de Megatoit Hockey. Découvrez les derniers matchs, abonnez-vous pour la saison et restez informé des événements à venir.",
  keywords: "billetterie, hockey, Megatoit, abonnements, matchs",
  openGraph: {
    title: "Accueil - Megatoit Hockey",
    description:
      "Découvrez les derniers matchs et abonnements de Megatoit Hockey.",
    url: "https://lemegatoit.com",
  },
};

export default function Home() {
  return (
    <div className="pb-20">
      <HomeBanner />
      <MatchsList />
      <AbonnementSection />
      <CallToActionBanner />
    </div>
  );
}
