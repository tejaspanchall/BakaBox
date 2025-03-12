'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getUserAnimeStats } from '@/app/api/anilist';

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

const getRoastMessage = (timeData) => {
  const totalMinutes = 
    timeData.years * 525600 + 
    timeData.months * 43800 + 
    timeData.days * 1440 + 
    timeData.hours * 60 + 
    timeData.minutes;
  
  if (totalMinutes > 525600) {
    return `You've spent ${timeData.years} years watching anime. You could have learned ${Math.floor(timeData.years * 2)} new languages!`;
  } else if (totalMinutes > 262800) {
    return `You're only ${6 - (totalMinutes / 43800)} months away from a full PhD in Anime Studies.`;
  } else if (totalMinutes > 87600) {
    return `In the time you spent watching anime, you could have read ${Math.floor(totalMinutes / 300)} books!`;
  } else if (totalMinutes > 43800) {
    return `You've spent a month of your life on anime. That's a whole vacation's worth!`;
  } else {
    return `${totalMinutes / 1440} days watching anime? Rookie numbers, you need to pump those up!`;
  }
};

const LifeOnAnime = () => {
  const [username, setUsername] = useState('');
  const [compareUsername, setCompareUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeData, setTimeData] = useState(null);
  const [compareTimeData, setCompareTimeData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countingStats, setCountingStats] = useState(null);
  const [animeData, setAnimeData] = useState(null);
  const [viewMode, setViewMode] = useState('time');
  const [isComparing, setIsComparing] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeData(null);
    setCountingStats(null);
    setAnimeData(null);
    setCompareTimeData(null);
    setIsComparing(false);

    if (!username) {
      setError('Please enter your AniList username');
      setIsLoading(false);
      return;
    }

    try {
      const stats = await getUserAnimeStats(username);
      if (!stats) {
        throw new Error('No data found for this username');
      }

      setTimeData(stats.timeData);
      setAnimeData(stats);
      setCountingStats({ years: 0, months: 0, days: 0, hours: 0, minutes: 0 });

      // Animate counters
      animateNumber(0, stats.timeData.years, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, years: value }))
      );
      animateNumber(0, stats.timeData.months, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, months: value }))
      );
      animateNumber(0, stats.timeData.days, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, days: value }))
      );
      animateNumber(0, stats.timeData.hours, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, hours: value }))
      );
      animateNumber(0, stats.timeData.minutes, 2000, (value) => 
        setCountingStats(prev => ({ ...prev, minutes: value }))
      );

      setSubmitted(true);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to fetch user statistics. Please check the username and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!compareUsername.trim()) {
      setError('Please enter a username to compare with');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const stats = await getUserAnimeStats(compareUsername);
      if (!stats) {
        throw new Error('No data found for comparison user');
      }
      
      setCompareTimeData(stats.timeData);
      setIsComparing(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setCompareUsername('');
    setSubmitted(false);
    setTimeData(null);
    setCountingStats(null);
    setAnimeData(null);
    setCompareTimeData(null);
    setIsComparing(false);
    setError('');
    setViewMode('time');
  };

  const formatMinutes = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hrs ${minutes % 60} mins`;
    return `${Math.floor(minutes / 1440)} days ${Math.floor((minutes % 1440) / 60)} hrs`;
  };

  return (
    <div className="box-border m-0 p-0">
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
            <h2 className="text-[1.25rem] sm:text-[1.5rem] mb-4 leading-relaxed">
              👋 Hey <span className="font-bold text-[#3b82f6]">{username}</span>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button 
                onClick={() => setViewMode('time')}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'time' ? 'bg-[#3b82f6] text-white' : 'bg-[#e5e7eb] text-[#1f2937]'}`}
              >
                ⏱️ Time
              </button>
              <button 
                onClick={() => setViewMode('genres')}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'genres' ? 'bg-[#3b82f6] text-white' : 'bg-[#e5e7eb] text-[#1f2937]'}`}
              >
                🏷️ Genres
              </button>
              <button 
                onClick={() => setViewMode('studios')}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'studios' ? 'bg-[#3b82f6] text-white' : 'bg-[#e5e7eb] text-[#1f2937]'}`}
              >
                🎬 Studios
              </button>
              <button 
                onClick={() => setViewMode('top5')}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'top5' ? 'bg-[#3b82f6] text-white' : 'bg-[#e5e7eb] text-[#1f2937]'}`}
              >
                🏆 Top 5
              </button>
              <button 
                onClick={() => setViewMode('patterns')}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'patterns' ? 'bg-[#3b82f6] text-white' : 'bg-[#e5e7eb] text-[#1f2937]'}`}
              >
                📊 Patterns
              </button>
            </div>
            
            {viewMode === 'time' && (
              <div>
                <p className="text-[1.125rem] mb-4 text-[#4b5563] font-medium">
                  {animeData?.completedCount ? `You've completed ${animeData.completedCount} anime series.` : ''}
                  {animeData?.mostWatchedYear ? ` Your peak anime year was ${animeData.mostWatchedYear}.` : ''}
                </p>
                
                <div className="bg-[#f3f4f6] rounded-lg p-4 mb-6">
                  <h3 className="text-[1.125rem] font-bold text-[#ef4444]">😂 Reality Check:</h3>
                  <p className="text-[1rem] text-[#1f2937]">
                    {timeData && getRoastMessage(timeData)}
                  </p>
                </div>
                
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
                
                {!isComparing ? (
                  <div className="mt-8 p-4 border border-[#e5e7eb] rounded-lg max-w-md mx-auto">
                    <h3 className="text-[1.125rem] font-bold mb-2">Compare with a Friend</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Friend's username"
                        value={compareUsername}
                        onChange={(e) => setCompareUsername(e.target.value)}
                        className="flex-1 p-2 border-2 border-[#e5e7eb] rounded-lg text-base outline-none focus:border-[#3b82f6]"
                        disabled={isLoading}
                      />
                      <button 
                        onClick={handleCompare} 
                        className="px-4 py-2 bg-[#3b82f6] text-white border-none rounded-lg cursor-pointer transition-colors hover:bg-[#2563eb] disabled:opacity-50"
                        disabled={isLoading || !compareUsername}
                      >
                        Compare
                      </button>
                    </div>
                    {error && (
                      <div className="mt-2 p-2 bg-[#fee2e2] text-[#dc2626] rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-8 p-4 border border-[#e5e7eb] rounded-lg">
                    <h3 className="text-[1.125rem] font-bold mb-4">Comparison with {compareUsername}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-[#f3f4f6] rounded-lg">
                        <h4 className="font-bold text-[#3b82f6]">{username}</h4>
                        <p className="text-[1.125rem]">
                          {timeData ? `${timeData.years}y ${timeData.months}m ${timeData.days}d` : ''}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-[#f3f4f6] rounded-lg">
                        <h4 className="font-bold text-[#ef4444]">{compareUsername}</h4>
                        <p className="text-[1.125rem]">
                          {compareTimeData ? `${compareTimeData.years}y ${compareTimeData.months}m ${compareTimeData.days}d` : ''}
                        </p>
                      </div>
                    </div>
                    
                    {timeData && compareTimeData && (
                      <div className="p-3 bg-[#f9fafb] rounded-lg">
                        <h4 className="font-bold mb-2">Who's the bigger weeb?</h4>
                        <p className="text-[1rem]">
                          {(() => {
                            const user1Minutes = timeData.years * 525600 + timeData.months * 43800 + timeData.days * 1440 + timeData.hours * 60 + timeData.minutes;
                            const user2Minutes = compareTimeData.years * 525600 + compareTimeData.months * 43800 + compareTimeData.days * 1440 + compareTimeData.hours * 60 + compareTimeData.minutes;
                            
                            if (user1Minutes > user2Minutes) {
                              const diff = user1Minutes - user2Minutes;
                              return `${username} has watched ${formatMinutes(diff)} more anime than ${compareUsername}! 🏆`;
                            } else if (user2Minutes > user1Minutes) {
                              const diff = user2Minutes - user1Minutes;
                              return `${compareUsername} has watched ${formatMinutes(diff)} more anime than you! 😮`;
                            } else {
                              return `Wow, you've both watched exactly the same amount of anime! 🤝`;
                            }
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {viewMode === 'genres' && animeData?.genres && (
              <div>
                <h3 className="text-[1.25rem] font-bold mb-4">Your Top Genres</h3>
                <div className="mx-auto" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={animeData.genres}>
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Minutes Watched', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${formatMinutes(value)}`, 'Watch Time']} />
                      <Bar dataKey="minutes" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-[#f3f4f6] rounded-lg">
                  <h4 className="font-bold text-[1rem] mb-2">Your Taste Analysis:</h4>
                  <p className="text-[0.875rem] text-[#4b5563]">
                    {animeData.genres[0] && `You're clearly a big fan of ${animeData.genres[0].name} anime, with ${formatMinutes(animeData.genres[0].minutes)} watched!`}
                    {animeData.genres[1] && ` ${animeData.genres[1].name} comes in second place.`}
                  </p>
                </div>
              </div>
            )}
            
            {viewMode === 'studios' && animeData?.studios && (
              <div>
                <h3 className="text-[1.25rem] font-bold mb-4">Your Favorite Studios</h3>
                <div className="mx-auto" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={animeData.studios}>
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Minutes Watched', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${formatMinutes(value)}`, 'Watch Time']} />
                      <Bar dataKey="minutes" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-[#f3f4f6] rounded-lg">
                  <h4 className="font-bold text-[1rem] mb-2">Studio Loyalty:</h4>
                  <p className="text-[0.875rem] text-[#4b5563]">
                    {animeData.studios[0] && `You've spent ${formatMinutes(animeData.studios[0].minutes)} with ${animeData.studios[0].name} productions!`}
                  </p>
                </div>
              </div>
            )}
            
            {viewMode === 'top5' && animeData?.top5 && (
              <div>
                <h3 className="text-[1.25rem] font-bold mb-4">Your Top 5 Longest Watched Anime</h3>
                <div className="space-y-3">
                  {animeData.top5.map((anime, index) => (
                    <div key={anime.id} className="p-3 bg-[#f9fafb] rounded-lg flex items-center">
                      <div className="w-8 h-8 bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium">{anime.title}</h4>
                        <div className="flex justify-between">
                          <span className="text-[0.875rem] text-[#4b5563]">{anime.episodes} episodes</span>
                          <span className="text-[0.875rem] font-medium">{formatMinutes(anime.watchTime)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {viewMode === 'patterns' && animeData?.yearPattern && (
              <div>
                <h3 className="text-[1.25rem] font-bold mb-4">Your Anime Watch Patterns</h3>
                
                <div className="mb-8">
                  <h4 className="text-[1rem] font-medium mb-2">Yearly Watch Time</h4>
                  <div className="mx-auto" style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={animeData.yearPattern}>
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${formatMinutes(value)}`, 'Watch Time']} />
                        <Line type="monotone" dataKey="minutes" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {animeData.monthPattern.length > 0 && (
                  <div>
                    <h4 className="text-[1rem] font-medium mb-2">Recent Monthly Trends</h4>
                    <div className="mx-auto" style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={animeData.monthPattern.map(item => ({
                          label: `${item.year}-${item.month}`,
                          minutes: item.minutes
                        }))}>
                          <XAxis dataKey="label" />
                          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${formatMinutes(value)}`, 'Watch Time']} />
                          <Bar dataKey="minutes" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-[#f3f4f6] rounded-lg">
                  <h4 className="font-bold text-[1rem] mb-2">Watch Pattern Analysis:</h4>
                  <p className="text-[0.875rem] text-[#4b5563]">
                    {animeData.mostWatchedYear && `${animeData.mostWatchedYear} was your peak anime year.`}
                    {animeData.yearPattern.length > 2 && 
                      ` Your anime consumption has ${
                        animeData.yearPattern[animeData.yearPattern.length-1].minutes > 
                        animeData.yearPattern[animeData.yearPattern.length-2].minutes ? 
                        'increased' : 'decreased'
                      } recently.`
                    }{animeData.yearPattern.length > 2 && 
                      ` Your anime consumption has ${
                        animeData.yearPattern[animeData.yearPattern.length-1].minutes > 
                        animeData.yearPattern[animeData.yearPattern.length-2].minutes ? 
                        'increased' : 'decreased'
                      } recently.`
                    }
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#3b82f6] text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-[#2563eb]"
              >
                🔄 Reset
              </button>
              {compareTimeData && (
                <button
                  onClick={() => {
                    setCompareTimeData(null);
                    setIsComparing(false);
                    setCompareUsername('');
                    setError('');
                  }}
                  className="px-6 py-3 bg-[#e5e7eb] text-[#1f2937] border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-[#d1d5db]"
                >
                  Cancel Comparison
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeOnAnime;