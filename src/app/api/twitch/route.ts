// src/app/api/twitch/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types';
import { html } from 'html-entities';


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
	console.log("[API] App access token data:", tokenData)
    return tokenData.access_token;
}


export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('twitchAccessToken')?.value;

        let streamStatus: TwitchStreamStatus = { isLive: false };
		let userData = null;
        let pastBroadcasts: PastBroadcast[] = [];
        let schedule: ScheduleItem[] = [];


        // Get an app access token for public data.
        const appAccessToken = await getAppAccessToken();

        // Fetch Stream Status (always available, uses app access token)
        const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${userLogin}`, {
            headers: {
                'Client-ID': clientId!,
                'Authorization': `Bearer ${appAccessToken}`, // Use app access token
            },
            cache: 'no-store',
        });

        if (!streamResponse.ok) {
                if (streamResponse.status === 429) { // Check for rate limit
                    console.error("[API] Twitch API Rate Limit Exceeded (Stream)");
                    return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
            }
            const errorText = await streamResponse.text();
            console.error(`[API] Failed to get stream status: ${streamResponse.status} - ${errorText}`);
            return NextResponse.json({ error: 'Failed to get stream status' }, { status: 500 });
        }

        const streamData = await streamResponse.json();
		console.log("[API] Stream data:", streamData)
        if (streamData.data.length > 0) {
            const stream = streamData.data[0];
            streamStatus = {
                isLive: true,
                title: html.encode(stream.title),
                game: html.encode(stream.game_name),
                viewerCount: stream.viewer_count,
            };
        }


        // If we have a user access token, fetch additional data.
        if (accessToken) {

			 // Fetch User Info
			 const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${userLogin}`, {
                headers: {
                    'Client-ID': clientId!,
                    'Authorization': `Bearer ${accessToken}`, // Use *user* access token
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

			userData = await userResponse.json();
			console.log("[API] User data:", userData);


            // Fetch Past Broadcasts
            const broadcastsResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${userData.data[0].id}&type=archive`, {
                headers: {
                    'Client-ID': clientId!,
                    'Authorization': `Bearer ${accessToken}`,
                },
                cache: 'no-store',
            });

             if (!broadcastsResponse.ok) {
                if (broadcastsResponse.status === 429) { // Check for rate limit
                    console.error("[API] Twitch API Rate Limit Exceeded (Broadcasts)");
                    return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
                }
                const errorText = await broadcastsResponse.text();
                console.error(`[API] Failed to get past broadcasts: ${broadcastsResponse.status} - ${errorText}`);
                return NextResponse.json({ error: 'Failed to get past broadcasts' }, { status: 500 });
            }


            const broadcastsData = await broadcastsResponse.json();
			console.log("[API] Past broadcasts data:", broadcastsData);
            pastBroadcasts = broadcastsData.data.map((broadcast: any) => ({
                id: broadcast.id,
                title: html.encode(broadcast.title),
                thumbnail: broadcast.thumbnail_url,
                duration: broadcast.duration,
                date: new Date(broadcast.created_at).toLocaleDateString(),
				views: broadcast.view_count,
				game: streamStatus.isLive ? streamStatus.game : "No Game"
            }));

            // Fetch Stream Schedule
            const scheduleResponse = await fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=${userData.data[0].id}`, {
                headers: {
                    'Client-ID': clientId!,
                    'Authorization': `Bearer ${accessToken}`,
                },
                cache: 'no-store',
            });

             if (!scheduleResponse.ok) {
                if(scheduleResponse.status === 429) {
                     console.error("[API] Twitch API Rate Limit Exceeded (Schedule)");
                     return NextResponse.json({error: 'Twitch API Rate Limit Exceeded. Please try again later.'}, {status: 429})
                }
                const errorText = await scheduleResponse.text();
                console.error(`[API] Failed to get schedule: ${scheduleResponse.status} - ${errorText}`);
                return NextResponse.json({ error: 'Failed to get stream schedule' }, { status: 500 });
            }

            const scheduleData = await scheduleResponse.json();
			console.log("[API] Schedule data:", scheduleData);

			if (scheduleData && scheduleData.data && scheduleData.data.segments) {
                schedule = scheduleData.data.segments.map((segment: any) => ({
                    id: segment.id,
                    title: html.encode(segment.title),
                    game: segment.category ? html.encode(segment.category.name) : 'No Category',
                    date: new Date(segment.start_time).toLocaleDateString(),
                    time: new Date(segment.start_time).toLocaleTimeString(),
                }));
            } else {
                schedule = []; // Set to an empty array if no segments
            }


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