import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Firm Display",
  description: "Internal law firm display system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
