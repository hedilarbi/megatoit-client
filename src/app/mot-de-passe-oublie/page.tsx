// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        `Si un compte existe pour ${email}, vous recevrez un lien de réinitialisation sous peu.`
      );
    } catch (err: any) {
      // you could inspect err.code for more specific messaging
      setError(
        "Échec de l'envoi de l'email de réinitialisation. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Mot de passe oublié ?</h1>

      {message && <p className="bg-green-100 p-3 rounded mb-4">{message}</p>}
      {error && <p className="bg-red-100   p-3 rounded mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          <span>Adresse e-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-2 rounded bg-black text-white  disabled:opacity-50"
        >
          {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
        </button>
      </form>
    </div>
  );
}
