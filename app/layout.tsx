import type { Metadata } from "next";
import ClerkClientProvider from "./clerk-provider";
import "./globals.css";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
        {clerkEnabled ? <ClerkClientProvider>{children}</ClerkClientProvider> : children}
      </body>
    </html>
  );
}
