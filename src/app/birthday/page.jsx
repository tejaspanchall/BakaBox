'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getBirthdayCharacters } from '@/app/api/anilist';

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
      
      const birthdayCharacters = await getBirthdayCharacters(month, day);
      setCharacters(birthdayCharacters);
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

  // Function to get greeting message based on character count
  const getBirthdayMessage = (count) => {
    if (loading) return "Loading character birthdays...";
    if (error) return "Oops! We couldn't fetch today's birthdays";
    if (count === 0) return "No character birthdays today";
    if (count === 1) return "1 character is celebrating their birthday today! 🎉";
    return `${count} characters are celebrating their birthdays today! 🎉`;
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Date Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{currentDate}</h1>
          <p className="text-lg text-blue-600 font-medium mt-2">
            {getBirthdayMessage(characters.length)}
          </p>
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
          // Added gap back to grid and adjusted column count
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
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
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 20vw, (max-width: 1024px) 14vw, 12vw"
                        className="object-cover"
                        quality={80}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <h2 className="text-xs font-medium text-gray-800 line-clamp-1">
                    {character.name.full}
                  </h2>
                  {character.media.nodes[0] && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {character.media.nodes[0].title.english || character.media.nodes[0].title.romaji}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Character Details Popup - Made to match desktop style on mobile */}
        {selectedCharacter && (
          <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-3">
            <div className="bg-white w-full max-h-[90vh] sm:h-auto sm:w-[90%] sm:max-w-3xl rounded-xl shadow-xl overflow-hidden relative animate-fadeIn">
              {/* Close button - Made more visible */}
              <button 
                onClick={closeCharacterDetails}
                className="absolute top-3 right-3 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content - Single consistent layout for mobile and desktop */}
              <div className="h-full overflow-y-auto">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Image and Title Section - Combined layout for mobile and desktop */}
                    <div className="sm:w-1/4 flex-shrink-0">
                      <div className="flex flex-row sm:flex-col gap-4">
                        {/* Image */}
                        <div className="w-1/3 sm:w-full flex-shrink-0">
                          {selectedCharacter.image?.large ? (
                            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden ring-1 ring-gray-200 shadow-md">
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
                            <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Character Name - Always visible */}
                        <div className="flex-1 sm:mt-4">
                          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{selectedCharacter.name.full}</h2>
                          {selectedCharacter.name.native && (
                            <p className="text-sm sm:text-base text-gray-600 mt-1">{selectedCharacter.name.native}</p>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <div className="bg-blue-50 p-2 rounded-lg flex-1">
                              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Birthday</h3>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {selectedCharacter.dateOfBirth.month}/{selectedCharacter.dateOfBirth.day}
                                {selectedCharacter.dateOfBirth.year ? `/${selectedCharacter.dateOfBirth.year}` : ''}
                              </p>
                            </div>

                            <div className="bg-blue-50 p-2 rounded-lg flex-1">
                              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Popularity</h3>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {selectedCharacter.favourites.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-4 mt-4 sm:mt-0">
                      {/* Anime */}
                      {selectedCharacter.media.nodes[0] && (
                        <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Featured In</h3>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {selectedCharacter.media.nodes[0].title.english || selectedCharacter.media.nodes[0].title.romaji}
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      {selectedCharacter.description && (
                        <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
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