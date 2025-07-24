'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { ReviewCard } from '@/components/ReviewCard';
import { WriteReviewModal } from '@/components/WriteReviewModal';
import { BusinessResponseModal } from '@/components/BusinessResponseModal';
import { RatingStars } from '@/components/RatingStars';
import { useWallet } from '@/hooks/useWallet';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Star, 
  MessageSquare,
  Shield,
  Loader2
} from 'lucide-react';
import { mockBusinesses, mockReviews, type Review } from '@/lib/mock-data';
import { pb } from '@/lib/pocketbase-production';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  category: string;
  logo: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params Promise using React.use()
  const { slug } = use(params);
  
  const { isConnected, account } = useWallet();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showBusinessResponse, setShowBusinessResponse] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Function to load reviews from PocketBase
  const loadReviews = async (businessId: string) => {
    setLoadingReviews(true);
    try {
      const pocketbaseReviews = await pb.getReviewsForBusiness(businessId);
      
      // Convert PocketBase reviews to match mock data format
      const convertedReviews: Review[] = pocketbaseReviews.map(review => ({
        id: review.id,
        businessId: review.business_id,
        reviewerAddress: review.reviewer_address,
        reviewerName: `${review.reviewer_address.slice(0, 6)}...${review.reviewer_address.slice(-4)}`,
        rating: review.rating,
        title: review.title || '',
        content: review.content,
        timestamp: review.created,
        verified: review.world_id_verified,
        likes: 0, // No likes tracked yet
        dislikes: 0, // No dislikes tracked yet
        businessResponse: undefined // No business responses yet
      }));
      
      setReviews(convertedReviews);
      console.log(`✅ Loaded ${convertedReviews.length} reviews from PocketBase`);
    } catch (error) {
      console.error('❌ Failed to load reviews from PocketBase:', error);
      // Fallback to mock data
      const businessReviews = mockReviews.filter(r => r.businessId === businessId);
      setReviews(businessReviews);
      console.log('↩️ Falling back to mock data');
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    // Find business by slug
    const foundBusiness = mockBusinesses.find(b => b.slug === slug);
    
    if (!foundBusiness) {
      notFound();
      return;
    }
    
    setBusiness(foundBusiness);
    
    // Load reviews from PocketBase
    loadReviews(foundBusiness.id);
    
    // Check if current user is the business owner (mock implementation)
    // In a real app, this would check against the business owner's wallet address
    setIsBusinessOwner(isConnected && account?.address === '0x1234...5678');
  }, [slug, isConnected, account]);

  const handleReviewReply = (review: Review) => {
    if (!isBusinessOwner) return;
    setSelectedReview(review);
    setShowBusinessResponse(true);
  };

  // Callback to refresh reviews after new review is submitted
  const handleReviewSubmitted = () => {
    if (business) {
      loadReviews(business.id);
    }
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
          <p className="text-gray-600 mb-6">The business you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Business Profile</h1>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Business Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                  {business.name.charAt(0)}
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{business.name}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{business.category}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{business.description}</p>
                    
                    {business.website && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={`https://${business.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {business.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <RatingStars rating={business.averageRating} readonly size="md" />
                      </div>
                      <span className="font-semibold">{business.averageRating}</span>
                      <span className="text-gray-500">({business.totalReviews})</span>
                    </div>
                    
                    {isConnected ? (
                      <Button onClick={() => setShowWriteReview(true)} className="bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    ) : (
                      <WalletConnectButton />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Rating Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = business.ratingDistribution[rating as keyof typeof business.ratingDistribution];
                const percentage = Math.round((count / business.totalReviews) * 100);
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Reviews ({loadingReviews ? '...' : reviews.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Verified reviews only</span>
            </div>
          </div>
          
          {loadingReviews ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading reviews...</span>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  showReplyButton={isBusinessOwner}
                  onReply={handleReviewReply}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to review {business.name} and help other customers make informed decisions.
                </p>
                {isConnected ? (
                  <Button onClick={() => setShowWriteReview(true)}>
                    Write the First Review
                  </Button>
                ) : (
                  <WalletConnectButton />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {business && (
        <WriteReviewModal
          open={showWriteReview}
          onOpenChange={setShowWriteReview}
          businessName={business.name}
          businessId={business.id}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Business Response Modal */}
      {selectedReview && (
        <BusinessResponseModal
          open={showBusinessResponse}
          onOpenChange={setShowBusinessResponse}
          review={selectedReview}
          businessName={business.name}
        />
      )}

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