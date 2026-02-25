import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCarousel } from '@/components/MovieCarousel';
import { LoginModal } from '@/components/LoginModal';
import { useContentByMainSection, type Content } from '@/hooks/useContent';
import { Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SeriesPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { content: series, loading } = useContentByMainSection('series');
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    if (q.trim()) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const byGenre = useMemo(() => {
    const map: Record<string, Content[]> = {};
    series.forEach((item) => {
      item.genres?.forEach((g) => {
        if (!map[g]) map[g] = [];
        map[g].push(item);
      });
    });
    return map;
  }, [series]);

  const recent = useMemo(() => {
    return series.filter((s) => {
      if (!s.imported_at) return false;
      const d = s.imported_at.toDate ? s.imported_at.toDate() : new Date(s.imported_at);
      return d.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
    });
  }, [series]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar onSearch={handleSearch} onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <main className="pt-20 pb-12">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-red-600/20">
              <Tv className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Series</h1>
              <p className="text-gray-400 mt-1">{series.length} series disponibles</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <MovieCarousel title="Todas las Series" content={series} loading={loading} />

          {recent.length > 0 && (
            <MovieCarousel title="Recien Agregadas" content={recent} />
          )}

          {Object.entries(byGenre).map(
            ([genre, items]) =>
              items.length >= 2 && (
                <MovieCarousel
                  key={genre}
                  title={genre}
                  content={items}
                  viewAllHref={`/categoria/${encodeURIComponent(genre)}`}
                />
              )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
