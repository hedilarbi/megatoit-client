import React from "react";
import CommandeEnCours from "../../../components/CommandeEnCours";

const page = ({ params }) => {
  const { paymentIntent } = params;
  return <CommandeEnCours paymentIntent={paymentIntent} />;
};

export default page;
