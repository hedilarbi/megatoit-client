import React from "react";

import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import ContactBanner from "@/components/ContactBanner";
import { IoMdPin } from "react-icons/io";

const page = () => {
  return (
    <div className="pb-20">
      <ContactBanner />

      <div className="mt-14  py-8 px-6  w-full md:w-[95%] mx-auto">
        <h2 className="font-bebas-neue md:text-5xl text-3xl text-center ">
          nos contacts
        </h2>

        <div className="mt-10 flex md:flex-row flex-col md:px-20 justify-center items-center gap-8">
          <div className="flex-1 w-full flex flex-col items-center bg-[#f3f4f6] px-4 py-8 rounded-md">
            <div className="bg-black flex p-3 rounded-full justify-center items-center">
              <IoMail size={28} color="white" />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              Email
            </h3>
            <p className="text-center font-lato mt-3 font-semibold">
              contact@megatoit.com
            </p>
          </div>
          <div className="flex-1 flex w-full flex-col items-center bg-[#f3f4f6] px-4 py-8 rounded-md">
            <div className="bg-black flex p-3 rounded-full justify-center items-center">
              <FaPhoneAlt size={28} color="white" />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              Téléphone
            </h3>
            <p className="text-center font-lato mt-3 font-semibold">
              12 12 12 12 12 12
            </p>
          </div>
          <div className="flex-1 flex w-full flex-col items-center bg-[#f3f4f6] px-4 py-8 rounded-md">
            <div className="bg-black flex p-3 rounded-full justify-center items-center">
              <IoMdPin size={28} color="white" />
            </div>
            <h3 className="font-lato font-bold mt-4 text-2xl text-center">
              Adresse
            </h3>
            <p className="text-center font-lato mt-3 font-semibold">
              Colisée Jean-Guy-Talbot
            </p>
          </div>
        </div>
        <div className="w-full h-[500px] mt-20">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2754.0994306476287!2d-72.56155808863868!3d46.347570973947455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc7c8b1b4330ec1%3A0xe22ea2d888da9b3e!2sColis%C3%A9e%20Jean-Guy%20Talbot!5e0!3m2!1sfr!2stn!4v1752437524943!5m2!1sfr!2stn"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default page;
