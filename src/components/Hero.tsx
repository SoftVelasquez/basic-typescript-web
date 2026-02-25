import { useState, useEffect } from 'react';
import { Play, Info, Plus, Volume2, VolumeX, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Content } from '@/hooks/useContent';

interface HeroProps {
  content: Content | null;
  isInMyList?: boolean;
  onPlay?: () => void;
  onMoreInfo?: () => void;
  onToggleMyList?: () => void;
}

export function Hero({
  content,
  isInMyList = false,
  onPlay,
  onMoreInfo,
  onToggleMyList,
}: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!content) {
    return (
      <div className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Cargando...</div>
      </div>
    );
  }

  const backdropUrl = content.backdrop_path
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : content.poster_path
    ? `https://image.tmdb.org/t/p/original${content.poster_path}`
    : '';

  const isMovie = content.media_type === 'movie';
  const duration = isMovie
    ? content.release_date
      ? new Date(content.release_date).getFullYear()
      : ''
    : content.seasons
    ? `${Object.keys(content.seasons).length} temporadas`
    : '';

  const isNew =
    content.imported_at &&
    new Date(content.imported_at.toDate()).getTime() >
      Date.now() - 30 * 24 * 60 * 60 * 1000;

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 gradient-overlay" />
      </div>

      {/* Content */}
      <div
        className={`relative h-full flex items-end pb-16 lg:pb-24 px-4 sm:px-6 lg:px-12 xl:px-20 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-3xl">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {isNew && (
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded">
                Nuevo
              </span>
            )}
            {content.display_options?.main_sections?.includes('trending') && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded">
                Tendencia #1
              </span>
            )}
            <span className="text-gray-300 text-sm">{duration}</span>
            <span className="px-2 py-0.5 border border-gray-500 text-gray-300 text-xs rounded">
              HD
            </span>
            {content.media_type === 'tv' && (
              <span className="text-gray-300 text-sm">Serie</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
            {content.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {content.genres?.map((genre, index) => (
              <span key={genre} className="flex items-center text-gray-300 text-sm">
                {genre}
                {index < (content.genres?.length || 0) - 1 && (
                  <span className="ml-2 w-1 h-1 bg-gray-500 rounded-full" />
                )}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-base lg:text-lg mb-8 line-clamp-3 max-w-2xl">
            {content.overview}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor((content.vote_average || 0) / 2)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white font-bold">{content.vote_average?.toFixed(1)}</span>
            <span className="text-gray-500">/10</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6 text-lg rounded-lg transition-all duration-200 hover:scale-105"
              onClick={onPlay}
            >
              <Play className="w-5 h-5 mr-2 fill-black" />
              Reproducir
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-gray-600/80 text-white hover:bg-gray-500/80 font-semibold px-8 py-6 text-lg rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
              onClick={onMoreInfo}
            >
              <Info className="w-5 h-5 mr-2" />
              Más Información
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-500 text-white hover:bg-white/10 font-semibold px-6 py-6 text-lg rounded-lg transition-all duration-200 hover:scale-105"
              onClick={onToggleMyList}
            >
              {isInMyList ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-8 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all duration-200"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
