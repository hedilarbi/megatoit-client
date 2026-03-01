import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useMemo, useRef, useState } from "react";

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
  userName,
  email,
  codeId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const submitLockRef = useRef(false);
  const checkoutSessionIdRef = useRef(
    typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const paymentIntentPayload = useMemo(
    () => ({
      amount: Math.trunc(Number(amount) * 100),
      currency: "cad",
      userId,
      quantity,
      matchId,
      ticketPrice,
      abonnementId,
      abonnementPrice,
      userName,
      email,
      codeId,
      checkoutSessionId: checkoutSessionIdRef.current,
    }),
    [
      amount,
      userId,
      quantity,
      matchId,
      ticketPrice,
      abonnementId,
      abonnementPrice,
      userName,
      email,
      codeId,
    ]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLockRef.current || loading) {
      return;
    }
    submitLockRef.current = true;
    setLoading(true);
    setError(null);
    if (!stripe || !elements || !clientSecret) {
      setLoading(false);
      submitLockRef.current = false;
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Error submitting payment:", submitError);
        setError(submitError.message);
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
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/commande-en-cours`,
          payment_method_data: {
            billing_details: {
              email: email || undefined,
              name: userName || undefined,
            },
          }, // Adjust this URL to your success page
        },
      });

      if (error) {
        console.error("Payment confirmation error:", error);

        setError(error.message);
        return;
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const createPaymentIntent = async () => {
      if (
        !paymentIntentPayload.userId ||
        !paymentIntentPayload.email ||
        !Number.isInteger(paymentIntentPayload.amount) ||
        paymentIntentPayload.amount <= 0
      ) {
        return;
      }

      setIsCreatingIntent(true);
      setError("");

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentIntentPayload),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "Impossible de créer le paiement");
        }
        if (!ignore) {
          setClientSecret(data.clientSecret || "");
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error creating payment intent:", fetchError);
        if (!ignore) {
          setError("Un problème est survenu lors de la création du paiement");
          setClientSecret("");
        }
      } finally {
        if (!ignore) {
          setIsCreatingIntent(false);
        }
      }
    };

    createPaymentIntent();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [paymentIntentPayload]);

  if (!stripe || !elements || isCreatingIntent) {
    return (
      <div className="w-full flex justify-center items-center mt-10">
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
      {!clientSecret && !error && (
        <div className="w-full flex justify-center items-center my-4">
          <Spinner />
        </div>
      )}
      {error && (
        <div className="text-red-400 text-center font-lato font-semibold text-lg my-4">
          {error}
        </div>
      )}
      <button
        disabled={!stripe || loading || isCreatingIntent || !clientSecret}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold text-xl disabled:opacity-50 disabled:animate-pulse font-bebas-neue cursor-pointer"
      >
        {!loading ? "CONFIRMER LE PAIEMENT" : "Chargement..."}
      </button>
    </form>
  );
};
export default CheckoutForm;
