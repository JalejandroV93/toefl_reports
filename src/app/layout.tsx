import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/assets/styles/print.css"
import { ReportProvider } from "@/providers/ReportProvider";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TOEFL Assessment Reports",
  description: "Sistema de reportes para evaluaciones TOEFL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReportProvider>
          {children}
        </ReportProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}