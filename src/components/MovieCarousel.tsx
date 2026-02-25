import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Plus, Check, Info } from 'lucide-react';
import type { Content, Episode } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VideoPlayer } from './VideoPlayer';

interface MovieCarouselProps {
  title: string;
  content: Content[];
  id?: string;
  loading?: boolean;
  viewAllHref?: string;
}

export function MovieCarousel({ title, content, id, loading = false, viewAllHref }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [playingContent, setPlayingContent] = useState<Content | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<{
    episode: Episode;
    seasonNumber: number;
    episodeNumber: number;
  } | null>(null);
  const [myList, setMyList] = useState<Set<string>>(new Set());

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const toggleMyList = (contentId: string) => {
    setMyList((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const handlePlay = (item: Content, episode?: Episode, seasonNum?: number, episodeNum?: number) => {
    setPlayingContent(item);
    if (episode && seasonNum && episodeNum) {
      setPlayingEpisode({
        episode,
        seasonNumber: seasonNum,
        episodeNumber: episodeNum,
      });
    }
  };

  const getPosterUrl = (posterPath: string) => {
    if (posterPath.startsWith('http')) {
      return posterPath;
    }
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const isNew = (item: Content) => {
    if (!item.imported_at) return false;
    const importedDate = item.imported_at.toDate ? item.imported_at.toDate() : new Date(item.imported_at);
    return importedDate.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <section id={id} className="py-8 lg:py-12">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-6" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (content.length === 0) return null;

  return (
    <section id={id} className="py-8 lg:py-12">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl lg:text-2xl font-bold text-white">{title}</h2>
            {viewAllHref && (
              <Link
                to={viewAllHref}
                className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                Ver todo
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full bg-gray-800/80 text-white transition-all duration-200 ${
                canScrollLeft ? 'hover:bg-gray-700 hover:scale-110' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full bg-gray-800/80 text-white transition-all duration-200 ${
                canScrollRight ? 'hover:bg-gray-700 hover:scale-110' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {content.map((item, index) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] xl:w-[220px] group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedContent(item)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 card-hover">
                {/* Image */}
                {item.poster_path ? (
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Sin imagen</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        className="p-2 rounded-full bg-white text-black hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(item);
                        }}
                      >
                        <Play className="w-4 h-4 fill-black" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-gray-700/80 text-white hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMyList(item.id);
                        }}
                      >
                        {myList.has(item.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                      <button
                        className="p-2 rounded-full bg-gray-700/80 text-white hover:scale-110 transition-transform ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContent(item);
                        }}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">{item.title}</h3>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-green-400 font-medium">{item.vote_average?.toFixed(1)} match</span>
                      <span>{item.media_type === 'movie' ? 'Película' : 'Serie'}</span>
                      <span className="px-1 border border-gray-500 rounded text-[10px]">HD</span>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.genres?.slice(0, 2).map((genre) => (
                        <span key={genre} className="text-[10px] text-gray-400">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isNew(item) && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                      NUEVO
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Details Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        {selectedContent && (
          <DialogContent className="max-w-4xl bg-[#141414] border-gray-800 text-white p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80">
              {selectedContent.backdrop_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${selectedContent.backdrop_path}`}
                  alt={selectedContent.title}
                  className="w-full h-full object-cover"
                />
              ) : selectedContent.poster_path ? (
                <img
                  src={getPosterUrl(selectedContent.poster_path)}
                  alt={selectedContent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="px-6 pb-6 -mt-16 relative">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-white mb-2">
                  {selectedContent.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedContent.overview}
                </DialogDescription>
              </DialogHeader>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 my-4">
                <span className="text-green-400 font-semibold">
                  {selectedContent.vote_average?.toFixed(1)} de popularidad
                </span>
                <span className="text-gray-500">
                  {selectedContent.release_date
                    ? new Date(selectedContent.release_date).getFullYear()
                    : ''}
                </span>
                <span className="text-gray-500">
                  {selectedContent.media_type === 'movie' ? 'Película' : 'Serie'}
                </span>
                <span className="px-2 py-0.5 border border-gray-600 text-gray-400 text-xs rounded">HD</span>
                {selectedContent.media_type === 'tv' && selectedContent.seasons && (
                  <span className="text-gray-500">
                    {Object.keys(selectedContent.seasons).length} temporadas
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Button
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-6"
                  onClick={() => handlePlay(selectedContent)}
                >
                  <Play className="w-4 h-4 mr-2 fill-black" />
                  Reproducir
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-white/10"
                  onClick={() => toggleMyList(selectedContent.id)}
                >
                  {myList.has(selectedContent.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      En Mi Lista
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar a Mi Lista
                    </>
                  )}
                </Button>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-gray-500">Géneros:</span>
                {selectedContent.genres?.map((genre) => (
                  <span key={genre} className="text-gray-300">
                    {genre}
                  </span>
                ))}
              </div>

              {/* Episodes for TV Shows */}
              {selectedContent.media_type === 'tv' && selectedContent.seasons && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Episodios</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(selectedContent.seasons).map(([seasonKey, season]) => (
                      <div key={seasonKey} className="border-t border-gray-800 pt-4">
                        <h4 className="text-lg font-semibold text-white mb-3">
                          Temporada {season.season_number}
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(season.episodes).map(([episodeKey, episode]) => (
                            <div
                              key={episodeKey}
                              className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                              onClick={() =>
                                handlePlay(
                                  selectedContent,
                                  episode,
                                  season.season_number,
                                  episode.episode_number
                                )
                              }
                            >
                              {episode.still_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                                  alt={episode.name}
                                  className="w-24 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-24 h-16 bg-gray-700 rounded flex items-center justify-center">
                                  <Play className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  E{episode.episode_number}: {episode.name}
                                </p>
                                <p className="text-gray-400 text-sm line-clamp-1">{episode.overview}</p>
                              </div>
                              <Play className="w-5 h-5 text-white" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Video Player */}
      {playingContent && (
        <VideoPlayer
          content={playingContent}
          episode={playingEpisode?.episode}
          seasonNumber={playingEpisode?.seasonNumber}
          episodeNumber={playingEpisode?.episodeNumber}
          onClose={() => {
            setPlayingContent(null);
            setPlayingEpisode(null);
          }}
        />
      )}
    </section>
  );
}
