"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Spinner,
  Tooltip,
  Alert,
  AlertIcon,
  Badge,
  Input,
  Link,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useStellarWallet } from "@/context/StellarWalletContext";
import {
  factoryContractId,
  minLockPeriodSeconds,
  sorobanRpcUrl,
  stellarNetwork,
} from "@/config";
import UnlockModal from "@/components/UnlockModal/UnlockModal";
import { useCountdown } from "@/hooks/useCountdown";
import { unlockAvailableAt, type FarmPosition } from "@/types/farm";
import { useAllUserPositions, usePools, QUERY_KEYS } from "@/hooks/useSorobanQuery";
import { lockAssets, stellarExpertTxUrl } from "@/lib/soroban";
import { normalizeError } from "@/lib/error-handler";
import type { PoolInfo, UserPosition } from "@/lib/soroban";

const ACCENT = "#4ae292";

type DepositStep = "idle" | "simulating" | "signing" | "submitting" | "success" | "error";

type LivePoolRow = {
  id: string;
  name: string;
  earned: string;
  stake: string;
  dailyRate: string;
  totalStakedLiquidity: string;
  symbol: string;
  lockedAmount: number;
  lockedAt: number;
  lockPeriodSeconds: number;
};

function EarningRow({
  position,
  onUnlock,
}: {
  position: FarmPosition;
  onUnlock: (position: FarmPosition) => void;
}) {
  const countdown = useCountdown(unlockAvailableAt(position));
  const hasStake = position.lockedAmount > 0;
  const canUnlock = hasStake && countdown.isElapsed;

  return (
    <Flex
      w="95%"
      h={20}
      mx="auto"
      align="center"
      justify="space-between"
      borderTop="1px solid #454545"
      borderBottom="1px solid #454545"
      px={4}
    >
      <Text>{position.name}</Text>
      <Flex direction="column" minW="110px" align="flex-start">
        <Text fontSize="2xs">Earned</Text>
        <Text>{position.earned}</Text>
      </Flex>
      <Flex direction="column" minW="110px" align="flex-start">
        <Text fontSize="2xs">My Stake</Text>
        <Text>{position.stake}</Text>
      </Flex>
      <Flex direction="column" minW="110px" align="flex-start">
        <Text fontSize="2xs">Daily Rate</Text>
        <Text>{position.dailyRate}</Text>
      </Flex>
      <Flex direction="column" minW="180px" align="flex-start">
        <Text fontSize="2xs">Total Staked Liquidity</Text>
        <Text>{position.totalStakedLiquidity}</Text>
      </Flex>
      <Flex gap={4}>
        <Button
          borderRadius="3xl"
          disabled
          opacity={0.6}
          cursor="not-allowed"
          _hover={{ opacity: 0.6 }}
        >
          Boost
        </Button>
        <Tooltip
          label={
            !hasStake
              ? "No locked assets in this position"
              : `Locked for another ${countdown.label}`
          }
          isDisabled={canUnlock}
          hasArrow
          bg="#222"
          color="#fff"
        >
          <Box>
            <Button
              borderRadius="3xl"
              onClick={() => onUnlock(position)}
              isDisabled={!canUnlock}
            >
              Unlock
            </Button>
          </Box>
        </Tooltip>
      </Flex>
    </Flex>
  );
}

const STEP_LABEL: Record<DepositStep, string> = {
  idle: "",
  simulating: "Simulating transaction…",
  signing: "Waiting for Freighter signature…",
  submitting: "Submitting to Stellar network…",
  success: "Deposit confirmed!",
  error: "",
};

function infoRow(label: string, value: React.ReactNode) {
  return (
    <Flex justify="space-between" fontSize="sm" py={1}>
      <Text color="#A2A2A2">{label}</Text>
      <Text>{value}</Text>
    </Flex>
  );
}

export default function Farm() {
  const { publicKey, walletApi, isConnected } = useStellarWallet();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: pools,
    isLoading: poolsLoading,
    isError: poolsError,
    error: poolsErrorObj,
  } = usePools();

  const {
    data: userPositions,
    isLoading: positionsLoading,
    isError: positionsError,
    error: positionsErrorObj,
  } = useAllUserPositions();

  const [selectedFarm, setSelectedFarm] = useState<LivePoolRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unlockPosition, setUnlockPosition] = useState<FarmPosition | null>(null);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);

  // Deposit flow state
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositStep, setDepositStep] = useState<DepositStep>("idle");
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  useEffect(() => {
    if (poolsError && poolsErrorObj) {
      toast({
        title: "Unable to load pools",
        description:
          poolsErrorObj instanceof Error
            ? poolsErrorObj.message
            : "Failed to fetch pool data from Soroban",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  }, [poolsError, poolsErrorObj, toast]);

  useEffect(() => {
    if (positionsError && positionsErrorObj) {
      toast({
        title: "Unable to load positions",
        description:
          positionsErrorObj instanceof Error
            ? positionsErrorObj.message
            : "Failed to fetch user positions from Soroban",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  }, [positionsError, positionsErrorObj, toast]);

  const myPositions = useMemo<FarmPosition[]>(() => {
    if (!userPositions) return [];
    return userPositions.map(({ pool, position }) => ({
      id: pool.id,
      name: pool.asset.code,
      img: "",
      earned: position?.credits ?? "-",
      stake: position?.amount ?? "-",
      dailyRate: pool.dailyRate,
      totalStakedLiquidity: `$${Number(pool.totalLocked).toLocaleString()}`,
      symbol: pool.asset.code,
      lockedAmount: position?.amount ? Number(position.amount) : 0,
      lockedAt: position?.lockedAt ?? 0,
      lockPeriodSeconds: position ? pool.minLockPeriod : minLockPeriodSeconds,
    }));
  }, [userPositions]);

  const availablePools = useMemo<LivePoolRow[]>(() => {
    if (!pools) return [];
    const positionMap = new Map<string, UserPosition | null>();
    userPositions?.forEach((item) => {
      positionMap.set(item.pool.id, item.position);
    });
    return pools.map((pool) => {
      const position = positionMap.get(pool.id);
      return {
        id: pool.id,
        name: pool.asset.code,
        earned: position?.credits ?? "-",
        stake: position?.amount ?? "-",
        dailyRate: pool.dailyRate,
        totalStakedLiquidity: `$${Number(pool.totalLocked).toLocaleString()}`,
        symbol: pool.asset.code,
        lockedAmount: position?.amount ? Number(position.amount) : 0,
        lockedAt: position?.lockedAt ?? 0,
        lockPeriodSeconds: pool.minLockPeriod,
      };
    });
  }, [pools, userPositions]);

  const handleDepositClick = (pool: LivePoolRow) => {
    setSelectedFarm(pool);
    setDepositAmount("0");
    setDepositStep("idle");
    setDepositTxHash(null);
    setDepositError(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (depositStep === "simulating" || depositStep === "signing" || depositStep === "submitting") return;
    setIsModalOpen(false);
    setSelectedFarm(null);
    setDepositStep("idle");
    setDepositTxHash(null);
    setDepositError(null);
  };

  const handleUnlockClick = (position: FarmPosition) => {
    setUnlockPosition(position);
    setIsUnlockOpen(true);
  };

  const handleUnlockClose = () => {
    setIsUnlockOpen(false);
    setUnlockPosition(null);
  };

  const handleUnlocked = (position: FarmPosition, amount: number) => {
    setIsUnlockOpen(false);
    setUnlockPosition(null);
    toast({
      title: "Unlock submitted",
      description: `${amount} ${position.symbol} unlock request sent.`,
      status: "success",
      duration: 6000,
      isClosable: true,
    });
  };

  const parsedAmount = parseFloat(depositAmount);
  const amountValid =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && depositAmount.trim() !== "";

  const isPending =
    depositStep === "simulating" ||
    depositStep === "signing" ||
    depositStep === "submitting";

  const handleLockClick = async () => {
    if (!selectedFarm) return;

    // Input validation
    if (!amountValid) {
      setDepositError("Enter a valid amount greater than 0.");
      return;
    }

    if (!isConnected || !publicKey) {
      setDepositError("Connect your Freighter wallet before depositing.");
      return;
    }

    if (!walletApi) {
      setDepositError("Freighter wallet is not available. Please install or unlock it.");
      return;
    }

    setDepositError(null);
    setDepositTxHash(null);

    try {
      // Step 1 — simulate
      setDepositStep("simulating");

      // Convert to integer stroops (1 unit = 10,000,000 stroops for XLM-based assets)
      const amountInStroops = String(Math.round(parsedAmount * 10_000_000));

      // Step 2 — Freighter popup (lockAssets internally simulates then prompts)
      setDepositStep("signing");

      const result = await lockAssets({
        poolContractId: selectedFarm.id,
        publicKey,
        amount: amountInStroops,
        walletApi,
      });

      if (!result.success) {
        throw new Error(result.error ?? "Transaction failed");
      }

      // Step 3 — confirmed
      setDepositStep("submitting");
      const hash = result.hash ?? result.transactionHash ?? null;
      setDepositTxHash(hash);
      setDepositStep("success");

      // Refresh positions and pools without requiring a page reload
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_POSITION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POOLS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLATFORM_STATS] });

    } catch (err) {
      const normalized = normalizeError(err, "Deposit");
      setDepositError(normalized.userMessage ?? normalized.message);
      setDepositStep("error");
    }
  };

  const explorerUrl = depositTxHash
    ? stellarExpertTxUrl(depositTxHash, stellarNetwork.toLowerCase())
    : null;

  const hasPositions = myPositions.length > 0;

  return (
    <Flex direction="column" align="center" gap={6} px={8} py={6}>
      <Text fontSize="xs" color="#A2A2A2" textAlign="center">
        Network: {stellarNetwork}
        {publicKey ? ` · ${publicKey.slice(0, 6)}…` : ""}
        {factoryContractId
          ? ` · Factory ${factoryContractId.slice(0, 8)}…`
          : " · Set NEXT_PUBLIC_FACTORY_CONTRACT_ID when your Soroban factory is deployed"}
        {" · "}
        {sorobanRpcUrl.replace(/^https?:\/\//, "")}
      </Text>

      <Text fontSize="4xl" fontWeight="bold" textTransform="uppercase">
        Farm pools
      </Text>

      {poolsLoading ? (
        <Flex w="100%" justify="center" py={16}>
          <Spinner size="xl" color={ACCENT} />
        </Flex>
      ) : availablePools.length === 0 ? (
        <Alert status="info" borderRadius="2xl" w="95%" maxW="1200px">
          <AlertIcon /> No farm pools are currently available. Ensure your factory contract is deployed and the factory contract ID is configured.
        </Alert>
      ) : (
        availablePools.map((farm) => (
          <Flex
            key={farm.id}
            w="95%"
            h={20}
            mx="auto"
            align="center"
            justify="space-between"
            borderTop="1px solid #454545"
            borderBottom="1px solid #454545"
            px={4}
          >
            <Text>{farm.name}</Text>
            <Flex direction="column" minW="110px" align="flex-start">
              <Text fontSize="2xs">Earned</Text>
              <Text>{farm.earned}</Text>
            </Flex>
            <Flex direction="column" minW="110px" align="flex-start">
              <Text fontSize="2xs">My Stake</Text>
              <Text>{farm.stake}</Text>
            </Flex>
            <Flex direction="column" minW="110px" align="flex-start">
              <Text fontSize="2xs">Daily Rate</Text>
              <Text>{farm.dailyRate}</Text>
            </Flex>
            <Flex direction="column" minW="180px" align="flex-start">
              <Text fontSize="2xs">Total Staked Liquidity</Text>
              <Text>{farm.totalStakedLiquidity}</Text>
            </Flex>
            <Button borderRadius="3xl" onClick={() => handleDepositClick(farm)}>
              Deposit
            </Button>
          </Flex>
        ))
      )}

      <Text fontSize="4xl" fontWeight="bold" textTransform="uppercase" mt={10}>
        My earnings
      </Text>

      {positionsLoading ? (
        <Flex w="100%" justify="center" py={16}>
          <Spinner size="xl" color={ACCENT} />
        </Flex>
      ) : !isConnected ? (
        <Alert status="info" borderRadius="2xl" w="95%" maxW="1200px">
          <AlertIcon /> Connect your Freighter wallet to view your positions.
        </Alert>
      ) : !hasPositions ? (
        <Alert status="info" borderRadius="2xl" w="95%" maxW="1200px">
          <AlertIcon /> No active positions found for the connected wallet.
        </Alert>
      ) : (
        myPositions.map((position) => (
          <EarningRow
            key={position.id}
            position={position}
            onUnlock={handleUnlockClick}
          />
        ))
      )}

      {/* ── Deposit Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent bgColor="#171717" color="#fff" borderRadius="3xl">
          <ModalHeader mx="auto">{selectedFarm?.name}</ModalHeader>
          <ModalCloseButton isDisabled={isPending} />
          <ModalBody p={8}>

            {/* ── Success state ─────────────────────────────────────────── */}
            {depositStep === "success" ? (
              <Flex direction="column" gap={4} align="center" textAlign="center">
                <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="sm">
                  Deposit confirmed
                </Badge>
                <Text fontSize="sm" color="#A2A2A2">
                  {parsedAmount} {selectedFarm?.symbol} locked successfully. Your stake will appear below once the page refreshes.
                </Text>
                <Box w="100%" border="1px solid #454545" borderRadius="2xl" p={3}>
                  {infoRow("Amount deposited", `${parsedAmount} ${selectedFarm?.symbol}`)}
                  {depositTxHash && infoRow("Transaction hash", (
                    <Text fontFamily="mono" fontSize="xs">{depositTxHash.slice(0, 16)}…</Text>
                  ))}
                  {explorerUrl && infoRow("Explorer", (
                    <Link href={explorerUrl} isExternal color={ACCENT} fontSize="sm">
                      View on Stellar Expert ↗
                    </Link>
                  ))}
                </Box>
                <Button
                  borderRadius="2xl"
                  w="100%"
                  bg={ACCENT}
                  color="#000"
                  _hover={{ opacity: 0.9 }}
                  onClick={handleModalClose}
                >
                  Done
                </Button>
              </Flex>

            ) : (
              /* ── Input / pending / error state ──────────────────────── */
              <Flex direction="column" gap={6}>
                <Text color="#A2A2A2" fontSize="sm">
                  Lock {selectedFarm?.symbol} into this pool to earn credits. The assets will be time-locked for the minimum lock period.
                </Text>

                <Flex direction="column" gap={2}>
                  <Text fontSize="sm">Amount ({selectedFarm?.symbol})</Text>
                  <Box position="relative" w="100%">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        setDepositError(null);
                      }}
                      isDisabled={isPending}
                      borderRadius="2xl"
                      h="50px"
                      borderColor="#454545"
                      _placeholder={{ color: "#A2A2A2" }}
                      _hover={{ borderColor: ACCENT }}
                      _focus={{ boxShadow: "none", borderColor: ACCENT }}
                      pr="60px"
                    />
                    <Text
                      position="absolute"
                      top="50%"
                      right="14px"
                      transform="translateY(-50%)"
                      fontSize="xs"
                      color="#A2A2A2"
                      pointerEvents="none"
                    >
                      {selectedFarm?.symbol}
                    </Text>
                  </Box>
                  {!amountValid && depositAmount !== "0" && depositAmount !== "" && (
                    <Text fontSize="xs" color="#ff8080">Amount must be greater than 0.</Text>
                  )}
                </Flex>

                {/* Pending steps indicator */}
                {isPending && (
                  <Flex
                    align="center"
                    gap={3}
                    bg="#1e1e1e"
                    borderRadius="2xl"
                    p={4}
                    border="1px solid #454545"
                  >
                    <Spinner size="sm" color={ACCENT} />
                    <Text fontSize="sm" color="#A2A2A2">
                      {STEP_LABEL[depositStep]}
                    </Text>
                  </Flex>
                )}

                {/* Error banner */}
                {depositStep === "error" && depositError && (
                  <Alert status="error" borderRadius="2xl" bg="#2a1414" color="#ff8080" fontSize="sm">
                    <AlertIcon color="#ff8080" />
                    {depositError}
                  </Alert>
                )}

                {!isConnected && (
                  <Alert status="warning" borderRadius="2xl" bg="#2a2412" color="#f6c453" fontSize="sm">
                    <AlertIcon color="#f6c453" />
                    Connect your Freighter wallet to deposit.
                  </Alert>
                )}

                <Button
                  borderRadius="2xl"
                  bg={ACCENT}
                  color="#000"
                  _hover={{ opacity: isPending ? 1 : 0.9 }}
                  isDisabled={!amountValid || !isConnected || isPending}
                  onClick={() => void handleLockClick()}
                  w="full"
                >
                  {isPending ? (
                    <Flex align="center" gap={2}>
                      <Spinner size="xs" />
                      <Text>{depositStep === "signing" ? "Waiting for signature…" : "Processing…"}</Text>
                    </Flex>
                  ) : (
                    `Lock ${amountValid ? parsedAmount : ""} ${selectedFarm?.symbol ?? "tokens"}`
                  )}
                </Button>

                {depositStep === "error" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    color="#A2A2A2"
                    onClick={() => {
                      setDepositStep("idle");
                      setDepositError(null);
                    }}
                  >
                    Try again
                  </Button>
                )}
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <UnlockModal
        isOpen={isUnlockOpen}
        onClose={handleUnlockClose}
        onUnlocked={handleUnlocked}
        position={unlockPosition}
      />
    </Flex>
  );
}
