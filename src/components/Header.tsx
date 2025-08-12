"use client";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import React from "react";
import Logo from "@/assets/logo-small.png"; // Adjust the path as necessary
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
      console.error("Logout failed:", error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  return (
    <div className="h-20 bg-white fixed top-0 left-0 w-full flex items-center px-4 md:px-16 z-50  justify-between shadow-md border-b border-gray-200">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link href="/">
          <Image src={Logo} alt="Logo" className="h-12 w-auto" />
        </Link>
      </div>

      {/* Links for desktop */}
      <div className="hidden md:flex flex-grow justify-center gap-8  font-bebas-neue text-lg">
        <Link
          href="/"
          className={`text-black hover:underline  ${
            pathname === "/" && "underline"
          } `}
        >
          Accueil
        </Link>
        <Link
          href="/calendrier"
          className={`text-black hover:underline ${
            pathname === "/calendrier" && "underline"
          } `}
        >
          Calendrier
        </Link>
        <Link
          href="/abonnement-saison"
          className={`text-black hover:underline ${
            pathname === "/abonnement-saison" && "underline"
          } `}
        >
          Abonnement saison
        </Link>
        <Link
          href="/partenaires"
          className={`text-black hover:underline ${
            pathname === "/partenaires" && "underline"
          } `}
        >
          Nos partenaires
        </Link>
        <Link
          href="/notre-mission"
          className={`text-black hover:underline ${
            pathname === "/notre-mission" && "underline"
          } `}
        >
          Notre mission
        </Link>
        <Link
          href="/contact"
          className={`text-black hover:underline ${
            pathname === "/contact" && "underline"
          } `}
        >
          Contact
        </Link>
      </div>

      {/* Buttons or Hamburger Menu */}
      <div className="flex-shrink-0">
        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="   text-center px-10 bg-black border border-black hover:text-black hover:bg-white text-white rounded-md cursor-pointer"
            >
              <span className="font-bebas-neue  text-center   ">
                Déconnexion
              </span>
            </button>
            <Link
              href="/profil"
              className={`text-black hover:underline ${
                pathname === "/profil" && "underline"
              } `}
            >
              <FaUserAlt size={28} />
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/connexion"
              className=" border border-black text-black hover:text-white px-10  rounded-md bg-white hover:bg-black  transition-colors  "
            >
              <span className="font-bebas-neue text-center">Connexion</span>
            </Link>
            <Link
              href="/inscription"
              className="   text-center px-10 bg-black border border-black hover:text-black hover:bg-white text-white rounded-md  "
            >
              <span className="font-bebas-neue  text-center   ">
                Inscription
              </span>
            </Link>
          </div>
        )}
        {/* Hamburger Menu for mobile/tablet */}
        <div className="md:hidden block">
          <button className="text-black" onClick={toggleSidebar}>
            <RiMenu3Fill size={32} color="black" />
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
