import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

import Spinner from "./spinner/Spinner";
import { getMatchById } from "@/services/match.service";

const CheckoutForm = ({
  amount,

  userId,
  matchId,
  quantity,
  ticketPrice,
  abonnementPrice,
  abonnementId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) return;

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Error submitting payment:", submitError);
        setError(submitError.message);
        setLoading(false);
        return;
      }
      if (matchId) {
        const matchresponse = await getMatchById(matchId);
        if (matchresponse.success) {
          if (matchresponse.data.availableSeats < quantity) {
            setError("Le nombre de tickets séléctionné n'est pas disponible");
            return;
          }
        }
      }
      if (!userId) {
        setError("Vous devez être connecté pour effectuer un paiement");
        setLoading(false);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/commande-en-cours`, // Adjust this URL to your success page
        },
      });

      if (error) {
        console.error("Payment confirmation error:", error);

        setError(error.message);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount * 100,
        currency: "cad",
        userId,
        quantity,
        matchId,
        ticketPrice,
        abonnementId,
        abonnementPrice,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setError("Un problème est survenu lors de la création du paiement");
      });
  }, []);

  if (!stripe || !elements || !clientSecret) {
    return (
      <div className="w-full md:w-1/2 lg:w-1/3 h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-md p-2 w-full  mx-auto  mt-4"
    >
      {clientSecret && <PaymentElement />}
      {error && (
        <div className="text-red-400 text-center font-lato font-semibold text-lg my-4">
          {error}
        </div>
      )}
      <button
        disabled={!stripe || loading}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold text-xl disabled:opacity-50 disabled:animate-pulse font-bebas-neue cursor-pointer"
      >
        {!loading ? "CONFIRMER LE PAIEMENT" : "Chargement..."}
      </button>
    </form>
  );
};
export default CheckoutForm;
