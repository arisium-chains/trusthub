import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import PocketBase from 'pocketbase';

// Initialize PocketBase admin client
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Authenticate admin for database operations
async function authenticateAdmin() {
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );
  }
}

// Wallet authentication endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, signature, message, world_id_data } = body;

    // Validate required fields
    if (!wallet_address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required authentication fields' },
        { status: 400 }
      );
    }

    // Verify wallet signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
        return NextResponse.json(
          { error: 'Invalid wallet signature' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Signature verification failed:', error);
      return NextResponse.json(
        { error: 'Failed to verify wallet signature' },
        { status: 401 }
      );
    }

    // Authenticate as admin to manage user records
    await authenticateAdmin();

    // Check if user exists
    let user;
    try {
      user = await pb.collection('users').getFirstListItem(
        `wallet_address=\"${wallet_address}\"`
      );
    } catch (error) {
      // User doesn't exist, create new user
      user = await pb.collection('users').create({
        wallet_address: wallet_address,
        world_id_verified: world_id_data?.verified || false,
        world_id_hash: world_id_data?.nullifier_hash,
        verification_level: world_id_data?.verification_level,
        display_name: `User ${wallet_address.substring(0, 8)}...`,
        reputation_score: 0,
        level: 'Beginner',
        badge: 'Bronze',
        reviews_count: 0,
        trh_balance: world_id_data?.verified ? 100 : 0, // Welcome bonus
        profile_public: true,
        email_notifications: true,
        push_notifications: true,
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        last_active: new Date().toISOString()
      });

      console.log('✅ Created new user:', user.id);
    }

    // Update last active time and World ID data if provided
    const updateData: any = {
      last_active: new Date().toISOString()
    };

    if (world_id_data?.verified && !user.world_id_verified) {
      updateData.world_id_verified = true;
      updateData.world_id_hash = world_id_data.nullifier_hash;
      updateData.verification_level = world_id_data.verification_level;
      updateData.verified_at = new Date().toISOString();
      updateData.trh_balance = (user.trh_balance || 0) + 100; // Verification bonus
    }

    if (Object.keys(updateData).length > 1) { // More than just last_active
      await pb.collection('users').update(user.id, updateData);
    }

    // Generate JWT token for the user
    const token = await generateUserToken(user);

    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        world_id_verified: user.world_id_verified,
        display_name: user.display_name,
        reputation_score: user.reputation_score,
        level: user.level,
        badge: user.badge,
        reviews_count: user.reviews_count,
        trh_balance: user.trh_balance,
        verified_at: user.verified_at,
        created: user.created
      }
    });

  } catch (error) {
    console.error('Wallet authentication error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate JWT token for authenticated user
async function generateUserToken(user: any): Promise<string> {
  // In a real implementation, you would generate a proper JWT token
  // For now, we'll use a simple token format
  const tokenData = {
    user_id: user.id,
    wallet_address: user.wallet_address,
    issued_at: Date.now(),
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };

  // In production, use a proper JWT library with signing
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

// Handle GET requests (for health check)
export async function GET() {
  return NextResponse.json({
    status: 'Wallet authentication endpoint active',
    timestamp: new Date().toISOString()
  });
}