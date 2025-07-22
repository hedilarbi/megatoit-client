import SuccessContent from "@/components/SuccessContent";
import React from "react";

const Page = async ({ searchParams }) => {
  // You need to await searchParams before accessing its properties
  const awaitedSearchParams = await searchParams;

  const paymentIntentId = awaitedSearchParams?.payment_intent || null;

  return (
    <div className="bg-[#F8F8F8] w-screen py-20">
      <SuccessContent paymentIntentId={paymentIntentId} />
    </div>
  );
};

export default Page;
