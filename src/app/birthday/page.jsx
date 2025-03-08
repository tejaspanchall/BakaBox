'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const BirthdayPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const searchRef = useRef(null);

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
      setFilteredCharacters(sortedCharacters);
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCharacters(characters);
    } else {
      const filtered = characters.filter(char => 
        char.name.full.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.media.nodes[0]?.title.english && 
          char.media.nodes[0].title.english.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (char.media.nodes[0]?.title.romaji && 
          char.media.nodes[0].title.romaji.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCharacters(filtered);
    }
  }, [searchQuery, characters]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const retryFetch = () => {
    fetchBirthdayCharacters();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
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
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center text-gray-500 text-lg p-8 bg-white rounded-lg shadow-lg">
            No characters found. Try another search!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCharacters.map(character => (
              <div 
                key={character.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
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
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="text-base font-medium text-gray-800 text-center line-clamp-1">
                    {character.name.full}
                  </h2>
                  {character.media.nodes[0] && (
                    <p className="text-xs text-gray-500 text-center mt-1 line-clamp-1">
                      {character.media.nodes[0].title.english || character.media.nodes[0].title.romaji}
                    </p>
                  )}
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