'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  channelTitle: string;
}

export default function Content() {
  const [activeTab, setActiveTab] = useState('liefx');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const channels = [
    { id: 'liefx', name: 'Liefx', channelId: 'UC6PVHS7Iq-fJqMLpdebrhZQ' }, // Replace with actual channel ID
    { id: 'liefsc', name: 'LiefSC', channelId: 'UCQ1MqH7fQKh428jtrHt3AqQ' }, // Replace with actual channel ID
    { id: 'gffbud', name: 'GFFBud', channelId: 'UCNcPrGnjX40pc7hNhh1dZZA' }, // Replace with actual channel ID
    { id: 'leafylongplays', name: 'LeafyLongplays', channelId: 'UCuoKmwfP_ZULNZi_FXlwpiA' } // Replace with actual channel ID
  ];

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      setLoading(true);
      setError('');
      
      try {
        // In a production environment, you would use the YouTube Data API
        // For this demo, we'll fetch from a public YouTube API endpoint
        const apiKey = 'AIzaSyAr8odT2EKKqn6WYJJF6zz_EZcwIJmBaSU'; // This is a demo key with limited quota
        const channelId = channels.find(c => c.id === activeTab)?.channelId;
        
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        
        // Get video IDs for statistics
        const videoIds = data.items
          .filter((item: any) => item.id.kind === 'youtube#video')
          .map((item: any) => item.id.videoId)
          .join(',');
        
        // Fetch video statistics
        const statsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics`
        );
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch video statistics');
        }
        
        const statsData = await statsResponse.json();
        
        // Combine data
        const videosWithStats = data.items
          .filter((item: any) => item.id.kind === 'youtube#video')
          .map((item: any) => {
            const stats = statsData.items.find((stat: any) => stat.id === item.id.videoId);
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.high.url,
              publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
              viewCount: stats ? formatViewCount(stats.statistics.viewCount) : '0',
              channelTitle: item.snippet.channelTitle
            };
          });
        
        setVideos(videosWithStats);
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError('Failed to load videos. Using placeholder data instead.');
        
        // Fallback to placeholder data
        setVideos(getPlaceholderVideos(activeTab));
      } finally {
        setLoading(false);
      }
    };
    
    fetchYouTubeVideos();
  }, [activeTab]);
  
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
  
  // Placeholder videos in case API fails
  const getPlaceholderVideos = (channel: string): YouTubeVideo[] => {
    const channelName = channels.find(c => c.id === channel)?.name || 'Liefx';
    
    const placeholders = [];
    for (let i = 1; i <= 12; i++) {
      placeholders.push({
        id: `placeholder-${i}`,
        title: `${channelName} Video ${i} - Click to watch on YouTube`,
        thumbnail: '/YTBanner_v1.png',
        publishedAt: '2025-03-01',
        viewCount: `${Math.floor(Math.random() * 10000)}`,
        channelTitle: channelName
      });
    }
    
    return placeholders;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Content Hub</h1>
      
      {/* Channel Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap border-b border-gray-200">
          {channels.map((channel) => (
            <button
              key={channel.id}
              className={`py-3 px-6 font-medium text-lg transition-colors ${
                activeTab === channel.id
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(channel.id)}
            >
              {channel.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Channel Description */}
      <div className="mb-8">
        {activeTab === 'liefx' && (
          <p className="text-gray-600">
            My main channel. Gaming, with a focus on narrative gameplay and game design philosophy!
          </p>
        )}
        {activeTab === 'liefsc' && (
          <p className="text-gray-600">
            Dedicated to Star Citizen gameplay, updates, and exploration of the ever-expanding universe.
          </p>
        )}
        {activeTab === 'gffbud' && (
          <p className="text-gray-600">
            Gaming For Fun, Bud! Casual gameplay across various titles with a focus on having a good time.
          </p>
        )}
        {activeTab === 'leafylongplays' && (
          <p className="text-gray-600">
            Relaxing playthroughs, no commentary. Perfect background content!
          </p>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-yellow-700">
            {error}
          </p>
        </div>
      )}
      
      {/* Videos Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                  unoptimized={video.thumbnail.startsWith('http')}
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {video.viewCount} views
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{video.title}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{video.channelTitle}</span>
                  <span>{video.publishedAt}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      
      {/* Subscribe Button */}
      <div className="mt-12 text-center">
        <a
          href={`https://www.youtube.com/${activeTab === 'liefx' ? '@LiefxRL' : activeTab === 'liefsc' ? '@LiefSC' : activeTab === 'gffbud' ? '@GFFBud' : '@LeafyLongplays'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Subscribe to {channels.find(c => c.id === activeTab)?.name}
        </a>
      </div>
    </div>
  );
}
