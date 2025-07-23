'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  TrendingUp, 
  Crown, 
  Star, 
  Zap, 
  Calendar,
  ArrowUp,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { trhTokenManager, formatTRHAmount } from '@/lib/trh-token';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

interface PromotionTier {
  id: 'basic' | 'premium' | 'platinum';
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

const PROMOTION_TIERS: PromotionTier[] = [
  {
    id: 'basic',
    name: 'Basic Promotion',
    price: 100,
    duration: 30,
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-blue-600',
    features: [
      'Featured in category listings',
      '"Promoted" badge on profile',
      'Priority in category search results',
      'Basic analytics dashboard'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Promotion',
    price: 500,
    duration: 30,
    icon: <Crown className="h-5 w-5" />,
    color: 'text-purple-600',
    popular: true,
    features: [
      'Everything in Basic',
      'Homepage trending section',
      'Cross-category visibility',
      'Featured business spotlight',
      'Enhanced analytics dashboard',
      'Priority customer support'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Promotion',
    price: 1000,
    duration: 30,
    icon: <Star className="h-5 w-5" />,
    color: 'text-yellow-600',
    features: [
      'Everything in Premium',
      'Top banner placement',
      'Push notification features',
      'Custom promotional campaigns',
      'Dedicated account manager',
      'Advanced analytics & insights'
    ]
  }
];

interface BusinessPromotionProps {
  businessId: string;
  businessName: string;
  currentPromotion?: {
    tier: string;
    expiresAt: string;
    isActive: boolean;
  };
}

export const BusinessPromotion = ({ 
  businessId, 
  businessName, 
  currentPromotion 
}: BusinessPromotionProps) => {
  const { isConnected } = useWallet();
  const [selectedTier, setSelectedTier] = useState<PromotionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handlePromotionPurchase = async (tier: PromotionTier) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if user has sufficient balance
      const balance = trhTokenManager.getBalance();
      if (balance.available < tier.price) {
        toast.error(`Insufficient TRH balance. You need ${formatTRHAmount(tier.price)}, but only have ${formatTRHAmount(balance.available)}`);
        setIsProcessing(false);
        return;
      }

      // Process payment
      await trhTokenManager.spendTokens(
        tier.price,
        `${tier.name} for ${businessName}`,
        'promotion_payment',
        businessId
      );

      // Show success message
      toast.success(`🎉 ${tier.name} activated! Your business is now promoted for ${tier.duration} days.`);
      
      setShowPaymentDialog(false);
      setSelectedTier(null);
      
    } catch (error) {
      console.error('Promotion purchase failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to purchase promotion');
    } finally {
      setIsProcessing(false);
    }
  };

  const PromotionCard = ({ tier }: { tier: PromotionTier }) => (
    <Card className={`relative ${tier.popular ? 'border-purple-300 shadow-lg' : 'border-gray-200'}`}>
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
          tier.id === 'basic' ? 'from-blue-400 to-blue-600' :
          tier.id === 'premium' ? 'from-purple-400 to-purple-600' :
          'from-yellow-400 to-yellow-600'
        } flex items-center justify-center mx-auto mb-3`}>
          <div className="text-white">{tier.icon}</div>
        </div>
        
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        <div className="text-3xl font-bold mt-2">
          {formatTRHAmount(tier.price)}
        </div>
        <CardDescription>per {tier.duration} days</CardDescription>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2 mb-6">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full"
          variant={tier.popular ? 'default' : 'outline'}
          onClick={() => {
            setSelectedTier(tier);
            setShowPaymentDialog(true);
          }}
          disabled={!isConnected}
        >
          {tier.popular && <Zap className="h-4 w-4 mr-2" />}
          Choose {tier.name}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Current Promotion Status */}
      {currentPromotion && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-green-900">
                    {currentPromotion.tier.charAt(0).toUpperCase() + currentPromotion.tier.slice(1)} Active
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Expires {new Date(currentPromotion.expiresAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Promotion Benefits Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-blue-600" />
            Boost Your Business Visibility
          </CardTitle>
          <CardDescription>
            Promote your business to reach more customers and get more reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Increased Visibility</h3>
              <p className="text-sm text-blue-700">Appear higher in search results</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Featured Placement</h3>
              <p className="text-sm text-purple-700">Stand out with promotional badges</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">More Reviews</h3>
              <p className="text-sm text-green-700">Get discovered by more customers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Tiers */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose Your Promotion Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMOTION_TIERS.map((tier) => (
            <PromotionCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Promotion Purchase</DialogTitle>
            <DialogDescription>
              You&apos;re about to purchase {selectedTier?.name} for {businessName}
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                    selectedTier.id === 'basic' ? 'from-blue-400 to-blue-600' :
                    selectedTier.id === 'premium' ? 'from-purple-400 to-purple-600' :
                    'from-yellow-400 to-yellow-600'
                  } flex items-center justify-center`}>
                    <div className="text-white">{selectedTier.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTier.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTier.duration} days promotion</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">{formatTRHAmount(selectedTier.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedTier.duration} days</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total:</span>
                    <span>{formatTRHAmount(selectedTier.price)}</span>
                  </div>
                </div>
              </div>

              {!isConnected && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Please connect your wallet to continue</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedTier && handlePromotionPurchase(selectedTier)}
              disabled={!isConnected || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Purchase Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};