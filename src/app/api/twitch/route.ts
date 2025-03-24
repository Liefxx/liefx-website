// src/app/api/twitch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types'; // Correct import

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const userLogin = process.env.TWITCH_USER_LOGIN;

  if (!clientId || !clientSecret || !userLogin) {
    console.error("[API] Missing Twitch credentials. Check .env.local and Vercel settings.");
    return NextResponse.json(
      { error: 'Missing Twitch credentials' },
      { status: 500 }
    );
  }

  try {
    // 1. Get an access token
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!tokenResponse.ok) {
        if (tokenResponse.status === 429) { // Check for rate limit
            console.error("[API] Twitch API Rate Limit Exceeded (Token)");
            return NextResponse.json({ error: 'Twitch API Rate Limit Exceeded. Please try again later.' }, { status: 429 });
        }
      const errorText = await tokenResponse.text();
      console.error(`[API] Failed to get Twitch access token: ${tokenResponse.status} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to get Twitch access token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("[API] Got access token:", accessToken); // Log the access token (for debugging)

    // 2. Get user information (for profile picture, etc., and user ID)
    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${userLogin}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
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


    // 3. Get stream information
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${userLogin}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

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

    // 4.  Get Past Broadcasts
    const videosResponse = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=4`, // Get last 4 VODs
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
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
        //  don't return here, provide empty array.
      }
    const videosData = await videosResponse.json();
    console.log("[API] Videos data:", videosData); // Log video data
    const pastBroadcasts = videosData.data.map((video: any) => ({
      id: video.id,
      title: video.title,
      date: new Date(video.created_at).toLocaleDateString(), // Format the date
      duration: video.duration, // This is in the format "1h2m3s"
      views: video.view_count,
      thumbnail: video.thumbnail_url.replace('%{width}', '400').replace('%{height}', '225'), // Use template for thumbnail
      game: video.game_name || 'Unknown Game', // Use game name if availabe
    }));

    // 5. Get Schedule (segments)
    const scheduleResponse = await fetch(
      `https://api.twitch.tv/helix/schedule/segments?broadcaster_id=${user.id}&first=3`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    )
      let schedule: ScheduleItem[] = [];
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
    } else {
        const scheduleData = await scheduleResponse.json()
        console.log("[API] Schedule data:", scheduleData); // Log schedule data

        schedule = scheduleData.data?.segments?.map((item: any) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.start_time).toLocaleDateString(),
          time: new Date(item.start_time).toLocaleTimeString(),
          game: item.category?.name || 'Unknown'
        })) ?? []
    }


    let streamStatus: TwitchStreamStatus;
    if (stream) {
      streamStatus = {
        isLive: true,
        viewerCount: stream.viewer_count,
        title: stream.title,
        game: stream.game_name,
        thumbnailUrl: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'), // Get a large thumbnail
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