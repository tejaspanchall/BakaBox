import React, { useState } from 'react';
import Header from '../header/Header';
import styles from './LifeOnAnime.module.css';

const LifeOnAnime = () => {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeData, setTimeData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countingStats, setCountingStats] = useState(null);

  const animateNumber = (start, end, duration, setValue) => {
    const startTime = performance.now();
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setValue(current);
      if (progress < 1) requestAnimationFrame(updateNumber);
    };
    requestAnimationFrame(updateNumber);
  };

  const fetchData = async (username) => {
    const query = `
      query ($username: String) {
        MediaListCollection(userName: $username, type: ANIME) {
          lists {
            entries {
              media {
                episodes
                duration
              }
              progress
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();
    if (data.errors) throw new Error(data.errors[0].message);
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your AniList username');
      return;
    }

    setIsLoading(true);
    setError('');
    setTimeData(null);
    setCountingStats(null);

    try {
      const response = await fetchData(username);
      if (!response.data?.MediaListCollection?.lists) throw new Error('No data found');

      let totalMinutes = 0;
      response.data.MediaListCollection.lists.forEach(list => {
        list.entries.forEach(entry => {
          const episodes = entry.progress || 0;
          const duration = entry.media?.duration || 24;
          totalMinutes += episodes * duration;
        });
      });

      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      setTimeData({ days, hours, minutes, totalMinutes });
      setCountingStats({ days: 0, hours: 0, minutes: 0 });

      animateNumber(0, days, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, days: value }))
      );
      animateNumber(0, hours, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, hours: value }))
      );
      animateNumber(0, minutes, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, minutes: value }))
      );

      setSubmitted(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setSubmitted(false);
    setTimeData(null);
    setCountingStats(null);
    setError('');
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        {!submitted ? (
          <>
            <div className={styles.header}>
              <h1>⏳ Your Life on Anime</h1>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="AniList Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
              <button type="submit" className={styles.button} disabled={isLoading || !username}>
                {isLoading ? '🔄' : '✨'}
              </button>
            </form>
            {error && <div className={styles.error}>{error}</div>}
          </>
        ) : (
          <div className={styles.results}>
            <h2 className={styles.usernameMessage}>
              Hey <span className={styles.username}>{username}</span>, <br></br> you've successfully wasted this much time watching anime!
            </h2>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{countingStats.days}</span>
                <span className={styles.statLabel}>days</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{countingStats.hours}</span>
                <span className={styles.statLabel}>hrs</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{countingStats.minutes}</span>
                <span className={styles.statLabel}>min</span>
              </div>
            </div>
            {timeData && <p className={styles.totalTime}>🎬 {timeData.totalMinutes.toLocaleString()} minutes total</p>}
            <button className={styles.resetButton} onClick={handleReset}>🔄 Reset</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeOnAnime;
