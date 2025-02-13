import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import styles from './RandomAnime.module.css';
import Header from '../header/Header';

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

  React.useEffect(() => {
    fetchRandomAnime();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <img src="/assets/loading.gif" alt="Loading..." className={styles.loadingGif} />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.imageSection}>
            <img
              src={anime.coverImage}
              alt={anime.title}
              className={styles.coverImage}
            />
          </div>
          
          <div className={styles.contentSection}>
            <h1 className={styles.title}>{anime.title}</h1>
            
            <div className={styles.stats}>
              <span>{anime.episodes} Episodes</span>
              <span className={styles.dot}>•</span>
              <span>{anime.meanScore}% Rating</span>
            </div>

            <div className={styles.genres}>
              {anime.genres.slice(0, 4).map((genre, index) => (
                <span key={index} className={styles.genre}>
                  {genre}
                </span>
              ))}
            </div>

            <p className={styles.description}>
              {showFullDescription ? anime.description : truncateDescription(anime.description)}
              {anime.description.split(' ').length > 50 && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className={styles.readMoreButton}
                >
                  {showFullDescription ? ' Show Less' : ' Read More'}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={fetchRandomAnime}
          disabled={loading}
          className={styles.refreshButton}
        >
          <RefreshCw className={styles.icon} />
          Get Random Anime
        </button>
      </div>
    </div>
  );
};

export default RandomAnime;