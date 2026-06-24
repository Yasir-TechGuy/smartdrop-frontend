"use client";

import { Flex, Text } from "@chakra-ui/react";
import { useStellarWallet } from "@/context/StellarWalletContext";
import Link from "next/link";

function shortenStellarAddress(address: string) {
  if (!address || address.length < 12) {
    return address;
  }
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function Navbar() {
  const { isConnected, publicKey } = useStellarWallet();

  return isConnected && publicKey ? (
    <Flex
      w="95%"
      h={20}
      mx="auto"
      align="center"
      justify="space-between"
      borderTop="1px solid #454545"
      borderBottom="1px solid #454545"
    >
      <Text px={8}>{shortenStellarAddress(publicKey)}</Text>
      <Flex gap={8} p={8}>
        <Link href="/" style={{ color: "white" }}>
          Home
        </Link>
        <Link href="/farm" style={{ color: "white" }}>
          Farm
        </Link>
        <Link href="/history" style={{ color: "white" }}>
          History
        </Link>
        <Link href="/leaderboard" style={{ color: "white" }}>
          Leaderboard
        </Link>
        <Link href="/contributors" style={{ color: "white" }}>
          Contributors
        </Link>
      </Flex>
      <Text px={8} fontWeight="bold">
        SMARTDROP
      </Text>
    </Flex>
  ) : (
    <Flex
      w="95%"
      h={20}
      mx="auto"
      align="center"
      justify="space-between"
      borderTop="1px solid #454545"
      borderBottom="1px solid #454545"
    >
      <Text px={8} fontWeight="bold">
        SMARTDROP
      </Text>
      <Flex gap={8} p={8} align="center" flexWrap="wrap" justify="flex-end">
        <Link href="/history" style={{ color: "white", textDecoration: "underline" }}>
          History
        </Link>
        <Link href="/contributors" style={{ color: "white", textDecoration: "underline" }}>
          Contributors
        </Link>
        <Text>Users online: 213</Text>
        <Text>Total Users: 30,738</Text>
        <Text>Total Value Locked: $302M</Text>
      </Flex>
    </Flex>
  );
}
