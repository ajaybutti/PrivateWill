export interface WillData {
  owner: `0x${string}`;
  checkInIntervalSeconds: bigint;
  totalDepositedAmount: bigint;
  encryptedTotalAmount: `0x${string}`;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: bigint;
  triggeredAt: bigint;
}

export type Tab = "overview" | "deposit" | "beneficiaries" | "claim";
