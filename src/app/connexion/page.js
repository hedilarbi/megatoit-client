"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { createUserDocument } from "@/services/user.service";
import Spinner from "@/components/spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-big.png"; // Adjust the path as necessary
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

/** Conversion des codes d'erreur Firebase Auth -> messages FR */
const getAuthErrorMessageFr = (error) => {
  const code =
    (error instanceof FirebaseError && error.code) || error?.code || "";
  const M = {
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Identifiants invalides.",
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/user-disabled": "Ce compte a été désactivé.",
    "auth/too-many-requests": "Trop de tentatives. Veuillez réessayer plus tard.",
    "auth/network-request-failed": "Problème de connexion réseau. Vérifiez votre internet.",
    "auth/popup-closed-by-user": "La fenêtre a été fermée avant la fin de l'opération.",
    "auth/popup-blocked": "La fenêtre contextuelle a été bloquée par le navigateur.",
    "auth/cancelled-popup-request": "Une autre fenêtre d'authentification est déjà ouverte.",
    "auth/account-exists-with-different-credential":
      "Un compte existe déjà avec cet e-mail via un autre fournisseur.",
  };
  if (M[code]) return M[code];
  if (typeof code === "string" && code.startsWith("auth/"))
    return `Erreur d'authentification : ${code.replace("auth/", "").replaceAll("-", " ")}.`;
  return "Une erreur s'est produite. Veuillez réessayer.";
};
export default function ConnexionPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    // BUG FIX: validate BEFORE setIsLoading(true) to avoid infinite spinner
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    try {
      setError("");
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err) {
      console.error("Error signing in:", err.code);
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
      // BUG FIX: use replace("/") instead of back() to avoid empty-history loop
      router.replace("/");
    } catch (err) {
      // BUG FIX: use French error messages instead of raw Firebase English message
      setError(getAuthErrorMessageFr(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/"); // Redirect to home if already logged in
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center md:justify-start justify-center  bg-[#F7F7F7] font-lato mt-20">
      <Header />
      {isLoading && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/40 flex justify-center items-center z-50">
          <Spinner />
        </div>
      )}
      <div className="hidden  w-1/2 md:flex justify-center items-center bg-black shadow-2xl h-screen ">
        <Image src={Logo} alt="Logo" className="h-48 w-auto" />
      </div>
      <div className="flex items-center p-8 rounded   flex-1">
        <div className="w-full">
          <h1 className="md:text-4xl text-3xl font-bold mb-4 font-bebas-neue text-center md:text-left">
            Se connecter
          </h1>
          <p className="mt-2 font-lato text-base md:text-xl">
            Accédez à votre compte pour acheter vos billets
          </p>

          <div>
            <div className="mb-4 mt-4">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Courriel
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
              />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between ">
                <label
                  htmlFor="password"
                  className="block text-base font-medium text-gray-700 font-lato"
                >
                  Mot de passe
                </label>
                <Link
                  href={"/mot-de-passe-oublie"}
                  className="text-black underline font-semibold font-lato"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={(e) => handleEmailSignIn(e)}
              className="w-full bg-brand hover:bg-brand-dark text-black py-2 px-4 rounded font-bebas-neue text-2xl cursor-pointer transition-colors"
            >
              Se connecter
            </button>
          </div>
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
              <span className=" font-bebas-neue text-2xl">
                Connexion avec Google
              </span>
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500">
              Pas encore de compte ?{" "}
              <Link
                href="/inscription"
                className="text-black font-semibold hover:underline"
              >
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
