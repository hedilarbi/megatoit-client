import Link from "next/link";
import React from "react";
import { MdClose } from "react-icons/md";
import { FaFacebook } from "react-icons/fa";
const SideBar = ({
  toggleSidebar,
  showSidebar,
  pathname,
  user,
  handleLogout,
}) => {
  return (
    <div
      className={`${
        showSidebar ? "" : "translate-x-[100%]"
      }  w-[70%] bg-white fixed top-0 right-0 border-l border-gray-200 shadow-md h-screen p-4 z-50 transition-width duration-300 ease-in-out font-bebas-neue text-lg`}
    >
      <div className="flex justify-end mb-4">
        <button className="text-black " onClick={toggleSidebar}>
          <MdClose size={28} />
        </button>
      </div>
      <div className="  flex flex-col justify-center gap-4   mt-8 border-b pb-8 border-black">
        <Link
          href="/"
          onClick={toggleSidebar}
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
          onClick={toggleSidebar}
        >
          Calendrier
        </Link>
        <Link
          href="/abonnement-saison"
          className={`text-black hover:underline ${
            pathname === "/abonnement-saison" && "underline"
          } `}
          onClick={toggleSidebar}
        >
          Abonnement de saison
        </Link>
        <Link
          href="/partenaires"
          className={`text-black hover:underline ${
            pathname === "/partenaires" && "underline"
          } `}
          onClick={toggleSidebar}
        >
          Nos partenaires
        </Link>

        <Link
          href="/notre-mission"
          className={`text-black hover:underline ${
            pathname === "/notre-mission" && "underline"
          } `}
          onClick={toggleSidebar}
        >
          Notre mission
        </Link>
        <Link
          href="/contact"
          className={`text-black hover:underline ${
            pathname === "/contact" && "underline"
          } `}
          onClick={toggleSidebar}
        >
          Contact
        </Link>
      </div>

      {user ? (
        <div className="flex flex-col gap-4 mt-8 border-b pb-8 border-black">
          <Link
            href="/profil"
            className={`text-black hover:underline ${
              pathname === "/profil" && "underline"
            } `}
            onClick={toggleSidebar}
          >
            Profil
          </Link>
          <button onClick={handleLogout} className={`text-black text-left`}>
            Se déconnecter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-8 border-b pb-8 border-black">
          <Link
            href="/connexion"
            className={`text-black hover:underline ${
              pathname === "/connexion" && "underline"
            } `}
            onClick={toggleSidebar}
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className={`text-black hover:underline ${
              pathname === "/inscription" && "underline"
            } `}
            onClick={toggleSidebar}
          >
            S&apos;inscrire
          </Link>
        </div>
      )}
      <div className="flex items-center justify-center mt-4 gap-4 ">
        <Link
          href="https://www.facebook.com/profile.php?id=61574831637274&locale=fr_FR"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook size={24} color="black" />
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
