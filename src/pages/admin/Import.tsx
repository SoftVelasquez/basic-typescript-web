import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Film,
  Tv,
  Loader2,
  Plus,
  AlertCircle,
  Star,
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const TMDB_API_KEY = '32e5e53999e380a0291d66fb304153fe';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
}

const GENRE_MAP: Record<number, string> = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia Ficción',
  10770: 'Película de TV',
  53: 'Suspense',
  10752: 'Bélica',
  37: 'Western',
};

export default function AdminImport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [importing, setImporting] = useState<number | null>(null);
  const navigate = useNavigate();

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await fetch(
        `${TMDB_BASE_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&language=es-ES`
      );

      if (!response.ok) throw new Error('Error en la búsqueda');

      const data = await response.json();
      setResults(
        data.results.map((item: any) => ({
          ...item,
          media_type: mediaType,
        }))
      );
    } catch (err) {
      console.error('Error searching TMDB:', err);
      toast.error('Error al buscar en TMDB');
    } finally {
      setSearching(false);
    }
  };

  const importContent = async (item: TMDBResult) => {
    try {
      setImporting(item.id);

      const detailResponse = await fetch(
        `${TMDB_BASE_URL}/${mediaType}/${item.id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=videos,credits`
      );

      if (!detailResponse.ok) throw new Error('Error fetching details');

      const detailData = await detailResponse.json();

      const genres = detailData.genres?.map((g: any) => g.name) ||
        item.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean);

      const contentData = {
        id: item.id,
        media_type: mediaType,
        title: item.title || item.name || '',
        original_title: detailData.original_title || detailData.original_name || '',
        overview: item.overview || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        release_date: item.release_date || item.first_air_date || '',
        vote_average: item.vote_average || 0,
        genres: genres,
        video_url: '',
        display_options: {
          main_sections: [],
          home_sections: [],
          platforms: [],
        },
        imported_by: 'admin',
        imported_at: serverTimestamp(),
      };

      if (mediaType === 'tv' && detailData.seasons) {
        const seasons: Record<string, any> = {};

        for (const season of detailData.seasons) {
          if (season.season_number === 0) continue;

          const seasonResponse = await fetch(
            `${TMDB_BASE_URL}/tv/${item.id}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=es-ES`
          );

          if (seasonResponse.ok) {
            const seasonData = await seasonResponse.json();
            const episodes: Record<string, any> = {};

            seasonData.episodes?.forEach((ep: any) => {
              episodes[ep.episode_number] = {
                episode_number: ep.episode_number,
                name: ep.name,
                overview: ep.overview || '',
                still_path: ep.still_path || '',
                video_url: '',
              };
            });

            seasons[season.season_number] = {
              season_number: season.season_number,
              episodes,
            };
          }
        }

        (contentData as any).seasons = seasons;
      }

      const docId = `${mediaType}_${item.id}`;
      await setDoc(doc(db, 'content', docId), contentData);

      toast.success(`${contentData.title} importado correctamente`);
      navigate(`/admin/content/edit/${docId}`);
    } catch (err) {
      console.error('Error importing content:', err);
      toast.error('Error al importar el contenido');
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Importar Contenido</h1>
        <p className="text-gray-400 mt-1">
          Busca y importa películas o series desde TMDB
        </p>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Tipo de Contenido</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={mediaType === 'movie' ? 'default' : 'outline'}
                onClick={() => setMediaType('movie')}
                className={
                  mediaType === 'movie'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-gray-700 text-gray-400'
                }
              >
                <Film className="w-4 h-4 mr-2" />
                Película
              </Button>
              <Button
                type="button"
                variant={mediaType === 'tv' ? 'default' : 'outline'}
                onClick={() => setMediaType('tv')}
                className={
                  mediaType === 'tv'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border-gray-700 text-gray-400'
                }
              >
                <Tv className="w-4 h-4 mr-2" />
                Serie
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Buscar</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
                placeholder={`Buscar ${mediaType === 'movie' ? 'película' : 'serie'}...`}
                className="bg-[#0a0a0a] border-gray-700 text-white flex-1"
              />
              <Button
                onClick={searchTMDB}
                disabled={searching || !searchQuery.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Resultados ({results.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all"
              >
                <div className="aspect-[2/3] relative">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-600" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => importContent(item)}
                      disabled={importing === item.id}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {importing === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      Importar
                    </Button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-white font-medium text-sm line-clamp-1">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      <span className="text-xs">{item.vote_average?.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {item.release_date || item.first_air_date
                        ? new Date(item.release_date || item.first_air_date!).getFullYear()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-medium">Información</h3>
            <p className="text-gray-400 text-sm mt-1">
              Después de importar, serás redirigido a la página de edición donde podrás
              agregar las URLs de los videos. Las imágenes se cargan automáticamente desde TMDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
