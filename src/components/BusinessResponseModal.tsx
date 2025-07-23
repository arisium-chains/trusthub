'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWallet } from '@/hooks/useWallet';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Review } from '@/lib/mock-data';

interface BusinessResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  businessName: string;
}

type SubmissionState = 'idle' | 'signing' | 'submitting' | 'success';

export const BusinessResponseModal = ({ 
  open, 
  onOpenChange, 
  review,
  businessName 
}: BusinessResponseModalProps) => {
  const { signMessage, sendTransaction } = useWallet();
  const [response, setResponse] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');

  const resetForm = () => {
    setResponse('');
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
    
    if (!response.trim()) {
      toast.error('Please write a response');
      return;
    }

    if (!review) {
      toast.error('No review selected');
      return;
    }

    try {
      setSubmissionState('signing');
      
      // Create response data
      const responseData = {
        reviewId: review.id,
        businessName,
        content: response.trim(),
        timestamp: new Date().toISOString(),
      };

      // Sign the response content
      const message = JSON.stringify(responseData);
      await signMessage(message);
      
      setSubmissionState('submitting');
      
      // Submit to blockchain (simulated)
      await sendTransaction({
        type: 'submitBusinessResponse',
        data: responseData,
      });
      
      setSubmissionState('success');
      toast.success('Response submitted successfully!');
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit response:', error);
      setSubmissionState('idle');
      // Error toast is handled by the wallet hook
    }
  };

  const canSubmit = response.trim().length > 0 && submissionState === 'idle';

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Respond to Review</DialogTitle>
          <DialogDescription>
            Write an official response as {businessName}
          </DialogDescription>
        </DialogHeader>

        {/* Original Review */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {review.reviewerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm">{review.reviewerName}</h4>
              <p className="text-xs text-gray-500">{review.timestamp}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 line-clamp-3">
            {review.content}
          </p>
        </div>

        {submissionState === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Response Posted!
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Your official response has been published and verified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Response Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response *
              </label>
              <Textarea
                placeholder="Thank you for your feedback. We appreciate..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={submissionState !== 'idle'}
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {response.length}/1000 characters
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
                      This verifies your response&apos;s authenticity
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
                Submit Response
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};