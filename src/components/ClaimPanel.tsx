"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import { Gift, Search, Lock } from "lucide-react";
import { CRYPTOWILL_ADDRESS, CRYPTOWILL_ABI } from "@/lib/contracts";
import { useWill, useHasClaimed } from "@/hooks/useWill";

interface ClaimPanelProps {
  address: `0x${string}`;  // Current user's wallet address (beneficiary)
  ownerAddress?: `0x${string}`;  // Will owner address (for autoLookup)
  autoLookup?: boolean;
}

export function ClaimPanel({ address, ownerAddress, autoLookup = false }: ClaimPanelProps) {
  const [input, setInput] = useState("");
  const [lookedUp, setLookedUp] = useState<`0x${string}` | undefined>();
  const isValid = isAddress(input);

  // Auto-lookup if enabled (for /claim/[address] route)
  useEffect(() => {
    if (autoLookup && ownerAddress) {
      setLookedUp(ownerAddress);
    }
  }, [autoLookup, ownerAddress]);

  const { will, beneficiaries, isOverdue } = useWill(lookedUp);
  const hasClaimed = useHasClaimed(lookedUp, address);
  const isBeneficiary = beneficiaries.some(b => b.toLowerCase() === address.toLowerCase());

  // Can claim if: will is active, (triggered OR overdue), is beneficiary, and hasn't claimed yet
  const canClaim = lookedUp && will?.isActive && (will?.isTriggered || isOverdue) && isBeneficiary && !hasClaimed;

  // Debug logging
  useEffect(() => {
    if (will && lookedUp) {
      console.log("🔍 ClaimPanel - Will data for", lookedUp, {
        isActive: will.isActive,
        isTriggered: will.isTriggered,
        isBeneficiary: isBeneficiary,
        hasClaimed: hasClaimed,
        canClaim: canClaim,
        totalDepositedAmount: will.totalDepositedAmount,
        createdAt: will.createdAt,
      });
      console.log("👥 Beneficiaries Array:", beneficiaries);
      console.log("📍 Current User Address:", address);
      
      // 🔍 DETAILED ADDRESS COMPARISON
      console.log("\n🔎 DETAILED COMPARISON:");
      console.log("Current user address:", address);
      console.log("Current user address (lowercase):", address.toLowerCase());
      console.log("Beneficiaries count:", beneficiaries.length);
      beneficiaries.forEach((b, idx) => {
        const match = b.toLowerCase() === address.toLowerCase();
        console.log(`  [${idx}] ${b} (lowercase: ${b.toLowerCase()}) - MATCH: ${match ? "✅ YES" : "❌ NO"}`);
      });
      
      const actualIsBeneficiary = beneficiaries.some(b => b.toLowerCase() === address.toLowerCase());
      console.log("Final isBeneficiary result:", actualIsBeneficiary);
    }
  }, [will, lookedUp, isBeneficiary, hasClaimed, canClaim, beneficiaries, address]);

  const {
    writeContract,
    data: txHash,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  const handleLookup = () => {
    if (isValid) {
      setLookedUp(input as `0x${string}`);
    }
  };

  const handleClaim = () => {
    if (!lookedUp) return;
    writeContract({
      address: CRYPTOWILL_ADDRESS,
      abi: CRYPTOWILL_ABI,
      functionName: "claimInheritance",
      args: [lookedUp],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-serif text-white">Claim Inheritance</h3>
        <p className="text-sm text-gray-400 mt-1">
          If a will has been triggered and you are a beneficiary, claim your cUSDC here.
        </p>
      </div>

      {/* Lookup - Hidden when autoLookup is enabled */}
      {!autoLookup && (
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
            Will Owner Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-black border border-white/10 text-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-orange-500 rounded-sm"
            />
            <button
              onClick={handleLookup}
              disabled={!isValid}
              className="border border-white/20 text-white font-mono text-sm uppercase tracking-widest px-4 py-3 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            Lookup
          </button>
            </div>
          </div>
        )}

      {/* Status grid after lookup */}
      {lookedUp && will && (
        <div className="border border-white/10 bg-white/5 p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Will Active", value: will.isActive ? "Yes" : "No", ok: will.isActive },
            { label: "Can Claim Now?", value: (will.isTriggered || isOverdue) ? "Yes" : "No", ok: will.isTriggered || isOverdue },
            { label: "You are beneficiary", value: isBeneficiary ? "Yes" : "No", ok: isBeneficiary },
            { label: "Already claimed", value: hasClaimed ? "Yes" : "No", ok: !hasClaimed },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{row.label}</div>
              <div className={`text-sm font-mono ${row.ok ? "text-green-400" : "text-red-400"}`}>{row.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Locked state */}
      {lookedUp && will?.isActive && !will.isTriggered && (
        <div className="border border-white/10 p-4 flex items-center gap-3 text-gray-400">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-mono">Will is not yet overdue. Owner can still check in. Funds are locked.</span>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs font-mono">Error: {error.message.slice(0, 120)}</p>
      )}

      {isSuccess ? (
        <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-sm font-mono px-4 py-3">
          ✓ Inheritance claimed! cUSDC transferred to your wallet.
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={!canClaim || isPending || isConfirming}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-sm uppercase tracking-widest px-5 py-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Gift className="w-4 h-4" />
          {isPending ? "Confirm in wallet..." : isConfirming ? "Claiming on-chain..." : "Claim Inheritance"}
        </button>
      )}
    </div>
  );
}
