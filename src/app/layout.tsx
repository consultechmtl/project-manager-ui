import type { Metadata } from "next";
import "./globals.css";
import Jarvis, { JarvisWelcome } from "@/components/Jarvis";

export const metadata: Metadata = {
  title: "Project Manager - JARVIS",
  description: "AI-powered project management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f23]">
        <JarvisWelcome onComplete={() => {}} />
        {children}
        <Jarvis />
      </body>
    </html>
  );
}
