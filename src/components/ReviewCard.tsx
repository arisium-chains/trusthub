'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ThumbsUp, ThumbsDown, Shield } from 'lucide-react';
import { Review } from '@/lib/mock-data';

interface ReviewCardProps {
  review: Review;
  showReplyButton?: boolean;
  onReply?: (reviewId: string) => void;
}

export const ReviewCard = ({ review, showReplyButton = false, onReply }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {review.reviewerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{review.reviewerName}</h4>
                {review.verified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="h-3 w-3" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{review.timestamp}</p>
            </div>
          </div>
          {showReplyButton && onReply && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReply(review.id)}
            >
              Reply
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {renderStars(review.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {review.rating}.0
            </span>
          </div>
          {review.title && (
            <h5 className="font-medium text-sm mb-2">{review.title}</h5>
          )}
        </div>
        
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {review.content}
        </p>

        {/* Business Response */}
        {review.businessResponse && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
              <span className="font-semibold text-sm text-blue-900">Official Response</span>
              <span className="text-xs text-blue-600">{review.businessResponse.timestamp}</span>
            </div>
            <p className="text-sm text-blue-800">
              {review.businessResponse.content}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span>{review.likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
            <ThumbsDown className="h-4 w-4" />
            <span>{review.dislikes}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};