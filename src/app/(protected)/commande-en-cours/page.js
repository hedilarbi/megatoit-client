import React from "react";
import CommandeEnCours from "../../../components/CommandeEnCours";

const page = async ({ searchParams }) => {
  const params = await searchParams;
  const payment_intent = params.payment_intent ?? "";

  return <CommandeEnCours paymentIntent={payment_intent} />;
};

export default page;
