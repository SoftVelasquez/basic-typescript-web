import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCarousel } from '@/components/MovieCarousel';
import { LoginModal } from '@/components/LoginModal';
import { useContentByGenre } from '@/hooks/useContent';
import { Tag } from 'lucide-react';

export default function CategoriaPage() {
  const { genre } = useParams<{ genre: string }>();
  const decodedGenre = decodeURIComponent(genre || '');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { content, loading } = useContentByGenre(decodedGenre);
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    if (q.trim()) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const movies = content.filter(
    (c) =>
      c.display_options?.main_sections?.includes('movies') ||
      c.media_type === 'movie'
  );
  const series = content.filter(
    (c) =>
      c.display_options?.main_sections?.includes('series') ||
      c.media_type === 'tv'
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar onSearch={handleSearch} onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <main className="pt-20 pb-12">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-red-600/20">
              <Tag className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">{decodedGenre}</h1>
              <p className="text-gray-400 mt-1">
                {content.length} resultados en esta categoria
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <MovieCarousel
            title={`Todo en ${decodedGenre}`}
            content={content}
            loading={loading}
          />

          {movies.length > 0 && (
            <MovieCarousel title={`Peliculas de ${decodedGenre}`} content={movies} />
          )}

          {series.length > 0 && (
            <MovieCarousel title={`Series de ${decodedGenre}`} content={series} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
