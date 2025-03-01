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
      <div className="max-w-[1200px] mx-auto px-5 py-10 min-h-[calc(100vh-200px)]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 bg-gray-100 p-8 md:p-10 rounded-2xl shadow-md mb-8">
          <div className="flex-shrink-0 flex justify-center">
            <div className="relative w-[200px] h-[300px] md:w-[240px] md:h-[340px]">
              <Image
                src={anime.coverImage}
                alt={anime.title}
                fill
                className="object-cover rounded-xl shadow-md"
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-5 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">{anime.title}</h1>
            
            <div className="flex items-center gap-4 text-base text-gray-600 justify-center md:justify-start">
              <span>{anime.episodes} Episodes</span>
              <span className="text-gray-400">•</span>
              <span>{anime.meanScore}% Rating</span>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
              {anime.genres.slice(0, 4).map((genre, index) => (
                <span 
                  key={index} 
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm transition-colors duration-200 hover:bg-blue-500"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-gray-700 leading-relaxed text-base text-left">
              {showFullDescription ? anime.description : truncateDescription(anime.description)}
              {anime.description.split(' ').length > 50 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="bg-transparent border-none text-blue-600 cursor-pointer text-base p-0 underline ml-1 hover:text-blue-500"
                >
                  {showFullDescription ? ' Show Less' : ' Read More'}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-5 shadow-lg flex justify-center z-10">
        <button
          onClick={fetchRandomAnime}
          disabled={loading}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white border-none rounded-xl cursor-pointer text-base font-medium transition-all duration-200 hover:bg-blue-500 hover:translate-y-[-2px] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5" />
          Get Random Anime
        </button>
      </div>
    </div>
  );
};

export default RandomAnime;