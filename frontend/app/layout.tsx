import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Contexts from "./contexts/ContextWrapper";
import OverlayWrapper from "./overlays/OverlayWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "What Anime?",
  description: "Quickly see what anime song you are listening to!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/amq_icon_green.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Contexts>
          <OverlayWrapper>
            {children}
          </OverlayWrapper>
        </Contexts>
      </body>
    </html>
  );
}
