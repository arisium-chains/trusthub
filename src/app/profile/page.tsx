'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { ReviewCard } from '@/components/ReviewCard';
import { WorldIDVerification } from '@/components/WorldIDVerification';
import { TRHBalanceDisplay } from '@/components/TRHBalance';
import { useWallet } from '@/hooks/useWallet';
import { ArrowLeft, Award, Gift, TrendingUp, Trophy } from 'lucide-react';
import { mockUserProfile, mockBusinesses } from '@/lib/mock-data';
import Link from 'next/link';

export default function ProfilePage() {
  const { isConnected, account } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to view your profile</p>
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  const progressToNextLevel = (mockUserProfile.reputationScore % 1000) / 1000 * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-pink-500">
                      {account?.address?.slice(2, 4).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                </CardTitle>
                <p className="text-sm text-gray-500">{mockUserProfile.level}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">
                    {mockUserProfile.badge} Badge
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Reputation Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg"></div>
                  <div>
                    <CardTitle className="text-lg">Reputation</CardTitle>
                    <p className="text-sm text-gray-500">Progress to next level</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{mockUserProfile.reputationScore} RP</span>
                      <span className="text-gray-500">Next: 2000 RP</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-600">
                    {2000 - mockUserProfile.reputationScore} RP to next level
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Rewards</CardTitle>
                  <div className="flex items-center gap-1 text-green-600">
                    <Gift className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {mockUserProfile.rewardsAvailable} available
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    You have {mockUserProfile.rewardsAvailable} rewards to claim!
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Gift className="h-4 w-4 mr-2" />
                    Claim All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                <TabsTrigger value="stats">My Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {/* TRH Balance */}
                  <TRHBalanceDisplay showTransactions={true} />
                  
                  {/* World ID Verification */}
                  <WorldIDVerification />
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {mockUserProfile.reviews.map((review) => {
                    const business = mockBusinesses.find(b => b.id === review.businessId);
                    return (
                      <div key={review.id}>
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-medium text-sm">
                            Review for &apos;{business?.name}&apos;
                          </h3>
                          <span className="text-xs text-gray-500">
                            Submitted {review.timestamp}
                          </span>
                        </div>
                        <ReviewCard review={review} />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {mockUserProfile.reviewsCount}
                      </div>
                      <p className="text-sm text-gray-500">Total reviews submitted</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Reputation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {mockUserProfile.reputationScore}
                      </div>
                      <p className="text-sm text-gray-500">Reputation points earned</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-purple-500" />
                        Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {mockUserProfile.level}
                      </div>
                      <p className="text-sm text-gray-500">Current contributor level</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-500" />
                        Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {mockUserProfile.rewardsAvailable}
                      </div>
                      <p className="text-sm text-gray-500">Available to claim</p>
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
          <Link href="/profile" className="flex flex-col items-center gap-1 px-3 py-2 text-blue-600">
            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}