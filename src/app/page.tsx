"use client";
import { Flex, Text } from "@chakra-ui/react";
import { useStellarWallet } from "@/context/StellarWalletContext";

export default function Home() {
  const { isConnected } = useStellarWallet();
  return isConnected ? (
    <Flex direction="column" px={16} py={8} align="center">
      <Flex direction="column" w="100%">
        <Text fontSize="6xl" fontWeight="bold" align="left">
          YOU
        </Text>
        <Text fontSize="6xl" fontWeight="bold">
          CURRENTLY
        </Text>
        <Flex justify="space-between" w="100%">
          <Text fontSize="6xl" fontWeight="bold">
            HAVE EARNED:
          </Text>
          <Text fontSize="6xl" fontWeight="bold">
            202 CREDITS
          </Text>
        </Flex>
      </Flex>
      <Flex direction="row" w="100%" py={8}>
        <Flex
          w="33%"
          border="1px solid #454545"
          justify="center"
          direction="column"
        >
          <Flex direction="column" p={2}>
            <Text color="#D1D1D1">Total Users</Text>
            <Text color="#4AE292" fontWeight="bold" fontSize="xl">
              30,738
            </Text>
          </Flex>
        </Flex>
        <Flex
          w="33%"
          border="1px solid #454545"
          justify="center"
          direction="column"
        >
          <Flex direction="column" p={2}>
            <Text color="#D1D1D1">Total Value Locked</Text>
            <Text color="#4AE292" fontWeight="bold" fontSize="xl">
              $302M
            </Text>
          </Flex>
        </Flex>
        <Flex
          w="33%"
          border="1px solid #454545"
          justify="center"
          direction="column"
        >
          <Flex direction="column" p={2}>
            <Text color="#D1D1D1">Users online</Text>
            <Text color="#4AE292" fontWeight="bold" fontSize="xl">
              213
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  ) : (
    <></>
  );
}
