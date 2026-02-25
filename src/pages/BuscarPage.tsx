import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MovieCarousel } from '@/components/MovieCarousel';
import { LoginModal } from '@/components/LoginModal';
import { useContent } from '@/hooks/useContent';
import { Search } from 'lucide-react';

export default function BuscarPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { content, loading } = useContent();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/buscar', { replace: true });
    }
  };

  const filteredContent = useMemo(() => {
    if (!initialQuery.trim()) return [];
    const query = initialQuery.toLowerCase();
    return content.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.overview.toLowerCase().includes(query) ||
        item.genres?.some((g) => g.toLowerCase().includes(query))
    );
  }, [initialQuery, content]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar
        onSearch={handleSearch}
        onLoginClick={() => setIsLoginOpen(true)}
        initialSearch={initialQuery}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <main className="pt-20 pb-12">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-red-600/20">
              <Search className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Resultados de busqueda</h1>
              {initialQuery && (
                <p className="text-gray-400 mt-1">
                  {filteredContent.length} resultados para &quot;{initialQuery}&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto" />
          </div>
        ) : filteredContent.length > 0 ? (
          <MovieCarousel title="" content={filteredContent} />
        ) : initialQuery ? (
          <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12 text-center">
            <p className="text-gray-500 text-lg">
              No se encontraron resultados. Intenta con otra busqueda.
            </p>
          </div>
        ) : (
          <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12 text-center">
            <p className="text-gray-500 text-lg">
              Escribe en la barra de busqueda para encontrar contenido.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
