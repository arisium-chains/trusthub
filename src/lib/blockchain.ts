import { ethers } from 'ethers';

// Blockchain Configuration
const BLOCKCHAIN_CONFIG = {
  // Network configuration (start with Polygon for lower fees)
  networks: {
    polygon: {
      name: 'Polygon',
      chainId: 137,
      rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com'
    },
    polygonMumbai: {
      name: 'Polygon Mumbai',
      chainId: 80001,
      rpcUrl: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      blockExplorer: 'https://mumbai.polygonscan.com'
    }
  },
  
  // Smart Contract Addresses (to be deployed)
  contracts: {
    trhToken: process.env.NEXT_PUBLIC_TRH_TOKEN_ADDRESS || '',
    reviewRegistry: process.env.NEXT_PUBLIC_REVIEW_REGISTRY_ADDRESS || '',
    businessRegistry: process.env.NEXT_PUBLIC_BUSINESS_REGISTRY_ADDRESS || '',
    governance: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS || ''
  },
  
  // IPFS Configuration
  ipfs: {
    gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || ''
  }
};

// Smart Contract ABIs (simplified for now)
const TRH_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Mint(address indexed to, uint256 amount, string reason)'
];

const REVIEW_REGISTRY_ABI = [
  'function submitReview(address business, uint8 rating, string memory contentHash, bytes memory worldIdProof) returns (bytes32)',
  'function getReview(bytes32 reviewId) view returns (address reviewer, address business, uint8 rating, string memory contentHash, uint256 timestamp, bool verified)',
  'function verifyReview(bytes32 reviewId, bytes memory proof) returns (bool)',
  'function getBusinessReviews(address business) view returns (bytes32[] memory)',
  'event ReviewSubmitted(bytes32 indexed reviewId, address indexed reviewer, address indexed business, uint8 rating, string contentHash)',
  'event ReviewVerified(bytes32 indexed reviewId, address indexed verifier)'
];

const BUSINESS_REGISTRY_ABI = [
  'function registerBusiness(string memory name, string memory metadataHash) returns (address)',
  'function verifyBusiness(address business, bytes memory proof) returns (bool)',
  'function getBusinessInfo(address business) view returns (string memory name, string memory metadataHash, bool verified, uint256 registeredAt)',
  'function isBusinessRegistered(address business) view returns (bool)',
  'event BusinessRegistered(address indexed business, address indexed owner, string name)',
  'event BusinessVerified(address indexed business, address indexed verifier)'
];

// Blockchain Service Class
export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: { [key: string]: ethers.Contract } = {};
  private currentNetwork: string = 'polygon';

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Use injected provider (MetaMask, etc.)
        const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        this.provider = browserProvider;
      } else {
        // Fallback to RPC provider
        const networkConfig = BLOCKCHAIN_CONFIG.networks[this.currentNetwork as keyof typeof BLOCKCHAIN_CONFIG.networks];
        this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      }

      console.log('🔗 Blockchain provider initialized');
      await this.initializeContracts();
    } catch (error) {
      console.error('❌ Failed to initialize blockchain provider:', error);
    }
  }

  private async initializeContracts() {
    if (!this.provider) return;

    try {
      // Initialize contract instances
      if (BLOCKCHAIN_CONFIG.contracts.trhToken) {
        this.contracts.trhToken = new ethers.Contract(
          BLOCKCHAIN_CONFIG.contracts.trhToken,
          TRH_TOKEN_ABI,
          this.provider
        );
      }

      if (BLOCKCHAIN_CONFIG.contracts.reviewRegistry) {
        this.contracts.reviewRegistry = new ethers.Contract(
          BLOCKCHAIN_CONFIG.contracts.reviewRegistry,
          REVIEW_REGISTRY_ABI,
          this.provider
        );
      }

      if (BLOCKCHAIN_CONFIG.contracts.businessRegistry) {
        this.contracts.businessRegistry = new ethers.Contract(
          BLOCKCHAIN_CONFIG.contracts.businessRegistry,
          BUSINESS_REGISTRY_ABI,
          this.provider
        );
      }

      console.log('📄 Smart contracts initialized');
    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error);
    }
  }

  // Wallet Connection
  async connectWallet(): Promise<{ address: string; chainId: number }> {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      this.provider = browserProvider;
      this.signer = await browserProvider.getSigner();

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();

      console.log('💼 Wallet connected:', address);
      console.log('🌐 Network:', network.name, network.chainId);

      // Verify we're on the correct network
      await this.checkNetwork();

      return { address, chainId: Number(network.chainId) };
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    }
  }

  async checkNetwork(): Promise<void> {
    if (!this.provider) return;

    const network = await this.provider.getNetwork();
    const expectedChainId = BLOCKCHAIN_CONFIG.networks[this.currentNetwork as keyof typeof BLOCKCHAIN_CONFIG.networks].chainId;

    if (Number(network.chainId) !== expectedChainId) {
      console.warn('⚠️ Wrong network detected. Requesting network switch...');
      await this.switchNetwork(this.currentNetwork);
    }
  }

  async switchNetwork(networkName: string): Promise<void> {
    if (!window.ethereum) return;

    const networkConfig = BLOCKCHAIN_CONFIG.networks[networkName as keyof typeof BLOCKCHAIN_CONFIG.networks];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
      });

      this.currentNetwork = networkName;
      console.log('🔄 Switched to network:', networkName);
    } catch (error: any) {
      // Network not added to wallet
      if (error.code === 4902) {
        await this.addNetwork(networkName);
      } else {
        console.error('❌ Failed to switch network:', error);
        throw error;
      }
    }
  }

  private async addNetwork(networkName: string): Promise<void> {
    if (!window.ethereum) return;

    const networkConfig = BLOCKCHAIN_CONFIG.networks[networkName as keyof typeof BLOCKCHAIN_CONFIG.networks];

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${networkConfig.chainId.toString(16)}`,
          chainName: networkConfig.name,
          rpcUrls: [networkConfig.rpcUrl],
          blockExplorerUrls: [networkConfig.blockExplorer]
        }],
      });

      console.log('✅ Network added:', networkName);
    } catch (error) {
      console.error('❌ Failed to add network:', error);
      throw error;
    }
  }

  // TRH Token Operations
  async getTRHBalance(address: string): Promise<number> {
    if (!this.contracts.trhToken) {
      console.warn('⚠️ TRH Token contract not available');
      return 0;
    }

    try {
      const balance = await this.contracts.trhToken.balanceOf(address);
      const decimals = await this.contracts.trhToken.decimals();
      return Number(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error('❌ Failed to get TRH balance:', error);
      return 0;
    }
  }

  async mintTRH(toAddress: string, amount: number, reason: string): Promise<string> {
    if (!this.contracts.trhToken || !this.signer) {
      throw new Error('TRH Token contract or signer not available');
    }

    try {
      const contractWithSigner = this.contracts.trhToken.connect(this.signer);
      const decimals = await this.contracts.trhToken.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);

      const tx = await (contractWithSigner as any).mint(toAddress, amountInWei);
      console.log('🪙 TRH mint transaction sent:', tx.hash);

      await tx.wait();
      console.log('✅ TRH tokens minted successfully');

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to mint TRH tokens:', error);
      throw error;
    }
  }

  // Review Operations
  async submitReview(reviewData: ReviewSubmissionData): Promise<string> {
    if (!this.contracts.reviewRegistry || !this.signer) {
      throw new Error('Review Registry contract or signer not available');
    }

    try {
      // 1. Upload content to IPFS
      const ipfsHash = await this.uploadToIPFS({
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating,
        images: reviewData.images || [],
        metadata: {
          timestamp: Date.now(),
          reviewer: await this.signer.getAddress(),
          version: '1.0'
        }
      });

      console.log('📁 Review content uploaded to IPFS:', ipfsHash);

      // 2. Submit to smart contract
      const contractWithSigner = this.contracts.reviewRegistry.connect(this.signer);
      
      const tx = await (contractWithSigner as any).submitReview(
        reviewData.businessAddress,
        reviewData.rating,
        ipfsHash,
        reviewData.worldIdProof || '0x'
      );

      console.log('📝 Review submission transaction sent:', tx.hash);

      // 3. Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Review submitted successfully');

      // 4. Extract review ID from transaction logs
      const reviewId = this.extractReviewIdFromLogs(receipt.logs);

      return reviewId || tx.hash;
    } catch (error) {
      console.error('❌ Failed to submit review:', error);
      throw error;
    }
  }

  private extractReviewIdFromLogs(logs: any[]): string | null {
    try {
      // Parse logs for ReviewSubmitted event
      const reviewRegistryInterface = new ethers.Interface(REVIEW_REGISTRY_ABI);
      
      for (const log of logs) {
        try {
          const parsedLog = reviewRegistryInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'ReviewSubmitted') {
            return parsedLog.args.reviewId;
          }
        } catch {
          // Skip unparseable logs
        }
      }
    } catch (error) {
      console.error('Failed to extract review ID from logs:', error);
    }
    
    return null;
  }

  async getReview(reviewId: string): Promise<ReviewData | null> {
    if (!this.contracts.reviewRegistry) {
      throw new Error('Review Registry contract not available');
    }

    try {
      const review = await this.contracts.reviewRegistry.getReview(reviewId);
      
      // Fetch content from IPFS
      const content = await this.fetchFromIPFS(review.contentHash);

      return {
        id: reviewId,
        reviewer: review.reviewer,
        business: review.business,
        rating: review.rating,
        contentHash: review.contentHash,
        timestamp: Number(review.timestamp),
        verified: review.verified,
        content: content
      };
    } catch (error) {
      console.error('❌ Failed to get review:', error);
      return null;
    }
  }

  async getBusinessReviews(businessAddress: string): Promise<string[]> {
    if (!this.contracts.reviewRegistry) {
      throw new Error('Review Registry contract not available');
    }

    try {
      const reviewIds = await this.contracts.reviewRegistry.getBusinessReviews(businessAddress);
      return reviewIds;
    } catch (error) {
      console.error('❌ Failed to get business reviews:', error);
      return [];
    }
  }

  // Business Operations
  async registerBusiness(name: string, metadata: BusinessMetadata): Promise<string> {
    if (!this.contracts.businessRegistry || !this.signer) {
      throw new Error('Business Registry contract or signer not available');
    }

    try {
      // Upload metadata to IPFS
      const metadataHash = await this.uploadToIPFS(metadata);
      console.log('📁 Business metadata uploaded to IPFS:', metadataHash);

      // Register on blockchain
      const contractWithSigner = this.contracts.businessRegistry.connect(this.signer);
      const tx = await (contractWithSigner as any).registerBusiness(name, metadataHash);

      console.log('🏢 Business registration transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Business registered successfully');

      // Extract business address from logs
      const businessAddress = this.extractBusinessAddressFromLogs(receipt.logs);
      
      return businessAddress || tx.hash;
    } catch (error) {
      console.error('❌ Failed to register business:', error);
      throw error;
    }
  }

  private extractBusinessAddressFromLogs(logs: any[]): string | null {
    try {
      const businessRegistryInterface = new ethers.Interface(BUSINESS_REGISTRY_ABI);
      
      for (const log of logs) {
        try {
          const parsedLog = businessRegistryInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'BusinessRegistered') {
            return parsedLog.args.business;
          }
        } catch {
          // Skip unparseable logs
        }
      }
    } catch (error) {
      console.error('Failed to extract business address from logs:', error);
    }
    
    return null;
  }

  // IPFS Operations
  async uploadToIPFS(data: any): Promise<string> {
    try {
      // Use Pinata for IPFS pinning
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': BLOCKCHAIN_CONFIG.ipfs.pinataApiKey,
          'pinata_secret_api_key': BLOCKCHAIN_CONFIG.ipfs.pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name: `trusthub-${Date.now()}`,
            keyvalues: {
              app: 'trusthub',
              version: '1.0'
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('❌ IPFS upload failed:', error);
      throw error;
    }
  }

  async fetchFromIPFS(hash: string): Promise<any> {
    try {
      const response = await fetch(`${BLOCKCHAIN_CONFIG.ipfs.gateway}${hash}`);
      
      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ IPFS fetch failed:', error);
      throw error;
    }
  }

  // Event Listeners
  setupEventListeners(callbacks: EventCallbacks) {
    if (!this.contracts.reviewRegistry || !this.contracts.trhToken) return;

    // Review events
    this.contracts.reviewRegistry.on('ReviewSubmitted', callbacks.onReviewSubmitted);
    this.contracts.reviewRegistry.on('ReviewVerified', callbacks.onReviewVerified);

    // Token events
    this.contracts.trhToken.on('Transfer', callbacks.onTokenTransfer);
    this.contracts.trhToken.on('Mint', callbacks.onTokenMint);

    console.log('🎧 Blockchain event listeners setup');
  }

  removeEventListeners() {
    Object.values(this.contracts).forEach(contract => {
      contract.removeAllListeners();
    });
    console.log('🔇 Blockchain event listeners removed');
  }

  // Utility Methods
  getNetworkInfo() {
    return BLOCKCHAIN_CONFIG.networks[this.currentNetwork as keyof typeof BLOCKCHAIN_CONFIG.networks];
  }

  getContractAddresses() {
    return BLOCKCHAIN_CONFIG.contracts;
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  async getGasPrice(): Promise<bigint> {
    if (!this.provider) throw new Error('Provider not available');
    return await this.provider.getFeeData().then(fee => fee.gasPrice || BigInt(0));
  }
}

// Type Definitions
export interface ReviewSubmissionData {
  businessAddress: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  worldIdProof?: string;
}

export interface ReviewData {
  id: string;
  reviewer: string;
  business: string;
  rating: number;
  contentHash: string;
  timestamp: number;
  verified: boolean;
  content: any;
}

export interface BusinessMetadata {
  name: string;
  description: string;
  website?: string;
  category: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  social?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface EventCallbacks {
  onReviewSubmitted: (reviewId: string, reviewer: string, business: string, rating: number, contentHash: string) => void;
  onReviewVerified: (reviewId: string, verifier: string) => void;
  onTokenTransfer: (from: string, to: string, amount: bigint) => void;
  onTokenMint: (to: string, amount: bigint, reason: string) => void;
}

// Global instance
export const blockchain = new BlockchainService();

// Window ethereum type extension
declare global {
  interface Window {
    ethereum?: any;
  }
}