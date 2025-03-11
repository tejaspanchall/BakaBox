"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, Play, Clock } from 'lucide-react';
import Image from 'next/image';
 
const RandomAnime = () => {
  const [anime, setAnime] = useState({
    title: '',
    description: '',
    coverImage: '',
    genres: [],
    meanScore: 0,
    episodes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const truncateDescription = (text, wordCount = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const fetchRandomAnime = async () => {
    setLoading(true);
    setIsRefreshing(true);
    setShowFullDescription(false);
    try {
      const page = Math.floor(Math.random() * 50) + 1;
      
      const query = `
        query ($page: Int) {
          Page(page: $page, perPage: 50) {
            media(type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                english
                romaji
              }
              description
              coverImage {
                large
                extraLarge
              }
              genres
              meanScore
              episodes
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { page }
        }),
      });

      const data = await response.json();
      const animeList = data.data.Page.media;
      const randomAnime = animeList[Math.floor(Math.random() * animeList.length)];

      setAnime({
        title: randomAnime.title.english || randomAnime.title.romaji,
        description: randomAnime.description?.replace(/<[^>]*>/g, '') || 'No description available',
        coverImage: randomAnime.coverImage.extraLarge || randomAnime.coverImage.large,
        genres: randomAnime.genres,
        meanScore: randomAnime.meanScore,
        episodes: randomAnime.episodes
      });
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchRandomAnime();
  }, []);

  if (loading || isRefreshing) {
    return (
      <div className="flex flex-col justify-center items-center h-full py-40">
        <img src="/loading.gif" alt="Loading..." className="w-37 h-37 object-contain mb-4" />
      </div>
    );
  }

  return (
    <div className="font-['Chivo',_sans-serif]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-20">
        <div className="bg-gray-100 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
          <div className="md:hidden">
            <div className="relative w-full h-56 bg-gray-200">
              <Image
                src={anime.coverImage}
                alt={anime.title}
                fill
                className="object-cover"
                priority
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{anime.meanScore}%</span>
                </div>
                <h1 className="text-xl font-bold leading-tight mb-2">{anime.title}</h1>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Play className="w-4 h-4" />
                  <span>{anime.episodes} Episodes</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {anime.genres.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-[#4D55CC] text-white px-2 py-0.5 rounded-full text-xs mb-1"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="mb-4">
                <h2 className="text-sm uppercase font-bold text-gray-500 mb-2">Synopsis</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {showFullDescription ? anime.description : truncateDescription(anime.description, 40)}
                  {anime.description.split(' ').length > 40 && (
                    <button 
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="bg-transparent border-none text-[#4D55CC] cursor-pointer text-sm p-0 underline ml-1"
                    >
                      {showFullDescription ? ' Show Less' : ' Read More'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-[280px_1fr] gap-0">
              <div className="relative">
                <div className="sticky top-0">
                  <div className="relative h-[420px]">
                    <Image
                      src={anime.coverImage}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      priority
                      quality={90}
                    />
                  </div>
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{anime.meanScore}%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-4">{anime.title}</h1>
                
                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-[#4D55CC]" />
                    <span className="font-medium">{anime.episodes} Episodes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {anime.genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className="bg-[#4D55CC] text-white px-3 py-1 rounded-full text-sm transition-colors duration-200 hover:bg-[#7A73D1]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <div>
                  <h2 className="text-sm uppercase font-bold text-gray-500 mb-3">Synopsis</h2>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {showFullDescription ? anime.description : truncateDescription(anime.description)}
                    {anime.description.split(' ').length > 50 && (
                      <button 
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="bg-transparent border-none text-[#4D55CC] cursor-pointer text-base p-0 underline ml-1 hover:text-[#7A73D1]"
                      >
                        {showFullDescription ? ' Show Less' : ' Read More'}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0px_-4px_6px_rgba(0,0,0,0.1)] flex justify-center z-10">
        <button
          onClick={fetchRandomAnime}
          disabled={loading || isRefreshing}
          className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-[#4D55CC] text-white border-none rounded-xl cursor-pointer text-base font-medium transition-all duration-200 hover:bg-[#7A73D1] hover:translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Finding Anime...' : 'Get Random Anime'}
        </button>
      </div>
    </div>
  );
};

export default RandomAnime;