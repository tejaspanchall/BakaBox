import React, { useState, useEffect } from 'react';
import styles from './Calender.module.css';
import Header from '../header/Header';

const Calendar = () => {
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAnimeData = async (retry = 0) => {
    const query = `
      query ($season: MediaSeason, $year: Int) {
        Page(page: 1, perPage: 100) {
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
            }
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

      setAnimeData(data.data.Page.media);
      setLoading(false);
      setError(null);
      
      // Store data in localStorage as a cache
      localStorage.setItem('animeCalendarData', JSON.stringify({
        data: data.data.Page.media,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Fetch error:', err);
      
      // If we have cached data, use it temporarily
      const cachedData = localStorage.getItem('animeCalendarData');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Use cached data if it's less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          setAnimeData(data);
          setLoading(false);
          setError('Using cached data. Please refresh later.');
          return;
        }
      }

      // Implement exponential backoff for retries
      if (retry < 3) {
        setError(`Retrying... Attempt ${retry + 1}/3`);
        await delay(Math.min(1000 * Math.pow(2, retry), 5000));
        setRetryCount(retry + 1);
        fetchAnimeData(retry + 1);
      } else {
        setError('Failed to fetch anime data. Please try refreshing the page.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Try to load cached data first
    const cachedData = localStorage.getItem('animeCalendarData');
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Use cached data if it's less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        setAnimeData(data);
        setLoading(false);
      }
    }
    
    // Fetch fresh data
    fetchAnimeData();

    // Set up auto-refresh every 15 minutes
    const refreshInterval = setInterval(() => {
      fetchAnimeData();
    }, 900000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Rest of the component code remains the same...
  // (Keep all the existing functions and JSX)

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

    Object.keys(days).forEach(day => {
      days[day].sort((a, b) => {
        if (a.airingTime === 'TBA') return 1;
        if (b.airingTime === 'TBA') return -1;
        return a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt;
      });
    });

    return days;
  };

  if (loading && !animeData.length) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const organizedAnime = organizeAnimeByDay();
  const orderedDays = getOrderedDays();

  return (
    <div>
      <Header />
      <div className={styles.container}>
      {error && <div className={styles.errorBanner}>{error}</div>}
      {orderedDays.map(day => {
        const animeList = organizedAnime[day];
        if (animeList.length === 0) return null;
        
        return (
          <div key={day} className={styles.daySection}>
            <h2 className={styles.dayTitle}>{day}</h2>
            <div className={styles.animeGrid}>
              {animeList.map(anime => (
                <div key={anime.id} className={styles.animeCard}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english || anime.title.romaji}
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.animeInfo}>
                    <h3 className={styles.animeTitle}>
                      {anime.title.english || anime.title.romaji}
                    </h3>
                    <p className={styles.episodeInfo}>
                      Ep {anime.nextAiringEpisode?.episode || '??'} 
                      {anime.airingTime !== 'TBA' ? ` aired at ${anime.airingTime}` : ' (TBA)'}
                    </p>
                  </div>
                </div>
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