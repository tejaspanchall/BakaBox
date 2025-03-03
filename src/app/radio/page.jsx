'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, Volume2, Music } from 'lucide-react';
import { NextSeo } from 'next-seo';

const HEARTBEAT_INTERVAL = 45000;
const STREAM_URL = 'https://listen.moe/stream';

const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Loading...',
    artist: 'Loading...',
    listeners: 0,
    duration: 0,
  });
  const audioRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    let heartbeatInterval;
    const setupWebSocket = () => {
      const ws = new WebSocket('wss://listen.moe/gateway_v2');
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ op: 9 }));
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 9 }));
          }
        }, HEARTBEAT_INTERVAL);
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.t === 'TRACK_UPDATE' && data.d?.song) {
            const song = data.d.song;
            setCurrentTrack({
              title: song.title || 'Unknown Title',
              artist: song.artists?.map((artist) => artist.name).join(', ') || 'Unknown Artist',
              listeners: data.d.listeners ?? 0,
              duration: song.duration || 0,
            });
          }
        } catch (error) {
          console.error(error);
        }
      };
      ws.onerror = (error) => {
        console.error(error);
      };
      ws.onclose = () => {
        clearInterval(heartbeatInterval);
        setTimeout(setupWebSocket, 5000);
      };
    };
    setupWebSocket();
    return () => {
      clearInterval(heartbeatInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = STREAM_URL;
    audio.preload = 'auto';
    audio.volume = volume;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = async () => {
      setIsPlaying(false);
      try {
        audio.load();
        await audio.play();
      } catch (error) {
        console.error(error);
      }
    };
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <>
    <NextSeo
    title="Anime Radio - 24/7 Anime OSTs, Openings & Endings"
    description="Listen to continuous streams of anime music, including opening themes, ending songs, original soundtracks, and J-pop hits from your favorite anime series."
    />
    <div className="m-0 p-0 box-border font-sans bg-white">
      <div className="w-full max-w-md mx-auto my-12 px-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-purple-100 rounded-full opacity-60"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-indigo-100 rounded-full opacity-60"></div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-center space-x-1 px-8 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i}
                className={`w-1 bg-indigo-400 rounded-full transform transition-all duration-150 ${isPlaying ? 'animate-pulse' : 'opacity-30'}`}
                style={{ 
                  height: isPlaying ? `${Math.floor(20 + Math.random() * 30)}px` : '4px',
                  animationDelay: `${i * 0.05}s`
                }}
              ></div>
            ))}
          </div>
          
          <div className="flex flex-col items-center pt-4 pb-8">
            <div className="relative mb-8">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg flex items-center justify-center overflow-hidden">
                <Music size={64} className="text-white opacity-40" />
                
                <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`} style={{animationDuration: '15s'}}>
                  <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.3)_360deg)] opacity-30"></div>
                </div>
                
                <div className="absolute w-10 h-10 rounded-full bg-white bg-opacity-20 border-4 border-white border-opacity-30"></div>
              </div>
              
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
            </div>
            
            <div className="text-center w-full mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-2">
                {currentTrack.title}
              </h2>
              <p className="text-lg text-gray-600 line-clamp-1">
                {currentTrack.artist}
              </p>
              {isPlaying && currentTrack.listeners > 0 && (
                <p className="mt-2 text-sm text-indigo-600 font-medium">
                  {currentTrack.listeners.toLocaleString()} listening now
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-center w-full space-y-6">
              <div className="w-full flex items-center space-x-4">
                <Volume2 size={20} className={`text-gray-500 ${volume === 0 ? 'opacity-50' : ''}`} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  aria-label="Volume"
                />
                <span className="text-xs font-medium text-gray-500 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              
              <button 
                className="w-20 h-20 rounded-full bg-[#4D55CC] hover:bg-[#7A73D1] text-white shadow-lg flex items-center justify-center focus:outline-none hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? 
                  <PauseIcon size={32} className="text-white" /> : 
                  <PlayIcon size={32} className="text-white ml-1" />
                }
              </button>
              
              <div className="text-sm font-medium text-gray-500">
                {isPlaying ? "LIVE STREAMING" : "READY TO PLAY"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
    </>
  );
};

export default Radio;