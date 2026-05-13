export type StellarNetworkPreset = "PUBLIC" | "TESTNET" | "FUTURENET";

const PRESETS: Record<
  StellarNetworkPreset,
  { horizon: string; passphrase: string }
> = {
  PUBLIC: {
    horizon: "https://horizon.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
  },
  TESTNET: {
    horizon: "https://horizon-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
  },
  FUTURENET: {
    horizon: "https://horizon-futurenet.stellar.org",
    passphrase: "Test SDF Future Network ; October 2022",
  },
};

function presetFromEnv(): StellarNetworkPreset {
  const n = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET").toUpperCase();
  if (n === "PUBLIC" || n === "MAINNET") return "PUBLIC";
  if (n === "FUTURENET") return "FUTURENET";
  return "TESTNET";
}

const preset = presetFromEnv();

export const stellarNetwork = preset;
export const horizonUrl =
  process.env.NEXT_PUBLIC_HORIZON_URL || PRESETS[preset].horizon;
export const networkPassphrase =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
  PRESETS[preset].passphrase;

export const sorobanRpcUrl =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  (preset === "TESTNET"
    ? "https://soroban-testnet.stellar.org"
    : preset === "FUTURENET"
      ? "https://rpc-futurenet.stellar.org"
      : "https://soroban-mainnet.stellar.org");

/** Soroban factory contract id (starts with C…) after you deploy */
export const factoryContractId =
  process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID ?? "";
