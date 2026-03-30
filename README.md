# PrivateWill

**Confidential Onchain Inheritance Protocol** — Powered by Zama Protocol (FHE)

A Web3 application that enables users to create decentralized inheritance plans with **confidential beneficiary allocations** using Fully Homomorphic Encryption (FHE). Owner funds are secured with automated check-in mechanisms, and beneficiaries can claim their inheritance when the owner becomes inactive.

---

## 🔐 Challenge Overview

Public blockchains are transparent by default, exposing balances, strategies, and user activity to the public. This level of transparency has hindered the adoption of onchain finance by institutions, DeFi protocols, and everyday users.

With the **Zama Protocol**, powered by **Fully Homomorphic Encryption (FHE)**, computation can run directly on encrypted data, enabling confidential and verifiable onchain finance.

### Our Solution: PrivateWill

PrivateWill demonstrates how FHE enables **private inheritance planning** on public blockchains:

- ✅ **Confidential Beneficiary Allocations** — Beneficiary amounts are encrypted using FHE before being stored onchain
- ✅ **Transparent Ownership** — Owner identity and check-in mechanism remain public for verifiability
- ✅ **Automated Triggers** — Will is triggered only when owner misses check-in deadline
- ✅ **Decentralized & Trustless** — No intermediaries; smart contract enforces all rules

---

## 📋 Smart Contracts (Sepolia)

| Contract | Address |
|---|---|
| **PrivateWill** (Main Protocol) | `0x8d2E87114e66E3F56BBf41C1F14C0ace7f1F00f4` |
| **Sepolia USDC** (Test Token) | `0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF` |
| **Confidential USDC (cUSDC)** (Encrypted Wrapper) | `0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639` |

---

## 🛠 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy env and add your WalletConnect project ID
cp .env.example .env.local
# Get a free project ID at https://cloud.walletconnect.com

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💰 Get Test Tokens

### Sepolia USDC (Mock USDC for Testing)
**Faucet:** https://sepolia.etherscan.io/address/0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF#writeContract

1. Go to the link above
2. Click "Write Contract" tab
3. Connect your wallet
4. Call `mint()` function with:
   - `to`: Your address
   - `amount`: `1000000000000000000` (1 USDC with 6 decimals)
5. Confirm transaction

### Sepolia ETH
**Faucet:** https://sepoliafaucet.com

---

## 🎯 Key Features

### 1. **Create Will** (Owner)
- Set check-in interval (1 minute to 1 year)
- Add beneficiaries with confidential allocations
- Amounts are encrypted using Zama FHE before storage
- Approve USDC spending + submit transaction

### 2. **Check In** (Owner)
- Reset the inactivity timer
- Prevents will from being triggered
- Can be called anytime to extend the deadline

### 3. **Claim Inheritance** (Beneficiary)
- Available only when owner misses check-in deadline
- Look up will owner's address
- Claim your encrypted allocation (converted to cUSDC)
- Multiple beneficiaries can claim their portions

---

## 🔒 How FHE Encryption Works

```
Frontend (Client-Side):
1. User enters beneficiary amounts
2. amounts = [100, 200, 300] USDC
3. Zama SDK encrypts: handles = [encrypted_100, encrypted_200, encrypted_300]
4. Creates proof for decryption

Smart Contract (Onchain):
5. Stores handles and proof
6. Beneficiary amounts remain encrypted
7. Only cUSDC transfer is decrypted (via relayer)
8. No one can see individual allocations
```

---

## 📚 Stack

- **Frontend:** Next.js 15 (App Router)
- **Web3:** wagmi v2 + viem
- **Wallet:** RainbowKit
- **State Management:** TanStack Query
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Encryption:** Zama Protocol (fhEVM)
- **Network:** Ethereum Sepolia

---

## 🚀 Smart Contract Architecture

### Core Functions
- `setupWill()` — Create will with encrypted beneficiary amounts
- `checkIn()` — Reset inactivity timer
- `claimInheritance()` — Beneficiary claims inheritance

### View Functions
- `getWill()` — Fetch will details
- `getBeneficiaries()` — List beneficiary addresses
- `isCheckInOverdue()` — Check if will can be triggered
- `getTimeUntilTrigger()` — Seconds until trigger
- `hasClaimedFrom()` — Check if beneficiary already claimed

---

## 📖 Technical Implementation

### FHE Integration
- Uses `@zama-fhe/relayer-sdk/web` for encryption
- Testnet relayer: `https://testnet-fhe-relay.zama.ai/`
- Bytes32 handle encoding for beneficiary amounts
- Proof generation for contract verification

### Project Flow
1. User connects wallet
2. Approves USDC spending via `ERC20.approve()`
3. Encrypts beneficiary amounts using FHE
4. Calls `setupWill()` with encrypted data
5. Smart contract stores encrypted allocations with respective Beneficiaries
6. After the timeout if the owner didnt checkedin , trigger will release
7. After this beneficiaries claim their allocated usdc privately among each other.

---

## 💡 Future Enhancement: Yield Generation (Mainnet)

**Note:** On mainnet,since the CIRCLEUSDC is same as  underlying token for  mainnet confidential token in zamausdc, so the deposited USDC will be put to work in lending protocols (like Aave) to generate APR while idle. This maximizes capital efficiency:

- ✅ **While Active:** Deposited USDC earns yield in Aave/other protocols
- ✅ **Owner Checking In:** Will remains locked, USDC continues earning
- ✅ **Trigger Initiated:** Upon owner missing check-in or beneficiary initiating claim, USDC is withdrawn from lending protocols
- ✅ **Beneficiary Claims:** Beneficiaries receive their encrypted allocation (as confidential cUSDC)

This approach ensures that **dormant inheritance funds don't sit idle** — they generate returns for the inheritance pool until needed. The Sepolia testnet version uses direct USDC holding for simplicity.

---

## 🎬 Demo

[pending]

---



## 🔗 Links

- **Zama Protocol:** https://www.zama.ai/
- **fhEVM Docs:** https://docs.zama.ai/fhevm
- **Sepolia Block Explorer:** https://sepolia.etherscan.io/


---

## 📄 License

MIT
