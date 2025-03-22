'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Game item type
interface GameItem {
  id: string;
  name: string;
  hint: string;
  location: string;
  found: boolean;
  points: number;
}

// User points type
interface UserPoints {
  daily: number;
  total: number;
  lastPlayed: string | null;
}

export default function Game() {
  // State for game items
  const [gameItems, setGameItems] = useState<GameItem[]>([
    {
      id: 'item1',
      name: 'Hidden Logo',
      hint: 'Check the footer of the About page',
      location: '/about',
      found: false,
      points: 10
    },
    {
      id: 'item2',
      name: 'Secret Code',
      hint: 'Look closely at the featured content section',
      location: '/',
      found: false,
      points: 15
    },
    {
      id: 'item3',
      name: 'Easter Egg',
      hint: 'Explore the Content Hub navigation',
      location: '/content',
      found: false,
      points: 20
    }
  ]);

  // State for user points
  const [userPoints, setUserPoints] = useState<UserPoints>({
    daily: 0,
    total: 0,
    lastPlayed: null
  });

  // State for game status
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'completed'>('ready');
  
  // State for countdown
  const [countdown, setCountdown] = useState<number>(0);
  
  // State for leaderboard
  const [leaderboard, setLeaderboard] = useState<{name: string, points: number}[]>([
    { name: 'Player1', points: 450 },
    { name: 'GameFan22', points: 380 },
    { name: 'RLFanatic', points: 325 },
    { name: 'StarCitizen007', points: 290 },
    { name: 'TwitchViewer', points: 240 }
  ]);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedPoints = localStorage.getItem('liefx_game_points');
    const storedItems = localStorage.getItem('liefx_game_items');
    
    if (storedPoints) {
      setUserPoints(JSON.parse(storedPoints));
    }
    
    if (storedItems) {
      setGameItems(JSON.parse(storedItems));
    }
    
    // Check if user has played today
    const today = new Date().toDateString();
    if (storedPoints) {
      const points = JSON.parse(storedPoints);
      if (points.lastPlayed === today) {
        setGameStatus('completed');
      }
    }
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('liefx_game_points', JSON.stringify(userPoints));
    localStorage.setItem('liefx_game_items', JSON.stringify(gameItems));
  }, [userPoints, gameItems]);

  // Start the game
  const startGame = () => {
    setGameStatus('playing');
    setCountdown(60);
    
    // Reset items for new game
    setGameItems(gameItems.map(item => ({
      ...item,
      found: false
    })));
    
    // Reset daily points
    setUserPoints({
      ...userPoints,
      daily: 0
    });
  };

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStatus === 'playing' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (gameStatus === 'playing' && countdown === 0) {
      endGame();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameStatus, countdown]);

  // Find an item
  const findItem = (id: string) => {
    const updatedItems = gameItems.map(item => {
      if (item.id === id && !item.found) {
        return {
          ...item,
          found: true
        };
      }
      return item;
    });
    
    const foundItem = gameItems.find(item => item.id === id);
    if (foundItem && !foundItem.found) {
      setUserPoints({
        ...userPoints,
        daily: userPoints.daily + foundItem.points,
        total: userPoints.total + foundItem.points
      });
    }
    
    setGameItems(updatedItems);
    
    // Check if all items are found
    if (updatedItems.every(item => item.found)) {
      endGame();
    }
  };

  // End the game
  const endGame = () => {
    setGameStatus('completed');
    setUserPoints({
      ...userPoints,
      lastPlayed: new Date().toDateString()
    });
  };

  // Format time from seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Enter giveaway
  const enterGiveaway = () => {
    alert(`You've entered the monthly giveaway with ${userPoints.total} points!`);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Daily Scavenger Hunt</h1>
      
      {/* Game Explanation */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">How It Works</h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Welcome to the Daily Scavenger Hunt! Each day, you can play this game to find hidden items throughout the website.
            Every item you find earns you points that accumulate over time. At the end of each month, you can use your points
            to enter giveaways for exclusive merch and other prizes!
          </p>
          <ul className="mt-4">
            <li>Find all the hidden items before time runs out</li>
            <li>Each item is worth different point values</li>
            <li>You can play once per day</li>
            <li>Points accumulate throughout the month</li>
            <li>Use your points to enter monthly giveaways</li>
          </ul>
        </div>
      </section>
      
      {/* Game Interface */}
      <section className="bg-gray-100 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Game Controls */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-700">
                  {gameStatus === 'ready' ? 'Ready to Play?' : 
                   gameStatus === 'playing' ? 'Find the Items!' : 
                   'Daily Hunt Completed!'}
                </h2>
                {gameStatus === 'playing' && (
                  <div className="text-xl font-bold text-red-600">
                    Time: {formatTime(countdown)}
                  </div>
                )}
              </div>
              
              {gameStatus === 'ready' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    Ready to start today's scavenger hunt? You'll have 60 seconds to find all the hidden items!
                  </p>
                  <button 
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    Start Hunt
                  </button>
                </div>
              )}
              
              {gameStatus === 'playing' && (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {gameItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`border rounded-lg p-4 ${item.found ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-gray-600">{item.hint}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-700 font-bold mr-3">{item.points} pts</span>
                            {item.found ? (
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Found!</span>
                            ) : (
                              <button 
                                onClick={() => findItem(item.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                              >
                                Found It!
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <button 
                      onClick={endGame}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      End Hunt
                    </button>
                  </div>
                </div>
              )}
              
              {gameStatus === 'completed' && (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {userPoints.daily} Points Earned Today!
                    </div>
                    <p className="text-gray-600">
                      You've completed today's hunt. Come back tomorrow for more points!
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="text-xl font-bold text-gray-800 mb-2">
                      Total Points: {userPoints.total}
                    </div>
                    <button 
                      onClick={enterGiveaway}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      Enter Monthly Giveaway
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Next hunt available tomorrow. The more you play, the more chances to win!
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Leaderboard */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Leaderboard</h2>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-3 rounded-lg ${index === 0 ? 'bg-yellow-100' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-700' : 
                        'bg-gray-200'
                      } text-white font-bold text-sm`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <span className="font-bold">{player.points} pts</span>
                  </div>
                ))}
                
                {/* Current User */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-100 mt-4">
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full mr-3 bg-green-600 text-white font-bold text-sm">
                      ?
                    </span>
                    <span className="font-medium">You</span>
                  </div>
                  <span className="font-bold">{userPoints.total} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Monthly Prizes */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Monthly Prizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Signed Merch', points: 500, image: '/LiefLogoYT.png' },
            { name: 'Exclusive Discord Role', points: 300, image: '/LiefLogoYT.png' },
            { name: 'Game Key', points: 200, image: '/LiefLogoYT.png' }
          ].map((prize, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image 
                  src={prize.image} 
                  alt={prize.name} 
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-bold text-lg mb-1">{prize.name}</h3>
              <p className="text-gray-600 mb-3">{prize.points} points to enter</p>
              <button 
                className={`w-full py-2 rounded-lg font-bold ${
                  userPoints.total >= prize.points 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors`}
                disabled={userPoints.total < prize.points}
              >
                {userPoints.total >= prize.points ? 'Enter Giveaway' : `Need ${prize.points - userPoints.total} more points`}
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Rules */}
      <section className="bg-gray-800 text-white rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Rules & Information</h2>
        <div className="prose prose-invert max-w-none">
          <ul>
            <li>You can play the scavenger hunt once per day</li>
            <li>Points accumulate throughout the month</li>
            <li>Monthly giveaways reset on the 1st of each month</li>
            <li>Winners will be announced on Twitch and social media</li>
            <li>Multiple entries increase your chances of winning</li>
            <li>Prizes may vary each month</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
