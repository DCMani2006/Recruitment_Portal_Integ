import type { Metadata } from "next";
import "@fontsource/pirata-one";
import "@fontsource/anton";
import "@fontsource/im-fell-english";
import "@fontsource/im-fell-english/400-italic.css";
import "@fontsource/old-standard-tt";
import "@fontsource/old-standard-tt/700.css";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "The TAM Times — Recruitment Portal | The AI & ML Club",
  description:
    "Official recruitment gazette of TAM (The AI & ML Club). Turn the pages to explore domains, inspect requirements, and submit your dispatches at the Subscriber's Desk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthGate>{children}</AuthGate>
        </SessionProvider>
      </body>
    </html>
  );
}
