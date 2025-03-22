'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">About Brody Moore (Liefx)</h1>
      
      {/* Profile Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-64 h-64">
              <Image 
                src="/LiefLogoYT.png" 
                alt="Brody Moore (Liefx)" 
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Rocket League Host, Content Creator, and Streamer</h2>
            <p className="text-gray-600 mb-4">
              Brody "Liefx" Moore is a Canadian Rocket League host, caster, and content creator. With a passion for gaming and esports, 
              Brody has established himself as a prominent figure in the Rocket League community as a host and caster for the Rocket League 
              Championship Series (RLCS).
            </p>
            <p className="text-gray-600 mb-4">
              Beyond Rocket League, Brody creates content focused on Star Citizen, gaming concepts, and various other titles across multiple 
              YouTube channels. He's also the host of the Rocket League Dojo podcast, where he goes beyond the surface of RLCS and dives 
              deeper into the personalities and stories within the esports industry.
            </p>
            <p className="text-gray-600">
              With his signature tagline "KEEP GAMIN' HARD," Brody continues to entertain and engage with his community through livestreams, 
              videos, and social media.
            </p>
          </div>
        </div>
      </section>
      
      {/* Career Highlights */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Career Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">RLCS Host & Caster</h3>
            <p className="text-gray-600">
              Established host and caster for the Rocket League Championship Series, bringing energy and insight to professional matches.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Content Creator</h3>
            <p className="text-gray-600">
              Creator of engaging content across multiple YouTube channels, focusing on Rocket League, Star Citizen, and gaming concepts.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Podcast Host</h3>
            <p className="text-gray-600">
              Host of the Rocket League Dojo podcast, diving deep into the personalities and stories within the esports industry.
            </p>
          </div>
        </div>
      </section>
      
      {/* Channels & Platforms */}
      <section className="bg-gray-100 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Find Me Online</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">YouTube Channels</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <a href="https://youtube.com/c/liefx" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
                  Liefx
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <a href="https://youtube.com/@LiefxRL" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
                  LiefX Rocket League
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <a href="#" className="text-gray-700 hover:text-green-600">
                  LiefSC
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <a href="#" className="text-gray-700 hover:text-green-600">
                  GFFBud
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <a href="#" className="text-gray-700 hover:text-green-600">
                  LeafyLongplays
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Social Media & Streaming</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="text-purple-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
                  </svg>
                </div>
                <a href="https://twitch.tv/Liefx" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
                  Twitch
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-blue-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <a href="https://twitter.com/liefx" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
                  Twitter
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-pink-500">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </div>
                <a href="https://www.instagram.com/liefx/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
                  Instagram
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="text-green-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <a href="https://open.spotify.com/show/6PBXwjIutQLwOUpSPaC7Ej" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
                  Lief's Lounge Podcast
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact & Business Inquiries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
          <div className="flex flex-col justify-center">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Business Inquiries</h3>
              <p className="text-gray-600 mb-4">
                For business inquiries, sponsorships, or collaboration opportunities, please use the contact form or reach out via email.
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">contact@liefx.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">DM on Twitter or Instagram</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
