import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raja Gems Testing Lab — Certificate Generator",
  description:
    "Generate gemstone certification cards with embedded QR codes. Raja Gems Testing Lab, Jabalpur (M.P.)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}