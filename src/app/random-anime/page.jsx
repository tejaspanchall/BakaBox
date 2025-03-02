"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/header/Header';
 
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

  const truncateDescription = (text, wordCount = 50) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const fetchRandomAnime = async () => {
    setLoading(true);
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
        coverImage: randomAnime.coverImage.large,
        genres: randomAnime.genres,
        meanScore: randomAnime.meanScore,
        episodes: randomAnime.episodes
      });
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomAnime();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen font-['Chivo',_sans-serif]">
        <img src="/loading.gif" alt="Loading..." className="w-35 h-35 object-contain" />
      </div>
    );
  }

  return (
    <div className="font-['Chivo',_sans-serif]">
      <Header />
      <div className="max-w-[1200px] mx-auto px-5 py-6 md:py-10 min-h-[calc(100vh-200px)] mb-12 md:mb-15">
        <div className="bg-gray-100 p-5 md:p-10 rounded-2xl shadow-md mb-8">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex gap-4">
              {/* Image Container */}
              <div className="w-1/3">
                <div className="relative w-full pt-[150%] rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={anime.coverImage}
                    alt={anime.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Title and Details Container - Removed line-clamp-2 from title */}
              <div className="w-2/3 flex flex-col justify-start">
                <h1 className="text-xl font-bold text-gray-800 mb-2">{anime.title}</h1>
                
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{anime.episodes} Episodes</span>
                    <span className="text-gray-400">•</span>
                    <span>{anime.meanScore}% Rating</span>
                  </div>
                </div>

                {/* Show all genres rather than slicing */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {anime.genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className="bg-[#4D55CC] text-white px-2 py-0.5 rounded-full text-xs mb-1"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Description - Full Width Below on Mobile */}
            <div className="mt-5 pt-4 border-t border-gray-200">
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

          {/* Desktop Layout */}
          <div className="hidden md:flex flex-row gap-10">
            <div className="flex-shrink-0">
              <div className="relative w-[240px] h-[340px]">
                <Image
                  src={anime.coverImage}
                  alt={anime.title}
                  fill
                  className="object-cover rounded-xl shadow-md"
                />
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-5">
              <h1 className="text-4xl font-bold text-gray-800 leading-tight">{anime.title}</h1>
              
              <div className="flex items-center gap-4 text-base text-gray-600">
                <span>{anime.episodes} Episodes</span>
                <span className="text-gray-400">•</span>
                <span>{anime.meanScore}% Rating</span>
              </div>

              {/* Show all genres rather than slicing */}
              <div className="flex flex-wrap gap-2.5">
                {anime.genres.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-[#4D55CC] text-white px-4 py-1.5 rounded-full text-sm transition-colors duration-200 hover:bg-[#7A73D1] mb-1"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
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

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 md:p-5 shadow-[0px_-4px_6px_rgba(0,0,0,0.1)] flex justify-center z-10">
        <button
          onClick={fetchRandomAnime}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-[#4D55CC] text-white border-none rounded-xl cursor-pointer text-base font-medium transition-all duration-200 hover:bg-[#7A73D1] hover:translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5" />
          Get Random Anime
        </button>
      </div>
    </div>
  );
};

export default RandomAnime;