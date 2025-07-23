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
  clearWorldIDVerification
} from '@/lib/worldid';
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
  const verificationData = getWorldIDVerification();

  const onSuccess = async (result: ISuccessResult) => {
    setIsVerifying(true);
    try {
      await handleWorldIDSuccess(result);
      setVerified(true);
      toast.success('World ID verification successful! +50 TRH bonus earned');
      onVerificationComplete?.(true);
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed');
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

  const handleClearVerification = () => {
    clearWorldIDVerification();
    setVerified(false);
    toast.info('World ID verification cleared');
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
          Verify your humanity with World ID to earn bonus TRH tokens and increase trust
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!account?.address ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Connect your wallet first to verify with World ID</span>
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
              <h4 className="text-sm font-medium text-blue-900 mb-1">Benefits Unlocked:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• +5 TRH bonus on every review</li>
                <li>• Higher trust score and reputation</li>
                <li>• Access to premium features</li>
                <li>• Reduced anti-fraud restrictions</li>
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
              <h4 className="text-sm font-medium text-gray-900 mb-2">Why verify with World ID?</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Earn 50 TRH tokens immediately upon verification</li>
                <li>• Get +5 TRH bonus on every review you submit</li>
                <li>• Build higher trust and reputation scores</li>
                <li>• Prevent spam and ensure authentic reviews</li>
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
              Verification is free and takes less than 30 seconds
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};