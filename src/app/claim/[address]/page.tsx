"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClaimPanel } from "@/components/ClaimPanel";
import { isAddress } from "viem";

export default function ClaimPage() {
  const params = useParams();
  const { isConnected, address: walletAddress } = useAccount();
  const addressParam = params.address as string;
  
  // Validate address format
  const isValidAddress = addressParam && isAddress(addressParam);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-10">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl font-serif text-white">
            Claim Your <span className="text-orange-500">Inheritance</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Connect your wallet to claim your confidential allocation from this will.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <ConnectButton label="Connect Wallet to Claim" />
          <p className="font-mono text-xs text-gray-600">
            Ethereum Sepolia Testnet
          </p>
        </div>
      </div>
    );
  }

  if (!isValidAddress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-serif text-white">Invalid Address</h1>
          <p className="text-gray-400">
            The address in the URL is not valid. Please check the link and try again.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Header with back button */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-white">Claim Inheritance</h1>
          <p className="font-mono text-xs text-gray-500 mt-1">
            Will Owner: {addressParam.slice(0, 6)}...{addressParam.slice(-4)}
          </p>
        </div>
      </div>

      {/* Claim panel with auto-filled address */}
      <div className="min-h-[400px]">
        {walletAddress ? (
          <ClaimPanel 
            address={walletAddress} 
            ownerAddress={addressParam as `0x${string}`} 
            autoLookup={true} 
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            Connect your wallet to claim
          </div>
        )}
      </div>
    </div>
  );
}
