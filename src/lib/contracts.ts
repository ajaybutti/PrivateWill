export const CRYPTOWILL_ADDRESS = "0xa3a5F67797708D9664D5Ea3CF29616998642A10B" as const;
export const SEPOLIA_USDC = "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF" as const;
export const SEPOLIA_CUSDC = "0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639" as const;

export const CRYPTOWILL_ABI = [
  // ============ Core Functions ============
  
  {
    name: "setupWill",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_checkInIntervalSeconds", type: "uint256" },
      { name: "_depositAmount", type: "uint256" },
      { name: "_beneficiaries", type: "address[]" },
      { name: "_encryptedAmounts", type: "bytes32[]" },
      { name: "_inputProofs", type: "bytes[]" },
    ],
    outputs: [],
  },
  {
    name: "checkIn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "claimInheritance",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [],
  },
  
  // ============ View Functions ============
  
  {
    name: "getWill",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "checkInIntervalSeconds", type: "uint256" },
          { name: "totalDepositedAmount", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "isTriggered", type: "bool" },
          { name: "executed", type: "bool" },
          { name: "createdAt", type: "uint256" },
          { name: "triggeredAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getBeneficiaries",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "isCheckInOverdue",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getTimeUntilTrigger",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasClaimedFrom",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_beneficiary", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "lastCheckIn",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "wills",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "checkInIntervalSeconds", type: "uint256" },
      { name: "totalDepositedAmount", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "isTriggered", type: "bool" },
      { name: "executed", type: "bool" },
      { name: "createdAt", type: "uint256" },
      { name: "triggeredAt", type: "uint256" },
    ],
  },
];

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
