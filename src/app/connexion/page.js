"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument } from "@/services/user.service";
import Spinner from "@/components/spinner/Spinner";
import Image from "next/image";
import Logo from "@/assets/logo-big.png"; // Adjust the path as necessary
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      setError(""); // Reset error message
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);

      router.back();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      setError(""); // Reset error message
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user.uid, {
        email: user.email || "",
        userName: user.displayName || "",

        type: "client", // Default type, can be changed later
        createdAt: new Date(),
      });
      router.back(); // Redirect to dashboard or another page
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center md:justify-start justify-center  bg-[#F7F7F7] font-lato ">
      {isLoading && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/40 flex justify-center items-center z-50">
          <Spinner />
        </div>
      )}
      <div className="hidden  w-1/2 md:flex justify-center items-center bg-white shadow-2xl h-screen ">
        <Image src={Logo} alt="Logo" className="h-48 w-auto" />
      </div>
      <div className="flex items-center p-8 rounded   flex-1">
        <div className="w-full">
          <h1 className="md:text-4xl text-3xl font-bold mb-4 font-bebas-neue text-center md:text-left">
            Connexion
          </h1>
          <p className="mt-2 font-lato text-base md:text-xl">
            Accédez à votre compte pour réserver vos billets
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleEmailSignIn}>
            <div className="mb-4 mt-4">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Email
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
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded font-bebas-neue text-2xl cursor-pointer"
            >
              Se connecter
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
