import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habitify",
  description: "Habit tracking dashboard for daily progress",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
