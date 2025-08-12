import CtaMatchsBanner from "@/components/CtaMatchsBanner";
import MatchsBanner from "@/components/MatchsBanner";
import MatchsContent from "@/components/MatchsContent";
import React from "react";

const page = () => {
  return (
    <div className="pb-20">
      <MatchsBanner />
      <MatchsContent />
      <CtaMatchsBanner />
    </div>
  );
};

export default page;
