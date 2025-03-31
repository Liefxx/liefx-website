// src/app/api/twitch/route.ts
export const dynamic = 'force-dynamic'; // Force dynamic rendering

import { NextRequest, NextResponse } from 'next/server';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types';
import { cookies } from 'next/headers';
import { encode } from 'html-entities';

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const userLogin = process.env.TWITCH_USER_LOGIN;

// Function to get an app access token (for public data)
async function getAppAccessToken() {
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: 'client_credentials',
        }),
        cache: 'no-store', // Important: Do not cache the app access token!
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`[API] Failed to get app access token: ${tokenResponse.status} - ${errorText}`);
        throw new Error('Failed to get app access token');
    }

    const tokenData = await tokenResponse.json();
    console.log("[API] App access token data:", tokenData);
    return tokenData.access_token;
}

// Function to get a user access token (for private data, using cookies)
async function getUserAccessToken() {
    const cookieStore = cookies();
    let accessToken = cookieStore.get('twitchAccessToken')?.value;
    const refreshToken = cookieStore.get('twitchRefreshToken')?.value;

    console.log("[API getAccessToken] accessToken from cookie:", accessToken);
    console.log("[API getAccessToken] refreshToken from cookie:", refreshToken);

    if (!accessToken && !refreshToken) {
        return null; // No token available
    }

    if (!accessToken && refreshToken) {
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
                    client_id: clientId!,
                    client_secret: clientSecret!,
                }),
                cache: 'no-store',
            }
        );

        if (!refreshResponse.ok) {
            const errorText = await refreshResponse.text();
            console.error(`[API] Failed to refresh token: ${refreshResponse.status} - ${errorText}`);
            // Delete cookies
            cookies().delete('twitchAccessToken')
            cookies().delete('twitchRefreshToken')
            return null;
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
    try {

      const appAccessToken = await getAppAccessToken(); // Always get an app token

      // Fetch Stream Status (always available, uses app access token)
      const streamResponse = await fetch(
        `https://api.twitch.tv/helix/streams?user_login=${userLogin}`,
        {
          headers: {
            'Client-ID': clientId!,
            'Authorization': `Bearer ${appAccessToken}`, // Use APP access token
          },
          cache: 'no-store',
        }
      );

      if (!streamResponse.ok) {
            if (streamResponse.status === 429) { // Check for rate limit
                console.error("[API] Twitch API Rate Limit Exceeded (Stream)");
                return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
        }
        const errorText = await streamResponse.text();
        console.error(
          `[API] Failed to get stream status: ${streamResponse.status} - ${errorText}`
        );
        return NextResponse.json(
          { error: "Failed to get stream status" },
          { status: 500 }
        );
      }

      const streamData = await streamResponse.json();
      console.log("[API] Stream data:", streamData);
      let streamStatus: TwitchStreamStatus = { isLive: false };
      if (streamData.data.length > 0) {
        const stream = streamData.data[0];
        streamStatus = {
          isLive: true,
          title: encode(stream.title),
          game: encode(stream.game_name),
          viewerCount: stream.viewer_count,
          thumbnailUrl: stream.thumbnail_url
            .replace("{width}", "1920")
            .replace("{height}", "1080"),
        };
      }


        let pastBroadcasts: PastBroadcast[] = [];
        let schedule: ScheduleItem[] = [];

        // Get user access token, if available
        const userAccessToken = await getUserAccessToken(); // No arguments!

        if (userAccessToken) {
          // Fetch User Info (requires user access token)
            const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${userLogin}`, {
                headers: {
                    'Client-ID': clientId!,
                    'Authorization': `Bearer ${userAccessToken}`, // Use *user* access token
                },
                cache: 'no-store', // Very important!
            });

            if (!userResponse.ok) {
                if (userResponse.status === 429) { // Check for rate limit
                    console.error("[API] Twitch API Rate Limit Exceeded (User)");
                    return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
                }
                const errorText = await userResponse.text();
                console.error(`[API] Failed to get Twitch user info: ${userResponse.status} - ${errorText}`);
                return NextResponse.json({ error: 'Failed to get Twitch user info' }, { status: 500 }); // This is the line triggering the error
            }

            const userData = await userResponse.json();
            console.log("[API] User data:", userData);

            // Check if userData.data exists and has at least one element
            if (!userData.data || userData.data.length === 0) {
                console.error("[API] ERROR: No user data found for login:", userLogin);
                return NextResponse.json({ error: 'No user data found for login: ' + userLogin }, { status: 404 });
            }

            const user = userData.data[0];
            console.log("[API] User ID:", user.id, "User Login:", user.login); //Log the user ID


            // Fetch Past Broadcasts (requires user access token)
            const videosResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=4`, {
                headers: {
                    'Client-ID': clientId!,
                    'Authorization': `Bearer ${userAccessToken}`,
                },
                cache: 'no-store',
            });

             if (!videosResponse.ok) {
                  if(videosResponse.status === 429){
                      console.error("[API] Twitch API Rate Limit Exceeded (Videos)");
                      return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
                  }
                const errorText = await videosResponse.text();
                console.error(`[API] Error fetching past broadcasts: ${videosResponse.status} - ${errorText}`);
                //Don't return.
              }
              else { //parse if no errors
                const videosData = await videosResponse.json();
                console.log("[API] Videos data:", videosData);
                pastBroadcasts = videosData.data.map((video: any) => ({
                id: video.id,
                title: encode(video.title),
                thumbnail: video.thumbnail_url.replace('%{width}', '400').replace('%{height}', '225'),
                duration: video.duration,
                date: new Date(video.created_at).toLocaleDateString(),
                views: video.view_count,
                game: video.game_name || 'Unknown Game'
                }));
            }

            // Fetch Stream Schedule (requires user access token)
            const scheduleResponse = await fetch(`https://api.twitch.tv/helix/schedule/segments?broadcaster_id=${user.id}&first=3`, {
                headers: {
                    'Client-ID': clientId!,
                    'Authorization': `Bearer ${userAccessToken}`,
                },
                cache: 'no-store',
            });

            if (!scheduleResponse.ok) {
                if(scheduleResponse.status === 429){
                    console.error("[API] Twitch API Rate Limit Exceeded (Schedule)");
                    return NextResponse.json({error: 'Twitch API Rate Limit Exceeded. Please try again later.'}, {status: 429})
                }
                try{
                    const errorData = await scheduleResponse.json(); // Try to parse as JSON
                console.error("[API] Error fetching schedule", scheduleResponse.status, errorData);
                } catch (e){
                    const errorText = await scheduleResponse.text();
                    console.error("[API] Error fetching schedule", scheduleResponse.status, errorText)
                }

            } else { //parse if no errors
                const scheduleData = await scheduleResponse.json()
                console.log("[API] Schedule data:", scheduleData); // Log schedule data

                schedule = scheduleData.data?.segments?.map((item: any) => ({
                id: item.id,
                title: encode(item.title),
                game: item.category ? encode(item.category.name) : 'No Category',
                date: new Date(item.start_time).toLocaleDateString(),
                time: new Date(item.start_time).toLocaleTimeString(),
                })) ?? []
            }
        } else {
            console.log("[API] No user access token.  Using app access token for public data only.");
        }

        return NextResponse.json({
            streamStatus,
            pastBroadcasts,
            schedule,
        });

    } catch (error) {
        console.error('[API] Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}