import { useCallback } from 'react';
import { miniappSDK } from '@/lib/miniapp-sdk';
import { useWalletStore } from '@/store/wallet';
import { toast } from 'sonner';

export const useWallet = () => {
  const { isConnected, account, isConnecting, setConnected, setAccount, setConnecting } = useWalletStore();

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;
    
    setConnecting(true);
    
    try {
      const walletAccount = await miniappSDK.connectWallet();
      setAccount(walletAccount);
      setConnected(true);
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
      setConnected(false);
      setAccount(null);
    } finally {
      setConnecting(false);
    }
  }, [isConnecting, setConnected, setAccount, setConnecting]);

  const disconnectWallet = useCallback(async () => {
    try {
      await miniappSDK.disconnectWallet();
      setConnected(false);
      setAccount(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  }, [setConnected, setAccount]);

  const signMessage = useCallback(async (message: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await miniappSDK.signMessage(message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast.error('Failed to sign message');
      throw error;
    }
  }, [isConnected]);

  const sendTransaction = useCallback(async (transactionData: Record<string, unknown>) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await miniappSDK.sendTransaction(transactionData);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      toast.error('Failed to send transaction');
      throw error;
    }
  }, [isConnected]);

  return {
    isConnected,
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
  };
};