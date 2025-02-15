"use client";

// import "./globals.scss";
import { AuthContextProvider, useAuthContext } from "@/context/AuthContext";
import "@/css/satoshi.css";
import "@/css/style.css";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// export const metadata = {
//   title: "Leicester Bakery",
//   description: "Generated by create next app",
// };

export default function RootLayout({ children }) {
    
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">{children}</div>
        </AuthContextProvider>
      </body>
    </html>
  );
}
