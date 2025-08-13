"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { createUserDocument } from "@/services/user.service";
import { auth } from "@/lib/firebase";
import Logo from "@/assets/logo-big.png"; // Adjust the path as necessary
import Image from "next/image";
import { FaGoogle } from "react-icons/fa6";
import Spinner from "@/components/spinner/Spinner";
import Link from "next/link";

const InscriptionPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
    phone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, userName, phone } = formData;

    try {
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      setError(""); // Reset error message
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      //const user = userCredential.user;

      // Send verification email
      // await sendEmailVerification(user);
      await createUserDocument(userCredential.user.uid, {
        email,
        userName,
        phone,
        type: "client", // Default type, can be changed later
        createdAt: new Date(),
      });

      router.push("/"); // Redirect to home or another page
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user.uid, {
        email: user.email || "",
        userName: user.displayName || "",

        type: "client", // Default type, can be changed later
        createdAt: new Date(),
      });
      router.back(); // Redirect to home or another page
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center md:justify-start justify-center  bg-[#F7F7F7] ">
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
            Inscription
          </h1>
          <p className="mt-2 font-lato text-base md:text-xl">
            Créer un compte pour acheter vos tickets
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4 mt-4">
              <label
                htmlFor="userName"
                className="block text-base font-medium text-gray-700"
              >
                Nom et prénom
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

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Email
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
            <div className="mb-4">
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
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700"
              >
                Confirmer mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border-[#B4B4B4] bg-white rounded-md shadow-sm p-3"
                required
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
              <span className=" font-bebas-neue text-2xl">
                S&apos;inscrire avec Google
              </span>
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500">
              Vous avez déja un compte ?{" "}
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
