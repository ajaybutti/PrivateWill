"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CRYPTOWILL_ADDRESS, CRYPTOWILL_ABI } from "@/lib/contracts";
import type { WillData } from "@/types";

export function useWill(owner?: `0x${string}`) {
  const { data: will, refetch: refetchWill, isLoading } = useReadContract({
    address: CRYPTOWILL_ADDRESS,
    abi: CRYPTOWILL_ABI,
    functionName: "getWill",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 5000 },
  });

  const { data: beneficiaries, refetch: refetchBeneficiaries } = useReadContract({
    address: CRYPTOWILL_ADDRESS,
    abi: CRYPTOWILL_ABI,
    functionName: "getBeneficiaries",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 5000 },
  });

  const { data: timeUntilTrigger, refetch: refetchTimer } = useReadContract({
    address: CRYPTOWILL_ADDRESS,
    abi: CRYPTOWILL_ABI,
    functionName: "getTimeUntilTrigger",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 5000 },
  });

  const { data: isOverdue, refetch: refetchOverdue } = useReadContract({
    address: CRYPTOWILL_ADDRESS,
    abi: CRYPTOWILL_ABI,
    functionName: "isCheckInOverdue",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 5000 },
  });

  const { data: lastCheckIn } = useReadContract({
    address: CRYPTOWILL_ADDRESS,
    abi: CRYPTOWILL_ABI,
    functionName: "lastCheckIn",
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner, refetchInterval: 5000 },
  });

  const refetch = () => {
    refetchWill();
    refetchBeneficiaries();
    refetchTimer();
    refetchOverdue();
  };

  return {
    will: will as WillData | undefined,
    beneficiaries: (beneficiaries as `0x${string}`[]) ?? [],
    timeUntilTrigger: timeUntilTrigger as bigint | undefined,
    isOverdue: isOverdue as boolean | undefined,
    lastCheckIn: lastCheckIn as bigint | undefined,
    isLoading,
    refetch,
  };
}

export function useHasClaimed(owner?: `0x${string}`, beneficiary?: `0x${string}`) {
  const { data } = useReadContract({
    address: CRYPTOWILL_ADDRESS,
    abi: CRYPTOWILL_ABI,
    functionName: "hasClaimedFrom",
    args: owner && beneficiary ? [owner, beneficiary] : undefined,
    query: { enabled: !!owner && !!beneficiary },
  });
  return data as boolean | undefined;
}
