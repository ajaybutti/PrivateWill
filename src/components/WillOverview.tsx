"use client";

import { useState, useMemo } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { Clock, RefreshCw, AlertTriangle, Shield, Plus, X } from "lucide-react";
import { CRYPTOWILL_ADDRESS, CRYPTOWILL_ABI, SEPOLIA_USDC, ERC20_ABI } from "@/lib/contracts";
import { useWill } from "@/hooks/useWill";
import { formatCountdown, formatTimestamp, secondsToInterval, formatUSDC } from "@/lib/utils";
import clsx from "clsx";

interface WillOverviewProps {
  address: `0x${string}`;
}

interface Beneficiary {
  address: string;
  amount: string;
}

export function WillOverview({ address }: WillOverviewProps) {
  const { will, timeUntilTrigger, isOverdue, lastCheckIn, refetch } = useWill(address);
  const [intervalSeconds, setIntervalSeconds] = useState("120");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newBeneficiaryAddr, setNewBeneficiaryAddr] = useState("");
  const [newBeneficiaryAmount, setNewBeneficiaryAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Calculate total amount for approval
  const totalAmount = useMemo(() => {
    return beneficiaries.reduce((sum, b) => {
      const decimal = parseFloat(b.amount);
      return sum + BigInt(Math.floor(decimal * 1e6));
    }, BigInt(0));
  }, [beneficiaries]);

  // Check current USDC allowance on-chain
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: SEPOLIA_USDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, CRYPTOWILL_ADDRESS],
    query: { enabled: !!address },
  });

  // Determine if USDC is already approved
  const isApproved = useMemo(() => {
    if (!allowance || totalAmount === BigInt(0)) return false;
    return allowance >= totalAmount;
  }, [allowance, totalAmount]);

  const {
    writeContract: approveWrite,
    data: approveTxHash,
    isPending: isApproving,
  } = useWriteContract();

  const {
    writeContract: createWillWrite,
    data: createTxHash,
    isPending: isCreating,
    error: createError,
  } = useWriteContract();

  const {
    writeContract: checkInWrite,
    data: checkInTxHash,
    isPending: isCheckingIn,
  } = useWriteContract();

  const { isLoading: isApprovalConfirming, isSuccess: approvalSuccess } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  const { isLoading: isCreateConfirming, isSuccess: createSuccess } =
    useWaitForTransactionReceipt({ hash: createTxHash });

  const { isLoading: isCheckInConfirming, isSuccess: checkInSuccess } =
    useWaitForTransactionReceipt({ hash: checkInTxHash });

  // Refetch allowance when approval is confirmed
  if (approvalSuccess) {
    setTimeout(() => refetchAllowance(), 1000);
  }

  if (createSuccess || checkInSuccess) {
    setTimeout(refetch, 2000);
  }

  const addBeneficiary = () => {
    if (!newBeneficiaryAddr || !newBeneficiaryAmount) {
      alert("Please enter both address and amount");
      return;
    }
    setBeneficiaries([
      ...beneficiaries,
      { address: newBeneficiaryAddr, amount: newBeneficiaryAmount },
    ]);
    setNewBeneficiaryAddr("");
    setNewBeneficiaryAmount("");
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const handleApproveUSDC = async () => {
    if (totalAmount === BigInt(0)) {
      alert("Please add beneficiaries with amounts first");
      return;
    }

    approveWrite({
      address: SEPOLIA_USDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CRYPTOWILL_ADDRESS, totalAmount],
    });
  };

  const handleCreateWill = async () => {
    if (beneficiaries.length === 0) {
      alert("Please add at least one beneficiary");
      return;
    }

    if (!isApproved) {
      alert("Please approve USDC spending first");
      return;
    }

    setIsEncrypting(true);
    try {
      // Step 1: Encrypt beneficiary amounts using FHE
      const { encryptBeneficiaryAmounts } = await import("@/lib/fhe");
      
      const amounts = beneficiaries.map(b => {
        const decimal = parseFloat(b.amount);
        if (isNaN(decimal) || decimal < 0) {
          throw new Error(`Invalid amount: ${b.amount}`);
        }
        return BigInt(Math.floor(decimal * 1e6));
      });
      
      const encrypted = await encryptBeneficiaryAmounts(
        CRYPTOWILL_ADDRESS,
        address,
        amounts
      );

      console.log("🔐 FHE Encryption complete:");
      console.log("  Handles:", encrypted.handles);
      console.log("  Proof:", encrypted.inputProof);

      // Step 2: Extract beneficiary addresses
      const beneficiaryAddrs = beneficiaries.map(b => b.address as `0x${string}`);
      const inputProofs = encrypted.handles.map(() => encrypted.inputProof) as `0x${string}`[];

      // Step 3: Call setupWill with encrypted amounts
      console.log("📝 Calling setupWill with:", {
        checkInIntervalSeconds: BigInt(intervalSeconds),
        depositAmount: totalAmount.toString(),
        beneficiariesCount: beneficiaryAddrs.length,
        encryptedHandlesCount: encrypted.handles.length,
        inputProofsCount: inputProofs.length,
      });
      
      createWillWrite({
        address: CRYPTOWILL_ADDRESS,
        abi: CRYPTOWILL_ABI,
        functionName: "setupWill",
        args: [
          BigInt(intervalSeconds),
          totalAmount,
          beneficiaryAddrs,
          encrypted.handles as `0x${string}`[],
          inputProofs,
        ],
      });
    } catch (error) {
      alert(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleCheckIn = () => {
    checkInWrite({
      address: CRYPTOWILL_ADDRESS,
      abi: CRYPTOWILL_ABI,
      functionName: "checkIn",
      args: [],
    });
  };

  const isOverdueStatus = isOverdue ?? false;

  // ── No will yet ──────────────────────────────────────────
  if (!will?.isActive) {
    return (
      <div className="space-y-6">
        <div className="border border-white/10 p-8 text-center space-y-3">
          <Shield className="w-10 h-10 text-gray-600 mx-auto" />
          <h2 className="text-2xl font-serif text-white">No Will Found</h2>
          <p className="text-gray-500 text-sm">Create your onchain inheritance to get started.</p>
        </div>

        <div className="border border-white/10 bg-white/5 p-6 space-y-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400">Create Will</h3>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
              Check-in Interval
            </label>
            <select
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(e.target.value)}
              className="w-full bg-black border border-white/10 text-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-orange-500 rounded-sm"
            >
              <option value="60">1 Minute (Testing)</option>
              <option value="120">2 Minutes (Testing)</option>
              <option value="86400">1 Day</option>
              <option value="604800">1 Week</option>
              <option value="2592000">30 Days</option>
              <option value="7776000">90 Days</option>
              <option value="31536000">1 Year</option>
            </select>
          </div>

          {/* Beneficiaries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Beneficiaries (FHE Encrypted)
              </label>
              <span className="text-xs text-gray-500">{beneficiaries.length} added</span>
            </div>

            {/* Add beneficiary form */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Beneficiary address"
                  value={newBeneficiaryAddr}
                  onChange={(e) => setNewBeneficiaryAddr(e.target.value)}
                  className="flex-1 bg-black border border-white/10 text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-blue-500 rounded-sm placeholder:text-gray-600"
                />
                <input
                  type="number"
                  placeholder="Amount USDC"
                  value={newBeneficiaryAmount}
                  onChange={(e) => setNewBeneficiaryAmount(e.target.value)}
                  className="w-24 bg-black border border-white/10 text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-blue-500 rounded-sm placeholder:text-gray-600"
                />
                <button
                  onClick={addBeneficiary}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase rounded-sm flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>

            {/* Beneficiaries list */}
            {beneficiaries.length > 0 && (
              <div className="space-y-2">
                {beneficiaries.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-sm">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-400 truncate">{b.address}</div>
                      <div className="text-xs text-gray-500">{b.amount} USDC (will be encrypted)</div>
                    </div>
                    <button
                      onClick={() => removeBeneficiary(idx)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {createError && (
            <p className="text-red-400 text-xs font-mono">Error: {createError.message.slice(0, 100)}</p>
          )}

          {/* USDC Approval Info */}
          <div className="bg-blue-900/20 border border-blue-500/30 text-blue-300 text-xs font-mono p-4 rounded-sm space-y-2">
            <div className="font-bold uppercase tracking-wider">⚠ USDC Approval Required</div>
            <div>Step 1: Click "Approve USDC" to give CryptoWill permission to transfer your USDC.</div>
            <div>Step 2: Click "Create Will" to set up your inheritance with FHE-encrypted beneficiary amounts.</div>
          </div>

          {/* Approval Button */}
          {!isApproved && (
            <button
              onClick={handleApproveUSDC}
              disabled={isApproving || isApprovalConfirming || beneficiaries.length === 0}
              className={clsx(
                "w-full py-3 font-mono text-sm uppercase tracking-wider rounded-sm transition-all",
                isApproving || isApprovalConfirming
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : beneficiaries.length === 0
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
            >
              {isApproving || isApprovalConfirming ? "Approving USDC..." : "Step 1: Approve USDC"}
            </button>
          )}

          {isApproved && (
            <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-xs font-mono p-3 rounded-sm">
              ✅ USDC Approved - Ready to create will
            </div>
          )}

          {/* Create Will Button */}
          {isApproved && (
            <button
              onClick={handleCreateWill}
              disabled={isEncrypting || isCreating || isCreateConfirming || beneficiaries.length === 0}
              className={clsx(
                "w-full py-3 font-mono text-sm uppercase tracking-wider rounded-sm transition-all",
                isEncrypting || isCreating || isCreateConfirming
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : beneficiaries.length === 0
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#375BD2] to-[#2d4bb8] hover:from-[#2d4bb8] hover:to-[#1f3a8a] text-white"
              )}
            >
              {isEncrypting ? "Encrypting amounts (FHE)..." : isCreating || isCreateConfirming ? "Creating Will..." : "Step 2: Create Will"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Will exists ──────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Status pill */}
      <div className="flex items-center justify-between">
        <span className={clsx(
          "text-xs font-mono uppercase tracking-widest border px-3 py-1 flex items-center gap-2",
          will.isTriggered
            ? "border-red-500/40 text-red-400 bg-red-900/20"
            : isOverdueStatus
              ? "border-yellow-500/40 text-yellow-400 bg-yellow-900/20"
              : "border-green-500/40 text-green-400 bg-green-900/20"
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {will.isTriggered ? "Triggered" : isOverdueStatus ? "Overdue" : "Active"}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Deposited", value: `$${formatUSDC(will.totalDepositedAmount)} USDC` },
          { label: "Check-in Interval", value: secondsToInterval(Number(will.checkInIntervalSeconds)) },
          { label: "Last Check-in", value: formatTimestamp(lastCheckIn ?? 0n) },
          { label: "Created", value: formatTimestamp(will.createdAt) },
        ].map((s) => (
          <div key={s.label} className="border border-white/10 bg-white/5 p-4 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{s.label}</div>
            <div className="text-sm font-mono text-white truncate">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Countdown timer */}
      {will.isActive && !will.isTriggered && (
        <div className={clsx(
          "border p-5 space-y-2",
          isOverdueStatus ? "border-red-500/40 bg-red-900/10" : "border-white/10 bg-white/5"
        )}>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400">
            {isOverdueStatus
              ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              : <Clock className="w-3.5 h-3.5" />
            }
            {isOverdueStatus ? "Will can be triggered now!" : "Time until trigger"}
          </div>
          <div className={clsx("font-serif text-4xl", isOverdueStatus ? "text-red-400" : "text-white")}>
            {isOverdueStatus ? "OVERDUE" : formatCountdown(timeUntilTrigger ?? 0n)}
          </div>
        </div>
      )}

      {/* Check-in button */}
      {!will.isTriggered && (
        <>
          {checkInSuccess ? (
            <div className="bg-green-900/30 border border-green-500/30 text-green-400 text-sm font-mono px-4 py-3">
              ✓ Checked in successfully!
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn || isCheckInConfirming}
              className={clsx(
                "w-full flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-widest px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                isOverdueStatus
                  ? "bg-red-700 hover:bg-red-600 text-white"
                  : "bg-orange-600 hover:bg-orange-500 text-white"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              {isCheckingIn ? "Confirm in wallet..." : isCheckInConfirming ? "Checking in..." : "Check In Now"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
