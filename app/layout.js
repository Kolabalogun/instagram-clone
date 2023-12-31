"use client";
import Provider from "@/components/Provider";
import "./globals.css";
import { Inter } from "next/font/google";
import { RecoilRoot } from "recoil";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Instagram",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Instagram</title>
        <link rel="icon" href="/fav.ico" />
      </head>
      <Provider>
        <RecoilRoot>
          <body className={inter.className}>{children}</body>
        </RecoilRoot>
      </Provider>
    </html>
  );
}
