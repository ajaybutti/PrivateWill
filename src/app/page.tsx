"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, ArrowDownToLine, Users, Gift } from "lucide-react";
import { useWill } from "@/hooks/useWill";
import { WillOverview } from "@/components/WillOverview";
import { DepositPanel } from "@/components/DepositPanel";
import { BeneficiariesPanel } from "@/components/BeneficiariesPanel";
import { ClaimPanel } from "@/components/ClaimPanel";
import type { Tab } from "@/types";
import clsx from "clsx";

const TABS: { id: Tab; label: string; icon: React.ReactNode; requiresWill?: boolean }[] = [
  { id: "overview", label: "My Will", icon: <Shield className="w-4 h-4" /> },
  { id: "deposit", label: "Deposit", icon: <ArrowDownToLine className="w-4 h-4" />, requiresWill: true },
  { id: "beneficiaries", label: "Beneficiaries", icon: <Users className="w-4 h-4" />, requiresWill: true },
  { id: "claim", label: "Claim", icon: <Gift className="w-4 h-4" /> },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { will, beneficiaries, refetch } = useWill(address);
  const hasWill = will?.isActive ?? false;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-10">
        {/* Hero */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-6xl font-serif text-white leading-tight">
            Your Will,{" "}
            <span className="text-orange-500">Encrypted.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Confidential onchain inheritance using Fully Homomorphic Encryption.
            Deposit USDC, assign beneficiaries, and pass on wealth — privately.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-4 max-w-lg w-full">
          {[
            { icon: "🔒", label: "FHE Encrypted", desc: "Amounts stay encrypted on-chain" },
            { icon: "⏱", label: "Dead Man's Switch", desc: "Auto-triggers on missed check-in" },
            { icon: "💸", label: "USDC Native", desc: "Stable value, zero volatility" },
          ].map((f) => (
            <div key={f.label} className="border border-white/10 bg-white/5 p-4 text-center space-y-2 rounded-sm">
              <div className="text-2xl">{f.icon}</div>
              <div className="font-mono text-xs text-white uppercase tracking-wider">{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Big connect button */}
        <div className="flex flex-col items-center gap-3">
          <ConnectButton label="Connect Wallet to Begin" />
          <p className="font-mono text-xs text-gray-600">
            Ethereum Sepolia Testnet · Powered by Zama FHE
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Inheritance Dashboard</h1>
        <p className="font-mono text-xs text-gray-500 mt-1">
          {address?.slice(0, 10)}...{address?.slice(-8)} · Sepolia
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {TABS.map((tab) => {
          const disabled = tab.requiresWill && !hasWill;
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && setActiveTab(tab.id)}
              disabled={disabled}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-gray-500 hover:text-white",
                disabled && "opacity-25 cursor-not-allowed"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && address && (
          <WillOverview address={address} />
        )}
        {activeTab === "beneficiaries" && hasWill && (
          <BeneficiariesPanel beneficiaries={beneficiaries} onSuccess={refetch} />
        )}
        {activeTab === "claim" && address && <ClaimPanel address={address} />}
      </div>
    </div>
  );
}
