import { create } from 'zustand';
import { WalletAccount } from '@/lib/miniapp-sdk';

interface WalletState {
  isConnected: boolean;
  account: WalletAccount | null;
  isConnecting: boolean;
  setConnected: (connected: boolean) => void;
  setAccount: (account: WalletAccount | null) => void;
  setConnecting: (connecting: boolean) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  account: null,
  isConnecting: false,
  setConnected: (connected) => set({ isConnected: connected }),
  setAccount: (account) => set({ account }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
}));