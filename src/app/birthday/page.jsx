// app/birthday/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BirthdayPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const fetchBirthdayCharacters = async (date) => {
    try {
      setLoading(true);
      
      // Get month and day from the date
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      const query = `
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            characters(sort: FAVOURITES_DESC) {
              id
              name {
                full
                native
              }
              image {
                large
              }
              gender
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
            }
          }
        }
      `;

      const variables = {
        page: 1,
        perPage: 100
      };

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: variables
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      // Get all characters without filtering by date
      const allCharacters = data.data.Page.characters;
      
      // Sort characters by birthday
      const sortedCharacters = allCharacters.sort((a, b) => {
        // Characters with birthdays on the selected date come first
        const aMatchesDate = a.dateOfBirth && a.dateOfBirth.month === month && a.dateOfBirth.day === day;
        const bMatchesDate = b.dateOfBirth && b.dateOfBirth.month === month && b.dateOfBirth.day === day;
        
        if (aMatchesDate && !bMatchesDate) return -1;
        if (!aMatchesDate && bMatchesDate) return 1;
        
        // Then sort by favorites
        return b.favourites - a.favourites;
      });
      
      setCharacters(sortedCharacters);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch character data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdayCharacters(currentDate);
  }, [currentDate]);

  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  // Reset to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Jump to specific date
  const jumpToDate = () => {
    // Create a new date using the current year and selected month/day
    const newDate = new Date();
    newDate.setMonth(selectedMonth - 1);
    newDate.setDate(selectedDay);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate array of days for the selected month
  const getDaysInMonth = (month) => {
    // Create a date for the last day of the selected month
    const date = new Date(new Date().getFullYear(), month, 0);
    const daysInMonth = date.getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-700 mb-4">Anime Character Birthdays</h1>
          <p className="text-xl text-gray-600 mb-8">Celebrating birthdays of your favorite characters!</p>
          
          {/* Date navigation controls */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <button 
              onClick={goToPreviousDay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full flex items-center transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous Day
            </button>
            
            <button
              onClick={goToToday}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
            >
              Today
            </button>
            
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
            >
              Jump to Date
            </button>
            
            <button 
              onClick={goToNextDay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full flex items-center transition-colors duration-300"
            >
              Next Day
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Date Picker Modal */}
          {showDatePicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Jump to Date</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Month</label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Day</label>
                    <select 
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {getDaysInMonth(selectedMonth).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={jumpToDate}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                  >
                    Go to Date
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-2xl font-medium text-gray-800 mb-4">{formatDate(currentDate)}</div>
          
          {characters.length > 0 && (
            <p className="text-lg text-indigo-600">
              {characters.filter(char => char.dateOfBirth && char.dateOfBirth.month === currentDate.getMonth() + 1 && char.dateOfBirth.day === currentDate.getDate()).length > 0 
                ? `🎉 Celebrating ${characters.filter(char => char.dateOfBirth && char.dateOfBirth.month === currentDate.getMonth() + 1 && char.dateOfBirth.day === currentDate.getDate()).length} character${characters.filter(char => char.dateOfBirth && char.dateOfBirth.month === currentDate.getMonth() + 1 && char.dateOfBirth.day === currentDate.getDate()).length !== 1 ? 's' : ''} today!`
                : 'No birthdays today, but here are some popular characters!'}
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg p-8 bg-white rounded-lg shadow-lg">
            {error}
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center text-gray-500 text-lg p-8 bg-white rounded-lg shadow-lg">
            No characters found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
            {characters.map(character => (
              <div 
                key={character.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-72 overflow-hidden bg-gray-100 relative">
                  {character.image?.large ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={character.image.large} 
                        alt={character.name.full} 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {character.name.full}
                  </h2>
                  {character.name.native && (
                    <p className="text-sm text-gray-600 mb-3">
                      {character.name.native}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {character.dateOfBirth.month}/{character.dateOfBirth.day}
                      {character.dateOfBirth.year ? ` (${character.dateOfBirth.year})` : ''}
                    </span>
                  </div>
                  {character.media.nodes[0] && (
                    <p className="text-sm text-indigo-600 font-medium mb-3 line-clamp-1">
                      From: {character.media.nodes[0].title.english || character.media.nodes[0].title.romaji}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{character.favourites.toLocaleString()} favorites</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayPage;