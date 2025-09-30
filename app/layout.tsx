import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700"], // light, regular, bold
});

export const metadata: Metadata = {
  title: "Zara / Uniqlo Inspired",
  description: "A modern fashion e-commerce website.",
};

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        {modal}
        <Footer />
      </body>
    </html>
  );
}
