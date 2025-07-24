'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Gift,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  trhTokenManager, 
  formatTRHAmount,
  getTRHTransactionTypeLabel,
  getTRHContextTypeLabel,
  type TRHBalance,
  type TRHTransaction
} from '@/lib/trh-token';
import { useWallet } from '@/hooks/useWallet';

interface TRHBalanceProps {
  showTransactions?: boolean;
  compact?: boolean;
}

export const TRHBalanceDisplay = ({ 
  showTransactions = false, 
  compact = false 
}: TRHBalanceProps) => {
  const { isConnected } = useWallet();
  const [balance, setBalance] = useState<TRHBalance | null>(null);
  const [transactions, setTransactions] = useState<TRHTransaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load balance and transactions
  useEffect(() => {
    if (isConnected) {
      const loadData = async () => {
        try {
          const currentBalance = trhTokenManager.getBalance();
          const currentTransactions = trhTokenManager.getTransactions();
          
          setBalance(currentBalance);
          setTransactions(currentTransactions);
          setLoading(false);
        } catch (error) {
          console.error('Error loading TRH data:', error);
          // Set default balance on error
          setBalance({
            available: 0,
            earned: 0,
            spent: 0,
            locked: 0
          });
          setTransactions([]);
          setLoading(false);
        }
      };

      loadData();

      // Initialize with verification bonus if applicable
      trhTokenManager.initializeWithVerificationBonus().then(() => {
        loadData(); // Reload after potential bonus
      }).catch(error => {
        console.error('Error initializing verification bonus:', error);
      });

      // Refresh data periodically
      const interval = setInterval(loadData, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    } else {
      setBalance(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : 'pt-6'}>
          <div className="text-center text-gray-500">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Connect wallet to view TRH balance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !balance) {
    return (
      <Card className={compact ? 'p-4' : ''}>
        <CardContent className={compact ? 'p-0' : 'pt-6'}>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Coins className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {showBalance ? formatTRHAmount(balance.available) : '••••••'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="h-6 w-6 p-0"
            >
              {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          <p className="text-xs text-gray-600">Available Balance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">TRH Balance</CardTitle>
                <CardDescription>TrustHub Tokens</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Available Balance */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {showBalance ? formatTRHAmount(balance.available) : '••••••'}
              </div>
              <p className="text-xs text-gray-500">Available</p>
            </div>

            {/* Total Earned */}
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {showBalance ? formatTRHAmount(balance.earned) : '••••••'}
              </div>
              <p className="text-xs text-gray-500">Total Earned</p>
            </div>

            {/* Total Spent */}
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600 flex items-center justify-center gap-1">
                <TrendingDown className="h-4 w-4" />
                {showBalance ? formatTRHAmount(balance.spent) : '••••••'}
              </div>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>

            {/* Locked/Staked */}
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {showBalance ? formatTRHAmount(balance.locked) : '••••••'}
              </div>
              <p className="text-xs text-gray-500">Locked</p>
            </div>
          </div>

          {/* Quick Stats */}
          {balance.earned > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Net Balance:</span>
                <span className="font-medium">
                  {formatTRHAmount(balance.earned - balance.spent)}
                </span>
              </div>
              {balance.spent > 0 && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Spending Rate:</span>
                  <span className="text-gray-700">
                    {Math.round((balance.spent / balance.earned) * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* First-time user message */}
          {balance.earned === 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Gift className="h-4 w-4" />
                <span className="text-sm font-medium">Start earning TRH!</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Submit your first review to earn 10-50 TRH tokens. Verify with World ID for bonus rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {showTransactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </div>
            <CardDescription>
              Your latest TRH token activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={tx.type === 'earning' ? 'default' : 'secondary'}
                        className={tx.type === 'earning' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {getTRHTransactionTypeLabel(tx.type)}
                      </Badge>
                      <span className="text-sm font-medium">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {getTRHContextTypeLabel(tx.contextType)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatTRHAmount(Math.abs(tx.amount))}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        tx.status === 'confirmed' ? 'text-green-600 border-green-200' : 
                        tx.status === 'pending' ? 'text-yellow-600 border-yellow-200' : 
                        'text-red-600 border-red-200'
                      }`}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};