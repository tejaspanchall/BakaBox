import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import styles from './RandomAnime.module.css';
import Header from '../header/Header';

const RandomAnime = () => {
  const [anime, setAnime] = useState({
    title: 'Loading...',
    description: '',
    coverImage: '',
    genres: [],
    meanScore: 0,
    episodes: 0,
    id: 0
  });
  const [loading, setLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const truncateDescription = (text, wordCount = 70) => {
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
                extraLarge
                large
              }
              genres
              meanScore
              episodes
              season
              seasonYear
              status
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
        episodes: randomAnime.episodes,
        id: randomAnime.id,
        season: randomAnime.season,
        seasonYear: randomAnime.seasonYear,
        status: randomAnime.status
      });
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRandomAnime();
  }, []);

  return (
    <div>
      <Header />
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <div className={styles.coverImageContainer}>
            {anime.coverImage && (
              <img
                src={anime.coverImage}
                alt={anime.title}
                className={styles.coverImage}
              />
            )}
          </div>
          
          <div className={styles.infoContainer}>
            <h1 className={styles.title}>{anime.title}</h1>
            
            <div className={styles.metadata}>
              <span>{anime.episodes} Episodes</span>
              <span className={styles.dot}>•</span>
              <span>{anime.meanScore}% Rating</span>
              {anime.season && (
                <>
                  <span className={styles.dot}>•</span>
                  <span>{anime.season} {anime.seasonYear}</span>
                </>
              )}
            </div>

            <div className={styles.genres}>
              {anime.genres.map((genre, index) => (
                <span key={index} className={styles.genre}>
                  {genre}
                </span>
              ))}
            </div>

            <div className={styles.descriptionContainer}>
              <p className={styles.description}>
                {showFullDescription ? anime.description : truncateDescription(anime.description)}
              </p>
              {anime.description.split(' ').length > 70 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className={styles.readMoreButton}
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.fixedButtonContainer}>
        <button
          onClick={fetchRandomAnime}
          disabled={loading}
          className={styles.button}
        >
          <RefreshCw className={`${styles.icon} ${loading ? styles.spinning : ''}`} />
          Get Random Anime
        </button>
      </div>
    </div>
    </div>
  );
};

export default RandomAnime;