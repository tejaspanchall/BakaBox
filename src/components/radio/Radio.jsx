import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon } from 'lucide-react';
import Header from '../header/Header';

const HEARTBEAT_INTERVAL = 45000;
const STREAM_URL = 'https://listen.moe/stream';

const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const generateWavePath = () => {
    const width = 1000;
    const height = 100;
    const segments = 20;
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const y = height / 2 + Math.sin(i * Math.PI / 2) * 20;
      points.push(`${x},${y}`);
    }
    
    return `M${points.join(' L')}`;
  };

  return (
    <div className="m-0 p-0 box-border font-['Chivo',_sans-serif]">
      <Header />
      <div className="w-full max-w-[400px] mx-auto my-8 px-4">
        <div className="bg-[#2d3748] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex flex-col gap-4">
          <div className="bg-[#1a202c] rounded-lg p-4 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.3)] bg-[#f56565]"></div>
              <div className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.3)] bg-[#ecc94b]"></div>
              <div className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.3)] bg-[#48bb78]"></div>
            </div>
            <div className="w-8 h-8 bg-[#1a202c] rounded flex items-center justify-center">
              <div className="w-full h-full bg-[radial-gradient(#2d3748_20%,transparent_20%)] bg-[0_0] bg-[length:8px_8px]"></div>
            </div>
          </div>
          
          <div className="bg-[#2b4c7c] rounded-lg p-4">
            <div className="bg-[#bcdaf7] p-4 rounded text-center">
              <h2 className="text-[#1a365d] text-xl font-semibold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {currentTrack.title}
              </h2>
              <p className="text-[#2a4365] text-base whitespace-nowrap overflow-hidden text-ellipsis">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          <div className="h-12 my-4 bg-[#1a202c] rounded-lg p-2 overflow-hidden relative">
            <svg
              className={`w-full h-full ${isPlaying ? 'animate-wave' : ''}`}
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
            >
              <path
                className="fill-none stroke-[#4299e1] stroke-[1px] stroke-round opacity-50"
                d={generateWavePath()}
                style={{
                  animation: isPlaying ? 'waveFlow 3.6s linear infinite' : 'none'
                }}
              />
              <path
                className="fill-none stroke-[#4299e1] stroke-[1px] stroke-round opacity-50"
                d={generateWavePath()}
                style={{
                  animation: isPlaying ? 'waveFlow 3.6s linear infinite' : 'none',
                  animationDelay: '-1.2s'
                }}
              />
              <path
                className="fill-none stroke-[#4299e1] stroke-[1px] stroke-round opacity-50"
                d={generateWavePath()}
                style={{
                  animation: isPlaying ? 'waveFlow 3.6s linear infinite' : 'none',
                  animationDelay: '-2.4s'
                }}
              />
            </svg>
            <style jsx>{`
              @keyframes waveFlow {
                0% {
                  transform: translateX(0%);
                  opacity: 0.5;
                }
                100% {
                  transform: translateX(-50%);
                  opacity: 0.2;
                }
              }
            `}</style>
          </div>

          <div className="flex justify-center">
            <button 
              className="w-16 h-16 rounded-full border-none bg-[#4299e1] text-white cursor-pointer flex items-center justify-center transition-all duration-200 ease-linear shadow-[0_4px_6px_rgba(66,153,225,0.3)] hover:bg-[#3182ce] hover:scale-105 active:scale-95"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
            </button>
          </div>
        </div>
        <audio ref={audioRef} />
      </div>
    </div>
  );
};

export default Radio;