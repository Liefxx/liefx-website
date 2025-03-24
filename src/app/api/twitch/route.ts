// src/app/api/twitch/route.ts
import { NextRequest, NextResponse } from 'next/server';

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
      const errorText = await tokenResponse.text();
      console.error(`[API] Failed to get Twitch access token: ${tokenResponse.status} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to get Twitch access token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Get stream information
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
      const errorText = await streamResponse.text();
      console.error(`[API] Failed to get Twitch stream info: ${streamResponse.status} - ${errorText}`);
      return NextResponse.json({ error: 'Failed to get Twitch stream info' }, { status: 500 });
    }

    const streamData = await streamResponse.json();
    const stream = streamData.data[0]; // The API returns an array; we want the first (and usually only) element

    // 3. Get user information (for profile picture, etc.)
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
          const errorText = await userResponse.text();
          console.error(`[API] Failed to get Twitch user info: ${userResponse.status} - ${errorText}`);
          return NextResponse.json({ error: 'Failed to get Twitch user info' }, { status: 500 });
        }
        const userData = await userResponse.json();
        const user = userData.data[0];

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
        const errorText = await videosResponse.text();
        console.error(`[API] Error fetching past broadcasts: ${videosResponse.status} - ${errorText}`);
        //  don't return here, provide empty array.
      }
      const videosData = await videosResponse.json();
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

        if (!scheduleResponse.ok) {
            const errorData = await scheduleResponse.text()
            console.error("[API] Error fetching schedule", scheduleResponse.status, errorData)
        }
    const scheduleData = await scheduleResponse.json()

    const schedule = scheduleData.data?.segments?.map((item: any) => ({
      id: item.id,
      title: item.title,
      date: new Date(item.start_time).toLocaleDateString(),
      time: new Date(item.start_time).toLocaleTimeString(),
      game: item.category?.name || 'Unknown'
    })) ?? []

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