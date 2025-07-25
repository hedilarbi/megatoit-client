import type { Metadata } from "next";
import { Bebas_Neue, Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
});

const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--bebas-neue-font",
});

export const metadata: Metadata = {
  title: "Megatoit Hockey",
  description: "Réservez vos billets pour les matchs de Megatoit Hockey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${lato.variable} ${bebasNeue.variable} antialiased   relative w-screen  `}
      >
        <Toaster position="top-right" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
