import { GoogleTagManager } from "@next/third-parties/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import "./css/card.scss";
import "./css/globals.scss";

const ScrollToTop = dynamic(() => import('./components/helper/scroll-to-top'));



import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { personalData } from "@/utils/data/personal-data";
import dynamic from "next/dynamic";

export const metadata = {
  title: `Portfolio of ${personalData.name} - Software Developer`,
  description:
    `This is the portfolio of ${personalData.name}. I am a full stack developer and a self taught developer. I love to learn new things and I am always open to collaborating with others. I am a quick learner and I am always looking for new challenges.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} ${GeistMono.variable}`}>
        <ToastContainer />
        <Navbar />
        <main className="min-h-screen relative mt-14 mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
          {children}
          <ScrollToTop />
        </main>
        <Footer />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
    </html>
  );
}
