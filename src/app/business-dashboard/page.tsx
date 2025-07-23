'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { BusinessPromotion } from '@/components/BusinessPromotion';
import { TRHBalanceDisplay } from '@/components/TRHBalance';
import { useWallet } from '@/hooks/useWallet';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Star, 
  TrendingUp,
  MessageSquare,
  Settings
} from 'lucide-react';
import { mockBusinesses, mockReviews } from '@/lib/mock-data';
import Link from 'next/link';

export default function BusinessDashboardPage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');

  // For demo purposes, assume user owns "The Daily Grind" business
  const userBusiness = mockBusinesses[0]; // The Daily Grind
  const businessReviews = mockReviews.filter(r => r.businessId === userBusiness.id);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Dashboard</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to access your business dashboard</p>
          <WalletConnectButton />
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
                Back to Platform
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Business Dashboard</h1>
              <p className="text-sm text-gray-600">{userBusiness.name}</p>
            </div>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Business Info Card */}
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {userBusiness.name.charAt(0)}
                </div>
                <CardTitle className="text-lg">{userBusiness.name}</CardTitle>
                <CardDescription>{userBusiness.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{userBusiness.averageRating}</span>
                    <span className="text-sm text-gray-500">({userBusiness.totalReviews} reviews)</span>
                  </div>
                  <Link href={`/business/${userBusiness.slug}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* TRH Balance Compact */}
            <TRHBalanceDisplay compact={true} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="promotion">Promotion</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Stats Cards */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Reviews</p>
                          <p className="text-2xl font-bold">{userBusiness.totalReviews}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Average Rating</p>
                          <p className="text-2xl font-bold">{userBusiness.averageRating}</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Views</p>
                          <p className="text-2xl font-bold">1.2k</p>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Growth</p>
                          <p className="text-2xl font-bold">+15%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Reviews</CardTitle>
                      <CardDescription>Latest customer feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {businessReviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="border-b border-gray-100 pb-3 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm font-medium">{review.reviewerName}</span>
                              </div>
                              <span className="text-xs text-gray-500">{review.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                          </div>
                        ))}
                      </div>
                      <Link href={`/business/${userBusiness.slug}`}>
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          View All Reviews
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                      <CardDescription>Manage your business presence</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('promotion')}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Promote Your Business
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('reviews')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Respond to Reviews
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => setActiveTab('analytics')}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Business Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="promotion" className="mt-6">
                <BusinessPromotion
                  businessId={userBusiness.id}
                  businessName={userBusiness.name}
                  currentPromotion={undefined} // No active promotion for demo
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Reviews</CardTitle>
                    <CardDescription>
                      Respond to customer reviews and engage with your audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Management</h3>
                      <p className="text-gray-600 mb-4">
                        Visit your public business profile to respond to reviews
                      </p>
                      <Link href={`/business/${userBusiness.slug}`}>
                        <Button>Go to Business Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>Track your business performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profile Views (30 days)</span>
                          <span className="font-semibold">1,234</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Review Clicks</span>
                          <span className="font-semibold">456</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Website Clicks</span>
                          <span className="font-semibold">89</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Response Rate</span>
                          <span className="font-semibold">25%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Breakdown</CardTitle>
                      <CardDescription>Distribution of your ratings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = userBusiness.ratingDistribution[rating as keyof typeof userBusiness.ratingDistribution];
                          const percentage = Math.round((count / userBusiness.totalReviews) * 100);
                          
                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <span className="w-2 text-sm">{rating}</span>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

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
          <Link href="/business-dashboard" className="flex flex-col items-center gap-1 px-3 py-2 text-blue-600">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Business</span>
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