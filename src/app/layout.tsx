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
      <body>{children}</body>
    </html>
  );
}
