'use client';

import React, { useState } from 'react';

const predefinedPrompts = {
  casual: "cute, casual clothes, modern fashion, smiling, natural pose",
  fantasy: "fantasy, magical girl, flowing dress, sparkles, magical effects, ethereal",
  school: "school uniform, classroom, student, indoor, cute expression",
  warrior: "armor, warrior, sword, battle pose, action, confident",
  idol: "idol, stage costume, microphone, performance, energetic",
  maid: "maid outfit, maid headdress, elegant pose, serving",
  princess: "princess, royal dress, crown, elegant, castle background",
  witch: "witch hat, magic, spellcasting, mystical aura, magical items",
  ninja: "ninja outfit, athletic, agile pose, mysterious, shadows",
  shrine_maiden: "shrine maiden outfit, traditional, spiritual, peaceful",
  scientist: "lab coat, smart, glasses, scientific equipment, professional",
  detective: "detective outfit, mysterious, clever, investigation scene",
  chef: "chef uniform, cooking, kitchen background, cheerful",
  artist: "artist outfit, creative, paintbrush, artistic environment",
  athlete: "sporty outfit, athletic build, dynamic pose, energetic",
  vampire: "gothic dress, vampire features, elegant, moonlight",
  cyberpunk: "futuristic outfit, cyberpunk, neon lights, tech elements",
  beach: "summer outfit, beach background, cheerful, sunny",
  winter: "winter outfit, snow background, cozy, warm clothes",
  rockstar: "rock style, guitar, stage lights, performance energy"
};

export default function WaifuGenerator() {
  const [formData, setFormData] = useState({
    description: '',
    antiDescription: '',
    artStyle: 'Waifu',
    shape: 'Portrait',
    count: 2
  });
  const [waifu, setWaifu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRandomPrompt = () => {
    const prompts = Object.values(predefinedPrompts);
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setFormData(prev => ({
      ...prev,
      description: randomPrompt
    }));
  };

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const handleImageError = (index) => {
    setLoadedImages(prev => ({
      ...prev,
      [index]: 'error'
    }));
  };

  const generateWaifu = async () => {
    setIsLoading(true);
    setError(null);
    setLoadedImages({});
    setWaifu(null);
    
    try {
      const response = await fetch('/api/waifu-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        const errorMessage = data.message || data.error || response.statusText;
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      setWaifu(data);
    } catch (err) {
      console.error('Error generating waifu:', err);
      setError(
        err.message || 'Failed to generate waifu. Please try again later. If the problem persists, check if your Hugging Face API key is properly configured.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (img) => {
    setSelectedImage(img);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = (img) => {
    const link = document.createElement('a');
    link.href = img;
    link.download = `waifu-${Date.now()}.jpg`;
    link.click();
  };

  const artStyles = ["Waifu", "Cute Anime", "Tattoo Design", "Anime", "Manga", "Chibi", "Realistic", "Watercolor"];
  const shapes = ["Portrait", "Full Body", "Half Body"];
  const counts = [2, 4, 6, 8, 10];

  return (
    <div className="p-4 bg-white text-black">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="inline-block mr-2">📝</span>
                <label className="font-semibold">Description</label>
                <button className="ml-2 text-gray-400 hover:text-white" title="Provide details about your waifu's appearance, personality, etc.">ⓘ</button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="cute, smiling, long hair..."
                className="w-full p-2 rounded bg-white border border-gray-300 text-black"
                rows="3"
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={handleRandomPrompt}
                  className="p-2 px-4 bg-pink-100 text-pink-600 rounded hover:bg-pink-200 transition-colors" 
                  title="Random description"
                >
                  🎲 Random
                </button>
              </div>
            </div>

            {/* Anti-Description */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="inline-block mr-2">🚫</span>
                <label className="font-semibold">Anti-Description (optional)</label>
                <button className="ml-2 text-gray-400 hover:text-white" title="Describe what you don't want in the image">ⓘ</button>
              </div>
              <input
                type="text"
                name="antiDescription"
                value={formData.antiDescription}
                onChange={handleInputChange}
                placeholder="Things you don't want in the image..."
                className="w-full p-2 rounded bg-white border border-gray-300 text-black"
              />
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Art Style */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="inline-block mr-2">🎨</span>
                  <label className="font-semibold">Art Style</label>
                </div>
                <select
                  name="artStyle"
                  value={formData.artStyle}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-white border border-gray-300 text-black"
                >
                  {artStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Shape */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="inline-block mr-2">🖼️</span>
                  <label className="font-semibold">Shape</label>
                </div>
                <select
                  name="shape"
                  value={formData.shape}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-white border border-gray-300 text-black"
                >
                  {shapes.map(shape => (
                    <option key={shape} value={shape}>{shape}</option>
                  ))}
                </select>
              </div>

              {/* Count */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="inline-block mr-2">🔢</span>
                  <label className="font-semibold">How many?</label>
                </div>
                <select
                  name="count"
                  value={formData.count}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-white border border-gray-300 text-black"
                >
                  {counts.map(count => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={generateWaifu}
              disabled={isLoading}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-bold">Error</p>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Results */}
        {waifu && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 text-pink-400">Generated Waifus</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {waifu.generatedImages.map((img, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-300 hover:border-pink-500 transition-colors">
                  <div 
                    className="relative aspect-[3/4] w-full cursor-pointer"
                    onClick={() => handleImageClick(img)}
                  >
                    {!loadedImages[index] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                      </div>
                    )}
                    {loadedImages[index] === 'error' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 text-sm">
                        Failed to load
                      </div>
                    ) : (
                      <img 
                        src={img} 
                        alt={`Generated waifu ${index+1}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                      />
                    )}
                  </div>
                  <div className="p-1.5 flex justify-between items-center text-sm">
                    <span className="text-gray-400">#{index+1}</span>
                    <button 
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      onClick={() => handleDownload(img)}
                      title="Download image"
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Selected waifu"
                  className="w-full h-auto rounded-lg shadow-xl"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors"
                    title="Download image"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All characters are fictional and generated for entertainment purposes only.</p>
        </div>
      </div>
    </div>
  );
}
