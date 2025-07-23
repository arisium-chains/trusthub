import { ISuccessResult, IErrorState } from '@worldcoin/idkit';

// World ID Configuration
export const WORLD_ID_CONFIG = {
  app_id: (process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || 'app_staging_123456789') as `app_${string}`,
  action: 'verify-reviewer' as const,
  signal: '' as const,
  enableTelemetry: true,
  debug: process.env.NODE_ENV === 'development'
};

// World ID verification result types
export interface WorldIDVerificationResult {
  success: boolean;
  nullifier_hash?: string;
  merkle_root?: string;
  proof?: string;
  error?: string;
}

// Verify World ID proof on backend (mock implementation)
export const verifyWorldIDProof = async (
  proof: ISuccessResult
): Promise<WorldIDVerificationResult> => {
  try {
    // In production, this would call your backend API to verify the proof
    // For now, we'll simulate the verification process
    console.log('Verifying World ID proof:', proof);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock verification - in production, this would verify with World ID's backend
    const isValid = Math.random() > 0.1; // 90% success rate for demo
    
    if (isValid) {
      return {
        success: true,
        nullifier_hash: proof.nullifier_hash,
        merkle_root: proof.merkle_root,
        proof: proof.proof
      };
    } else {
      return {
        success: false,
        error: 'World ID proof verification failed'
      };
    }
  } catch (error) {
    console.error('World ID verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
};

// Handle World ID verification success
export const handleWorldIDSuccess = async (result: ISuccessResult) => {
  console.log('World ID verification successful:', result);
  
  // Verify the proof with backend
  const verification = await verifyWorldIDProof(result);
  
  if (verification.success) {
    // Store verification data (in production, this would be stored securely)
    const verificationData = {
      nullifier_hash: result.nullifier_hash,
      merkle_root: result.merkle_root,
      proof: result.proof,
      verified_at: new Date().toISOString()
    };
    
    // Store in localStorage for demo (in production, store in secure backend)
    localStorage.setItem('worldid_verification', JSON.stringify(verificationData));
    
    return verification;
  }
  
  throw new Error(verification.error || 'Verification failed');
};

// Handle World ID verification error
export const handleWorldIDError = (error: IErrorState) => {
  console.error('World ID verification failed:', error);
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'verification_rejected': 'Verification was rejected. Please try again.',
    'max_verifications_reached': 'Maximum verification attempts reached.',
    'credential_unavailable': 'World ID credential not available.',
    'network_error': 'Network error. Please check your connection.',
    'generic_error': 'Verification failed. Please try again.'
  };
  
  const message = errorMessages[error.code] || error.message || 'Unknown error occurred';
  throw new Error(message);
};

// Check if user has valid World ID verification
export const isWorldIDVerified = (): boolean => {
  try {
    const verification = localStorage.getItem('worldid_verification');
    if (!verification) return false;
    
    const data = JSON.parse(verification);
    const verifiedAt = new Date(data.verified_at);
    const now = new Date();
    
    // Verification is valid for 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return verifiedAt > thirtyDaysAgo;
  } catch {
    return false;
  }
};

// Get World ID verification data
export const getWorldIDVerification = () => {
  try {
    const verification = localStorage.getItem('worldid_verification');
    return verification ? JSON.parse(verification) : null;
  } catch {
    return null;
  }
};

// Clear World ID verification (for testing/logout)
export const clearWorldIDVerification = () => {
  localStorage.removeItem('worldid_verification');
};