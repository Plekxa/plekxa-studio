import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plekxa — Original experiences for how you feel",
  description:
    "Listen, watch and discover original Plekxa experiences made for real moments.",
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