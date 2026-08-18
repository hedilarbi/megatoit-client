"use client";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import React from "react";
import Logo from "@/assets/logo.png"; // Adjust the path as necessary
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RiMenu3Fill } from "react-icons/ri";
import SideBar from "./SideBar";
import { FaUserAlt } from "react-icons/fa";
const Header = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const handleLogout = async () => {
    try {
      setShowSidebar(false); // Close sidebar on logout
      await signOut(auth);
    } catch (error) {
      console.error("Échec de la déconnexion :", error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  return (
    <div className="h-20 md:h-24 bg-black fixed top-0 left-0 w-full flex items-center px-4 md:px-16 z-50 justify-between shadow-md border-b-4 border-brand">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link href="/">
          <Image src={Logo} alt="Logo" className="h-10 md:h-14 w-auto" />
        </Link>
      </div>

      {/* Links for desktop */}
      <div className="hidden md:flex flex-grow justify-center gap-8 font-bebas-neue text-lg">
        <Link
          href="/"
          className={`text-white hover:text-brand transition-colors ${pathname === "/" && "text-brand underline decoration-2 underline-offset-4"
            } `}
        >
          Accueil
        </Link>
        <Link
          href="/calendrier"
          className={`text-white hover:text-brand transition-colors ${pathname === "/calendrier" && "text-brand underline decoration-2 underline-offset-4"
            } `}
        >
          Saison & Billets
        </Link>
        <Link
          href="/abonnement-saison"
          className={`text-white hover:text-brand transition-colors ${pathname === "/abonnement-saison" && "text-brand underline decoration-2 underline-offset-4"
            } `}
        >
          Devenir Membre
        </Link>
        {/* <Link
          href="https://megatoit.atelierqg.com/"
          target="_blank"
          className="text-white hover:text-brand transition-colors"
        >
          Boutique Officielle
        </Link> */}
        <Link
          href="/partenaires"
          className={`text-white hover:text-brand transition-colors ${pathname === "/partenaires" && "text-brand underline decoration-2 underline-offset-4"
            } `}
        >
          Nos précieux partenaires
        </Link>
        <Link
          href="/notre-mission"
          className={`text-white hover:text-brand transition-colors ${pathname === "/notre-mission" && "text-brand underline decoration-2 underline-offset-4"
            } `}
        >
          L&apos;Esprit BSR
        </Link>
        <Link
          href="/contact"
          className={`text-white hover:text-brand transition-colors ${pathname === "/contact" && "text-brand underline decoration-2 underline-offset-4"
            } `}
        >
          Nous Contacter
        </Link>
      </div>

      {/* Buttons or Hamburger Menu */}
      <div className="flex-shrink-0">
        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-center px-10 py-1 bg-brand border border-brand hover:bg-brand-dark text-black rounded-md cursor-pointer transition-colors"
            >
              <span className="font-bebas-neue text-center">
                se déconnecter
              </span>
            </button>
            <Link
              href="/profil"
              className={`text-white hover:text-brand transition-colors ${pathname === "/profil" && "text-brand"
                } `}
            >
              <FaUserAlt size={24} />
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/connexion"
              className="border border-white text-white px-10 py-1 rounded-md bg-transparent hover:bg-brand hover:text-black hover:border-brand transition-colors"
            >
              <span className="font-bebas-neue text-center">Se connecter</span>
            </Link>
            <Link
              href="/inscription"
              className="text-center px-10 py-1 bg-brand border border-brand hover:bg-brand-dark text-black rounded-md transition-colors"
            >
              <span className="font-bebas-neue text-center">
                s&apos;inscrire
              </span>
            </Link>
          </div>
        )}
        {/* Hamburger Menu for mobile/tablet */}
        <div className="md:hidden block">
          <button className="text-white" onClick={toggleSidebar}>
            <RiMenu3Fill size={32} className="text-white" />
          </button>
        </div>
      </div>
      <SideBar
        toggleSidebar={toggleSidebar}
        showSidebar={showSidebar}
        pathname={pathname}
        user={user}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default Header;
