// src/app/api/videos/[channelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = params.channelId;
  const apiKey = process.env.YOUTUBE_API_KEY;

  console.log(`[YouTube API] Request received for channelId: ${channelId}`);
  console.log(`[YouTube API] API Key status: ${apiKey ? 'Present' : 'Missing'}`);

  if (!apiKey) {
    console.error("[YouTube API] ERROR: Missing YouTube API key. Make sure YOUTUBE_API_KEY is set in .env.local");
    return NextResponse.json({ error: 'Missing YouTube API key' }, { status: 500 });
  }

  if (!channelId) {
    console.error("[YouTube API] ERROR: Missing channelId parameter in the request.");
    return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`;
    console.log(`[YouTube API] Fetching search results...`);
    
    const searchResponse = await fetch(searchUrl);
    const searchResponseText = await searchResponse.text();
    
    if (!searchResponse.ok) {
      console.error(`[YouTube API] ERROR fetching search results: Status ${searchResponse.status}. Response:`, searchResponseText);
      return NextResponse.json(
        { 
          error: `Failed to fetch videos: ${searchResponse.status}`, 
          details: searchResponseText,
          url: searchUrl 
        }, 
        { status: searchResponse.status }
      );
    }

    const searchData = JSON.parse(searchResponseText);
    console.log(`[YouTube API] Search results fetched successfully. Found ${searchData.items?.length || 0} items.`);

    const videoItems = searchData.items
      ? searchData.items.filter((item: any) => item.id.kind === 'youtube#video')
      : [];

    if (videoItems.length === 0) {
      console.log("[YouTube API] No videos found for this channel.");
      return NextResponse.json([], { status: 200 }); // Return an empty array, not an error
    }

    const videoIds = videoItems.map((item: any) => item.id.videoId).join(',');
    console.log(`[YouTube API] Fetching statistics for ${videoItems.length} videos...`);

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics`;
    const statsResponse = await fetch(statsUrl);
    const statsResponseText = await statsResponse.text();

    if (!statsResponse.ok) {
      console.error(`[YouTube API] ERROR fetching video statistics: Status ${statsResponse.status}. Response:`, statsResponseText);
      return NextResponse.json(
        { 
          error: `Failed to fetch video statistics: ${statsResponse.status}`, 
          details: statsResponseText,
          url: statsUrl 
        }, 
        { status: statsResponse.status }
      );
    }

    const statsData = JSON.parse(statsResponseText);
    console.log(`[YouTube API] Video statistics fetched successfully for ${statsData.items?.length || 0} videos.`);

    const videosWithStats = videoItems.map((item: any) => {
      const stats = statsData.items?.find((stat: any) => stat.id === item.id.videoId);
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
        viewCount: stats ? formatViewCount(stats.statistics.viewCount) : 'N/A',
        channelTitle: item.snippet.channelTitle,
      };
    });

    console.log(`[YouTube API] Returning ${videosWithStats.length} videos with stats.`);
    return NextResponse.json(videosWithStats, { status: 200 });

  } catch (error: any) {
    console.error("[YouTube API] UNEXPECTED ERROR:", error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch videos', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

// Format view count (e.g., 1500 -> 1.5K)
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