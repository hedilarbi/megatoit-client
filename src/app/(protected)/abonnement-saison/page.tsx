import AbonnementContent from "@/components/AbonnementContent";
import AbonnementsBanner from "@/components/AbonnementsBanner";
import React from "react";

const page = () => {
  return (
    <div className="bg-[#F8F8F8]">
      <AbonnementsBanner />
      <AbonnementContent />
    </div>
  );
};

export default page;
