"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { Search } from "lucide-react";
import { useWill } from "@/hooks/useWill";
import { formatCountdown } from "@/lib/utils";

export function TriggerPanel() {
  const [input, setInput] = useState("");
  const [lookedUp, setLookedUp] = useState<`0x${string}` | undefined>();
  const isValid = isAddress(input);

  const { will, isOverdue, timeUntilTrigger } = useWill(lookedUp);

  const handleLookup = () => {
    if (isValid) setLookedUp(input as `0x${string}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-serif text-white">Trigger a Will</h3>
        <p className="text-sm text-gray-400 mt-1">
          When an owner misses their check-in window, their will triggers automatically when a beneficiary claims their inheritance.
        </p>
      </div>

      {/* Lookup */}
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

      {/* Will info after lookup */}
      {lookedUp && will && (
        <div className="border border-white/10 bg-white/5 p-5 space-y-3">
          {!will.isActive && (
            <p className="text-gray-400 text-sm font-mono">No active will found for this address.</p>
          )}
          {will.isActive && will.isTriggered && (
            <p className="text-yellow-400 text-sm font-mono">✓ This will has already been triggered.</p>
          )}
          {will.isActive && !will.isTriggered && isOverdue && (
            <p className="text-red-400 text-sm font-mono">⚠ Owner is overdue — will triggers when beneficiary claims!</p>
          )}
          {will.isActive && !will.isTriggered && !isOverdue && timeUntilTrigger !== undefined && (
            <div>
              <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">Time remaining</p>
              <p className="text-white text-2xl font-serif">{formatCountdown(timeUntilTrigger)}</p>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-white/10 pt-5">
        <p className="text-xs text-gray-500">
          <strong>How it works:</strong> Beneficiaries claim their inheritance using the <strong>Claim</strong> tab. When they claim, the will automatically triggers if the owner is overdue.
        </p>
      </div>
    </div>
  );
}

