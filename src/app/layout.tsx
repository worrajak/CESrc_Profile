import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AuthProvider } from "@/lib/AuthContext";
import { I18nProvider } from "@/lib/I18nContext";
import ConsentBanner from "@/components/ConsentBanner";
import EngagementTracker from "@/components/EngagementTracker";
import { getServerLocale } from "@/lib/i18n-server";

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
  const locale = getServerLocale();
  return (
    <html lang={locale}>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <I18nProvider initialLocale={locale}>
          <AuthProvider>
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <EngagementTracker />
            <ConsentBanner />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
