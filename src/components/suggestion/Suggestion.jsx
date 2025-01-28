import React, { useState } from 'react';
import styles from './Suggestion.module.css';
import { RefreshCw } from 'lucide-react';

const AnimeCard = () => {
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

  const fetchRandomAnime = async () => {
    setLoading(true);
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
        episodes: randomAnime.episodes,
        id: randomAnime.id
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
    <div className={styles.containerFullPage}>
      <h1 className={styles.title}>{anime.title}</h1>
      <p className={styles.info}>Episodes: {anime.episodes} | Score: {anime.meanScore}%</p>
      {anime.coverImage && (
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className={styles.coverImage}
        />
      )}
      <p className={styles.description}>{anime.description}</p>
      <div className={styles.genreContainer}>
        {anime.genres.map((genre, index) => (
          <span key={index} className={styles.genre}>{genre}</span>
        ))}
      </div>
      <div className={styles.linksContainer}>
        <a 
          href={`https://www.anime-planet.com/anime/${encodeURIComponent(anime.title.replace(/ /g, '-'))}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.link}
        >
          View on Anime-Planet
        </a>
        <a 
          href={`https://myanimelist.net/anime/${anime.id}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.link}
        >
          View on MyAnimeList
        </a>
      </div>
      <button 
        onClick={fetchRandomAnime} 
        disabled={loading} 
        className={styles.button}
      >
        <RefreshCw className={`${styles.icon} ${loading ? styles.loading : ''}`} />
        Get Random Anime
      </button>
    </div>
  );
};

export default AnimeCard;
