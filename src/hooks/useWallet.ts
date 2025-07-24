import { useCallback } from 'react';
import { useWalletStore } from '@/store/wallet';
import { toast } from 'sonner';
import { IDKitWidget, ISuccessResult, IErrorState } from '@worldcoin/idkit';
import { WORLD_ID_CONFIG, handleWorldIDSuccess, handleWorldIDError } from '@/lib/worldid';
import { pb, authenticateWithWorldID } from '@/lib/pocketbase';

export const useWallet = () => {
  const { isConnected, account, isConnecting, setConnected, setAccount, setConnecting } = useWalletStore();

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;
    
    setConnecting(true);
    
    try {
      // In production, this would use World ID's wallet connector
      // For now, we'll simulate the connection with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock wallet account (in production, this would come from World ID)
      const walletAccount = {
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        publicKey: `0x${Math.random().toString(16).substring(2, 66)}`
      };
      
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
      // In production, this would disconnect from World ID
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // In production, this would use World ID's signMessage method
      // For now, we'll simulate the signing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock signature (in production, this would come from World ID)
      const signature = `0x${Math.random().toString(16).substring(2, 130)}`;
      
      return {
        signature,
        message
      };
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
      // In production, this would use World ID's sendTransaction method
      // For now, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock transaction result (in production, this would come from World ID)
      const txId = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      return {
        txId,
        status: 'pending' as const
      };
    } catch (error) {
      console.error('Failed to send transaction:', error);
      toast.error('Failed to send transaction');
      throw error;
    }
  }, [isConnected]);

  // World ID verification methods
  const verifyWithWorldID = useCallback(async (onSuccess?: (result: ISuccessResult) => void, onError?: (error: IErrorState) => void) => {
    try {
      // This would be handled by the WorldIDVerification component in practice
      // Here we're providing a programmatic way to trigger verification
      console.log('Initiating World ID verification');
    } catch (error) {
      console.error('Failed to initiate World ID verification:', error);
      toast.error('Failed to initiate World ID verification');
    }
  }, []);

  // Authenticate with PocketBase using World ID
  const authenticateWithPocketBase = useCallback(async (signature: string, message: string) => {
    if (!account?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const authData = await authenticateWithWorldID(account.address, signature, message);
      toast.success('Authenticated with PocketBase successfully');
      return authData;
    } catch (error) {
      console.error('PocketBase authentication failed:', error);
      toast.error('Failed to authenticate with PocketBase');
      throw error;
    }
  }, [account]);

  return {
    isConnected,
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
    verifyWithWorldID,
    authenticateWithPocketBase,
  };
};