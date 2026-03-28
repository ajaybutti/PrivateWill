'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'OTC Desk',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [sepolia],
  ssr: true,
});

// Contract addresses on Sepolia
export const CONTRACTS = {
  SETTLEMENT: '0xFbE6d1E9D1209E9AA64fDBc187743a3eFD179AA3',
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  CHAINLINK_ETH_USD: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
} as const;

// Token configuration
export const TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: CONTRACTS.USDC,
    decimals: 6,
    icon: '/tokens/usdc.svg',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: CONTRACTS.WETH,
    decimals: 18,
    icon: '/tokens/weth.svg',
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
    decimals: 18,
    icon: '/tokens/dai.svg',
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    decimals: 18,
    icon: '/tokens/link.svg',
  },
] as const;

export type Token = (typeof TOKENS)[number];
