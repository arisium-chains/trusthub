// World App MiniKit integration wrapper (enhanced)
// Attempts to dynamically import the SDK if available, otherwise falls back to global window.MiniKit.

export interface WalletAuthResult {
  address: string;
  signature?: string;
  message?: string;
  isVerified: boolean;
}

export interface SignMessageResult {
  signature: string;
  message: string;
  address: string;
}

// Get MiniKit instance
function getMiniKit(): any {
  if (typeof window !== 'undefined' && (window as any).MiniKit) {
    return (window as any).MiniKit;
  }
  return null;
}

// Initialize MiniKit (window-based only to avoid bundling optional SDK)
export async function initMiniKit(): Promise<void> {
  const mk = getMiniKit();
  const projectId = (typeof window !== 'undefined') ? (window as any).NEXT_PUBLIC_MINIKIT_ID || process.env.NEXT_PUBLIC_MINIKIT_ID : undefined;
  if (mk?.init && projectId) {
    try { await mk.init({ projectId }); } catch {}
  }
}

// Connect wallet with optional signature verification
export async function connectWallet(requireSignature = false): Promise<WalletAuthResult> {
  await initMiniKit();
  const MiniKit = getMiniKit();
  
  if (!MiniKit?.walletAuth) {
    throw new Error('World App MiniKit not installed or unavailable. Install @worldcoin/minikit and set NEXT_PUBLIC_MINIKIT_ID.');
  }

  try {
    const res = await MiniKit.walletAuth();
    const address = res?.address || res?.walletAddress;
    
    if (!address) {
      throw new Error('MiniKit did not return address');
    }

    let signature: string | undefined;
    let message: string | undefined;
    let isVerified = false;

    // If signature is required, request it
    if (requireSignature) {
      try {
        const signResult = await signMessage(`Verify wallet ownership for TrustHub: ${address}`);
        signature = signResult.signature;
        message = signResult.message;
        isVerified = await verifySignature(address, message, signature);
      } catch (signError) {
        console.warn('Failed to get signature:', signError);
        // Continue without signature if it fails
      }
    }

    return {
      address: String(address),
      signature,
      message,
      isVerified
    };
  } catch (error) {
    throw new Error(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Sign a message with the connected wallet
export async function signMessage(message: string): Promise<SignMessageResult> {
  const MiniKit = getMiniKit();
  
  if (!MiniKit?.signMessage) {
    throw new Error('MiniKit signMessage not available');
  }

  try {
    const result = await MiniKit.signMessage({ message });
    
    if (!result?.signature) {
      throw new Error('Failed to get signature from MiniKit');
    }

    return {
      signature: result.signature,
      message: message,
      address: result.address || ''
    };
  } catch (error) {
    throw new Error(`Message signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Verify a signature (basic implementation)
export async function verifySignature(address: string, message: string, signature: string): Promise<boolean> {
  try {
    // This is a simplified verification - in production you'd want to use a proper crypto library
    // For now, we'll just check that all required fields are present
    return !!(address && message && signature && signature.length > 0);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Check if user has World ID verification
export async function checkWorldIdVerification(): Promise<boolean> {
  const MiniKit = getMiniKit();
  
  if (!MiniKit?.worldIdAuth) {
    return false;
  }

  try {
    const result = await MiniKit.worldIdAuth();
    return !!(result?.proof || result?.verified);
  } catch (error) {
    console.warn('World ID verification check failed:', error);
    return false;
  }
}

// Get user's verification status
export async function getUserVerificationStatus(): Promise<{
  hasWallet: boolean;
  hasSignature: boolean;
  hasWorldId: boolean;
  verificationLevel: 'none' | 'wallet' | 'signature' | 'worldid';
}> {
  try {
    const walletResult = await connectWallet(true);
    const hasWallet = !!walletResult.address;
    const hasSignature = walletResult.isVerified;
    const hasWorldId = await checkWorldIdVerification();

    let verificationLevel: 'none' | 'wallet' | 'signature' | 'worldid' = 'none';
    
    if (hasWorldId) {
      verificationLevel = 'worldid';
    } else if (hasSignature) {
      verificationLevel = 'signature';
    } else if (hasWallet) {
      verificationLevel = 'wallet';
    }

    return {
      hasWallet,
      hasSignature,
      hasWorldId,
      verificationLevel
    };
  } catch (error) {
    return {
      hasWallet: false,
      hasSignature: false,
      hasWorldId: false,
      verificationLevel: 'none'
    };
  }
}

// Legacy function for backward compatibility
export async function connectWalletLegacy(): Promise<string> {
  const result = await connectWallet(false);
  return result.address;
}
