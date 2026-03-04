import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoldINR Tracker",
  description:
    "Track US Gold ETF prices (GLD, IAU, GLDM) and USD/INR exchange rate. See your combined INR-adjusted daily return at a glance.",
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
