import Image from "next/image";
import React from "react";
import Logo from "@/assets/logo.png"; // Adjust the path as necessary
import Link from "next/link";
import { FaFacebook, FaPhone, FaTiktok } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { RiInstagramFill } from "react-icons/ri";
const Footer = () => {
  return (
    <div>
      <div className="bg-[#D7D7D7]  md:px-20 px-10 pt-8 pb-20 md:pb-30  ">
        <div className="md:flex justify-between flex flex-col md:flex-row gap-8">
          <Link href="/">
            <Image src={Logo} alt="Logo" className="h-20 w-auto mb-4" />
          </Link>

          <div>
            <h3 className="font-bebas-neue text-black text-xl  mb-2">
              Support
            </h3>
            <ul className="font-lato text-black">
              <li className="flex items-center gap-2 mb-2">
                <IoMdMail />
                <p>support@lemegatoit.com</p>
              </li>
              <li className="flex items-center gap-2 mb-2">
                <FaPhone />
                <p>+1 1 23 45 67 89</p>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bebas-neue text-black text-xl  mb-2">
              Suivez-nous
            </h3>
            <div className="flex gap-4">
              <Link
                href="https://www.facebook.com/profile.php?id=61574831637274&locale=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={24} color="black" />
              </Link>
              <Link
                href="https://www.facebook.com/profile.php?id=61574831637274&locale=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RiInstagramFill size={24} color="black" />
              </Link>
              <Link
                href="https://www.facebook.com/profile.php?id=61574831637274&locale=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok size={24} color="black" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4">
          <p className="font-lato text-black text-center">
            © {new Date().getFullYear()} Le Mégatoit Hockey. Tous droits
            réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
