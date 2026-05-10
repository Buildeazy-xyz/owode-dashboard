import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OWODE Alajo - Admin Dashboard",
  description: "OWODE Digital Services Limited - Alajo Platform Admin Dashboard",
  verification: {
    google: "PUyl0SQuvaeh2RmKd7Q3reX0Ga9nL3hzBUOs_bjhGBA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="PUyl0SQuvaeh2RmKd7Q3reX0Ga9nL3hzBUOs_bjhGBA" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}