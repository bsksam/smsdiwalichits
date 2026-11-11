import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIWALI CHIT | Supermarket Chit Fund Management ERP",
  description: "Complete, production-ready Supermarket Chit Fund ERP with Tamil supermarket chit poster generator, mobile support and receipts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1e3a8a" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
