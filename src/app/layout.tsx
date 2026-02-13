import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AETERNUM MARK X",
  description: "Aeternum Mark X - Private AI Command Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
