"use client";

import ConnectWalletButton from "@/components/ConnectWalletButton/ConnectWalletButton";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import ContextProvider from "@/context";
import { useStellarWallet } from "@/context/StellarWalletContext";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isConnected } = useStellarWallet();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
      }}
    >
      <Navbar />
      {isConnected ? (
        <>
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </>
      ) : (
        <>
          <main style={{ flex: 1 }}>{children}</main>
          <ConnectWalletButton />
        </>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </ContextProvider>
  );
}
