'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWallet } from '@/hooks/useWallet';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const businessCategories = [
  'Restaurant',
  'Coffee Shop',
  'Technology',
  'Retail',
  'Healthcare',
  'Finance',
  'Education',
  'Entertainment',
  'Other'
];

export default function BusinessRegistrationPage() {
  const { isConnected, account, signMessage } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Sign the business registration data
      const message = JSON.stringify({
        ...formData,
        walletAddress: account?.address,
        timestamp: new Date().toISOString()
      });
      
      await signMessage(message);
      
      // In a real implementation, this would call an API to register the business
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Business registered successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        website: '',
        category: ''
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register business');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/business-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Register Your Business</h1>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Register your business to start receiving and responding to reviews
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to register your business and establish your identity on the platform.
                </p>
                <WalletConnectButton />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your business name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business and what you offer"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      disabled={isSubmitting}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yourbusiness.com"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange('category', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Important</h4>
                  <p className="text-sm text-blue-700">
                    By registering your business, you agree to respond to reviews in a timely and professional manner. 
                    Your wallet address will be linked to this business profile for verification purposes.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Register Business'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
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
            <Building className="w-6 h-6" />
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