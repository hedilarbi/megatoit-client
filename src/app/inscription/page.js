"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { createUserDocument } from "@/services/user.service";
import { auth } from "@/lib/firebase";
import Logo from "@/assets/logo-big.png";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa6";
import Spinner from "@/components/spinner/Spinner";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

/** Conversion des codes d'erreur Firebase Auth -> messages FR */
const getAuthErrorMessageFr = (error) => {
  const code =
    (error instanceof FirebaseError && error.code) || error?.code || "";

  const M = {
    "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/missing-email": "Veuillez saisir une adresse e-mail.",
    "auth/missing-password": "Veuillez saisir un mot de passe.",
    "auth/weak-password":
      "Le mot de passe est trop faible (au moins 6 caractères).",
    "auth/operation-not-allowed":
      "Cette méthode d’authentification est désactivée.",
    "auth/user-disabled": "Ce compte a été désactivé.",
    "auth/user-not-found": "Aucun compte ne correspond à cet e-mail.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Identifiants invalides.",
    "auth/credential-already-in-use":
      "Ces identifiants sont déjà utilisés par un autre compte.",
    "auth/account-exists-with-different-credential":
      "Un compte existe déjà avec cet e-mail via un autre fournisseur. Essayez une autre méthode de connexion.",
    "auth/requires-recent-login":
      "Action sensible : veuillez vous reconnecter puis réessayer.",
    "auth/too-many-requests":
      "Trop de tentatives. Veuillez réessayer plus tard.",
    "auth/network-request-failed":
      "Problème de connexion réseau. Vérifiez votre internet.",
    "auth/popup-closed-by-user":
      "La fenêtre a été fermée avant la fin de l’opération.",
    "auth/popup-blocked":
      "La fenêtre contextuelle a été bloquée par le navigateur.",
    "auth/cancelled-popup-request":
      "Une autre fenêtre d’authentification est déjà ouverte.",
  };

  if (M[code]) return M[code];

  // Fallback lisible si on ne connaît pas le code
  if (typeof code === "string" && code.startsWith("auth/")) {
    return `Erreur d’authentification : ${code
      .replace("auth/", "")
      .replaceAll("-", " ")}.`;
  }
  return "Une erreur inattendue est survenue. Veuillez réessayer.";
};

const InscriptionPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
    phone: "",
    dateOfBirth: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Met les e-mails d’auth Firebase (vérif, reset) en français
    auth.languageCode = "fr";
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/"); // déjà connecté -> on renvoie vers l'accueil
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, userName, phone, dateOfBirth } = formData;

    try {
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (!email || !password || !userName || !dateOfBirth) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      setError("");
      setIsLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUserDocument(userCredential.user.uid, {
        email,
        userName,
        phone,
        type: "client",
        dateOfBirth,
        createdAt: new Date(),
      });

      // E-mail de vérification (sera en FR grâce à languageCode)
      await sendEmailVerification(userCredential.user);

      router.replace("/");
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessageFr(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      setError("");
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      await createUserDocument(gUser.uid, {
        email: gUser.email || "",
        userName: gUser.displayName || "",
        type: "client",
        createdAt: new Date(),
      });

      router.back();
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessageFr(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center md:justify-start justify-center bg-[#F7F7F7] md:mt-20 mt:20">
      <Header />
      {isLoading && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/40 flex justify-center items-center z-50">
          <Spinner />
        </div>
      )}

      <div className="hidden w-1/2 md:flex justify-center items-center bg-white shadow-2xl h-screen">
        <Image src={Logo} alt="Logo" className="h-48 w-auto" />
      </div>

      <div className="px-8 py-4 rounded flex-1 overflow-y-auto h-screen">
        <div className="w-full">
          <h1 className="md:text-3xl text-2xl font-bold mb-3 font-bebas-neue text-center md:text-left mt-4">
            S&apos;inscrire
          </h1>
          <p className="mt-2 font-lato text-sm md:text-base">
            Créez un compte pour acheter vos billets
          </p>

          {error && <p className="text-red-500 mb-3">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3 mt-3">
              <label
                htmlFor="userName"
                className="block text-base font-medium text-gray-700"
              >
                Prénom et Nom
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Courriel
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="dateOfBirth"
                className="block text-base font-medium text-gray-700"
              >
                Date de naissance
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="confirmPassword"
                className="block text-base font-medium text-gray-700"
              >
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded font-bebas-neue text-2xl cursor-pointer"
            >
              S&apos;inscrire
            </button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500 text-xl uppercase">ou</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-black text-black py-2 px-4 rounded justify-center flex items-center cursor-pointer gap-4"
            >
              <FaGoogle size={24} />
              <span className="font-bebas-neue text-2xl">
                S&apos;inscrire avec Google
              </span>
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-500">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="text-black font-semibold hover:underline"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionPage;
