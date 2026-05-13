import { Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export default function Footer() {
  return (
    <Flex
      as="footer"
      w="95%"
      h={5}
      align="center"
      justify="space-between"
      borderTop="1px solid #454545"
      borderBottom="1px solid #454545"
      py={5}
      mx="auto"
      my={8}
    >
      <Text px={8}>SMARTDROP</Text>
      <ChakraLink
        as={NextLink}
        href="/contributors"
        px={8}
        color="white"
        textDecoration="underline"
        fontSize="sm"
      >
        Contributors (Lernza community)
      </ChakraLink>
      <Text px={8}>2026</Text>
    </Flex>
  );
}
