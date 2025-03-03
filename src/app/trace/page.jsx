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
      console.log('API Response:', data);
      setResults(data);
      
      // Select the first match automatically
      if (data.result && data.result.length > 0) {
        setSelectedMatch(data.result[0]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to identify the anime');
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
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">AnimeScene Finder</h1>
        <p className="text-center text-gray-600 mb-8">Upload a screenshot to find which anime it's from</p>
        
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                Upload an anime screenshot
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-gray-700 border border-gray-300 bg-gray-50 rounded-lg py-2 px-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="imageUrl">
                Or enter image URL
              </label>
              <div className="flex">
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/anime-screenshot.jpg"
                  className="flex-1 text-gray-700 border border-gray-300 bg-gray-50 rounded-lg rounded-r-none py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg rounded-l-none px-4"
                >
                  Preview
                </button>
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
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              Found {results.result.length} Matches
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - List of matches */}
              <div className="w-full md:w-1/3">
                <div className="bg-white border border-gray-200 shadow-md rounded-xl p-4">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Match Results</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
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
                          <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover"
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
                                Ep {item.episode || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right side - Preview and details */}
              <div className="w-full md:w-2/3">
                {selectedMatch && (
                  <div className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                    {/* Video/Image preview */}
                    <div className="relative pb-[56.25%] h-0 overflow-hidden bg-black">
                      {selectedMatch.video ? (
                        <video 
                          controls 
                          autoPlay
                          loop 
                          muted
                          className="absolute top-0 left-0 w-full h-full object-contain"
                          poster={selectedMatch.image}
                        >
                          <source src={selectedMatch.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          src={selectedMatch.image} 
                          alt="Anime scene" 
                          className="absolute top-0 left-0 w-full h-full object-contain"
                        />
                      )}
                    </div>
                    
                    {/* Details below preview */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-xl text-gray-800">
                          {getTitle(selectedMatch)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          selectedMatch.similarity > 0.9 ? 'bg-green-100 text-green-800' : 
                          selectedMatch.similarity > 0.8 ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(selectedMatch.similarity * 100).toFixed(1)}% Match
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 my-3">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Episode</p>
                          <p className="font-medium">{selectedMatch.episode || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <p className="text-sm text-gray-500">Timestamp</p>
                          <p className="font-medium">{formatTime(selectedMatch.from)}</p>
                        </div>
                      </div>

                      {selectedMatch.anilist && (
                        <div className="mt-4">
                          {selectedMatch.anilist.isAdult && (
                            <span className="inline-block bg-red-100 border border-red-400 text-red-700 text-xs px-2 py-1 rounded-md mb-2">
                              NSFW Content
                            </span>
                          )}
                          
                          {selectedMatch.anilist.description && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {selectedMatch.anilist.description.replace(/<[^>]*>?/gm, '')}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <a 
                              href={`https://anilist.co/anime/${selectedMatch.anilist.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                              </svg>
                              View on AniList
                            </a>
                            
                            {selectedMatch.anilist.idMal && (
                              <a 
                                href={`https://myanimelist.net/anime/${selectedMatch.anilist.idMal}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-lg"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                </svg>
                                View on MyAnimeList
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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

      <footer className="mt-8 pb-6 text-center text-gray-500 text-sm">
        <p>Powered by <a href="https://trace.moe" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">trace.moe</a> API</p>
        <p className="mt-1 text-xs text-gray-400">This site is not affiliated with trace.moe.</p>
      </footer>
    </div>
  );
}