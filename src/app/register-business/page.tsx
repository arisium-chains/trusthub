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
import { toast } from 'sonner';
import Link from 'next/link';

const businessCategories = [
  'Restaurant',
  'Coffee Shop',
  'Retail',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Entertainment',
  'Other'
];

export default function BusinessRegistrationPage() {
  const { isConnected, account, signMessage } = useWallet();
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      toast.error('Please enter a business name');
      return;
    }
    
    if (!businessCategory) {
      toast.error('Please select a category');
      return;
    }
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create business data
      const businessData = {
        name: businessName.trim(),
        description: businessDescription.trim(),
        website: businessWebsite.trim(),
        category: businessCategory,
        ownerAddress: account?.address,
        timestamp: new Date().toISOString()
      };

      // Sign the business registration data
      const message = JSON.stringify(businessData);
      await signMessage(message);
      
      // In a real implementation, this would call an API or smart contract
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Business registered successfully!');
      
      // Reset form
      setBusinessName('');
      setBusinessDescription('');
      setBusinessWebsite('');
      setBusinessCategory('');
      
    } catch (error) {
      console.error('Failed to register business:', error);
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Register Your Business</h1>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Business Registration</CardTitle>
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
                    Connect your wallet to register your business and establish ownership
                  </p>
                  <WalletConnectButton />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="Enter your business name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="businessCategory">Category *</Label>
                      <Select value={businessCategory} onValueChange={setBusinessCategory} disabled={isSubmitting}>
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
                    
                    <div>
                      <Label htmlFor="businessDescription">Description</Label>
                      <Textarea
                        id="businessDescription"
                        placeholder="Describe your business"
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="businessWebsite">Website</Label>
                      <Input
                        id="businessWebsite"
                        placeholder="https://yourbusiness.com"
                        value={businessWebsite}
                        onChange={(e) => setBusinessWebsite(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Ownership Verification</h4>
                    <p className="text-sm text-blue-700">
                      Your business will be registered to your wallet address: {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}.
                      You&apos;ll need to sign a message to verify ownership.
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
                        Registering Business...
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
          <Link href="/profile" className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500">
            <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}