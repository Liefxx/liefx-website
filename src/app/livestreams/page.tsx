// src/app/livestreams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TwitchStreamStatus {
  isLive: boolean;
  viewerCount?: number;
  title?: string;
  game?: string;
  thumbnailUrl?: string;
}

interface PastBroadcast {
    id: string;
    title: string;
    date: string;
    duration: string;
    views: number;
    thumbnail: string;
    game: string;
}
interface ScheduleItem {
  id: string
  title: string
  date: string
  time: string
  game: string

}
export default function Livestreams() {
  const [streamStatus, setStreamStatus] = useState<TwitchStreamStatus>({
    isLive: false,
  });
  const [pastBroadcasts, setPastBroadcasts] = useState<PastBroadcast[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const fetchTwitchData = async () => {
      try {
        const response = await fetch('/api/twitch');
        if (!response.ok) {
          throw new Error(`Failed to fetch Twitch data: ${response.status}`);
        }

        const data = await response.json();
        setStreamStatus(data.streamStatus);
        setPastBroadcasts(data.pastBroadcasts);
        setSchedule(data.schedule);

      } catch (error) {
        console.error('Error fetching Twitch data:', error);
      }
    };

    fetchTwitchData();
    const interval = setInterval(fetchTwitchData, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Livestreams</h1>

      {/* Live Stream Section */}
      <section className="mb-12">
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
          <div className="relative">
            {streamStatus.isLive ? (
              <>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://player.twitch.tv/?channel=<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_TWITCH\_USER\_LOGIN\}&parent\=localhost&parent\=</span>{new URL(window.location.href).hostname}&autoplay=true`}
                    height="100%"
                    width="100%"
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="absolute top-4 left-4 bg-red-600 text-white text-sm px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  LIVE
                </div>
              </>
            ) : (
              <div className="aspect-video w-full bg-gray-800 flex flex-col items-center justify-center text-white p-8">
                <div className="mb-4">
                  <Image
                    src="/LiefLogoYT.png"
                    alt="Liefx Logo"
                    width={100}
                    height={100}
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Currently Offline</h2>
                <p className="text-gray-300 text-center max-w-2xl">
                  Liefx is not streaming right now. Check the schedule below for upcoming streams or watch past broadcasts!
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-800 text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">
                  {streamStatus.isLive ? streamStatus.title : 'Channel: Liefx'}
                </h2>
                {streamStatus.isLive && (
                  <div className="flex items-center mt-2 text-gray-300">
                    <span className="mr-4">{streamStatus.game}</span>
                    <span>{streamStatus.viewerCount} viewers</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Follow on Twitch
                </a>
                <a
                  href={`https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}/subscribe`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Subscribe
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stream Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Streams</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedule.length > 0 ? schedule.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.date}</div>
                      <div className="text-sm text-gray-5