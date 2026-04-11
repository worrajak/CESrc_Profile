import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CESRU - Clean Energy System Research Unit | RMUTL",
  description: "ระบบฐานข้อมูลนักวิจัย หน่วยวิจัยระบบพลังงานสะอาด มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา",
  keywords: ["CESRU", "RMUTL", "Clean Energy", "Solar Energy", "Research", "Researcher Profile"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
