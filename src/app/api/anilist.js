const ANILIST_API_URL = 'https://graphql.anilist.co';

// Common queries
const MEDIA_FRAGMENT = `
  id
  title {
    english
    romaji
  }
  coverImage {
    large
    extraLarge
  }
  bannerImage
  description
  genres
  meanScore
  episodes
  isAdult
`;

// Fetch data from AniList API with rate limiting
async function fetchFromAniList(query, variables, delay = 0) {
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const response = await fetch(ANILIST_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded for AniList API');
    }
    throw new Error(`AniList API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`AniList API errors: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

// Get anime by ID
export async function getAnimeById(id, delay = 0) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
      }
    }
  `;

  const data = await fetchFromAniList(query, { id }, delay);
  return data.data.Media;
}

// Get random anime
export async function getRandomAnime(page = 1) {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 50) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchFromAniList(query, { page });
  const animeList = data.data.Page.media;
  return animeList[Math.floor(Math.random() * animeList.length)];
}

// Get detailed user anime statistics
export async function getUserAnimeStats(username) {
  const query = `
    query ($username: String) {
      MediaListCollection(userName: $username, type: ANIME) {
        lists {
          entries {
            media {
              id
              title {
                romaji
                english
              }
              episodes
              duration
              genres
              seasonYear
              studios {
                nodes {
                  name
                }
              }
            }
            progress
            completedAt {
              year
              month
            }
            startedAt {
              year
              month
            }
            status
          }
        }
      }
    }
  `;

  const data = await fetchFromAniList(query, { username });
  return processAnimeData(data.data.MediaListCollection);
}

// Process anime data for user statistics
function processAnimeData(mediaListCollection) {
  if (!mediaListCollection?.lists) return null;

  let totalMinutes = 0;
  let genreCounts = {};
  let studioCounts = {};
  let animeList = [];
  let watchByYear = {};
  let watchByMonth = {};
  let completedCount = 0;
  
  mediaListCollection.lists.forEach(list => {
    list.entries.forEach(entry => {
      const episodes = entry.progress || 0;
      const duration = entry.media?.duration || 24;
      const watchMinutes = episodes * duration;
      
      totalMinutes += watchMinutes;
      
      entry.media?.genres?.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + watchMinutes;
      });
      
      entry.media?.studios?.nodes?.forEach(studio => {
        studioCounts[studio.name] = (studioCounts[studio.name] || 0) + watchMinutes;
      });
      
      animeList.push({
        id: entry.media.id,
        title: entry.media.title.english || entry.media.title.romaji,
        watchTime: watchMinutes,
        episodes: episodes,
        status: entry.status
      });
      
      const year = entry.completedAt?.year || entry.startedAt?.year;
      if (year) {
        watchByYear[year] = (watchByYear[year] || 0) + watchMinutes;
      }
      
      const month = entry.completedAt?.month || entry.startedAt?.month;
      if (year && month) {
        const key = `${year}-${month}`;
        watchByMonth[key] = (watchByMonth[key] || 0) + watchMinutes;
      }
      
      if (entry.status === "COMPLETED") {
        completedCount++;
      }
    });
  });

  const genreData = Object.entries(genreCounts)
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);
  
  const studioData = Object.entries(studioCounts)
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);
  
  const top5Anime = animeList
    .sort((a, b) => b.watchTime - a.watchTime)
    .slice(0, 5);
  
  const yearData = Object.entries(watchByYear)
    .map(([year, minutes]) => ({ year: parseInt(year), minutes }))
    .sort((a, b) => a.year - b.year);
  
  const mostWatchedYear = yearData.length > 0 
    ? yearData.reduce((max, current) => (current.minutes > max.minutes ? current : max)).year
    : null;
  
  const monthlyData = Object.entries(watchByMonth)
    .map(([key, minutes]) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month, minutes };
    })
    .sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year)
    .slice(-12);

  const years = Math.floor(totalMinutes / 525600);
  const months = Math.floor((totalMinutes % 525600) / 43800);
  const days = Math.floor((totalMinutes % 43800) / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return {
    timeData: { years, months, days, hours, minutes },
    genres: genreData,
    studios: studioData,
    top5: top5Anime,
    yearPattern: yearData,
    monthPattern: monthlyData,
    mostWatchedYear,
    completedCount
  };
}

// Get seasonal anime
export async function getSeasonalAnime(season, year, page = 1) {
  const query = `
    query ($season: MediaSeason, $year: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) {
          ${MEDIA_FRAGMENT}
          startDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  const data = await fetchFromAniList(query, { season, year, page });
  return data.data.Page.media;
}

// Helper function to format anime data
export function formatAnimeData(anime) {
  return {
    id: anime.id,
    title: anime.title.english || anime.title.romaji,
    description: anime.description?.replace(/<[^>]*>/g, '') || 'No description available',
    coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
    bannerImage: anime.bannerImage,
    genres: anime.genres,
    meanScore: anime.meanScore,
    episodes: anime.episodes,
    isAdult: anime.isAdult
  };
}

// Get characters with birthdays on a specific date
export async function getBirthdayCharacters(month, day, page = 1) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          hasNextPage
        }
        characters(sort: FAVOURITES_DESC, isBirthday: true) {
          id
          name {
            full
            native
          }
          image {
            large
          }
          dateOfBirth {
            year
            month
            day
          }
          media(sort: POPULARITY_DESC, perPage: 1) {
            nodes {
              title {
                romaji
                english
              }
            }
          }
          favourites
          description
        }
      }
    }
  `;

  let allCharacters = [];
  let hasNextPage = true;
  let currentPage = page;

  while (hasNextPage && currentPage <= 10) { // Limit to 10 pages to prevent infinite loops
    const variables = {
      page: currentPage,
      perPage: 50 // Maximum allowed by API
    };

    const data = await fetchFromAniList(query, variables);
    const pageInfo = data.data.Page.pageInfo;
    const pageCharacters = data.data.Page.characters;
    
    // Filter to ensure we only have characters with the exact birth date
    const birthdayCharacters = pageCharacters.filter(
      char => char.dateOfBirth && char.dateOfBirth.month === month && char.dateOfBirth.day === day
    );
    
    allCharacters = [...allCharacters, ...birthdayCharacters];
    hasNextPage = pageInfo.hasNextPage;
    currentPage++;
  }
  
  // Sort by number of favorites
  return allCharacters.sort((a, b) => b.favourites - a.favourites);
} 