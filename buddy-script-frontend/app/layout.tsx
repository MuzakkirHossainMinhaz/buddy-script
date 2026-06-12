import type { Metadata } from "next";
import Script from "next/script";
import "../public/assets/css/bootstrap.min.css";
import "../public/assets/css/common.css";
import "../public/assets/css/main.css";
import "../public/assets/css/responsive.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "Buddy Script Social Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/assets/images/logo-copy.svg" />
        <link rel="stylesheet" href="/assets/fonts/flaticon/flaticon.css" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Script
          src="/assets/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
