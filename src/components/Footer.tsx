import Image from "next/image";
import React from "react";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
import Link from "next/link";
import { FaFacebook } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="bg-[#D7D7D7]  md:py-8 md:px-20 px-10 py-8   ">
      <div className="md:flex justify-between flex flex-col md:flex-row gap-8">
        <div>
          <Image
            src={Logo}
            alt="Logo"
            className="h-20 w-auto mb-4"
            width={48}
            height={48}
          />
          <p className="font-lato text-black ">
            Équipe professionnelle de hockey qui électrise la glace depuis 1995.
          </p>
        </div>
        <div>
          <h3 className="font-bebas-neue text-black text-2xl  mb-4">
            Liens utiles
          </h3>
          <ul className="font-lato text-black">
            <li className="mb-2">
              <Link href="/" className="hover:underline">
                Accueil
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/matchs" className="hover:underline">
                Matchs
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/abonnements" className="hover:underline">
                Abonnements
              </Link>
            </li>

            <li className="mb-2">
              <Link href="/a-propos" className="hover:underline">
                À propos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bebas-neue text-black text-2xl  mb-4">Support</h3>
          <ul className="font-lato text-black">
            <li className="mb-2">
              <Link href="/" className="hover:underline">
                Contactez-nous
              </Link>
            </li>
            {/* <li className="mb-2">
              <Link href="/matchs" className="hover:underline">
                FAQ
              </Link>
            </li> */}
            <li className="mb-2">
              <Link
                href="/politique-de-remboursement"
                className="hover:underline"
              >
                Politique de remboursement
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bebas-neue text-black text-2xl  mb-4">
            Suivez-nous
          </h3>
          <div className="flex gap-4">
            <Link href="https://www.facebook.com/">
              <FaFacebook size={24} color="black" />
            </Link>
            <Link href="https://www.facebook.com/">
              <FaFacebook size={24} color="black" />
            </Link>
            <Link href="https://www.facebook.com/">
              <FaFacebook size={24} color="black" />
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-4">
        <p className="font-lato text-black text-center">
          © {new Date().getFullYear()} Megatoit Hockey. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Footer;
