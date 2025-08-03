// src/app/api/imagekit-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const privateKey = 'private_OiWhfp78ou3Prah0GLZ67xoLE98=';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || '';
    const expire = request.nextUrl.searchParams.get('expire') || '';
    const privateAPIKey = privateKey;
    
    const auth = crypto.createHmac('sha1', privateAPIKey)
      .update(token + expire)
      .digest('hex');
    
    return NextResponse.json({
      token,
      expire,
      signature: auth
    });
  } catch (error) {
    console.error('Error in ImageKit auth:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}