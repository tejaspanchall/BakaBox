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
    duration: 0, // duration in seconds (if provided by the WebSocket)
  });
  const [progress, setProgress] = useState(0);

  const audioRef = useRef(null);
  const wsRef = useRef(null);
  // This ref stores the audio element's time (in seconds) corresponding to the start of the current track.
  const trackAudioStartRef = useRef(0);

  // Setup the WebSocket connection to receive track updates.
  useEffect(() => {
    let heartbeatInterval;

    const setupWebSocket = () => {
      const ws = new WebSocket('wss://listen.moe/gateway_v2');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to LISTEN.moe WebSocket');
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
            const newDuration = song.duration || 0;
            // Assume the WebSocket provides a "progress" field (in seconds) showing how far along the track is.
            // If not provided, default to 0.
            const progressOffset = data.d.progress || 0;
            
            setCurrentTrack({
              title: song.title || 'Unknown Title',
              artist:
                song.artists?.map((artist) => artist.name).join(', ') ||
                'Unknown Artist',
              listeners: data.d.listeners ?? 0,
              duration: newDuration,
            });
            if (audioRef.current) {
              // Set the reference so that:
              //   elapsed = audio.currentTime - trackAudioStartRef.current
              // equals the track’s current progress.
              trackAudioStartRef.current = audioRef.current.currentTime - progressOffset;
              // Set the initial progress immediately.
              const initialProgress = newDuration > 0 ? Math.min(progressOffset / newDuration, 1) : 0;
              setProgress(initialProgress);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
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

  // Setup the audio element and update the progress bar using its "timeupdate" event.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = STREAM_URL;
    audio.preload = 'auto';

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = async () => {
      console.error('Audio error occurred');
      setIsPlaying(false);
      try {
        audio.load();
        await audio.play();
      } catch (error) {
        console.error('Error retrying playback:', error);
      }
    };

    // Sync the progress bar with the audio's playback.
    const handleTimeUpdate = () => {
      if (currentTrack.duration > 0 && audio.currentTime >= trackAudioStartRef.current) {
        const elapsed = audio.currentTime - trackAudioStartRef.current;
        const newProgress = Math.min(elapsed / currentTrack.duration, 1);
        setProgress(newProgress);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentTrack.duration]);

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

  // Calculate inline style for the tuner indicator.
  // At progress = 0, the indicator is centered (left: 50% with 0% width).
  // At progress = 1, the indicator spans from left: 0% with 100% width.
  const indicatorLeft = 50 - progress * 50;
  const indicatorWidth = progress * 100;

  return (
    <div>
      <Header />
      <div className={styles.playerContainer}>
        <div className={styles.radioUnit}>
          {/* Top Panel: LED indicators and speaker icon */}
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

          {/* Display Panel: Title and Artist */}
          <div className={styles.display}>
            <div className={styles.displayContent}>
              <h2 className={styles.title}>{currentTrack.title}</h2>
              <p className={styles.artist}>{currentTrack.artist}</p>
            </div>
          </div>

          {/* Tuner Progress Bar */}
          <div className={styles.tuner}>
            <div
              className={styles.tunerIndicator}
              style={{ left: `${indicatorLeft}%`, width: `${indicatorWidth}%` }}
            ></div>
          </div>

          {/* Controls: Play/Pause Button */}
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
