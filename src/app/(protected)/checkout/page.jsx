import CheckoutContent from "@/components/CheckoutContent";
import React from "react";

const Page = async ({ searchParams }) => {
  // You need to await searchParams before accessing its properties
  const awaitedSearchParams = await searchParams;

  const quantity = awaitedSearchParams?.quantity || null;
  const matchId = awaitedSearchParams?.matchId || null;
  const abonnementId = awaitedSearchParams?.abonnementId || null;

  return (
    <div className="bg-[#F8F8F8] w-screen pb-20">
      <CheckoutContent
        matchId={matchId}
        quantity={quantity}
        abonnementId={abonnementId}
      />
    </div>
  );
};

export default Page;
