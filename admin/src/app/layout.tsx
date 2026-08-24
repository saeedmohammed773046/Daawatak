import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "دعوتك | Daawatak - دعوات إلكترونية بلمسة احترافية",
  description: "منصة دعوتك لإنشاء وإرسال الدعوات الإلكترونية والتحقق منها عبر رمز الاستجابة السريعة المشفر ومتابعة الحضور لحظياً.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0B0E14] text-[#F9F9FB] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
