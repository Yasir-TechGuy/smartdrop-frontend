"use client";
import { Button } from "@chakra-ui/react";
import { useStellarWallet } from "@/context/StellarWalletContext";

export default function ConnectWalletButton() {
  const { connect } = useStellarWallet();
  return (
    <Button
      bgColor="#4AE292"
      color="#000"
      borderRadius="3xl"
      position="fixed"
      bottom="20px"
      right="20px"
      p={4}
      onClick={() => void connect()}
    >
      Connect Freighter
    </Button>
  );
}
