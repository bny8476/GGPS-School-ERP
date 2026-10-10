import type { Metadata } from "next";
import ThemeInitializer from "@/components/ThemeInitializer";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/providers/QueryProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GGPS School ERP",
  description: "Comprehensive management system for GGPS School",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

import MainWrapper from "@/components/MainWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <ThemeInitializer />
      </head>
      <body className={`${outfit.variable} font-sans antialiased flex flex-col min-h-screen bg-white dark:bg-[#000a1f] text-[#000E28] dark:text-white transition-colors duration-200`}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <Navbar />
              <MainWrapper>
                {children}
              </MainWrapper>
              <Footer />
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
