"use client";

import { Users } from "lucide-react";

interface BeneficiariesPanelProps {
  beneficiaries: `0x${string}`[];
  onSuccess?: () => void;
}

export function BeneficiariesPanel({ beneficiaries, onSuccess }: BeneficiariesPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-serif text-white">Beneficiaries</h3>
        <p className="text-sm text-gray-400 mt-1">
          Beneficiaries are set when you create your will with encrypted amounts.
        </p>
      </div>

      {/* List */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-widest">
          <Users className="w-3.5 h-3.5" />
          Added ({beneficiaries.length})
        </div>

        {beneficiaries.length === 0 ? (
          <div className="border border-dashed border-white/10 p-8 text-center text-gray-500 text-sm">
            No beneficiaries yet. Create your will to add beneficiaries.
          </div>
        ) : (
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <div key={b} className="border border-white/10 bg-white/5 px-4 py-3">
                <div className="font-mono text-xs text-gray-400">{b}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-5">
        <p className="text-xs text-gray-500">
          To add or modify beneficiaries, create a new will through the <strong>My Will</strong> tab.
        </p>
      </div>
    </div>
  );
}

