import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
const TicketQuantityModal = ({
  setShowModal,
  setTicketQuantity,
  ticketQuantity,
  match,
}) => {
  const router = useRouter();
  const handlePassToCheckout = () => {
    if (ticketQuantity < 1) {
      alert("Veuillez sélectionner au moins un ticket.");
      return;
    }

    if (ticketQuantity > match.availableSeats) {
      alert(
        `Le nombre de tickets sélectionnés (${ticketQuantity}) dépasse le nombre de places disponibles (${match.availableSeats}).`
      );
    }
    router.push(
      `/checkout?quantity=${ticketQuantity}&matchTitle=${encodeURIComponent(
        match.title
      )}`
    );
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={28} />
        </button>

        {/* Modal Content */}
        <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">
          Nombre de tickets à acheter
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Vueillez sélectionner le nombre de tickets que vous souhaitez acheter
          pour le match <span className="font-semibold">{match.title}</span> ?
        </p>

        {/* Quantity Input */}
        <div className="flex items-center justify-center mb-4">
          <input
            type="number"
            value={ticketQuantity}
            onChange={(e) => setTicketQuantity(Number(e.target.value))}
            min="1"
            max="10"
            className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={handlePassToCheckout}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Passer à la caisse
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketQuantityModal;
