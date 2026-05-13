"use client";

import { StellarWalletProvider } from "@/context/StellarWalletContext";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { type ReactNode, useState } from "react";

function ContextProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <StellarWalletProvider>{children}</StellarWalletProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default ContextProvider;
