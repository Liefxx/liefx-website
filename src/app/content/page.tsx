// src/app/content/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string; // Keep this as string for display
    publishedAtTimestamp: number; // Add this for calculations
    viewCount: string;
    channelTitle: string;
}

export default function Content() {
    const [activeTab, setActiveTab] = useState('all'); // Start with "All" active
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewedVideos, setViewedVideos] = useState<string[]>([]);

    const channels = [
        { id: 'all', name: 'All', channelId: '' }, // Add "All" tab. channelId is unused for "All"
        { id: 'liefx', name: 'Liefx', channelId: 'UC6PVHS7Iq-fJqMLpdebrhZQ' },
        { id: 'liefsc', name: 'LiefSC', channelId: 'UCQ1MqH7fQKh428jtrHt3AqQ' },
        { id: 'gffbud', name: 'GFFBud', channelId: 'UCNcPrGnjX40pc7hNhh1dZZA' },
        { id: 'leafylongplays', name: 'LeafyLongplays', channelId: 'UCuoKmwfP_ZULNZi_FXlwpiA' }
    ];

    useEffect(() => {
        // Load viewed video IDs from local storage
        const storedViewedVideos = localStorage.getItem('viewedVideos');
        if (storedViewedVideos) {
            setViewedVideos(JSON.parse(storedViewedVideos));
        }
    }, []); // Empty dependency array: runs only once on mount

    useEffect(() => {
        const fetchYouTubeVideos = async () => {
            setLoading(true);
            setError('');

            try {
                let fetchedVideos: YouTubeVideo[] = [];

                if (activeTab === 'all') {
                    // Fetch videos from ALL channels
                    const allVideos = await Promise.all(
                        channels.filter(c => c.id !== 'all').map(async (channel) => {
                            const response = await fetch(`/api/videos/${channel.channelId}`);
                            if (!response.ok) {
                                console.error(`Failed to fetch videos for channel ${channel.name}`);
                                return [];
                            }
                            const data: any[] = await response.json(); // Use any[] temporarily
                            // Add publishedAtTimestamp to each video
                            const videosWithTimestamps = data.map(v => ({
                                ...v,
                                publishedAtTimestamp: new Date(v.publishedAt).getTime(),
                            }));

                            return videosWithTimestamps;
                        })
                    );
                    fetchedVideos = allVideos.flat()
                        .sort((a, b) => b.publishedAtTimestamp - a.publishedAtTimestamp);


                } else {
                    // Fetch videos from a SINGLE channel
                    const channelId = channels.find(c => c.id === activeTab)?.channelId;
                    if (!channelId) {
                        throw new Error('Invalid channel ID');
                    }

                    const response = await fetch(`/api/videos/${channelId}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch videos');
                    }

                    const data: any[] = await response.json();
                      // Add publishedAtTimestamp to each video
                    fetchedVideos = data.map(v => ({
                        ...v,
                        publishedAtTimestamp: new Date(v.publishedAt).getTime(),
                    }));
                }
                setVideos(fetchedVideos);

            } catch (err) {
                console.error('Error fetching YouTube videos:', err);
                setError('Failed to load videos. Using placeholder data instead.');
                setVideos(getPlaceholderVideos(activeTab)); // Use updated placeholders
            } finally {
                setLoading(false);
            }
        };

        fetchYouTubeVideos();
    }, [activeTab]);

    // Placeholder videos (updated with timestamps)
    const getPlaceholderVideos = (channel: string): YouTubeVideo[] => {
        let channelName = channels.find(c => c.id === channel)?.name || 'Liefx';
        if (channel === 'all') {
            channelName = 'Placeholder';
        }

        const placeholders = [];
        const now = Date.now();
        for (let i = 1; i <= 12; i++) {
            placeholders.push({
                id: `placeholder-${i}`,
                title: `${channelName} Video ${i} - Click to watch on YouTube`,
                thumbnail: '/YTBanner_v1.png',
                publishedAt: new Date(now - (i * 24 * 60 * 60 * 1000)).toLocaleDateString(), // Simulate recent dates
                publishedAtTimestamp: now - (i * 24 * 60 * 60 * 1000), // i days ago
                viewCount: `${Math.floor(Math.random() * 10000)}`,
                channelTitle: channelName
            });
        }

        return placeholders;
    };



    // Function to check if a video should have the "NEW" label
    const isNewVideo = (video: YouTubeVideo) => {
        if (viewedVideos.includes(video.id)) {
            return false; // Already viewed
        }

        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const publishedTime = video.publishedAtTimestamp;

        if (publishedTime > thirtyDaysAgo) {
            return true; // Less than 30 days old
        } else {
            // Count videos newer than this one within the last 30 days
            const recentNewerVideos = videos.filter(v => v.publishedAtTimestamp > thirtyDaysAgo && v.publishedAtTimestamp > publishedTime).length;
            return recentNewerVideos < 3; // Show "NEW" if fewer than 3 newer videos in last 30 days
        }
    };

    // Function to handle video clicks and update local storage
    const handleVideoClick = (videoId: string) => {
        if (!viewedVideos.includes(videoId)) {
            const updatedViewedVideos = [...viewedVideos, videoId];
            setViewedVideos(updatedViewedVideos);
            localStorage.setItem('viewedVideos', JSON.stringify(updatedViewedVideos));
        }
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
                            onClick={() => {
                                console.log("Tab clicked:", channel.id);
                                setActiveTab(channel.id);
                            }}
                        >
                            {channel.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Channel Description */}
            <div className="mb-8">
                {activeTab === 'all' && (
                    <p className="text-gray-600">
                        A collection of the latest videos from all my channels!
                    </p>
                )}
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
                            onClick={() => handleVideoClick(video.id)} // Add click handler
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
                {/* "NEW" Label - Inline */}
                {isNewVideo(video) && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold ml-2">
                    NEW
                  </span>
                )}
                <span>{video.publishedAt}</span>
              </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Subscribe Button */}
            <div className="mt-12 text-center">
                {activeTab !== 'all' && (
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
                )}
                {activeTab === 'all' && (
                    <p className="text-gray-600">
                        Visit individual channel tabs to subscribe!
                    </p>
                )}
            </div>
        </div>
    );
}