import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon } from 'lucide-react';
import Header from '../header/Header';
import styles from './Radio.module.css';

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
    <div>
      <Header />
      <div className={styles.playerContainer}>
        <div className={styles.radioUnit}>
          <div className={styles.topPanel}>
            <div className={styles.indicators}>
              <div className={`${styles.led} ${styles.ledRed}`}></div>
              <div className={`${styles.led} ${styles.ledYellow}`}></div>
              <div className={`${styles.led} ${styles.ledGreen}`}></div>
            </div>
            <div className={styles.speakerIcon}>
              <div className={styles.speakerHoles}></div>
            </div>
          </div>
          
          <div className={styles.display}>
            <div className={styles.displayContent}>
              <h2 className={styles.title}>{currentTrack.title}</h2>
              <p className={styles.artist}>{currentTrack.artist}</p>
            </div>
          </div>

          <div className={styles.waveformContainer}>
            <svg
              className={`${styles.waveform} ${isPlaying ? styles.waveformActive : ''}`}
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
            >
              <path
                className={styles.wave}
                d={generateWavePath()}
              />
              <path
                className={styles.wave}
                d={generateWavePath()}
                style={{ animationDelay: '-1.2s' }}
              />
              <path
                className={styles.wave}
                d={generateWavePath()}
                style={{ animationDelay: '-2.4s' }}
              />
            </svg>
          </div>

          <div className={styles.controls}>
            <button 
              className={styles.playButton} 
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