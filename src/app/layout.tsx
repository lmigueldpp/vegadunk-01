import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vegadunk",
  description: "Training, recovery, food and health data in one place",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
