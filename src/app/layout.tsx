import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "आपला किराणा | स्थानिक किराणा दुकान ॲप",
  description: "किराणा सामानाची यादी पाठवा, आजच्या भावाने ताजे सामान मिळवा, डिजिटल उधारी वही आणि WhatsApp बिलिंग.",
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
