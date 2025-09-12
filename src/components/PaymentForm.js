"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentForm({
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
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        currency: "cad",
        amount: Math.trunc(amount * 100), // amount in cents
        locale: "fr",
      }}
    >
      <CheckoutForm
        amount={amount}
        userId={userId}
        quantity={quantity}
        matchId={matchId}
        ticketPrice={ticketPrice}
        abonnementId={abonnementId}
        abonnementPrice={abonnementPrice}
        userName={userName}
        email={email}
        codeId={codeId}
      />
    </Elements>
  );
}
