import { NextRequest, NextResponse } from 'next/server';

// World ID verification endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proof, nullifier_hash, merkle_root, action, signal } = body;

    // Validate required fields
    if (!proof || !nullifier_hash || !merkle_root) {
      return NextResponse.json(
        { error: 'Missing required verification fields' },
        { status: 400 }
      );
    }

    // Verify with World ID's verification service
    const verificationResponse = await fetch('https://developer.worldcoin.org/api/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nullifier_hash,
        merkle_root,
        proof,
        action: action || process.env.WORLD_ID_ACTION,
        signal: signal || '',
        app_id: process.env.NEXT_PUBLIC_WORLD_ID_APP_ID
      }),
    });

    const verificationResult = await verificationResponse.json();

    if (!verificationResponse.ok) {
      console.error('World ID verification failed:', verificationResult);
      return NextResponse.json(
        { 
          error: 'World ID verification failed',
          details: verificationResult.detail || 'Unknown error'
        },
        { status: 400 }
      );
    }

    // If verification successful, return the result
    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        nullifier_hash,
        merkle_root,
        proof,
        verification_level: 'orb', // Default level
        verified_at: new Date().toISOString(),
        user_id: verificationResult.user_id || null
      });
    } else {
      return NextResponse.json(
        { 
          error: 'World ID verification rejected',
          details: verificationResult.detail || 'Verification not approved'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('World ID verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for health check)
export async function GET() {
  return NextResponse.json({
    status: 'World ID verification endpoint active',
    timestamp: new Date().toISOString()
  });
}