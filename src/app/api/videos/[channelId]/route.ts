// src/app/api/videos/[channelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = params.channelId;
  const apiKey = process.env.YOUTUBE_API_KEY;

  console.log(`[API] Request received for channelId: ${channelId}`);

  if (!apiKey) {
    console.error("[API] ERROR: Missing YouTube API key.  Make sure YOUTUBE_API_KEY is set in .env.local");
    return NextResponse.json({ error: 'Missing YouTube API key' }, { status: 500 });
  }

  if (!channelId) {
    console.error("[API] ERROR: Missing channelId parameter in the request.");
    return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`;
    console.log(`[API] Fetching search results from: ${searchUrl}`);
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`[API] ERROR fetching search results: Status ${searchResponse.status}.  Response: ${errorText}`);
      return NextResponse.json({ error: `Failed to fetch videos: ${searchResponse.status}`, details: errorText }, { status: searchResponse.status });
    }

    const searchData = await searchResponse.json();
    console.log(`[API] Search results fetched successfully.  Found ${searchData.items?.length || 0} items.`);

    const videoItems = searchData.items
      ? searchData.items.filter((item: any) => item.id.kind === 'youtube#video')
      : [];

      if (videoItems.length === 0) {
        console.log("[API] No videos found for this channel.");
        return NextResponse.json([], { status: 200 }); // Return an empty array, not an error
      }


    const videoIds = videoItems.map((item: any) => item.id.videoId).join(',');
    console.log(`[API] Fetching statistics for video IDs: ${videoIds}`);

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics`;
    const statsResponse = await fetch(statsUrl);

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.error(`[API] ERROR fetching video statistics: Status ${statsResponse.status}. Response: ${errorText}`);
      return NextResponse.json({ error: `Failed to fetch video statistics: ${statsResponse.status}`, details: errorText }, { status: statsResponse.status });
    }

    const statsData = await statsResponse.json();
    console.log(`[API] Video statistics fetched successfully.`);

    const videosWithStats = videoItems.map((item: any) => {
      const stats = statsData.items.find((stat: any) => stat.id === item.id.videoId);
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
        viewCount: stats ? formatViewCount(stats.statistics.viewCount) : 'N/A', // Handle missing stats
        channelTitle: item.snippet.channelTitle,
      };
    });

    console.log(`[API] Returning ${videosWithStats.length} videos with stats.`);
    return NextResponse.json(videosWithStats, { status: 200 });

  } catch (error: any) {
    console.error("[API] UNEXPECTED ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch videos', message: error.message }, { status: 500 });
  }
}

// Format view count (e.g., 1500 -> 1.5K) - No changes here
const formatViewCount = (count: string): string => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};