// src/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TwitchStreamStatus } from '@/types'; // Correct import using absolute path

export default function Sidebar() {
  const [streamStatus, setStreamStatus] = useState<TwitchStreamStatus>({
    isLive: false,
  });
  const [isScrolled, setIsScrolled] = useState(false);
    const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    const fetchTwitchStatus = async () => {
      try {
        const response = await fetch('/api/twitch'); // Fetch from your API route
        if (!response.ok) {
          console.error(`Failed to fetch Twitch status: ${response.status}`);
          return; // Don't update state if there's an error
        }
        const data = await response.json();
        setStreamStatus(data.streamStatus); // Update state with the actual stream status
      } catch (error) {
        console.error('Error fetching Twitch status:', error);
      }
    };

      fetchTwitchStatus();
    const interval = setInterval(fetchTwitchStatus, 60000); // Check every minute

    // Construct the iframe src *inside* useEffect, after checking for window
      if (typeof window !== 'undefined') {
          const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `&parent=${process.env.NEXT_PUBLIC_VERCEL_URL}` : "&parent=localhost";
          const liveSrc = `https://player.twitch.tv/?channel=<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_TWITCH\_USER\_LOGIN\}&autoplay\=true</span>{vercelUrl}`;

          setIframeSrc(liveSrc);
    }

    // Scroll listener (this part is correct)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function for both interval and scroll listener
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array: runs only once on mount


  return (
    <div className={`fixed left-0 top-0 h-full w-20 md:w-64 bg-gray-900 text-white transition-all duration-300 z-50 ${isScrolled ? 'shadow-xl' : ''}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 flex justify-center md:justify-start">
          <Link href="/">
            <Image
              src="/LiefLogoYT.png"
              alt="Liefx Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
          </Link>
        </div>

        {/* Twitch Stream Status */}
        <div className="px-4 py-2 mb-6">
          {streamStatus.isLive ? (
            <div className="bg-green-800 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="hidden md:inline text-sm font-bold">LIVE NOW</span>
              </div>
              <div className="hidden md:block mt-2">
                {/* Conditionally render the iframe only if iframeSrc is set */}
                {iframeSrc && (
                    <iframe
                      src={iframeSrc} // Use the dynamic src
                      height="150"
                      width="100%"
                      allowFullScreen={false}
                      className="rounded"
                    ></iframe>
                )}
                <p className="text-xs mt-1">{streamStatus.viewerCount} viewers</p>
              </div>
            </div>
          ) : (
            <div className="hidden md:block text-xs text-gray-400 text-center">
              Offline - Check back later!
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul className="space-y-2 px-2">
            <li>
              <Link href="/" className="flex items-center justify-center md:justify-start p-2 rounded hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden md:inline ml-3">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/content" className="flex items-center justify-center md:justify-start p-2 rounded hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline ml-3">Content</span>
              </Link>
            </li>
            <li>
              <Link href="/livestreams" className="flex items-center justify-center md:justify-start p-2 rounded hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline ml-3">Livestreams</span>
              </Link>
            </li>
            <li>
              <Link href="/merch" className="flex items-center justify-center md:justify-start p-2 rounded hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden md:inline ml-3">Merch</span>
              </Link>
            </li>
            <li>
              <Link href="/game" className="flex items-center justify-center md:justify-start p-2 rounded hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                <span className="hidden md:inline ml-3">Daily Game</span>
              </Link>
            </li>
            <li>
              <Link href="/about" className="flex items-center justify-center md:justify-start p-2 rounded hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:inline ml-3">About</span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Social Links */}
        <div className="p-4">
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="https://twitch.tv/Liefx" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
              </svg>
            </a>
            <a href="https://youtube.com/c/liefx" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://twitter.com/liefx" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}