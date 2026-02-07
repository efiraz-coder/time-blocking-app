import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "תכנון זמן שבועי | Weekly Planner",
  description: "אפליקציית ניהול זמן שבועי מודרנית עם Time Blocking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
