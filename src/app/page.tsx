'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Featured content type
interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  channelTitle: string;
}

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const channels = [
    { id: 'UC6PVHS7Iq-fJqMLpdebrhZQ', name: 'Liefx' },
    { id: 'UCQ1MqH7fQKh428jtrHt3AqQ', name: 'LiefSC' },
    { id: 'UCuoKmwfP_ZULNZi_FXlwpiA', name: 'LeafyLongplays' },
    { id: 'UC6PVHS7Iq-fJqMLpdebrhZQ', name: 'Liefx Rocket League' } // You might want to update this ID
  ];
  
  useEffect(() => {
    const fetchLatestVideos = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch the latest video from each channel
        const latestVideos = await Promise.all(
          channels.map(async (channel) => {
            const response = await fetch(`/api/videos/${channel.id}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch videos for ${channel.name}`);
            }
            const videos = await response.json();
            // Return only the first (most recent) video
            return videos[0];
          })
        );

        // Filter out any undefined results and set the featured content
        setFeaturedContent(latestVideos.filter(video => video));
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load latest videos');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVideos();
  }, []);

  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[70vh] flex items-center justify-center mb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/YTBanner_v1.png" 
            alt="Liefx Banner" 
            fill 
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white p-4">
          <Image 
            src="/LiefLogoYT.png" 
            alt="Liefx Logo" 
            width={150} 
            height={150} 
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">KEEP GAMIN' HARD</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Rocket League host, Star Citizen enthusiast, and content creator
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/content" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Watch Content
            </Link>
            <Link href="/game" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Play Daily Game
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="mb-12 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Latest Videos</h2>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredContent.map((video) => (
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

        <div className="text-center mt-8">
          <Link href="/content" className="text-green-600 hover:text-green-800 font-semibold">
            View All Content →
          </Link>
        </div>
      </section>

      {/* Daily Game Promo */}
      <section className="bg-gray-800 text-white py-12 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Daily Scavenger Hunt</h2>
          <p className="text-xl mb-6">
            Play the daily scavenger hunt game to earn points and enter monthly giveaways!
          </p>
          <Link href="/game" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Play Now
          </Link>
        </div>
      </section>

      {/* Merch Preview */}
      <section className="mb-12 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Merch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                <Image 
                  src="/LiefLogoYT.png" 
                  alt="Merch item" 
                  width={100} 
                  height={100}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">Liefx {item === 1 ? 'T-Shirt' : item === 2 ? 'Hoodie' : 'Hat'}</h3>
                <p className="text-gray-600 mb-2">${item === 1 ? '24.99' : item === 2 ? '49.99' : '19.99'}</p>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded transition duration-300">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/merch" className="text-green-600 hover:text-green-800 font-semibold">
            Shop All Merch →
          </Link>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-green-600 text-white py-12 px-4 rounded-lg mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-6">
            Subscribe to get notified about new content, streams, and giveaways
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
              required
            />
            <button 
              type="submit" 
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
