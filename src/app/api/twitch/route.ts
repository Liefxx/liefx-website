// src/app/api/twitch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types';
import { cookies } from 'next/headers';

// getAccessToken function remains the same, BUT IT'S ONLY USED FOR PRIVATE DATA NOW
async function getAccessToken(clientId: string, clientSecret: string) {
    const cookieStore = cookies()
    let accessToken = cookieStore.get('twitchAccessToken')?.value
    const refreshToken = cookieStore.get('twitchRefreshToken')?.value

    console.log("[API getAccessToken] accessToken from cookie:", accessToken);
    console.log("[API getAccessToken] refreshToken from cookie:", refreshToken);

    if (!accessToken && !refreshToken) {
        return null; // No token available
    }

    if(!accessToken && refreshToken) {
        // Need to refresh
        const refreshResponse = await fetch(
          `https://id.twitch.tv/oauth2/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret,
            }),
          }
        );

        if (!refreshResponse.ok) {
            const errorText = await refreshResponse.text();
            console.error(`[API] Failed to refresh token: ${refreshResponse.status} - ${errorText}`);
              // Delete cookies
              cookies().delete('twitchAccessToken')
              cookies().delete('twitchRefreshToken')
            return null
        }

        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;

        // Store the new access token and refresh token
        cookies().set('twitchAccessToken', refreshData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshData.expires_in,
        path: '/',
        });

        cookies().set('twitchRefreshToken', refreshData.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
    }

    return accessToken;
}

export async function GET(request: NextRequest) {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET; // Still needed for token refresh
    const userLogin = process.env.TWITCH_USER_LOGIN;

    if (!clientId || !clientSecret || !userLogin) {
        console.error("[API] Missing Twitch credentials. Check .env.local and Vercel settings.");
        return NextResponse.json(
            { error: 'Missing Twitch credentials' },
            { status: 500 }
        );
    }

    // NO accessToken needed for basic stream info!
    //  const accessToken = await getAccessToken(clientId, clientSecret);  // DON'T GET TOKEN YET

    //  if (!accessToken) { // NO REDIRECT!
    //    ...
    //  }

    try {
        // 1. Get user information (for profile picture, etc., and user ID)
        // Use Client-ID only for public user info
        const userResponse = await fetch(
            `https://api.twitch.tv/helix/users?login=${userLogin}`,
            {
                headers: {
                    'Client-ID': clientId,  // No Authorization header needed!
                },
            }
        );

        // ... (rest of the user info handling, as before) ...
        if (!userResponse.ok) {
            if (userResponse.status === 429) { // Check for rate limit
                console.error("[API] Twitch API Rate Limit Exceeded (User)");
                return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
            }
            const errorText = await userResponse.text();
            console.error(`[API] Failed to get Twitch user info: ${userResponse.status} - ${errorText}`);
            return NextResponse.json({ error: 'Failed to get Twitch user info' }, { status: 500 });
        }
        const userData = await userResponse.json();
        console.log("[API] User data:", userData); // Log user data

        // Check if userData.data exists and has at least one element
        if (!userData.data || userData.data.length === 0) {
            console.error("[API] ERROR: No user data found for login:", userLogin);
            return NextResponse.json({ error: 'No user data found for login: ' + userLogin }, { status: 404 });
        }

        const user = userData.data[0];
        console.log("[API] User ID:", user.id, "User Login:", user.login); //Log the user ID

        // 2. Get stream information (Publicly available)
        const streamResponse = await fetch(
            `https://api.twitch.tv/helix/streams?user_login=${userLogin}`,
            {
                headers: {
                    'Client-ID': clientId, // No Authorization header needed!
                },
            }
        );

        // ... (rest of the stream info handling, as before) ...
          if (!streamResponse.ok) {
              if (streamResponse.status === 429) {
                  console.error("[API] Twitch API Rate Limit Exceeded (Stream)");
                  return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
              }
              const errorText = await streamResponse.text();
              console.error(`[API] Failed to get Twitch stream info: ${streamResponse.status} - ${errorText}`);
              return NextResponse.json({ error: 'Failed to get Twitch stream info' }, { status: 500 });
          }

        const streamData = await streamResponse.json();
        console.log("[API] Stream data:", streamData); // Log stream data
        const stream = streamData.data[0];


        // 3. Get Past Broadcasts (Requires Authentication - Get Token Now)
        const accessToken = await getAccessToken(clientId, clientSecret); // Get the token *only* now
        let pastBroadcasts: PastBroadcast[] = []; // Initialize as an empty array

        if (accessToken) { // Only fetch if we have a token
            const videosResponse = await fetch(
                `https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=4`,
                {
                    headers: {
                        'Client-ID': clientId,
                        'Authorization': `Bearer ${accessToken}`, // Use the token!
                    },
                }
            );

            if (!videosResponse.ok) {
                  if(videosResponse.status === 429){
                      console.error("[API] Twitch API Rate Limit Exceeded (Videos)");
                      return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
                  }
                const errorText = await videosResponse.text();
                console.error(`[API] Error fetching past broadcasts: ${videosResponse.status} - ${errorText}`);
                // Don't return, just leave pastBroadcasts as an empty array
            } else {
                const videosData = await videosResponse.json();
                console.log("[API] Videos data:", videosData); // Log video data
                pastBroadcasts = videosData.data.map((video: any) => ({
                  id: video.id,
                  title: video.title,
                  date: new Date(video.created_at).toLocaleDateString(),
                  duration: video.duration,
                  views: video.view_count,
                  thumbnail: video.thumbnail_url.replace('%{width}', '400').replace('%{height}', '225'),
                  game: video.game_name || 'Unknown Game', // Use game name if available
                }));
            }
        } else {
            console.log("[API] No access token available. Cannot fetch past broadcasts.");
        }

        // 4. Get Schedule (Requires Authentication)
        let schedule: ScheduleItem[] = []; // Initialize

        if (accessToken) { // Only fetch if we have a token
            const scheduleResponse = await fetch(
                `https://api.twitch.tv/helix/schedule/segments?broadcaster_id=${user.id}&first=3`,
                {
                    headers: {
                        'Client-ID': clientId,
                        'Authorization': `Bearer ${accessToken}`, // Use the token
                    }
                }
            );

            if (!scheduleResponse.ok) {
                if(scheduleResponse.status === 429){
                    console.error("[API] Twitch API Rate Limit Exceeded (Schedule)");
                    return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
                }
                try {
                    const errorData = await scheduleResponse.json(); // Try to parse as JSON
                    console.error("[API] Error fetching schedule", scheduleResponse.status, errorData);
                } catch (jsonError) {
                    // If it's *not* valid JSON, log the raw text
                    const errorText = await scheduleResponse.text();
                    console.error("[API] Error fetching schedule (and not valid JSON)", scheduleResponse.status, errorText);
                }
                // Don't return, just leave schedule as an empty array.
            } else {
                const scheduleData = await scheduleResponse.json();
                console.log("[API] Schedule data:", scheduleData);
                schedule = scheduleData.data?.segments?.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    date: new Date(item.start_time).toLocaleDateString(),
                    time: new Date(item.start_time).toLocaleTimeString(),
                    game: item.category?.name || 'Unknown'
                })) ?? [];
            }
        } else {
            console.log("[API] No access token available. Cannot fetch schedule.");
        }

        let streamStatus: TwitchStreamStatus;
        if (stream) {
            streamStatus = {
                isLive: true,
                viewerCount: stream.viewer_count,
                title: stream.title,
                game: stream.game_name,
                thumbnailUrl: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
            };
        } else {
            streamStatus = { isLive: false };
        }

        return NextResponse.json({ streamStatus, pastBroadcasts, schedule });

    } catch (error) {
        console.error('[API] Error fetching Twitch data:', error);
        return NextResponse.json({ error: 'Failed to fetch Twitch data' }, { status: 500 });
    }
}