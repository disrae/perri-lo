import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { AdminProvider } from "@/components/admin/AdminContext";
import KeyboardListener from "@/components/admin/KeyboardListener";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Perri Lo - Classical Pianist",
  description: "Official website of Perri Lo, internationally acclaimed classical pianist and composer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AdminProvider>
            <KeyboardListener />
            {children}
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
