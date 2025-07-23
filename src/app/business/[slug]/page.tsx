'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { ReviewCard } from '@/components/ReviewCard';
import { RatingStars } from '@/components/RatingStars';
import { WriteReviewModal } from '@/components/WriteReviewModal';
import { BusinessResponseModal } from '@/components/BusinessResponseModal';
import { useWallet } from '@/hooks/useWallet';
import { ArrowLeft, ExternalLink, PenTool } from 'lucide-react';
import { mockBusinesses, mockReviews, type Review } from '@/lib/mock-data';
import Link from 'next/link';

export default function BusinessProfilePage() {
  const params = useParams();
  const { isConnected } = useWallet();
  const [sortBy, setSortBy] = useState('recent');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showBusinessResponse, setShowBusinessResponse] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const business = mockBusinesses.find(b => b.slug === params.slug);
  const businessReviews = mockReviews.filter(r => r.businessId === business?.id);

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleReply = (reviewId: string) => {
    const review = businessReviews.find(r => r.id === reviewId);
    if (review) {
      setSelectedReview(review);
      setShowBusinessResponse(true);
    }
  };

  // For demo purposes, assume user is business owner for first business
  const isBusinessOwner = business?.id === '1';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Reviews
              </Button>
            </Link>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Business Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {business.name.charAt(0)}
                </div>
                <CardTitle className="text-xl">{business.name}</CardTitle>
                <p className="text-sm text-gray-500">{business.category}</p>
                <a 
                  href={`https://${business.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1"
                >
                  {business.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6 text-center">
                  {business.description}
                </p>

                {/* Rating Summary */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {business.averageRating}
                  </div>
                  <RatingStars rating={business.averageRating} readonly />
                  <p className="text-sm text-gray-500 mt-2">
                    {business.totalReviews} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2 mb-6">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = business.ratingDistribution[star as keyof typeof business.ratingDistribution];
                    const percentage = Math.round((count / business.totalReviews) * 100);
                    
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-2">{star}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Button */}
                {isConnected ? (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowWriteReview(true)}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Connect your wallet to write a review
                    </p>
                    <WalletConnectButton />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                    <SelectItem value="helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {businessReviews.length > 0 ? (
              <div>
                {businessReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showReplyButton={isBusinessOwner && isConnected}
                    onReply={handleReply}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">No reviews yet</p>
                  <p className="text-sm text-gray-400">
                    Be the first to share your experience!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        open={showWriteReview}
        onOpenChange={setShowWriteReview}
        businessName={business.name}
        businessId={business.id}
      />

      {/* Business Response Modal */}
      <BusinessResponseModal
        open={showBusinessResponse}
        onOpenChange={setShowBusinessResponse}
        review={selectedReview}
        businessName={business.name}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
            <span className="text-xs">Explore</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}