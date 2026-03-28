"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SEPOLIA_USDC, CRYPTOWILL_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { parseUSDC } from "@/lib/utils";

export function useUSDC(userAddress?: `0x${string}`) {
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: SEPOLIA_USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: SEPOLIA_USDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: userAddress ? [userAddress, CRYPTOWILL_ADDRESS] : undefined,
    query: { enabled: !!userAddress },
  });

  const { writeContract, data: approveTxHash, isPending: isApprovePending } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  const approve = (amountUsdc: string) => {
    const amount = parseUSDC(amountUsdc);
    writeContract({
      address: SEPOLIA_USDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CRYPTOWILL_ADDRESS, amount],
    });
  };

  return {
    balance: balance as bigint | undefined,
    allowance: allowance as bigint | undefined,
    approve,
    isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    refetch: () => { refetchBalance(); refetchAllowance(); },
  };
}
