import AppShell from "@/components/AppShell/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartDrop",
  description: "Stellar-based liquidity-oriented airdrop experiment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
