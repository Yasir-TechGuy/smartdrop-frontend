"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StellarWalletContextValue = {
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const StellarWalletContext = createContext<StellarWalletContextValue | null>(
  null
);

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const freighter = await import("@stellar/freighter-api");
    const connected = await freighter.isConnected();
    if (!connected.isConnected || connected.error) {
      window.alert(
        "Install the Freighter wallet extension: https://www.freighter.app"
      );
      return;
    }

    const allowed = await freighter.isAllowed();
    if (!allowed.isAllowed || allowed.error) {
      const access = await freighter.requestAccess();
      if (access.error || !access.address) {
        return;
      }
      setPublicKey(access.address);
      return;
    }

    const addr = await freighter.getAddress();
    if (addr.error || !addr.address) {
      const access = await freighter.requestAccess();
      if (!access.error && access.address) {
        setPublicKey(access.address);
      }
      return;
    }
    setPublicKey(addr.address);
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  const value = useMemo(
    () => ({
      publicKey,
      isConnected: Boolean(publicKey),
      connect,
      disconnect,
    }),
    [publicKey, connect, disconnect]
  );

  return (
    <StellarWalletContext.Provider value={value}>
      {children}
    </StellarWalletContext.Provider>
  );
}

export function useStellarWallet() {
  const ctx = useContext(StellarWalletContext);
  if (!ctx) {
    throw new Error("useStellarWallet must be used within StellarWalletProvider");
  }
  return ctx;
}
