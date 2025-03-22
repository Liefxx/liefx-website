'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// YouTube channel type
interface YouTubeChannel {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
}

// YouTube video type
interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  channelId: string;
}

export default function Content() {
  // Mock data for channels
  const channels: YouTubeChannel[] = [
    {
      id: 'liefx',
      name: 'Liefx',
      description: 'Exploring video games by sharing my excitement for cool gaming concepts, game design philosophies, or whatever my little gamer heart is drawn to.',
      thumbnail: '/LiefLogoYT.png',
      subscriberCount: '10K+',
      videoCount: '100+'
    },
    {
      id: 'liefsc',
      name: 'LiefSC',
      description: 'Dedicated to Star Citizen content, gameplay, and updates.',
      thumbnail: '/LiefLogoYT.png',
      subscriberCount: '5K+',
      videoCount: '50+'
    },
    {
      id: 'gffbud',
      name: 'GFFBud',
      description: 'Gaming content focused on various titles and gameplay.',
      thumbnail: '/LiefLogoYT.png',
      subscriberCount: '3K+',
      videoCount: '30+'
    },
    {
      id: 'leafylongplays',
      name: 'LeafyLongplays',
      description: 'Long-form gameplay videos and walkthroughs.',
      thumbnail: '/LiefLogoYT.png',
      subscriberCount: '2K+',
      videoCount: '20+'
    },
    {
      id: 'liefxrl',
      name: 'LiefX Rocket League',
      description: 'A Rocket League podcast with Brody Liefx Moore that goes beyond the surface of the RLCS.',
      thumbnail: '/LiefLogoYT.png',
      subscriberCount: '1K+',
      videoCount: '75+'
    }
  ];

  // Mock data for videos
  const generateMockVideos = (channelId: string, count: number): YouTubeVideo[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${channelId}-video-${i}`,
      title: `${channelId === 'liefsc' ? 'Star Citizen' : channelId === 'liefxrl' ? 'Rocket League' : 'Gaming'} Video ${i + 1}`,
      thumbnail: '/YTBanner_v1.png',
      publishedAt: `${Math.floor(Math.random() * 30) + 1} days ago`,
      viewCount: `${Math.floor(Math.random() * 10000)}`,
      channelId
    }));
  };

  // State for selected channel
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  
  // Get videos based on selected channel
  const getVideos = (): YouTubeVideo[] => {
    if (selectedChannel === 'all') {
      return [
        ...generateMockVideos('liefx', 4),
        ...generateMockVideos('liefsc', 4),
        ...generateMockVideos('gffbud', 4),
        ...generateMockVideos('leafylongplays', 4),
        ...generateMockVideos('liefxrl', 4)
      ];
    }
    
    return generateMockVideos(selectedChannel, 12);
  };

  const videos = getVideos();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Content Hub</h1>
      
      {/* Channel Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">My Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => setSelectedChannel('all')}
            className={`p-4 rounded-lg transition-colors ${selectedChannel === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            All Channels
          </button>
          
          {channels.map(channel => (
            <button 
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`p-4 rounded-lg transition-colors ${selectedChannel === channel.id ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {channel.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Channel Info (if specific channel selected) */}
      {selectedChannel !== 'all' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {channels.filter(c => c.id === selectedChannel).map(channel => (
            <div key={channel.id} className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 relative flex-shrink-0">
                <Image 
                  src={channel.thumbnail} 
                  alt={channel.name} 
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{channel.name}</h2>
                <p className="text-gray-600 mb-4">{channel.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{channel.subscriberCount} subscribers</span>
                  <span>{channel.videoCount} videos</span>
                </div>
                <a 
                  href={`https://youtube.com/c/${channel.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Visit Channel
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Videos Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {selectedChannel === 'all' ? 'Latest Videos' : 'Channel Videos'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image 
                  src={video.thumbnail} 
                  alt={video.title} 
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(Math.random() * 20) + 1}:{Math.floor(Math.random() * 50) + 10}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-gray-500 text-sm mb-2">
                  {channels.find(c => c.id === video.channelId)?.name} • {video.viewCount} views • {video.publishedAt}
                </p>
                <a 
                  href={`https://youtube.com/watch?v=${video.id}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  Watch Video →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Playlists Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Featured Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Rocket League RLCS', 'Star Citizen Gameplay', 'Lief\'s Lounge Podcast'].map((playlist, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative h-40">
                <Image 
                  src="/YTBanner_v1.png" 
                  alt={playlist} 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{playlist}</h3>
                <p className="text-gray-500 text-sm mb-2">
                  {Math.floor(Math.random() * 20) + 5} videos • Updated {Math.floor(Math.random() * 30) + 1} days ago
                </p>
                <a 
                  href="#" 
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  View Playlist →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-gray-100 rounded-lg p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Search Content</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search videos..." 
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Categories</option>
            <option value="rocket-league">Rocket League</option>
            <option value="star-citizen">Star Citizen</option>
            <option value="podcast">Podcast</option>
            <option value="gameplay">Gameplay</option>
          </select>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
