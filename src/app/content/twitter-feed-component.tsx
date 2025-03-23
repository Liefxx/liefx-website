'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
  };
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  media?: {
    type: string;
    url: string;
  }[];
}

export default function TwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Twitter username
  const twitterUsername = 'liefx';
  
  useEffect(() => {
    const fetchTwitterData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // In a production environment, you would use the Twitter API with proper authentication
        // For this demo, we'll simulate the API response
        const tweetsResponse = await simulateTwitterAPI(twitterUsername);
        
        if (tweetsResponse.data && tweetsResponse.data.length > 0) {
          setTweets(tweetsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching Twitter data:', err);
        setError('Failed to load Twitter data. Using placeholder data instead.');
        
        // Fallback to placeholder data
        setTweets(getPlaceholderTweets());
      } finally {
        setLoading(false);
      }
    };
    
    fetchTwitterData();
  }, []);
  
  // Simulate Twitter API call (in production, use actual Twitter API)
  const simulateTwitterAPI = async (username: string) => {
    // This is a simulation function - in production, use actual Twitter API
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          data: getPlaceholderTweets()
        });
      }, 500);
    });
  };
  
  // Format date (e.g., "2023-01-01T00:00:00Z" -> "Jan 1, 2023")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    // If it's today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    
    // If it's this year, don't show year
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format metrics count (e.g., 1500 -> 1.5K)
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  // Process tweet text to add links, hashtags, and mentions
  const processTweetText = (text: string): JSX.Element => {
    // Replace URLs with links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withUrls = text.split(urlRegex);
    
    // Replace hashtags and mentions
    const parts = withUrls.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      
      // Process hashtags and mentions
      const hashtagRegex = /#(\w+)/g;
      const mentionRegex = /@(\w+)/g;
      
      let processed = part;
      let elements: JSX.Element[] = [];
      let lastIndex = 0;
      
      // Find all hashtags and mentions
      const tokens: {type: 'hashtag' | 'mention', text: string, index: number}[] = [];
      
      let match;
      while ((match = hashtagRegex.exec(part)) !== null) {
        tokens.push({
          type: 'hashtag',
          text: match[0],
          index: match.index
        });
      }
      
      while ((match = mentionRegex.exec(part)) !== null) {
        tokens.push({
          type: 'mention',
          text: match[0],
          index: match.index
        });
      }
      
      // Sort tokens by index
      tokens.sort((a, b) => a.index - b.index);
      
      // Build elements
      for (const token of tokens) {
        // Add text before token
        if (token.index > lastIndex) {
          elements.push(
            <span key={`text-${lastIndex}`}>
              {part.substring(lastIndex, token.index)}
            </span>
          );
        }
        
        // Add token
        if (token.type === 'hashtag') {
          elements.push(
            <a 
              key={`hashtag-${token.index}`} 
              href={`https://twitter.com/hashtag/${token.text.substring(1)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {token.text}
            </a>
          );
        } else {
          elements.push(
            <a 
              key={`mention-${token.index}`} 
              href={`https://twitter.com/${token.text.substring(1)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {token.text}
            </a>
          );
        }
        
        lastIndex = token.index + token.text.length;
      }
      
      // Add remaining text
      if (lastIndex < part.length) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {part.substring(lastIndex)}
          </span>
        );
      }
      
      return elements.length > 0 ? elements : part;
    });
    
    // Flatten the array
    return <>{parts}</>;
  };
  
  // Get placeholder tweets data
  const getPlaceholderTweets = (): Tweet[] => {
    const tweetTexts = [
      "Just wrapped up another amazing RLCS broadcast! Thanks to everyone who tuned in. #RocketLeague #RLCS",
      "Excited to announce I'll be casting the upcoming @RLEsports tournament next weekend! #RocketLeague",
      "New Star Citizen video is up on my channel! Check out the latest 4.0 exploration gameplay. https://youtube.com/watch?v=example",
      "Streaming some Rocket League ranked tonight at 7PM EST. Come hang out! https://twitch.tv/Liefx",
      "Thanks to everyone who participated in yesterday's giveaway! Congrats to @RandomUser for winning the signed jersey!",
      "Just hit Champion rank again this season! The grind continues. #RocketLeague #RankedGrind",
      "What games are you all playing this weekend? Looking for some new recommendations!",
      "New merch designs coming soon! Here's a sneak peek at what's coming to the store next month."
    ];
    
    const tweets = [];
    
    for (let i = 0; i < tweetTexts.length; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(i / 2));
      date.setHours(date.getHours() - (i % 2) * 6);
      
      tweets.push({
        id: `placeholder-tweet-${i}`,
        text: tweetTexts[i],
        created_at: date.toISOString(),
        author: {
          name: 'Brody Moore',
          username: twitterUsername,
          profile_image_url: '/LiefLogoYT.png'
        },
        public_metrics: {
          retweet_count: Math.floor(Math.random() * 50),
          reply_count: Math.floor(Math.random() * 30),
          like_count: Math.floor(Math.random() * 200) + 50,
          quote_count: Math.floor(Math.random() * 10)
        },
        media: i % 3 === 0 ? [
          {
            type: 'photo',
            url: '/YTBanner_v1.png'
          }
        ] : undefined
      });
    }
    
    return tweets;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Latest Tweets</h2>
        <a
          href={`https://twitter.com/${twitterUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 font-semibold flex items-center"
        >
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Follow
        </a>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            {error}
          </p>
        </div>
      )}
      
      {/* Tweets List */}
      {!loading && (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                {/* Tweet Header */}
                <div className="flex items-start mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                    <Image
                      src={tweet.author.profile_image_url}
                      alt={tweet.author.name}
                      fill
                      className="object-cover"
                      unoptimized={tweet.author.profile_image_url.startsWith('http')}
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900">{tweet.author.name}</span>
                      <svg className="w-4 h-4 text-blue-500 ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                      </svg>
                    </div>
                    <div className="text-gray-500">@{tweet.author.username}</div>
                  </div>
                  <div className="ml-auto text-gray-500 text-sm">
                    {formatDate(tweet.created_at)}
                  </div>
                </div>
                
                {/* Tweet Content */}
                <div className="mb-3 text-gray-800">
                  {processTweetText(tweet.text)}
                </div>
                
                {/* Tweet Media */}
                {tweet.media && tweet.media.length > 0 && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <div className="relative h-64 w-full">
                      <Image
                        src={tweet.media[0].url}
                        alt="Tweet media"
                        fill
                        className="object-cover"
                        unoptimized={tweet.media[0].url.startsWith('http')}
                      />
                    </div>
                  </div>
                )}
                
                {/* Tweet Actions */}
                <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"/>
                    </svg>
                    <span>{formatCount(tweet.public_metrics.reply_count)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"/>
                    </svg>
                    <span>{formatCount(tweet.public_metrics.retweet_count)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"/>
                    </svg>
                    <span>{formatCount(tweet.public_metrics.like_count)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"/>
                      <path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"/>
                    </svg>
                    <span>{formatCount(tweet.public_metrics.quote_count)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* View More Button */}
      <div className="mt-6 text-center">
        <a
          href={`https://twitter.com/${twitterUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
        >
          View More Tweets
        </a>
      </div>
    </div>
  );
}
