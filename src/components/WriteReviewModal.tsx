'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RatingStars } from './RatingStars';
import { useWallet } from '@/hooks/useWallet';
import { Loader2, CheckCircle2, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { 
  trhTokenManager, 
  calculateReviewQuality, 
  calculateReviewReward,
  formatTRHAmount
} from '@/lib/trh-token';
import { isWorldIDVerified } from '@/lib/worldid';
import { pb } from '@/lib/pocketbase-production';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  businessId: string;
  onReviewSubmitted?: () => void; // Callback to refresh reviews
}

type SubmissionState = 'idle' | 'signing' | 'submitting' | 'success';

interface RewardInfo {
  baseReward: number;
  qualityMultiplier: number;
  bonuses: string[];
  totalReward: number;
}

export const WriteReviewModal = ({ 
  open, 
  onOpenChange, 
  businessName, 
  businessId,
  onReviewSubmitted
}: WriteReviewModalProps) => {
  const { signMessage, sendTransaction, account } = useWallet();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setContent('');
    setSubmissionState('idle');
  };

  const handleClose = () => {
    if (submissionState !== 'signing' && submissionState !== 'submitting') {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      setSubmissionState('signing');
      
      // Create review data
      const reviewData = {
        businessId,
        rating,
        title: title.trim(),
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      // Sign the review content
      const message = JSON.stringify(reviewData);
      await signMessage(message);
      
      setSubmissionState('submitting');
      
      // Submit to blockchain (simulated)
      await sendTransaction({
        type: 'submitReview',
        data: reviewData,
      });

      // Save review to PocketBase database
      try {
        await pb.createReview({
          businessId: businessId,
          reviewerAddress: account?.address || '',
          rating,
          title: title.trim() || '',
          content: content.trim(),
          worldIdVerified: isWorldIDVerified()
        });
        console.log('✅ Review saved to PocketBase successfully');
      } catch (dbError) {
        console.error('❌ Failed to save review to database:', dbError);
        // Continue anyway - don't fail the entire process for DB issues
      }

      // Calculate TRH reward
      const qualityScore = calculateReviewQuality(
        content.length,
        0, // No helpful votes yet for new review
        false, // No media support yet
        30, // Mock account age
        false // Not first reviewer (for demo)
      );

      const reward = calculateReviewReward(qualityScore, false);
      
      // Award TRH tokens
      await trhTokenManager.awardTokens(
        reward,
        `Review reward for ${businessName}`,
        'review_reward',
        reviewData.timestamp
      );

      // Calculate reward info for display
      const bonuses = [];
      if (isWorldIDVerified()) bonuses.push('+5 TRH World ID bonus');
      if (qualityScore.multiplier > 1.5) bonuses.push('High quality review bonus');
      
      setRewardInfo({
        baseReward: 10,
        qualityMultiplier: qualityScore.multiplier,
        bonuses,
        totalReward: reward
      });
      
      setSubmissionState('success');
      toast.success(`Review submitted! Earned ${formatTRHAmount(reward)}`);
      
      // Trigger review refresh callback
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      setSubmissionState('idle');
      // Error toast is handled by the wallet hook
    }
  };

  const isFormValid = rating > 0 && content.trim().length > 0;
  const canSubmit = isFormValid && submissionState === 'idle';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {businessName}
          </DialogDescription>
        </DialogHeader>

        {submissionState === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Review Published!
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Your review is verified on the blockchain.
            </p>
            
            {rewardInfo && (
              <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">TRH Reward Earned</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base reward:</span>
                    <span className="font-medium">{formatTRHAmount(rewardInfo.baseReward)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quality multiplier:</span>
                    <span className="font-medium">{rewardInfo.qualityMultiplier.toFixed(1)}x</span>
                  </div>
                  
                  {rewardInfo.bonuses.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Bonuses:</span>
                      <ul className="mt-1 ml-4">
                        {rewardInfo.bonuses.map((bonus, index) => (
                          <li key={index} className="text-green-600 text-xs">• {bonus}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="border-t border-purple-200 pt-2 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-purple-900">Total earned:</span>
                      <span className="font-bold text-purple-900 text-lg">
                        {formatTRHAmount(rewardInfo.totalReward)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <RatingStars
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <Input
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submissionState !== 'idle'}
                maxLength={100}
              />
            </div>

            {/* Review Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <Textarea
                placeholder="Tell others about your experience..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submissionState !== 'idle'}
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {content.length}/1000 characters
              </div>
            </div>

            {/* Signing/Submitting State */}
            {submissionState === 'signing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Please sign the message in your wallet...
                    </p>
                    <p className="text-xs text-blue-700">
                      This verifies your review&apos;s authenticity
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submissionState === 'submitting' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Submitting to blockchain...
                    </p>
                    <p className="text-xs text-yellow-700">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submissionState === 'signing' || submissionState === 'submitting'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submissionState === 'signing' || submissionState === 'submitting' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};