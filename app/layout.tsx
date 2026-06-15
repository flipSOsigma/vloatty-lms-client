import type { Metadata } from "next";
import "./globals.css";
import { LmsProvider } from "../context/LmsContext";

export const metadata: Metadata = {
  title: "Vloatty - Learning Management System",
  description: "Premium academic and clinical LMS scheduling dashboard.",
  icons: {
    icon: "/vloatty - Logo Only.png",
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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <LmsProvider>
          {children}
        </LmsProvider>
      </body>
    </html>
  );
}
