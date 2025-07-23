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
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  businessId: string;
}

type SubmissionState = 'idle' | 'signing' | 'submitting' | 'success';

export const WriteReviewModal = ({ 
  open, 
  onOpenChange, 
  businessName, 
  businessId 
}: WriteReviewModalProps) => {
  const { signMessage, sendTransaction } = useWallet();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');

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
      
      setSubmissionState('success');
      toast.success('Review submitted successfully!');
      
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
              Success!
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Your review is published and verified on the blockchain.
            </p>
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