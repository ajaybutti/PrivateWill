
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/web";

const SEPOLIA_RPC_URL =
  "https://eth-sepolia.g.alchemy.com/v2/QyxMOKTYrNkmofq71rof8WEO1kw9VuI4";

// Zama's testnet relayer URL for Sepolia
const ZAMA_RELAYER_URL = "https://testnet-fhe-relay.zama.ai/";

/**
 * Converts a Uint8Array to a hex string
 */
function uint8ArrayToHex(uint8Array: Uint8Array): `0x${string}` {
  return `0x${Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')}` as `0x${string}`;
}

/**
 * Encrypts beneficiary amounts using Zama FHE
 * @param contractAddress - CryptoWill contract address
 * @param userAddress - User's wallet address
 * @param amounts - Array of amounts to encrypt (as BigInt)
 * @returns Object containing encrypted handles and proof (as hex strings)
 */
export async function encryptBeneficiaryAmounts(
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  amounts: bigint[]
) {
  try {

          await initSDK();
    // Initialize FHE instance with Sepolia config + relayer URL
    const config = { 
      ...SepoliaConfig, 
      network: SEPOLIA_RPC_URL,
      relayerURL: ZAMA_RELAYER_URL 
    };
    const instance = await createInstance(config);

    // Create encrypted input buffer
    const buffer = instance.createEncryptedInput(
      contractAddress,
      userAddress,
    );

    // Add each amount as 64-bit encrypted value
    for (const amount of amounts) {
      buffer.add64(amount);
    }

    // Encrypt, generate proof, and upload ciphertexts via relayer
    const ciphertexts = await buffer.encrypt();

    // Convert handles and proof to hex strings for contract encoding
    // ✅ Zama SDK returns bytes32 handles (256-bit), even for euint64
    // Contract expects externalEuint64[] which are passed as bytes32 hex strings
    const hexHandles = ciphertexts.handles.map((handle, idx) => {
      const handleHex = typeof handle === "string" ? handle : uint8ArrayToHex(handle);
      
      console.log(`  Handle[${idx}] raw:`, handleHex, `length: ${handleHex.length}`);
      
      // Zama SDK returns 32 bytes (66 chars with 0x prefix)
      // This is correct for externalEuint64 - the handle is always bytes32
      if (handleHex.length !== 66) {
        throw new Error(
          `Invalid handle length. Expected bytes32 (66 chars with 0x), got ${handleHex.length}`
        );
      }
      
      return handleHex as `0x${string}`;
    });
    
    const hexProof = typeof ciphertexts.inputProof === "string" 
      ? ciphertexts.inputProof 
      : uint8ArrayToHex(ciphertexts.inputProof);

    console.log("🔐 FHE Encryption Debug:");
    console.log("  Handles (bytes32 hex):", hexHandles);
    console.log("  Proof (hex):", hexProof);
    console.log("  Proof length:", hexProof.length);

    return {
      handles: hexHandles, // Array of encrypted amounts as bytes32 hex strings
      inputProof: hexProof, // Proof as hex string
    };
  } catch (error) {
    console.error('FHE encryption failed:', error);
    throw new Error(`Failed to encrypt amounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that handles and proof are ready for contract interaction
 */
export function validateEncryptedData(
  handles: string[],
  inputProof: string
): boolean {
  return (
    Array.isArray(handles) &&
    handles.length > 0 &&
    handles.every(h => typeof h === 'string' && h.length > 0) &&
    typeof inputProof === 'string' &&
    inputProof.length > 0
  );
}
