import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "Plekxa Creator Studio",
    template: "%s | Plekxa Creator Studio",
  },
  description:
    "Manage Plekxa opportunities, commissions, deliverables, contracts, Index certificates and earnings.",
  applicationName: "Plekxa Creator Studio",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
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