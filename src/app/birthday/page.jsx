'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const BirthdayPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  useEffect(() => {
    // Format today's date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  const fetchBirthdayCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current date
      const today = new Date();
      const month = today.getMonth() + 1; // Convert to 1-indexed month
      const day = today.getDate();
      
      // GraphQL query for characters with today's birthday
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
      let currentPage = 1;

      while (hasNextPage && currentPage <= 10) { // Limit to 10 pages to prevent infinite loops
        try {
          const variables = {
            page: currentPage,
            perPage: 50 // Maximum allowed by API
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

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.errors) {
            throw new Error(data.errors[0].message);
          }
          
          const pageInfo = data.data.Page.pageInfo;
          const pageCharacters = data.data.Page.characters;
          
          // Filter to ensure we only have characters with the exact birth date
          // This is a safety check in case isBirthday doesn't work exactly as expected
          const birthdayCharacters = pageCharacters.filter(
            char => char.dateOfBirth && char.dateOfBirth.month === month && char.dateOfBirth.day === day
          );
          
          allCharacters = [...allCharacters, ...birthdayCharacters];
          hasNextPage = pageInfo.hasNextPage;
          currentPage++;
          
        } catch (err) {
          console.error(`Error fetching page ${currentPage}:`, err);
          hasNextPage = false; // Stop trying if we hit an error
        }
      }
      
      // Sort by number of favorites
      const sortedCharacters = allCharacters.sort((a, b) => 
        b.favourites - a.favourites
      );
      
      setCharacters(sortedCharacters);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching birthday data:', err);
      setError('Failed to fetch character data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdayCharacters();
  }, []);

  const retryFetch = () => {
    fetchBirthdayCharacters();
  };

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
  };

  const closeCharacterDetails = () => {
    setSelectedCharacter(null);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        {/* Today's Date Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{currentDate}</h1>
          <h2 className="text-xl font-semibold text-blue-600 mt-2">Anime Character Birthdays Today</h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-full py-40">
            <img src="/loading.gif" alt="Loading..." className="w-37 h-37 object-contain mb-4" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg p-8 bg-white rounded-lg shadow-lg">
            <p>{error}</p>
            <button 
              onClick={retryFetch} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center text-gray-500 text-lg p-8 bg-white rounded-lg shadow-lg">
            No characters found with birthdays today.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map(character => (
              <div 
                key={character.id} 
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleCharacterClick(character)}
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                  {character.image?.large ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={character.image.large} 
                        alt={character.name.full} 
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover"
                        quality={90}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <h2 className="text-sm font-medium text-gray-800 line-clamp-1">
                    {character.name.full}
                  </h2>
                  {character.media.nodes[0] && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {character.media.nodes[0].title.english || character.media.nodes[0].title.romaji}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Character Details Popup */}
        {selectedCharacter && (
          <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50">
            <div className="bg-white w-full h-full sm:h-auto sm:w-[95%] sm:max-w-3xl sm:rounded-xl shadow-xl overflow-hidden relative animate-fadeIn">
              {/* Close button */}
              <button 
                onClick={closeCharacterDetails}
                className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-2 shadow-sm hover:bg-gray-100 transition-colors focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="h-full sm:h-auto overflow-y-auto">
                {/* Header for mobile */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:hidden">
                  <h2 className="text-lg font-bold text-gray-800 pr-8">{selectedCharacter.name.full}</h2>
                  {selectedCharacter.name.native && (
                    <p className="text-sm text-gray-600">{selectedCharacter.name.native}</p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Image and Desktop Title Section */}
                    <div className="w-1/4 sm:w-1/3 flex-shrink-0 mx-auto sm:mx-0">
                      {selectedCharacter.image?.large ? (
                        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden ring-1 ring-gray-200">
                          <Image 
                            src={selectedCharacter.image.large} 
                            alt={selectedCharacter.name.full} 
                            fill
                            className="object-cover"
                            quality={90}
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      
                      {/* Character Name for Desktop */}
                      <div className="hidden sm:block mt-4">
                        <h2 className="text-xl font-bold text-gray-800">{selectedCharacter.name.full}</h2>
                        {selectedCharacter.name.native && (
                          <p className="text-base text-gray-600 mt-1">{selectedCharacter.name.native}</p>
                        )}
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-3">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Birthday</h3>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {selectedCharacter.dateOfBirth.month}/{selectedCharacter.dateOfBirth.day}
                            {selectedCharacter.dateOfBirth.year ? `/${selectedCharacter.dateOfBirth.year}` : ''}
                          </p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Popularity</h3>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {selectedCharacter.favourites.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Anime */}
                      {selectedCharacter.media.nodes[0] && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Featured In</h3>
                          <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                            {selectedCharacter.media.nodes[0].title.english || selectedCharacter.media.nodes[0].title.romaji}
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      {selectedCharacter.description && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">About</h3>
                          <div 
                            className="text-sm text-gray-700 prose prose-sm max-w-none prose-p:my-1 prose-headings:text-blue-600 prose-a:text-blue-600"
                            dangerouslySetInnerHTML={{ __html: selectedCharacter.description }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayPage;