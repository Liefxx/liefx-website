// src/app/livestreams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TwitchStreamStatus, PastBroadcast, ScheduleItem } from '@/types';

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
                    src={`https://player.twitch.tv/?channel=${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}&parent=localhost&parent=${new URL(window.location.href).hostname}&autoplay=true`}
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
                  Liefx is not streaming right now.  Check the schedule below for upcoming streams or watch past broadcasts!
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stream Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedule.length > 0 ? (
                  schedule.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.date}</div>
                        <div className="text-sm text-gray-500">{item.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.game}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-green-600 hover:text-green-900 mr-4">Set Reminder</button>
                        <a
                          href={`https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Channel
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      No upcoming streams scheduled at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Past Broadcasts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Past Broadcasts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pastBroadcasts.map((broadcast) => (
            <div key={broadcast.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={broadcast.thumbnail}
                  alt={broadcast.title}
                  width={400}
                  height={225}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {broadcast.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">{broadcast.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{broadcast.game}</span>
                  <span>{broadcast.views} views</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">Streamed {broadcast.date}</div>
                <a
                  href={`https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}/videos`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  Watch VOD →
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <a
            href={`https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}/videos`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 font-semibold"
          >
            View All Past Broadcasts →
          </a>
        </div>
      </section>

      {/* Chat Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Chat</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-96">
            <iframe
              src={`https://www.twitch.tv/embed/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}/chat?parent=localhost&parent=${new URL(window.location.href).hostname}`}
              height="100%"
              width="100%"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-gray-100 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Get Notified</h2>
        <p className="text-gray-600 mb-6">
          Never miss a stream! Subscribe to get notifications when Liefx goes live.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href={`https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"
              />
            </svg>
            Follow on Twitch
          </a>
          <a
            href="https://twitter.com/liefx"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
            Follow on Twitter
          </a>
          <a
            href="https://discord.gg/liefx"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
              />
            </svg>
            Join Discord
          </a>
        </div>
      </section>
    </div>
  );
}