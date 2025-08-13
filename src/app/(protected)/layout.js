import Footer from "@/components/Footer";
import Header from "@/components/Header";

import SponsorsBar from "@/components/SponsorsBar";
export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <main className="mt-20 w-screen ">{children}</main>
      <SponsorsBar />
      <Footer />
    </>
  );
}
