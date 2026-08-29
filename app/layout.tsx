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
  title: "Velyquo | Intelligent Aesthetic Clinic Platform",
  description:
    "Velyquo helps aesthetic clinics manage patients, analyse skin, personalise treatments, track progress and run their clinic from one intelligent workspace.",
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