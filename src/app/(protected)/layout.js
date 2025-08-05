import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <main className="mt-20 w-screen ">{children}</main>
      <Footer />
    </>
  );
}
