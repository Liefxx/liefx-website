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

// Add Merch types
interface MerchProduct {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  variants: {
    id: string;
    unitPrice: { value: number; currency: string };
  }[];
  slug: string;
}

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [merchProducts, setMerchProducts] = useState<MerchProduct[]>([]);

  const channels = [
    { id: 'UC6PVHS7Iq-fJqMLpdebrhZQ', name: 'Liefx' },
    { id: 'UCQ1MqH7fQKh428jtrHt3AqQ', name: 'LiefSC' },
    { id: 'UCuoKmwfP_ZULNZi_FXlwpiA', name: 'LeafyLongplays' },
    { id: 'UC5TQE2PAX0YKvnl-xZNgH0Q', name: 'Liefx Rocket League' }
  ];
  
  useEffect(() => {
    const fetchLatestVideos = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch the latest video from each channel
        const latestVideos = await Promise.all(
          channels.map(async (channel) => {
            try {
              console.log(`Fetching videos for channel ${channel.name}`);
              const response = await fetch(`/api/videos/${channel.id}`);
              if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error for ${channel.name}:`, errorData);
                throw new Error(errorData.error || `Failed to fetch videos for ${channel.name}`);
              }
              const data = await response.json();
              console.log(`Successfully fetched videos for ${channel.name}:`, data);
              return data[0];
            } catch (channelError) {
              console.error(`Error fetching ${channel.name}:`, channelError);
              return null;
            }
          })
        );

        // Filter out any null results and set the featured content
        const validVideos = latestVideos.filter(video => video);
        if (validVideos.length === 0) {
          setError('No videos could be loaded. Please check the API configuration.');
        } else if (validVideos.length < channels.length) {
          setError('Some channels could not be loaded, but showing available videos.');
        }
        setFeaturedContent(validVideos);
      } catch (error: any) {
        console.error('Error fetching videos:', error);
        setError(error.message || 'Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    const fetchMerch = async () => {
      try {
        const res = await fetch('/api/merch');
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Merch API Error:', errorText);
          throw new Error(`Failed to fetch merch (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        console.log('Merch data fetched successfully:', data);
        
        if (!data.products) {
          console.error('No products array in response:', data);
          throw new Error('Invalid API response format');
        }
        
        setMerchProducts(data.products);
      } catch (error) {
        console.error('Error fetching merch:', error);
        setMerchProducts([]); // Set empty array on error to avoid undefined
      }
    };

    fetchLatestVideos();
    fetchMerch();
  }, []);

  return (
    <div className="container mx-auto">
      {/* Hero Section - Reduced height */}
      <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center mb-12 overflow-hidden">
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
            width={100} 
            height={100} 
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl md:text-5xl font-bold mb-3">KEEP GAMIN' HARD</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Rocket League host, Star Citizen enthusiast, and content creator
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/content" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Watch Content
            </Link>
            <Link href="/game" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
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

      {/* Merch Preview - Updated to use real data */}
      <section className="mb-12 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Merch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {merchProducts.slice(0, 10).map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 bg-gray-200">
                {product.images && product.images[0] ? (
                  <Image 
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Image 
                      src="/LiefLogoYT.png" 
                      alt="Merch item" 
                      width={100} 
                      height={100}
                    />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                {product.variants && product.variants[0] && (
                  <p className="text-gray-600 mb-2">
                    ${(product.variants[0].unitPrice.value || 0).toFixed(2)} {product.variants[0].unitPrice.currency}
                  </p>
                )}
                <Link href={`/merch/${product.slug}`}>
                  <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded transition duration-300">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
          {merchProducts.length === 0 && [1, 2, 3].map((item) => (
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
                <h3 className="font-bold text-lg mb-1">Loading...</h3>
                <p className="text-gray-600 mb-2">$XX.XX</p>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded transition duration-300 opacity-50" disabled>
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
