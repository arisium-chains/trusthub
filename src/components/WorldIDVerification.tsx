'use client';

import { useState } from 'react';
import { IDKitWidget, ISuccessResult, IErrorState } from '@worldcoin/idkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { 
  WORLD_ID_CONFIG, 
  handleWorldIDSuccess, 
  handleWorldIDError,
  isWorldIDVerified,
  getWorldIDVerification,
  clearWorldIDVerification,
  miniApp,
  isMiniAppEnvironment
} from '@/lib/worldid';
import { realtimeSync } from '@/lib/realtime-sync';
import { pb } from '@/lib/pocketbase-production';
import { toast } from 'sonner';

interface WorldIDVerificationProps {
  onVerificationComplete?: (verified: boolean) => void;
  showCard?: boolean;
}

export const WorldIDVerification = ({ 
  onVerificationComplete, 
  showCard = true 
}: WorldIDVerificationProps) => {
  const { account } = useWallet();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(isWorldIDVerified());
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [miniAppCapabilities, setMiniAppCapabilities] = useState<any>(null);
  const verificationData = getWorldIDVerification();

  // Check for MiniApp environment on mount
  useState(() => {
    const checkMiniApp = async () => {
      const isMiniAppEnv = isMiniAppEnvironment();
      setIsMiniApp(isMiniAppEnv);
      
      if (isMiniAppEnv) {
        const capabilities = miniApp.detectMiniAppCapabilities();
        setMiniAppCapabilities(capabilities);
        console.log('🔍 MiniApp capabilities:', capabilities);
      }
    };
    
    checkMiniApp();
  });

  const onSuccess = async (result: ISuccessResult) => {
    setIsVerifying(true);
    try {
      // Handle World ID success with production integration
      const verification = await handleWorldIDSuccess(result);
      
      // Update local state
      setVerified(true);
      
      // Success message with MiniApp awareness
      const bonusMessage = isMiniApp 
        ? 'World ID verification successful in MiniApp! +100 TRH bonus earned'
        : 'World ID verification successful! +100 TRH bonus earned';
      
      toast.success(bonusMessage);
      
      // Share success in MiniApp if available
      if (isMiniApp && miniAppCapabilities?.canShare) {
        await miniApp.shareContent({
          title: 'Just got verified on TrustHub!',
          description: 'I\'m now a verified reviewer earning TRH tokens for authentic reviews.',
          imageUrl: '/trusthub-share-image.png'
        });
      }
      
      // Analytics tracking
      await pb.logAnalyticsEvent({
        type: 'world_id_verification_success',
        userAddress: account?.address,
        sessionId: `session_${Date.now()}`,
        metadata: {
          verification_level: verification.verification_level,
          miniapp_environment: isMiniApp,
          capabilities: miniAppCapabilities
        }
      });
      
      onVerificationComplete?.(true);
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed');
      
      // Analytics tracking for failure
      await pb.logAnalyticsEvent({
        type: 'world_id_verification_failed',
        userAddress: account?.address,
        sessionId: `session_${Date.now()}`,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          miniapp_environment: isMiniApp
        }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onError = (error: IErrorState) => {
    try {
      handleWorldIDError(error);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    }
    onVerificationComplete?.(false);
  };

  const handleClearVerification = async () => {
    clearWorldIDVerification();
    setVerified(false);
    toast.info('World ID verification cleared');
    
    // Update database if user is authenticated
    if (pb.client.authStore.isValid) {
      try {
        const user = pb.client.authStore.model;
        if (user) {
          await pb.client.collection('users').update(user.id, {
            world_id_verified: false,
            world_id_hash: null,
            verification_level: null,
            verified_at: null
          });
        }
      } catch (error) {
        console.warn('Failed to update verification status in database:', error);
      }
    }
  };

  const config = {
    ...WORLD_ID_CONFIG,
    signal: account?.address || ''
  };

  if (!showCard) {
    return (
      <IDKitWidget
        app_id={config.app_id}
        action={config.action}
        signal={config.signal}
        onSuccess={onSuccess}
        onError={onError}
      >
        {({ open }) => (
          <Button
            onClick={open}
            disabled={!account?.address || verified || isVerifying}
            className="bg-green-600 hover:bg-green-700"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {verified ? 'Verified' : 'Verify with World ID'}
          </Button>
        )}
      </IDKitWidget>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">World ID Verification</CardTitle>
          </div>
          {verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <CardDescription>
          Verify your humanity with World ID to earn bonus TRH tokens and increase trust on TrustHub
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* MiniApp Status Indicator */}
        {isMiniApp && (
          <div className="mb-4 flex items-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-lg">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Running in World App MiniApp</span>
            <Badge variant="outline" className="text-xs">Enhanced Features</Badge>
          </div>
        )}

        {!account?.address ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {isMiniApp 
                ? 'Connect your wallet to verify with World ID in MiniApp'
                : 'Connect your wallet first to verify with World ID'
              }
            </span>
          </div>
        ) : verified ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">You are verified with World ID!</span>
            </div>
            
            {verificationData && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Verified: {new Date(verificationData.verified_at).toLocaleDateString()}</p>
                <p>Nullifier: {verificationData.nullifier_hash.substring(0, 16)}...</p>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {isMiniApp ? 'MiniApp Benefits Unlocked:' : 'Benefits Unlocked:'}
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• +{isMiniApp ? '10' : '5'} TRH bonus on every review</li>
                <li>• Higher trust score and reputation</li>
                <li>• Access to premium features</li>
                <li>• Reduced anti-fraud restrictions</li>
                {isMiniApp && (
                  <>
                    <li>• Native World App sharing</li>
                    <li>• Enhanced MiniApp features</li>
                    <li>• Priority verification processing</li>
                  </>
                )}
              </ul>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearVerification}
                className="text-xs"
              >
                Clear Verification (Dev Only)
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {isMiniApp ? 'Why verify in World App?' : 'Why verify with World ID?'}
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Earn {isMiniApp ? '100' : '100'} TRH tokens immediately upon verification</li>
                <li>• Get +{isMiniApp ? '10' : '5'} TRH bonus on every review you submit</li>
                <li>• Build higher trust and reputation scores</li>
                <li>• Prevent spam and ensure authentic reviews</li>
                {isMiniApp && (
                  <>
                    <li>• Share achievements directly to World App</li>
                    <li>• Access exclusive MiniApp features</li>
                  </>
                )}
              </ul>
            </div>

            <IDKitWidget
                app_id={config.app_id}
                action={config.action}
                signal={config.signal}
                onSuccess={onSuccess}
                onError={onError}
              >
              {({ open }) => (
                <Button
                  onClick={open}
                  disabled={isVerifying}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Verify with World ID
                </Button>
              )}
            </IDKitWidget>

            <p className="text-xs text-gray-500 text-center">
              {isMiniApp 
                ? 'MiniApp verification is seamless and instant'
                : 'Verification is free and takes less than 30 seconds'
              }
            </p>
            
            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                <strong>Dev Info:</strong>
                <div>Environment: {isMiniApp ? 'MiniApp' : 'Web'}</div>
                {miniAppCapabilities && (
                  <div>Capabilities: {JSON.stringify(miniAppCapabilities)}</div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};