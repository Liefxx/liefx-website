// src/app/api/twitch/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_VERCEL_URL ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/twitch/auth` : 'http://localhost:3000/api/twitch/auth';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing Twitch credentials' }, { status: 500 });
  }

  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      }
    );
        if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`[API] Failed to exchange authorization code: ${tokenResponse.status} - ${errorText}`);
        return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 500 });
      }

    const tokenData = await tokenResponse.json();

        // Store the access token and refresh token.  Using cookies for simplicity.
        cookies().set('twitchAccessToken', tokenData.access_token, {
          httpOnly: true, // Important for security
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'lax',
          maxAge: tokenData.expires_in, // Set cookie to expire when token expires
          path: '/',
      });

      cookies().set('twitchRefreshToken', tokenData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        //   maxAge: tokenData.expires_in, // Refresh Tokens might have a different expiry, look it up on the twitch API
          path: '/',
      });
    // Redirect the user to the homepage (or wherever you want)
    return NextResponse.redirect(process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000');

  } catch (error) {
    console.error('[API] Error exchanging authorization code:', error);
    return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 500 });
  }
}