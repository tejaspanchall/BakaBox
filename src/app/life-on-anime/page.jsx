'use client';

import { useState } from 'react';
import Header from '@/components/header/Header';

const TimeUnit = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-2">
      <div className="font-mono text-[#1f2937] font-semibold text-center min-w-[2ch] text-[2.5rem] sm:text-[4rem]">
        {String(value).padStart(2, '0')}
      </div>
      <span className="font-mono text-[#6b7280] text-[0.75rem] sm:text-[0.875rem] tracking-wider">
        {label}
      </span>
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
    <div className="box-border m-0 p-0">
      <Header />
      <div className="p-16 sm:p-4 sm:pt-8 max-sm:p-2 max-sm:pt-8">
        {!submitted ? (
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-[1.5rem] sm:text-[2.25rem] font-bold text-[#1f2937]">
                ⏳ Your Life on Anime
              </h1>
              <br />
              <h4 className="text-[#364252]">
                Enter your AniList username
              </h4>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 max-sm:flex-col">
              <input
                type="text"
                placeholder="eg. joyboy"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 p-3 border-2 border-[#e5e7eb] rounded-lg text-base outline-none focus:border-[#3b82f6] transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#3b82f6] text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full"
                disabled={isLoading || !username}
              >
                {isLoading ? '🔄' : '✨'}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-[#fee2e2] text-[#dc2626] rounded-lg">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-[1.25rem] sm:text-[1.5rem] mb-8 leading-relaxed">
              👋 Hey <span className="font-bold text-[#3b82f6]">{username}</span>, <br/>
              Congrats! You wasted this much of your time on anime instead of a new skill xD
            </h2>
            <div className="flex flex-wrap justify-center gap-4 p-4 sm:p-8 mx-auto max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:py-4 max-sm:px-0 max-sm:gap-1 max-sm:w-full max-sm:scrollbar-hide">
              {countingStats && (
                <>
                  <TimeUnit value={countingStats.years} label="YEARS" />
                  <div className="font-mono text-[2.5rem] sm:text-[4rem] text-[#1f2937] flex items-center px-1 sm:px-2 opacity-50 max-sm:text-[1.5rem] max-sm:px-0.5 max-sm:flex-shrink-0">:</div>
                  <TimeUnit value={countingStats.months} label="MONTHS" />
                  <div className="font-mono text-[2.5rem] sm:text-[4rem] text-[#1f2937] flex items-center px-1 sm:px-2 opacity-50 max-sm:text-[1.5rem] max-sm:px-0.5 max-sm:flex-shrink-0">:</div>
                  <TimeUnit value={countingStats.days} label="DAYS" />
                  <div className="font-mono text-[2.5rem] sm:text-[4rem] text-[#1f2937] flex items-center px-1 sm:px-2 opacity-50 max-sm:text-[1.5rem] max-sm:px-0.5 max-sm:flex-shrink-0">:</div>
                  <TimeUnit value={countingStats.hours} label="HOURS" />
                  <div className="font-mono text-[2.5rem] sm:text-[4rem] text-[#1f2937] flex items-center px-1 sm:px-2 opacity-50 max-sm:text-[1.5rem] max-sm:px-0.5 max-sm:flex-shrink-0">:</div>
                  <TimeUnit value={countingStats.minutes} label="MINS" />
                </>
              )}
            </div>
            <button
              onClick={handleReset}
              className="mt-8 px-6 py-3 bg-[#3b82f6] text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-[#2563eb]"
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