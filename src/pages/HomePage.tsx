import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { MovieCarousel } from '@/components/MovieCarousel';
import { Categories } from '@/components/Categories';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { VideoPlayer } from '@/components/VideoPlayer';

import {
  useDerivedSections,
  useContentByHomeSection,
  useMovies,
  useSeries,
  type Content,
} from '@/hooks/useContent';

/** Map of home_section keys to their proper Spanish labels */
const HOME_SECTION_LABELS: Record<string, string> = {
  en_estreno: 'En Estreno / Emision',
  recien_agregado: 'Recien Agregado',
  tendencias: 'Tendencias',
  populares: 'Populares',
  mejor_valorados: 'Mejor Valorados',
  recomendados: 'Recomendados',
};

function getHomeSectionLabel(sectionKey: string): string {
  if (HOME_SECTION_LABELS[sectionKey]) {
    return HOME_SECTION_LABELS[sectionKey];
  }
  return sectionKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Renders a single home_section carousel */
function HomeSectionCarousel({ sectionKey }: { sectionKey: string }) {
  const { content, loading } = useContentByHomeSection(sectionKey);
  if (!loading && content.length === 0) return null;

  return <MovieCarousel title={getHomeSectionLabel(sectionKey)} content={content} loading={loading} />;
}

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [playingContent, setPlayingContent] = useState<Content | null>(null);
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const {
    content: allContent,
    homeSections,
    genres,
    recentlyAdded,
    loading: allLoading,
  } = useDerivedSections();
  const { movies, loading: moviesLoading } = useMovies();
  const { series, loading: seriesLoading } = useSeries();

  // Pick a featured item
  useEffect(() => {
    if (allContent.length > 0 && !featuredContent) {
      const trending = allContent.find((c) =>
        c.display_options?.home_sections?.includes('en_estreno')
      );
      setFeaturedContent(trending || allContent[0]);
    }
  }, [allContent, featuredContent]);

  const handleSearch = (q: string) => {
    if (q.trim()) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const toggleMyList = (id: string) => {
    setMyList((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handlePlay = (item: Content) => {
    // For movies, play directly if video_url exists
    // For series (tv), play the content - VideoPlayer will show first episode or "not available"
    if (item.video_url || item.seasons) {
      setPlayingContent(item);
    }
  };

  const isInMyList = (id: string) => myList.has(id);

  // Derive home section keys (sorted)
  const homeSectionKeys = Array.from(homeSections.keys());

  // Derive genre keys (only genres with >=2 items)
  const genreKeys = Array.from(genres.entries())
    .filter(([, items]) => items.length >= 2)
    .map(([key]) => key);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar onSearch={handleSearch} onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <main>
        {/* Hero */}
        <Hero
          content={featuredContent}
          isInMyList={featuredContent ? isInMyList(featuredContent.id) : false}
          onPlay={() => featuredContent && handlePlay(featuredContent)}
          onMoreInfo={() => {}}
          onToggleMyList={() => featuredContent && toggleMyList(featuredContent.id)}
        />

        {/* Category pills */}
        <Categories genres={genreKeys} />

        <div className="space-y-2">
          {/* ── Dynamic home_sections from content documents ── */}
          {homeSectionKeys.map((key) => (
            <HomeSectionCarousel key={key} sectionKey={key} />
          ))}

          {/* ── Recien Agregado ── */}
          {recentlyAdded.length > 0 && (
            <MovieCarousel
              title="Recien Agregado"
              content={recentlyAdded}
              loading={allLoading}
            />
          )}

          {/* ── Peliculas ── */}
          <MovieCarousel
            title="Peliculas"
            content={movies}
            loading={moviesLoading}
            viewAllHref="/peliculas"
          />

          {/* ── Series ── */}
          <MovieCarousel
            title="Series"
            content={series}
            loading={seriesLoading}
            viewAllHref="/series"
          />

          {/* ── Genre sections ── */}
          {genreKeys.map((genre) => (
            <MovieCarousel
              key={genre}
              title={genre}
              content={genres.get(genre) || []}
              loading={allLoading}
              viewAllHref={`/categoria/${encodeURIComponent(genre)}`}
            />
          ))}

          {/* ── Todo el Contenido ── */}
          {allContent.length > 0 && (
            <MovieCarousel
              title="Todo el Contenido"
              content={allContent}
              loading={allLoading}
            />
          )}
        </div>
      </main>

      <Footer />

      {playingContent && (
        <VideoPlayer
          content={playingContent}
          onClose={() => setPlayingContent(null)}
        />
      )}
    </div>
  );
}
