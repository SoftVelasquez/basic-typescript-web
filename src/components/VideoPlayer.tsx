import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import type { Content, Episode } from '@/hooks/useContent';

interface VideoPlayerProps {
  content: Content;
  episode?: Episode;
  seasonNumber?: number;
  episodeNumber?: number;
  onClose: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export function VideoPlayer({
  content,
  episode,
  seasonNumber,
  episodeNumber,
  onClose,
  onNextEpisode,
  onPrevEpisode,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoUrl = episode?.video_url || content.video_url;
  const title = episode
    ? `${content.title} - T${seasonNumber}:E${episodeNumber} ${episode.name}`
    : content.title;

  // Detect if the URL is an embeddable iframe source (not a direct video file)
  const isEmbedUrl = videoUrl
    ? /\.(mp4|webm|ogg|m3u8|mkv)(\?|$)/i.test(videoUrl) === false &&
      (videoUrl.includes('embed') ||
        videoUrl.includes('iframe') ||
        videoUrl.includes('player') ||
        videoUrl.includes('drive.google.com') ||
        videoUrl.includes('ok.ru') ||
        videoUrl.includes('streamtape') ||
        videoUrl.includes('filemoon') ||
        videoUrl.includes('voe.sx') ||
        videoUrl.includes('dood') ||
        videoUrl.includes('upstream') ||
        videoUrl.includes('mixdrop') ||
        videoUrl.includes('uqload'))
    : false;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Video no disponible</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // For embed URLs, render an iframe player
  if (isEmbedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80">
          <div>
            <h2 className="text-white text-lg font-semibold">{title}</h2>
            {episode && (
              <p className="text-gray-400 text-sm">{episode.overview}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Iframe */}
        <div className="flex-1 relative">
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            style={{ border: 'none' }}
            title={title}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        autoPlay
      />

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-semibold">{title}</h2>
            {episode && (
              <p className="text-gray-400 text-sm">{episode.overview}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-full bg-red-600/90 text-white hover:bg-red-600 hover:scale-110 transition-all"
          >
            <Play className="w-12 h-12 fill-white" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-full text-white hover:bg-white/10"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Previous Episode */}
              {onPrevEpisode && (
                <button
                  onClick={onPrevEpisode}
                  className="p-2 rounded-full text-white hover:bg-white/10"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
              )}

              {/* Next Episode */}
              {onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="p-2 rounded-full text-white hover:bg-white/10"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              )}

              {/* Volume */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-full text-white hover:bg-white/10"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full text-white hover:bg-white/10"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
