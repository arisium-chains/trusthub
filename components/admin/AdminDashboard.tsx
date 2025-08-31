"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from '@/hooks/use-notifications';
import { getReviews, moderateReview, bulkModerateReviews, getModerationStats } from "@/app/actions/admin";
import { getCurrentUser } from "@/app/actions/auth";
import { VerifiedBadge, getVerificationLevelFromReview } from "@/components/ui/verified-badge";
import type { Review } from "@/types/db";

interface AdminReview extends Review {
  expand?: {
    app?: { name: string; slug: string };
    user?: { name: string; email: string };
  };
}

interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  shadowbanned: number;
  total: number;
}

interface AdminDashboardProps {
  searchParams: {
    status?: string;
    page?: string;
    search?: string;
    app?: string;
    rating?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    status: searchParams.status || '',
    search: searchParams.search || '',
    app: searchParams.app || '',
    rating: searchParams.rating || '',
    dateFrom: searchParams.dateFrom || '',
    dateTo: searchParams.dateTo || ''
  });

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, [searchParams]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.page || '1');
      setCurrentPage(page);
      
      const [reviewsResult, statsResult] = await Promise.all([
        getReviews(
          {
            status: searchParams.status as any,
            search: searchParams.search,
            app: searchParams.app,
            rating: searchParams.rating ? parseInt(searchParams.rating) : undefined,
            dateFrom: searchParams.dateFrom,
            dateTo: searchParams.dateTo
          },
          { page, perPage: 20 }
        ),
        getModerationStats()
      ]);
      
      setReviews(reviewsResult.items as unknown as AdminReview[]);
      setTotalPages(reviewsResult.totalPages);
      setStats(statsResult);
    } catch (error) {
      showError('Failed to load data');
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    
    router.push(`/admin?${params.toString()}`);
  };

  const handleModerateReview = async (reviewId: string, status: 'approved' | 'rejected' | 'shadowbanned', reason?: string) => {
    if (!currentUser?.id) {
      showError('User not authenticated');
      return;
    }

    try {
      await moderateReview({ id: reviewId, status, reason, adminId: currentUser.id });
      showSuccess(`Review ${status} successfully`);
      loadData();
    } catch (error) {
      showError(`Failed to ${status} review`);
      console.error('Moderation error:', error);
    }
  };

  const handleBulkModerate = async (status: 'approved' | 'rejected' | 'shadowbanned') => {
    if (selectedReviews.length === 0) {
      showError('No reviews selected');
      return;
    }

    if (!currentUser?.id) {
      showError('User not authenticated');
      return;
    }

    try {
      const results = await bulkModerateReviews({
        reviewIds: selectedReviews,
        status,
        adminId: currentUser.id
      });
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        showSuccess(`${successful} reviews ${status} successfully`);
      }
      if (failed > 0) {
        showError(`${failed} reviews failed to ${status}`);
      }
      
      setSelectedReviews([]);
      loadData();
    } catch (error) {
      showError('Bulk moderation failed');
      console.error('Bulk moderation error:', error);
    }
  };

  const toggleReviewSelection = (reviewId: string) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedReviews(prev => 
      prev.length === reviews.length ? [] : reviews.map(r => r.id)
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Shadowbanned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.shadowbanned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={filters.status} onValueChange={(value: string) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="shadowbanned">Shadowbanned</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.rating} onValueChange={(value: string) => handleFilterChange('rating', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All ratings</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
            
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({ status: '', search: '', app: '', rating: '', dateFrom: '', dateTo: '' });
                router.push('/admin');
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedReviews.length} review(s) selected
              </span>
              <Button size="sm" onClick={() => handleBulkModerate('approved')}>Approve Selected</Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkModerate('rejected')}>Reject Selected</Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulkModerate('shadowbanned')}>Shadowban Selected</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox 
                      checked={selectedReviews.length === reviews.length && reviews.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-2">App</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Rating</th>
                  <th className="text-left p-2">Comment</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Verification</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review: AdminReview) => (
                  <tr key={review.id} className="border-b">
                    <td className="p-2">
                      <Checkbox 
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={() => toggleReviewSelection(review.id)}
                      />
                    </td>
                    <td className="p-2">{review.expand?.app?.name || 'Unknown'}</td>
                    <td className="p-2">{review.expand?.user?.name || review.expand?.user?.email || 'Unknown'}</td>
                    <td className="p-2">{review.rating} ⭐</td>
                    <td className="p-2 max-w-xs truncate">{review.comment}</td>
                    <td className="p-2">
                      <Badge variant={review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'red' : 'outline'}>
                        {review.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <VerifiedBadge level={getVerificationLevelFromReview(review)} />
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(review.created).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {review.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleModerateReview(review.id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleModerateReview(review.id, 'rejected')}>Reject</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleModerateReview(review.id, 'shadowbanned')}>Shadowban</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                disabled={currentPage <= 1}
                onClick={() => handleFilterChange('page', (currentPage - 1).toString())}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage >= totalPages}
                onClick={() => handleFilterChange('page', (currentPage + 1).toString())}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}