import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "विश्वकर्मा किराणा स्टोअर्स, शिरोली | किराणा ॲप",
  description: "विश्वकर्मा किराणा स्टोअर्स, शिरोली (ता. घाटंजी, जि. यवतमाळ) - किराणा सामानाची यादी पाठवा, आजच्या भावाने सामान मिळवा, उधारी वही आणि WhatsApp बिलिंग.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
