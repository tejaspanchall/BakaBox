'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchStartTime, setSearchStartTime] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setImageUrl('');
    setError(null);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl || !imageUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    setPreview(imageUrl);
    setError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImageUrl('');
    setPreview(null);
    setResults(null);
    setSelectedMatch(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && (!imageUrl || !imageUrl.trim())) {
      setError('Please select an image or enter a valid image URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedMatch(null);
    
    // Record the start time when initiating the search
    const startTime = Date.now();
    setSearchStartTime(startTime);

    try {
      let response;
      
      if (selectedFile) {
        // File upload approach
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await fetch('https://api.trace.moe/search?anilistInfo', {
          method: 'POST',
          body: formData,
        });
      } else {
        // URL approach
        response = await fetch(`https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(imageUrl)}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to identify the anime');
      }

      const data = await response.json();
      
      if (!data) {
        throw new Error('No response data received from the server');
      }

      // Validate the response structure
      if (!Array.isArray(data.result)) {
        throw new Error('Invalid response format: result is not an array');
      }

      // Filter out invalid results and ensure image URLs are properly formatted
      const validResults = data.result.filter(item => {
        if (!item || !item.image) return false;
        
        // Ensure image URL is properly formatted
        if (!item.image.startsWith('http')) {
          item.image = `https://trace.moe${item.image}`;
        }
        
        return typeof item.similarity === 'number' && 
               item.similarity > 0 &&
               item.anilist?.id;
      });

      if (validResults.length === 0) {
        throw new Error('No valid matches found in the response');
      }

      console.log('API Response:', data);
      console.log('Valid Results:', validResults);
      
      // Fetch additional AniList data for each result
      const enhancedResults = await Promise.all(
        validResults.map(async (item, index) => {
          if (!item.anilist?.id) return item;
          
          try {
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, index * 100));

            const anilistQuery = `
              query ($id: Int) {
                Media (id: $id, type: ANIME) {
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
                }
              }
            `;

            const anilistResponse = await fetch('https://graphql.anilist.co', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: anilistQuery,
                variables: { id: item.anilist.id }
              }),
            });

            if (!anilistResponse.ok) {
              if (anilistResponse.status === 429) {
                console.warn('Rate limit exceeded for AniList API');
                return item;
              }
              console.warn(`Failed to fetch AniList data for ID ${item.anilist.id}`);
              return item;
            }

            const anilistData = await anilistResponse.json();
            
            // Check for AniList API errors
            if (anilistData.errors) {
              console.warn('AniList API errors:', anilistData.errors);
              return item;
            }

            const media = anilistData.data?.Media;

            if (!media) {
              console.warn(`No AniList data found for ID ${item.anilist.id}`);
              return item;
            }

            return {
              ...item,
              anilist: {
                ...item.anilist,
                title: media.title,
                coverImage: media.coverImage?.extraLarge || media.coverImage?.large,
                bannerImage: media.bannerImage,
                description: media.description,
                genres: media.genres,
                meanScore: media.meanScore,
                episodes: media.episodes,
                isAdult: media.isAdult
              }
            };
          } catch (err) {
            console.warn(`Error fetching AniList data for ID ${item.anilist.id}:`, err);
            return item;
          }
        })
      );

      // Sort results by similarity in descending order
      const sortedResults = enhancedResults.sort((a, b) => b.similarity - a.similarity);
      
      // Calculate the total search time
      const endTime = Date.now();
      const totalSearchTime = (endTime - startTime) / 1000; // Convert to seconds

      setResults({ 
        ...data, 
        result: sortedResults,
        frameCount: data.frameCount || 0,
        searchTime: totalSearchTime // Use our calculated search time instead of the API's
      });
      
      // Select the first match automatically
      if (sortedResults.length > 0) {
        setSelectedMatch(sortedResults[0]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to identify the anime. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format time from seconds to MM:SS.ms
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Get title in English or romanized
  const getTitle = (item) => {
    return item?.anilist?.title?.english || 
           item?.anilist?.title?.romaji || 
           item?.filename || 
           'Unknown Anime';
  };

  const selectMatch = (match) => {
    setSelectedMatch(match);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Head>
        <title>AnimeScene Finder | powered by trace.moe</title>
        <meta name="description" content="Find anime scenes by uploading an image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="imageUrl">
                  Enter image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/anime-screenshot.jpg"
                  className="w-full text-gray-700 border border-gray-300 bg-gray-50 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                  Or upload screenshot
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-gray-700 border border-gray-300 bg-gray-50 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {preview && (
              <div className="mb-4 text-center">
                <div className="bg-gray-100 p-2 rounded-lg inline-block">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={loading || (!selectedFile && !imageUrl)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  loading || (!selectedFile && !imageUrl)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : 'Find Anime Scene'}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-4 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {results && results.result && results.result.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">
              Found {results.result.length} Matches
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Searched {(results.frameCount || 0).toLocaleString()} frames in {results.searchTime.toFixed(2)}s
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left side - List of matches */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white border border-gray-200 shadow-md rounded-xl p-4 h-[600px]">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Match Results</h3>
                  <div className="space-y-3 h-[calc(600px-3rem)] overflow-y-auto">
                    {results.result.map((item, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded-lg cursor-pointer transition duration-150 ${
                          selectedMatch === item 
                            ? 'bg-blue-100 border border-blue-300' 
                            : 'hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => selectMatch(item)}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={`/api/proxy?url=${encodeURIComponent(item.image)}`}
                              alt="Thumbnail" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image load error:', item.image);
                                e.target.onerror = null;
                                e.target.src = '/placeholder.svg';
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', item.image);
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {getTitle(item)}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                item.similarity > 0.9 ? 'bg-green-100 text-green-800' : 
                                item.similarity > 0.8 ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(item.similarity * 100).toFixed(1)}%
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                Ep {item.episode || 'N/A'} • {formatTime(item.from)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right side - Preview and Details */}
              <div className="w-full lg:w-2/3 space-y-6">
                {/* Preview Section */}
                {selectedMatch && (
                  <div className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                    <div className="relative aspect-video bg-black">
                      {selectedMatch.video ? (
                        <video 
                          controls 
                          autoPlay
                          loop 
                          muted
                          className="w-full h-full object-contain"
                          poster={selectedMatch.image}
                        >
                          <source src={selectedMatch.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          src={`/api/proxy?url=${encodeURIComponent(selectedMatch.image)}`}
                          alt="Anime scene" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error('Preview image load error:', selectedMatch.image);
                            e.target.onerror = null;
                            e.target.src = '/placeholder.svg';
                          }}
                          onLoad={() => {
                            console.log('Preview image loaded successfully:', selectedMatch.image);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Anime Details Section */}
                {selectedMatch && (
                  <div className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-b from-gray-900 to-transparent">
                      {selectedMatch.anilist?.bannerImage ? (
                        <img 
                          src={selectedMatch.anilist.bannerImage} 
                          alt="Anime Banner" 
                          className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-3xl font-bold text-white mb-3">
                          {getTitle(selectedMatch)}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedMatch.similarity > 0.9 ? 'bg-green-500/20 text-green-200' : 
                            selectedMatch.similarity > 0.8 ? 'bg-blue-500/20 text-blue-200' : 
                            'bg-yellow-500/20 text-yellow-200'
                          }`}>
                            {(selectedMatch.similarity * 100).toFixed(1)}% Match
                          </span>
                          <span className="text-white/90 text-sm">
                            Episode {selectedMatch.episode || 'N/A'} • {formatTime(selectedMatch.from)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedMatch.anilist && (
                      <div>
                        {selectedMatch.anilist.isAdult && (
                          <span className="inline-block bg-red-100 border border-red-400 text-red-700 text-xs px-2 py-1 rounded-md">
                            NSFW Content
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {results && (!results.result || results.result.length === 0) && (
          <div className="max-w-3xl mx-auto mt-4 p-6 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-xl font-bold mb-1">No Matches Found</h3>
                <p>Try uploading a different screenshot or check the image quality.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Development Phase Notice</h3>
              <p className="mt-1 text-sm text-yellow-700">
                This tool is currently in development. While we strive for accuracy, some results may not be perfect. We're continuously improving the matching algorithm and database.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 pb-6 text-center text-gray-500 text-sm">
        <p>Powered by <a href="https://trace.moe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">trace.moe</a> API</p>
        <p className="mt-1 text-xs text-gray-400">This site is not affiliated with trace.moe.</p>
      </footer>
    </div>
  );
}