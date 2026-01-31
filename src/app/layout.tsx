import type { Metadata } from "next";
import "./globals.css";
import Jarvis, { JarvisWelcome } from "@/components/Jarvis";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import QuickAddWidget from "@/components/QuickAddWidget";

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
        <div className="fixed top-4 right-4 z-30">
          <NotificationCenter />
        </div>
        {children}
        <Jarvis />
        <KeyboardShortcuts />
        <QuickAddWidget />
      </body>
    </html>
  );
}
