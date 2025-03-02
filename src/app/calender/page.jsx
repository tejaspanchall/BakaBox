'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/header/Header';

const Calendar = () => {
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAnimeData = async (retry = 0) => {
    const query = `
      query ($season: MediaSeason, $year: Int) {
        Page(page: 1, perPage: 50) {
          media(season: $season, seasonYear: $year, type: ANIME, sort: [POPULARITY_DESC]) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            nextAiringEpisode {
              airingAt
              episode
              timeUntilAiring
            }
            airingSchedule {
              nodes {
                airingAt
                episode
                timeUntilAiring
              }
            }
            status
            episodes
          }
        }
      }
    `;

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            season: getCurrentSeason(),
            year: getCurrentYear()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const processedData = data.data.Page.media.map(anime => ({
        ...anime,
        airingSchedule: anime.airingSchedule?.nodes || []
      }));

      setAnimeData(processedData);
      setLoading(false);
      setError(null);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('animeCalendarData', JSON.stringify({
          data: processedData,
          timestamp: Date.now()
        }));
      }

    } catch (err) {
      console.error('Fetch error:', err);
      handleError(err, retry);
    }
  };

  const handleError = async (err, retry) => {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('animeCalendarData');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 3600000) {
          setAnimeData(data);
          setLoading(false);
          setError('Using cached data. Please refresh later.');
          return;
        }
      }
    }

    if (retry < 3) {
      setError(`Retrying... Attempt ${retry + 1}/3`);
      await delay(Math.min(1000 * Math.pow(2, retry), 5000));
      setRetryCount(retry + 1);
      fetchAnimeData(retry + 1);
    } else {
      setError('Failed to fetch anime data. Please try refreshing the page.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('animeCalendarData');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 3600000) {
          setAnimeData(data);
          setLoading(false);
        }
      }
    }
    
    fetchAnimeData();

    const refreshInterval = setInterval(() => {
      fetchAnimeData();
    }, 900000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) return 'WINTER';
    if (month >= 3 && month <= 5) return 'SPRING';
    if (month >= 6 && month <= 8) return 'SUMMER';
    return 'FALL';
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const isAiringNext = (anime) => {
    if (!anime.nextAiringEpisode) return false;
    const nextAiringTimes = animeData
      .filter(a => a.nextAiringEpisode)
      .map(a => a.nextAiringEpisode.timeUntilAiring);
    return anime.nextAiringEpisode.timeUntilAiring === Math.min(...nextAiringTimes);
  };

  const getDayOfWeek = (timestamp) => {
    if (!timestamp) return 'TBA';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'TBA';
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getOrderedDays = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = new Date().getDay();
    const orderedDays = [
      ...days.slice(currentDayIndex),
      ...days.slice(0, currentDayIndex)
    ];
    return [...orderedDays, 'TBA'];
  };

  const organizeAnimeByDay = () => {
    const orderedDays = getOrderedDays();
    const days = Object.fromEntries(orderedDays.map(day => [day, []]));

    animeData.forEach(anime => {
      const day = getDayOfWeek(anime.nextAiringEpisode?.airingAt);
      days[day].push({
        ...anime,
        airingTime: anime.nextAiringEpisode?.airingAt
          ? formatTime(anime.nextAiringEpisode.airingAt)
          : 'TBA'
      });
    });

    // Sort anime within each day by airing time
    Object.keys(days).forEach(day => {
      days[day].sort((a, b) => {
        if (a.airingTime === 'TBA') return 1;
        if (b.airingTime === 'TBA') return -1;
        return a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt;
      });
    });

    return days;
  };

  const AnimeCard = ({ anime }) => {
    const isNext = isAiringNext(anime);
    
    return (
      <div className="relative pt-3">
        {isNext && (
          <div className="absolute top-0 right-[-5px] bg-[#4D55CC] text-white px-2 py-1 rounded text-xs font-medium z-10">
            Airing Next
          </div>
        )}
        <div className="bg-gray-200 rounded-lg overflow-hidden shadow flex items-center p-3 h-20 transition-transform duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-md">
          <div className="flex-shrink-0 mr-4 relative w-[45px] h-[60px]">
            <Image
              src={anime.coverImage.large}
              alt={anime.title.english || anime.title.romaji}
              width={45}
              height={60}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="m-0 text-base text-gray-800 font-semibold mb-1 truncate">
              {anime.title.english || anime.title.romaji}
            </h3>
            <p className="m-0 text-sm text-gray-600">
              Ep {anime.nextAiringEpisode?.episode || '??'} 
              {anime.airingTime !== 'TBA' ? ` airing at ${anime.airingTime}` : ' (TBA)'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !animeData.length) {
    return (
      <div className="flex justify-center items-center min-h-screen font-['Chivo',_sans-serif]">
        <img src="/loading.gif" alt="Loading..." className="w-35 h-35 object-contain" />
      </div>
    );
  } 

  const organizedAnime = organizeAnimeByDay();
  const orderedDays = getOrderedDays();

  return (
    <div>
      <Header />
      <div className="max-w-[1400px] mx-auto px-8">
        {error && (
          <div className="bg-yellow-50 text-yellow-800 p-3 mb-4 border border-yellow-200 rounded text-center">
            {error}
          </div>
        )}
        {orderedDays.map(day => {
          const animeList = organizedAnime[day];
          if (animeList.length === 0) return null;
          
          return (
            <div key={day} className="mb-12">
              <h2 className="text-2xl text-gray-700 mb-4 font-semibold">{day}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {animeList.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;