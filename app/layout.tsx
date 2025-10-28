// lvcu04/ecommerce-website/ecommerce-website-00324e89d06c51b533ee0b8d5c991011da91ce99/app/layout.tsx
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AuthWrapper from "./components/AuthWrapper"; // <-- 1. Import AuthWrapper

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {/* 2. Bọc toàn bộ nội dung trong AuthWrapper */}
        <AuthWrapper>
          <Header />
          <main className="min-h-screen">{children}</main>
          {modal}
          <Footer />
        </AuthWrapper>
      </body>
    </html>
  );
}