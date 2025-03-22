// src/app/api/videos/[channelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = params.channelId;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing YouTube API key' }, { status: 500 });
  }

  if (!channelId) {
    return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
  }

  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=<span class="math-inline">\{apiKey\}&channelId\=</span>{channelId}&part=snippet,id&order=date&maxResults=12`
    );

    if (!searchResponse.ok) {
      throw new Error(`Failed to fetch videos: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    const videoIds = searchData.items
      .filter((item: any) => item.id.kind === 'youtube#video')
      .map((item: any) => item.id.videoId)
      .join(',');

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=<span class="math-inline">\{apiKey\}&id\=</span>{videoIds}&part=statistics`
    );

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch video statistics: ${statsResponse.status}`);
    }
    const statsData = await statsResponse.json();

    const videosWithStats = searchData.items
      .filter((item: any) => item.id.kind === 'youtube#video')
      .map((item: any) => {
        const stats = statsData.items.find((stat: any) => stat.id === item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
          viewCount: stats ? formatViewCount(stats.statistics.viewCount) : '0',
          channelTitle: item.snippet.channelTitle,
        };
      });

    return NextResponse.json(videosWithStats);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos', message: error.message }, { status: 500 });
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