'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Featured content type
interface FeaturedContent {
  type: 'youtube' | 'twitch';
  title: string;
  thumbnail: string;
  link: string;
  channel: string;
}

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
  
  useEffect(() => {
    // In a real implementation, this would fetch from YouTube/Twitch APIs
    // For now, we'll use mock data
    setFeaturedContent([
      {
        type: 'youtube',
        title: 'Star Citizen Just Hit Its BIGGEST Milestone',
        thumbnail: '/YTBanner_v1.png',
        link: 'https://www.youtube.com/watch?v=fzhROQPjwQM',
        channel: 'Liefx'
      },
      {
        type: 'youtube',
        title: 'Inside Star Citizen - Discussion + React',
        thumbnail: '/YTBanner_v1.png',
        link: 'https://www.youtube.com/watch?v=xEttxQlJ-bs',
        channel: 'LiefSC'
      },
      {
        type: 'twitch',
        title: 'Rocket League RLCS Casting',
        thumbnail: '/YTBanner_v1.png',
        link: 'https://www.twitch.tv/Liefx',
        channel: 'Liefx'
      },
      {
        type: 'youtube',
        title: 'Challenges of a Changing Esports Industry',
        thumbnail: '/YTBanner_v1.png',
        link: 'https://www.youtube.com/watch?v=FDNvxqvVT6E',
        channel: 'LiefX Rocket League'
      }
    ]);
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
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Featured Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredContent.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image 
                  src={item.thumbnail} 
                  alt={item.title} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
                {item.type === 'youtube' ? (
                  <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    YouTube
                  </div>
                ) : (
                  <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    Twitch
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.channel}</p>
              </div>
            </a>
          ))}
        </div>
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
