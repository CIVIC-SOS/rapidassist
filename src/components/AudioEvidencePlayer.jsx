import React, { useState, useRef, useEffect } from 'react';
import './AudioEvidencePlayer.css';

/**
 * Instagram-style Audio Player for SOS Evidence
 */
const AudioEvidencePlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    // If metadata is already loaded
    if (audio.readyState >= 2) {
      setAudioData();
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const wrap = progressRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Static waveform simulation
  const peaks = [30, 60, 45, 80, 50, 70, 40, 90, 65, 55, 75, 45, 60, 40, 30];

  return (
    <div className="instagram-audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button className="play-pause-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <span>Pause</span>
        ) : (
          <span>Play</span>
        )}
      </button>

      <div className="waveform-container">
        <div ref={progressRef} className="progress-bar-wrap" onClick={handleProgressClick}>
          <div className="waveform-peaks">
            {peaks.map((h, i) => (
              <div
                key={i}
                className="peak"
                style={{
                  height: `${h}%`,
                  opacity: (i / peaks.length) * 100 < progress ? 1 : 0.4
                }}
              />
            ))}
          </div>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, position: 'absolute', top: 0, left: 0, height: '100%', background: 'transparent' }}>
            <div className="progress-handle" style={{ display: progress > 0 ? 'block' : 'none' }} />
          </div>
        </div>
      </div>

      <div className="duration-label">
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </div>
    </div>
  );
};

export default AudioEvidencePlayer;
