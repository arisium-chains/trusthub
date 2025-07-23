'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { Search, Star, Filter, ArrowLeft, MapPin } from 'lucide-react';
import { mockBusinesses, type Business } from '@/lib/mock-data';
import Link from 'next/link';
import { SearchParamsHandler } from '@/components/SearchParamsHandler';

const categories = [
  'All Categories',
  'Coffee Shop',
  'Technology', 
  'Restaurant',
  'Retail',
  'Healthcare',
  'Finance',
  'Education',
  'Entertainment'
];

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'newest', label: 'Recently Added' },
  { value: 'name', label: 'Alphabetical' }
];

function ExploreContent({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (query: string) => void; }) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('rating');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>(mockBusinesses);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = useCallback(() => {
    let filtered = [...mockBusinesses];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(business => business.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'reviews':
          return b.totalReviews - a.totalReviews;
        case 'newest':
          return a.name.localeCompare(b.name); // Mock newest by name for demo
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredBusinesses(filtered);
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, sortBy, applyFilters]);

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
            <h1 className="text-xl font-semibold text-gray-900">Explore</h1>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search businesses, categories, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-500">
              {filteredBusinesses.length} businesses found
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Link key={business.id} href={`/business/${business.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {business.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{business.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {business.category}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {business.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{business.averageRating}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({business.totalReviews})
                        </span>
                      </div>
                      
                      {business.website && (
                        <span className="text-xs text-blue-600 truncate max-w-32">
                          {business.website}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Categories');
                setSortBy('rating');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center gap-1 px-3 py-2 text-blue-600">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Explore</span>
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

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsHandler onSearchQueryChange={setSearchQuery} />
      <ExploreContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </Suspense>
  );
}