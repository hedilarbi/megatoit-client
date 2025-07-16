import AbonnementSection from "@/components/AbonnementSection";
import CallToActionBanner from "@/components/CallToActionBanner";
import HomeBanner from "@/components/HomeBanner";
import MatchsList from "@/components/MatchsList";

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
