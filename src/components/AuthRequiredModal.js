import { useRouter } from "next/navigation";
import React from "react";
import { IoClose } from "react-icons/io5";
const AuthRequiredModal = ({ setShowModal }) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <IoClose size={28} />
        </button>

        {/* Modal Content */}
        <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">
          Connexion requise
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Pour pouvoir faire des achats, vous devez être connecté.
        </p>

        {/* Buttons */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => router.push("/connexion")}
            className="px-4 py-2 text-white bg-black rounded-md font-bebas-neue text-xl cursor-pointer"
          >
            Se connecter
          </button>
          <button
            onClick={() => router.push("/inscription")}
            className="px-4 py-2 text-black border border-black bg-white rounded-md font-bebas-neue text-xl cursor-pointer"
          >
            Pas un compte ? Créez un compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
