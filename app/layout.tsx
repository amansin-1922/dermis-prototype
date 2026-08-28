import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DemoDataInitializer from "./components/demo-data-initializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dermis | Aesthetic Clinic Platform",
  description:
    "AI-powered skin analysis, patient management and treatment planning for aesthetic clinics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DemoDataInitializer />
        {children}
      </body>
    </html>
  );
}