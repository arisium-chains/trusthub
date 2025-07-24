'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { TRHBalanceDisplay } from '@/components/TRHBalance';
import { useWallet } from '@/hooks/useWallet';
import { Search, Star, TrendingUp, Clock } from 'lucide-react';
import { trendingBusinesses, newBusinesses } from '@/lib/mock-data';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to explore page with search query
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-gray-900">TrustHub</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/register-business" className="text-gray-600 hover:text-gray-900">
                For Businesses
              </Link>
            </nav>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      {!isConnected ? (
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Honest reviews, backed by the blockchain.
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Discover trustworthy businesses through verified, decentralized reviews that can&apos;t be manipulated or censored.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Find a business, service, or website"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
              </form>

              <div className="mt-12">
                <WalletConnectButton />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome to TrustHub
              </h2>
              {isConnected && (
                <div className="lg:w-80">
                  <TRHBalanceDisplay compact={true} />
                </div>
              )}
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </form>

            {/* Trending Section */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Trending</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingBusinesses.map((business) => (
                  <Link key={business.id} href={`/business/${business.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {business.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{business.name}</CardTitle>
                            <CardDescription>{business.category}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {business.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{business.averageRating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({business.totalReviews} reviews)
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* New Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">New</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newBusinesses.map((business) => (
                  <Link key={business.id} href={`/business/${business.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {business.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{business.name}</CardTitle>
                            <CardDescription>{business.category}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {business.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{business.averageRating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({business.totalReviews} reviews)
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-1 px-3 py-2 text-blue-600">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <Search className="w-6 h-6" />
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
