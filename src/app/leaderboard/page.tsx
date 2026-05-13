"use client";
import { Flex, Input, Text } from "@chakra-ui/react";
import { useState } from "react";

const leaderboardRows = [
  { name: "amacaseybae", place: 1, points: "0.00102" },
  { name: "amacaseybae", place: 2, points: "0.00102" },
  { name: "amacaseybae", place: 3, points: "0.00102" },
  { name: "amacaseybae", place: 4, points: "0.00102" },
  { name: "amacaseybae", place: 5, points: "0.00102" },
  { name: "amacaseybae", place: 6, points: "0.00102" },
  { name: "amacaseybae", place: 7, points: "0.00102" },
  { name: "amacaseybae", place: 8, points: "0.00102" },
  { name: "amacaseybae", place: 9, points: "0.00102" },
  { name: "amcaseybae", place: 10, points: "0.00102" },
];

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = leaderboardRows.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Flex direction="column" align="center" mt={16}>
      <Text fontSize="4xl" fontWeight="bold">
        LEADERBOARD
      </Text>
      <Text>You are rank 0 in total of 31,694 unique farmers.</Text>
      <Input
        placeholder="Search.."
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        w="100%"
        maxW="300px"
        my={8}
        borderRadius="2xl"
        borderColor="#454545"
        _placeholder={{
          color: "#A2A2A2",
        }}
        _hover={{
          borderColor: "#4ae292",
        }}
        _focus={{
          boxShadow: "none",
          borderColor: "#4ae292",
        }}
      />

      <Flex direction="column">
        {filtered.map((user, index) => (
          <Flex
            key={index}
            borderTop="1px solid #454545"
            borderBottom="1px solid #454545"
            p={4}
          >
            <Text mr={4}>{user.place}</Text>
            <Text mr={64}>{user.name}</Text>
            <Text>{user.points}</Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}
