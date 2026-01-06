import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Bot",
  description: "A chatbot built with Next.js and Agui SDK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

