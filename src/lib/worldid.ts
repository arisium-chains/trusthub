import { ISuccessResult, IErrorState } from '@worldcoin/idkit';

// World ID MiniApp SDK Configuration
export const WORLD_ID_CONFIG = {
  app_id: (process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || 'app_staging_123456789') as `app_${string}`,
  action: 'verify-trusthub-reviewer' as const,
  signal: 'trusthub-verification-v1' as const,
  enableTelemetry: true,
  debug: process.env.NODE_ENV === 'development',
  // MiniApp specific configuration
  verification_level: 'orb' as const,
  theme: 'light' as const
};

// Environment check for MiniApp SDK
export const isMiniAppEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if running inside World App
  return !!(window as any).WorldApp || !!(window as any).worldcoin;
};

// World ID MiniApp integration (compatible implementation)
class WorldIDMiniApp {
  private static instance: WorldIDMiniApp;
  private isInitialized = false;
  
  public static getInstance(): WorldIDMiniApp {
    if (!WorldIDMiniApp.instance) {
      WorldIDMiniApp.instance = new WorldIDMiniApp();
    }
    return WorldIDMiniApp.instance;
  }
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      if (isMiniAppEnvironment()) {
        // Initialize MiniApp communication bridge
        await this.setupMiniAppBridge();
        console.log('✅ World ID MiniApp bridge initialized');
      } else {
        console.log('📱 Running outside MiniApp - using standard World ID');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize World ID MiniApp bridge:', error);
      throw error;
    }
  }

  private async setupMiniAppBridge(): Promise<void> {
    // Set up communication bridge with World App
    if (typeof window !== 'undefined') {
      // Register message handlers for MiniApp communication
      window.addEventListener('message', this.handleMiniAppMessage.bind(this));
      
      // Signal to World App that we're ready
      this.postMessage({ type: 'miniapp_ready' });
    }
  }

  private handleMiniAppMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'world_id_verified':
        this.handleVerificationResult(data);
        break;
      case 'user_info':
        this.handleUserInfo(data);
        break;
      default:
        console.log('Unknown MiniApp message:', type, data);
    }
  }

  private postMessage(message: any) {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(message, '*');
    }
  }
  
  async requestVerification(): Promise<ISuccessResult> {
    await this.initialize();
    
    if (isMiniAppEnvironment()) {
      // Request verification through MiniApp bridge
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Verification timeout'));
        }, 30000); // 30 second timeout
        
        // Store callback for later use
        (window as any).worldIdVerificationCallback = (result: any) => {
          clearTimeout(timeoutId);
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Verification failed'));
          }
        };
        
        // Request verification from World App
        this.postMessage({
          type: 'request_verification',
          data: {
            action: WORLD_ID_CONFIG.action,
            signal: WORLD_ID_CONFIG.signal,
            app_id: WORLD_ID_CONFIG.app_id
          }
        });
      });
    } else {
      // Use standard IDKit for web environments
      throw new Error('Please use World ID widget for verification in web environment');
    }
  }

  private handleVerificationResult(data: any) {
    const callback = (window as any).worldIdVerificationCallback;
    if (callback) {
      callback(data);
      delete (window as any).worldIdVerificationCallback;
    }
  }
  
  async getUserInfo() {
    if (!isMiniAppEnvironment()) {
      return null;
    }
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(null);
      }, 5000);
      
      (window as any).worldIdUserInfoCallback = (userInfo: any) => {
        clearTimeout(timeoutId);
        resolve(userInfo);
      };
      
      this.postMessage({ type: 'request_user_info' });
    });
  }

  private handleUserInfo(data: any) {
    const callback = (window as any).worldIdUserInfoCallback;
    if (callback) {
      callback(data);
      delete (window as any).worldIdUserInfoCallback;
    }
  }
  
  async shareContent(content: { title: string; description: string; imageUrl?: string }) {
    if (!isMiniAppEnvironment()) {
      console.log('Share functionality only available in MiniApp environment');
      return false;
    }
    
    try {
      this.postMessage({
        type: 'share_content',
        data: content
      });
      return true;
    } catch (error) {
      console.error('Failed to share content:', error);
      return false;
    }
  }

  // Detect if running in World App WebView
  detectMiniAppCapabilities(): { canVerify: boolean; canShare: boolean; canGetUserInfo: boolean } {
    return {
      canVerify: isMiniAppEnvironment(),
      canShare: isMiniAppEnvironment(),
      canGetUserInfo: isMiniAppEnvironment()
    };
  }
}

export const miniApp = WorldIDMiniApp.getInstance();

// World ID verification result types
export interface WorldIDVerificationResult {
  success: boolean;
  nullifier_hash?: string;
  merkle_root?: string;
  proof?: string;
  verification_level?: string;
  user_id?: string;
  error?: string;
}

// Enhanced user profile with MiniApp data
export interface WorldIDUserProfile {
  is_verified: boolean;
  verification_level: 'device' | 'orb';
  nullifier_hash: string;
  user_id?: string;
  profile?: {
    name?: string;
    avatar?: string;
  };
}

// Verify World ID proof on backend (production implementation)
export const verifyWorldIDProof = async (
  proof: ISuccessResult
): Promise<WorldIDVerificationResult> => {
  try {
    console.log('🔐 Verifying World ID proof:', proof);
    
    // Call backend API to verify the proof with World ID's verification service
    const response = await fetch('/api/auth/verify-world-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proof: proof.proof,
        nullifier_hash: proof.nullifier_hash,
        merkle_root: proof.merkle_root,
        action: WORLD_ID_CONFIG.action,
        signal: WORLD_ID_CONFIG.signal
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'World ID verification failed');
    }
    
    // Store verification in PocketBase
    await storeWorldIDVerification({
      nullifier_hash: result.nullifier_hash,
      merkle_root: result.merkle_root,
      proof: result.proof,
      verification_level: result.verification_level || 'orb',
      verified_at: new Date().toISOString()
    });
    
    return {
      success: true,
      nullifier_hash: result.nullifier_hash,
      merkle_root: result.merkle_root,
      proof: result.proof,
      verification_level: result.verification_level,
      user_id: result.user_id
    };
  } catch (error) {
    console.error('❌ World ID verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown verification error'
    };
  }
};

// Store World ID verification in PocketBase
export const storeWorldIDVerification = async (verificationData: any) => {
  try {
    const { pb } = await import('./pocketbase');
    
    // Update user record with World ID verification
    const user = pb.authStore.model;
    if (user) {
      await pb.collection('users').update(user.id, {
        world_id_verified: true,
        world_id_hash: verificationData.nullifier_hash,
        verification_level: verificationData.verification_level,
        verified_at: verificationData.verified_at
      });
    }
    
    console.log('✅ World ID verification stored in database');
  } catch (error) {
    console.error('❌ Failed to store World ID verification:', error);
  }
};

// Handle World ID verification success (MiniApp enhanced)
export const handleWorldIDSuccess = async (result: ISuccessResult) => {
  console.log('✅ World ID verification successful:', result);
  
  try {
    // Verify the proof with backend
    const verification = await verifyWorldIDProof(result);
    
    if (verification.success) {
      // Get additional user info if in MiniApp environment
      let userProfile = null;
      if (isMiniAppEnvironment()) {
        try {
          userProfile = await miniApp.getUserInfo();
          console.log('📱 Retrieved MiniApp user info:', userProfile);
        } catch (error) {
          console.log('ℹ️ Could not retrieve user info (using fallback):', error);
        }
      }
      
      // Create enhanced verification data
      const verificationData = {
        nullifier_hash: result.nullifier_hash,
        merkle_root: result.merkle_root,
        proof: result.proof,
        verification_level: verification.verification_level || 'orb',
        user_id: verification.user_id,
        profile: userProfile,
        verified_at: new Date().toISOString(),
        miniapp_environment: isMiniAppEnvironment(),
        capabilities: miniApp.detectMiniAppCapabilities()
      };
      
      // Store in localStorage as backup
      localStorage.setItem('worldid_verification', JSON.stringify(verificationData));
      
      // Award TRH tokens for verification
      if (verification.nullifier_hash) {
        await awardVerificationBonus(verification.nullifier_hash);
      }
      
      return verification;
    }
    
    throw new Error(verification.error || 'Verification failed');
  } catch (error) {
    console.error('❌ Failed to handle World ID success:', error);
    throw error;
  }
};

// Award TRH tokens for successful World ID verification
const awardVerificationBonus = async (nullifierHash: string) => {
  try {
    const { pb } = await import('./pocketbase');
    const { trhTokenManager } = await import('./trh-token');
    
    const user = pb.authStore.model;
    if (user && !user.world_id_verified) {
      // Award 100 TRH for first-time verification
      await trhTokenManager.awardTokens(100, 'World ID Verification Bonus', 'verification_bonus');
      console.log('🎉 Awarded 100 TRH for World ID verification!');
    }
  } catch (error) {
    console.error('❌ Failed to award verification bonus:', error);
  }
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