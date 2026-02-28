import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Grocery AI - Smart Shopping Lists",
  description: "AI-powered grocery list that automatically organizes items by store section",
  openGraph: {
    title: "Grocery AI - Smart Shopping Lists",
    description: "AI-powered grocery list that automatically organizes items by store section",
    images: ["/icon.png"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Grocery AI - Smart Shopping Lists",
    description: "AI-powered grocery list that automatically organizes items by store section",
    images: ["/icon.png"],
  },
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
