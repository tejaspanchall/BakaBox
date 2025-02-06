import React, { useState } from 'react';
import Header from '../header/Header';
import styles from './LifeOnAnime.module.css';

const TimeUnit = ({ value, label }) => {
  return (
    <div className={styles.timeUnit}>
      <div className={styles.value}>{String(value).padStart(2, '0')}</div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

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

      const years = Math.floor(totalMinutes / (525600));
      const months = Math.floor((totalMinutes % 525600) / 43800);
      const days = Math.floor((totalMinutes % 43800) / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      setTimeData({ years, months, days, hours, minutes });
      setCountingStats({ years: 0, months: 0, days: 0, hours: 0, minutes: 0 });

      animateNumber(0, years, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, years: value }))
      );
      animateNumber(0, months, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, months: value }))
      );
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
    <div className={styles.mainContainer}>
      {!submitted ? (
        <div className={styles.formSection}>
          <div className={styles.header}>
            <h1>⏳ Your Life on Anime</h1>
            <br />
            <h4>Enter your AniList username</h4>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="eg. joyboy"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoading || !username}
            >
              {isLoading ? '🔄' : '✨'}
            </button>
          </form>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      ) : (
        <div className={styles.results}>
          <h2 className={styles.usernameMessage}>
           👋 Hey <span className={styles.username}>{username}</span>, <br/>
           Congrats! You wasted this much of your time on anime instead of a new skill xD
          </h2>
          <div className={styles.clock}>
            {countingStats && (
              <>
                <TimeUnit value={countingStats.years} label="YEARS" />
                <div className={styles.separator}>:</div>
                <TimeUnit value={countingStats.months} label="MONTHS" />
                <div className={styles.separator}>:</div>
                <TimeUnit value={countingStats.days} label="DAYS" />
                <div className={styles.separator}>:</div>
                <TimeUnit value={countingStats.hours} label="HOURS" />
                <div className={styles.separator}>:</div>
                <TimeUnit value={countingStats.minutes} label="MINS" />
              </>
            )}
          </div>
          <button
            onClick={handleReset}
            className={styles.resetButton}
          >
            🔄 Reset
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default LifeOnAnime;