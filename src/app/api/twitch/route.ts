// src/app/api/twitch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types';
import { encode } from 'html-entities'; // Assuming you still want this for titles

// --- REMOVED `cookies` import and `getUserAccessToken` function ---

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const userLogin = process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN;

// Function to get an app access token (for public data)
async function getAppAccessToken() {
    console.log('[Twitch API] Checking credentials...');
    console.log('[Twitch API] Client ID status:', clientId ? 'Present' : 'Missing');
    console.log('[Twitch API] Client Secret status:', clientSecret ? 'Present' : 'Missing');
    console.log('[Twitch API] User Login status:', userLogin ? 'Present' : 'Missing');

    if (!clientId || !clientSecret) {
        console.error("[Twitch API] Missing Twitch Client ID or Secret for App Token");
        throw new Error('Missing Twitch credentials for App Token');
    }

    try {
        const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
            }),
            cache: 'no-store',
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error(`[Twitch API] Failed to get app access token: ${tokenResponse.status} - ${errorText}`);
            throw new Error(`Failed to get app access token: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        console.log("[Twitch API] App access token fetched successfully");
        return tokenData.access_token;
    } catch (error) {
        console.error('[Twitch API] Error getting app access token:', error);
        throw error;
    }
}

// Force dynamic rendering because we fetch data on every request
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('[Twitch API] Received request');
    
    if (!clientId || !userLogin) {
        console.error("[Twitch API] Missing configuration:", {
            clientId: clientId ? 'Present' : 'Missing',
            userLogin: userLogin ? 'Present' : 'Missing'
        });
        return NextResponse.json({ error: 'Missing Twitch configuration' }, { status: 500 });
    }

    try {
        const appAccessToken = await getAppAccessToken();
        console.log('[Twitch API] Successfully obtained access token');

        // --- Fetch User Info ---
        console.log(`[Twitch API] Fetching user info for: ${userLogin}`);
        const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${userLogin}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${appAccessToken}`,
            },
            cache: 'no-store',
        });

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error(`[Twitch API] Failed to fetch user info: ${userResponse.status} - ${errorText}`);
            throw new Error(`Failed to fetch user info: ${errorText}`);
        }

        const userData = await userResponse.json();
        if (!userData.data || userData.data.length === 0) {
            console.error(`[Twitch API] User not found: ${userLogin}`);
            throw new Error(`Twitch user not found: ${userLogin}`);
        }

        const user = userData.data[0];
        console.log("[Twitch API] User info fetched successfully");

        // --- Fetch Stream Status ---
        console.log(`[Twitch API] Fetching stream status for: ${userLogin}`);
        const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${userLogin}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${appAccessToken}`,
            },
            cache: 'no-store',
        });

        if (!streamResponse.ok) {
            const errorText = await streamResponse.text();
            console.error(`[Twitch API] Failed to fetch stream status: ${streamResponse.status} - ${errorText}`);
            throw new Error(`Failed to fetch stream status: ${errorText}`);
        }

        const streamData = await streamResponse.json();
        let streamStatus: TwitchStreamStatus = { isLive: false };
        if (streamData.data.length > 0) {
            const stream = streamData.data[0];
            streamStatus = {
                isLive: true,
                title: encode(stream.title),
                game: encode(stream.game_name),
                viewerCount: stream.viewer_count,
                thumbnailUrl: stream.thumbnail_url?.replace('{width}', '1920').replace('{height}', '1080'),
            };
        }
        console.log("[Twitch API] Stream status:", streamStatus.isLive ? "Live" : "Offline");

        // --- Fetch Past Broadcasts ---
        console.log(`[Twitch API] Fetching past broadcasts for user ID: ${user.id}`);
        const videosResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=4`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${appAccessToken}`,
            },
            cache: 'no-store',
        });

        let pastBroadcasts: PastBroadcast[] = [];
        if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            console.log("[Twitch API] Past broadcasts fetched successfully");
            pastBroadcasts = videosData.data?.map((video: any) => ({
                id: video.id,
                title: encode(video.title),
                thumbnail: video.thumbnail_url?.replace('%{width}', '400').replace('%{height}', '225'),
                duration: video.duration,
                date: new Date(video.created_at).toLocaleDateString(),
                views: video.view_count,
                game: encode(video.game_name || 'Unknown Game'),
            })) ?? [];
        } else {
            const errorText = await videosResponse.text();
            console.error(`[Twitch API] Error fetching past broadcasts: ${videosResponse.status} - ${errorText}`);
        }

        const schedule: ScheduleItem[] = [];
        console.log("[Twitch API] Preparing response");

        return NextResponse.json({
            streamStatus,
            pastBroadcasts,
            schedule,
        });

    } catch (error: any) {
        console.error('[Twitch API] Error:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch Twitch data',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, 
            { status: 500 }
        );
    }
}