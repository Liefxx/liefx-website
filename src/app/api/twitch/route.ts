// src/app/api/twitch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types';
import { encode } from 'html-entities'; // Assuming you still want this for titles

// --- REMOVED `cookies` import and `getUserAccessToken` function ---

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const userLogin = process.env.TWITCH_USER_LOGIN;

// Function to get an app access token (for public data)
async function getAppAccessToken() {
    if (!clientId || !clientSecret) {
        console.error("[API] Missing Twitch Client ID or Secret for App Token");
        throw new Error('Missing Twitch credentials for App Token');
    }
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
        console.error(`[API] Failed to get app access token: ${tokenResponse.status} - ${errorText}`);
        throw new Error('Failed to get app access token');
    }

    const tokenData = await tokenResponse.json();
    console.log("[API] App access token fetched.");
    return tokenData.access_token;
}

// Force dynamic rendering because we fetch data on every request
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (!clientId || !userLogin) {
        console.error("[API] Missing Twitch Client ID or User Login env variables.");
        return NextResponse.json({ error: 'Missing Twitch configuration' }, { status: 500 });
    }

    try {
        const appAccessToken = await getAppAccessToken(); // Always get an app token

        // --- Fetch User Info (using App Token) ---
        const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${userLogin}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${appAccessToken}`,
            },
            cache: 'no-store',
        });
        if (!userResponse.ok) {
            throw new Error(`Failed to fetch user info: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        if (!userData.data || userData.data.length === 0) {
            throw new Error(`Twitch user not found: ${userLogin}`);
        }
        const user = userData.data[0];
        console.log("[API] User ID fetched:", user.id);


        // --- Fetch Stream Status (using App Token) ---
        const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${userLogin}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${appAccessToken}`,
            },
            cache: 'no-store',
        });
        if (!streamResponse.ok) {
            throw new Error(`Failed to fetch stream status: ${streamResponse.status}`);
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
                thumbnailUrl: stream.thumbnail_url?.replace('{width}', '1920').replace('{height}', '1080'), // Add optional chaining
            };
        }
        console.log("[API] Stream Status:", streamStatus.isLive ? "Live" : "Offline");


        // --- Fetch Past Broadcasts (using App Token) ---
        let pastBroadcasts: PastBroadcast[] = [];
        const videosResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=4`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${appAccessToken}`,
            },
            cache: 'no-store',
        });

        if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            console.log("[API] Videos data fetched.");
            pastBroadcasts = videosData.data?.map((video: any) => ({ // Add optional chaining
                id: video.id,
                title: encode(video.title),
                thumbnail: video.thumbnail_url?.replace('%{width}', '400').replace('%{height}', '225'), // Add optional chaining
                duration: video.duration,
                date: new Date(video.created_at).toLocaleDateString(),
                views: video.view_count,
                game: encode(video.game_name || 'Unknown Game'),
            })) ?? []; // Ensure it defaults to empty array
        } else {
            console.error(`[API] Error fetching past broadcasts: ${videosResponse.status} - ${await videosResponse.text()}`);
            // Don't return an error, just send empty array for broadcasts
        }

        // --- REMOVED Schedule Fetching ---
        const schedule: ScheduleItem[] = []; // Always return empty schedule for now

        return NextResponse.json({
            streamStatus,
            pastBroadcasts,
            schedule, // Send empty schedule
        });

    } catch (error: any) {
        console.error('[API] Error fetching Twitch data:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch Twitch data' }, { status: 500 });
    }
}