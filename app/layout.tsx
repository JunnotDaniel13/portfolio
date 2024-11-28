import type { Metadata } from "next";
import localFont from "next/font/local";
import "./css/globals.css";
import Navbar from "./components/navbar";
import ScrollToTop from "./components/helper/scroll-to-top";
import Footer from "./components/footer";
import { personalData } from "@/utils/data/personal-data";
import { ToastContainer } from "react-toastify";
import { getLocale, getMessages } from "next-intl/server";

import { NextIntlClientProvider } from "next-intl";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: `${personalData.name} - Software Developer`,
  description: `This is the portfolio of ${personalData.name}. I am a full stack developer and a self taught developer. I love to learn new things and I am always open to collaborating with others. I am a quick learner and I am always looking for new challenges.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer />
        <Navbar />
        <main className="min-h-screen relative mt-14 mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
          <ScrollToTop />
        </main>
        <Footer />
      </body>
    </html>
  );
}
