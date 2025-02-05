import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, Volume2Icon } from 'lucide-react';
import Header from '../header/Header';
import styles from './Radio.module.css';

const HEARTBEAT_INTERVAL = 45000;
const STREAM_URL = 'https://listen.moe/stream';
const WEBSOCKET_URL = 'wss://listen.moe/gateway_v2';

const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Loading...',
    artist: 'Loading...',
    listeners: 0
  });

  const audioRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    let heartbeatInterval;
  
    const setupWebSocket = () => {
      const ws = new WebSocket('wss://listen.moe/gateway_v2');
      wsRef.current = ws;
  
      ws.onopen = () => {
        console.log('Connected to LISTEN.moe WebSocket');
        ws.send(JSON.stringify({ op: 9 })); // Sending heartbeat
  
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 9 }));
          }
        }, HEARTBEAT_INTERVAL);
      };
  
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket Message:', data); // Debugging incoming messages
  
          if (data.t === 'TRACK_UPDATE' && data.d?.song) {
            const song = data.d.song;
            setCurrentTrack({
              title: song.title || 'Unknown Title',
              artist: song.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
              listeners: data.d.listeners ?? 0
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
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
      console.error('Audio error occurred, attempting to reload stream.');
      setIsPlaying(false);
      try {
        audio.load();
        await audio.play();
      } catch (retryError) {
        console.error('Error retrying playback:', retryError);
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
      console.error('Playback error:', error);
    }
  };

  return (
    <div>
      <Header />
    <div className={styles.wrapper}>
      <div className={styles.title}>It's time to ditch other radio.</div>
      <div className={styles.container}>
        <div className={styles.radio}>
          <button
            className={styles.playButton}
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <PauseIcon className={styles.icon} size={24} />
            ) : (
              <PlayIcon className={styles.icon} size={24} />
            )}
          </button>

          <div className={styles.trackInfo}>
            <div className={styles.title}>{currentTrack.title}</div>
            <div className={styles.artist}>{currentTrack.artist}</div>
            <div className={styles.listeners}>
              <Volume2Icon size={14} className={styles.listenerIcon} />
              {currentTrack.listeners.toLocaleString()} Listeners
            </div>
          </div>
        </div>
        <audio ref={audioRef} />
      </div>
    </div>
    </div>
  );
};

export default Radio;
