import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "PrivateWill",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "195ff464f9c9a246c0c9a4ad2bb74f28",
  chains: [sepolia],
  ssr: true,
});
