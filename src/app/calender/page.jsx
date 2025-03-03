'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, AlertTriangle } from 'lucide-react';

const Calendar = () => {
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAnimeData = async (retry = 0) => {
    setIsRefreshing(true);
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
              extraLarge
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
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
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
    }, 900000);

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

  const formatTimeUntilAiring = (seconds) => {
    if (!seconds) return null;
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
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
          : 'TBA',
        timeUntil: anime.nextAiringEpisode?.timeUntilAiring
          ? formatTimeUntilAiring(anime.nextAiringEpisode.timeUntilAiring)
          : null
      });
    });

    Object.keys(days).forEach(day => {
      days[day].sort((a, b) => {
        if (a.airingTime === 'TBA') return 1;
        if (b.airingTime === 'TBA') return -1;
        return a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt;
      });
    });

    return days;
  };

  const AnimeListItem = ({ anime }) => {
    const isNext = isAiringNext(anime);
    const getCurrentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const isToday = getDayOfWeek(anime.nextAiringEpisode?.airingAt) === getCurrentDayName;
    
    return (
      <div className={`relative transition-all duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
        <div className="flex items-center py-3 border-b border-gray-100 hover:bg-gray-50">
          <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden mr-4">
            <Image
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={anime.title.english || anime.title.romaji}
              fill
              className="object-cover"
              quality={80}
            />
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center">
              <h3 className="text-sm md:text-base font-medium text-gray-800 truncate mr-2">
                {anime.title.english || anime.title.romaji}
              </h3>
              {isNext && (
                <span className="bg-[#4D55CC] text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                  NEXT
                </span>
              )}
            </div>
            
            <div className="flex items-center text-xs md:text-sm text-gray-500 mt-1">
              <div className="flex items-center mr-4">
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${isToday ? 'bg-green-500' : 'bg-[#4D55CC]'}`}></div>
                <span>Ep {anime.nextAiringEpisode?.episode || '??'}</span>
              </div>
              
              <div className="mr-4">
                {anime.airingTime !== 'TBA' ? anime.airingTime : 'Time TBA'}
              </div>
              
              {anime.timeUntil && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 text-gray-400" />
                  <span>{anime.timeUntil}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !animeData.length) {
    return (
      <div className="flex flex-col justify-center items-center">
        <img src="/loading.gif" alt="Loading..." className="w-40 h-40 object-contain mb-4" />
      </div>
    );
  } 

  const organizedAnime = organizeAnimeByDay();
  const orderedDays = getOrderedDays();

  return (
    <div className="font-['Chivo',_sans-serif] min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
        
        <div className="pt-2">
          {orderedDays.map(day => {
            const animeList = organizedAnime[day];
            if (animeList.length === 0) return null;
            
            const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const isCurrentDay = day === currentDay;
            
            return (
              <div key={day} className="mb-8">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-3 z-10 border-b border-gray-200">
                  <h2 className={`text-lg md:text-xl font-bold ${isCurrentDay ? 'text-[#4D55CC]' : 'text-gray-700'}`}>
                    {day}
                  </h2>
                  {isCurrentDay && (
                    <span className="bg-[#4D55CC] text-white text-xs px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                
                <div className="divide-y divide-gray-50">
                  {animeList.map(anime => (
                    <AnimeListItem key={anime.id} anime={anime} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;