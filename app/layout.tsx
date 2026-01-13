import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coaching Platform",
  description: "Simple and secure coaching platform for managing clients and tasks",
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
