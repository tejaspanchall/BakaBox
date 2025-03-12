'use client';

import { useState } from 'react';
import { searchCharacters, calculateLove } from '../api/anilist';

export default function WaifuHusbandoRate() {
  const [waifu, setWaifu] = useState(null);
  const [husbando, setHusbando] = useState(null);
  const [waifuSearch, setWaifuSearch] = useState('');
  const [husbandoSearch, setHusbandoSearch] = useState('');
  const [waifuResults, setWaifuResults] = useState([]);
  const [husbandoResults, setHusbandoResults] = useState([]);
  const [loveScore, setLoveScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSearch = async (query, type) => {
    if (query.length < 2) return;
    
    setLoading(true);
    const results = await searchCharacters(query, type === 'waifu' ? 'female' : 'male');
    if (type === 'waifu') {
      setWaifuResults(results);
    } else {
      setHusbandoResults(results);
    }
    setLoading(false);
  };

  const calculateCompatibility = () => {
    if (!waifu || !husbando) return;
    setIsCalculating(true);
    // Add a delay for animation
    setTimeout(() => {
      const score = calculateLove(waifu.name.full, husbando.name.full);
      setLoveScore(score);
    }, 3000); // 3 second delay for animation
  };

  const resetCharacter = (type) => {
    if (type === 'waifu') {
      setWaifu(null);
      setWaifuSearch('');
      setWaifuResults([]);
    } else {
      setHusbando(null);
      setHusbandoSearch('');
      setHusbandoResults([]);
    }
  };

  const resetCalculation = () => {
    setLoveScore(null);
    setIsCalculating(false);
  };

  const resetAll = () => {
    setWaifu(null);
    setHusbando(null);
    setWaifuSearch('');
    setHusbandoSearch('');
    setWaifuResults([]);
    setHusbandoResults([]);
    setLoveScore(null);
    setIsCalculating(false);
  };

  return (
    <div className="p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {!isCalculating ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Waifu Selection */}
              <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl shadow-lg border border-pink-100">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Choose Your Waifu</h2>
                {!waifu ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search for a waifu..."
                      className="w-full p-3 border border-pink-100 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                      value={waifuSearch}
                      onChange={(e) => {
                        setWaifuSearch(e.target.value);
                        handleSearch(e.target.value, 'waifu');
                      }}
                    />
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {waifuResults.map((character) => (
                        <div
                          key={character.id}
                          className="p-3 rounded-lg cursor-pointer hover:bg-pink-50 flex items-center gap-3 transition-colors border border-transparent hover:border-pink-100"
                          onClick={() => setWaifu(character)}
                        >
                          <img
                            src={character.image.large}
                            alt={character.name.full}
                            className="w-12 h-12 rounded-full object-cover border-2 border-pink-100"
                          />
                          <span className="text-gray-700">{character.name.full}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="relative w-48 h-48 mx-auto mb-6">
                      <img
                        src={waifu.image.large}
                        alt={waifu.name.full}
                        className="w-full h-full rounded-xl object-cover shadow-md border-4 border-pink-100"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{waifu.name.full}</h3>
                    <button
                      onClick={() => resetCharacter('waifu')}
                      className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-2.5 rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all shadow-md"
                    >
                      Choose Different Waifu
                    </button>
                  </div>
                )}
              </div>

              {/* Husbando Selection */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg border border-blue-100">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Choose Your Husbando</h2>
                {!husbando ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search for a husbando..."
                      className="w-full p-3 border border-blue-100 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      value={husbandoSearch}
                      onChange={(e) => {
                        setHusbandoSearch(e.target.value);
                        handleSearch(e.target.value, 'husbando');
                      }}
                    />
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {husbandoResults.map((character) => (
                        <div
                          key={character.id}
                          className="p-3 rounded-lg cursor-pointer hover:bg-blue-50 flex items-center gap-3 transition-colors border border-transparent hover:border-blue-100"
                          onClick={() => setHusbando(character)}
                        >
                          <img
                            src={character.image.large}
                            alt={character.name.full}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                          />
                          <span className="text-gray-700">{character.name.full}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="relative w-48 h-48 mx-auto mb-6">
                      <img
                        src={husbando.image.large}
                        alt={husbando.name.full}
                        className="w-full h-full rounded-xl object-cover shadow-md border-4 border-blue-100"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{husbando.name.full}</h3>
                    <button
                      onClick={() => resetCharacter('husbando')}
                      className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2.5 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-md"
                    >
                      Choose Different Husbando
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="mt-8 text-center">
              <button
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:from-violet-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={calculateCompatibility}
                disabled={!waifu || !husbando}
              >
                Calculate Love Score
              </button>
            </div>
          </>
        ) : (
          <div className="min-h-[65vh] flex items-center justify-center">
            {!loveScore ? (
              <div className="text-center">
                <div className="flex justify-center items-center gap-8 mb-8">
                  <div className="animate-bounce-left">
                    <img
                      src={waifu.image.large}
                      alt={waifu.name.full}
                      className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                    />
                  </div>
                  <div className="animate-pulse text-4xl">❤️</div>
                  <div className="animate-bounce-right">
                    <img
                      src={husbando.image.large}
                      alt={husbando.name.full}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                    />
                  </div>
                </div>
                <p className="text-2xl text-gray-600 animate-pulse">Calculating Love Score...</p>
              </div>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="bg-gradient-to-br from-white to-pink-50 p-8 rounded-xl shadow-lg inline-block border border-pink-100">
                  <div className="flex justify-center items-center gap-6 mb-6">
                    <img
                      src={waifu.image.large}
                      alt={waifu.name.full}
                      className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                    />
                    <div className="text-4xl">❤️</div>
                    <img
                      src={husbando.image.large}
                      alt={husbando.name.full}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">Love Score</h3>
                  <div className="text-7xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent animate-number-grow">
                    {loveScore}%
                  </div>
                  <p className="mt-4 text-gray-600 text-lg">
                    {loveScore > 80
                      ? "A perfect match made in anime heaven! 💕"
                      : loveScore > 60
                      ? "There's definitely something special here! 💫"
                      : loveScore > 40
                      ? "Not bad, but there might be better matches out there! 🌟"
                      : "Maybe try looking for another match? 🎭"}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={resetAll}
                      className="bg-gradient-to-r from-violet-400 to-violet-500 text-white px-8 py-3 rounded-lg hover:from-violet-500 hover:to-violet-600 transition-all shadow-md text-lg"
                    >
                      Try New Match
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes bounceLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
        }
        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes numberGrow {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-bounce-left {
          animation: bounceLeft 2s infinite;
        }
        .animate-bounce-right {
          animation: bounceRight 2s infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        .animate-number-grow {
          animation: numberGrow 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 