// pages/paiement-en-attente.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/spinner/Spinner";

const CommandeEnCours = ({ paymentIntent }) => {
  const router = useRouter();

  useEffect(() => {
    if (!paymentIntent) return;
    let attempts = 0;

    const interval = setInterval(async () => {
      if (attempts >= 5) {
        clearInterval(interval);
        router.back(); // Navigate back after 3 attempts
        return;
      }
      console.log("Checking payment status for:", paymentIntent);
      try {
        const res = await fetch(
          `/api/payment-status?payment_intent=${paymentIntent}`
        );

        const data = await res.json();
        console.log("Payment status response:", data);
        if (data.paiement_status) {
          clearInterval(interval);
          router.replace(`/paiement-reussi?payment_intent=${paymentIntent}`);
        } else if (data.paiement_status === false) {
          clearInterval(interval);
          router.push("/paiement-echoue");
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }

      attempts++;
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentIntent]);

  return (
    <div className="text-center mt-20 flex h-screen w-screen justify-center items-center">
      <div className="flex flex-col items-center">
        <p className="font-lato font-semibold text-xl mb-6 ">
          Commande en cours de traitement
        </p>
        <Spinner />
      </div>
    </div>
  );
};

export default CommandeEnCours;
