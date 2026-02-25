import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Tv,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Star,
} from 'lucide-react';
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Content } from '@/hooks/useContent';

export default function AdminContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [deleteItem, setDeleteItem] = useState<Content | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    let filtered = content;

    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.media_type === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.overview.toLowerCase().includes(query)
      );
    }

    setFilteredContent(filtered);
  }, [content, searchQuery, filterType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const contentRef = collection(db, 'content');
      const q = query(contentRef, orderBy('imported_at', 'desc'));
      const snapshot = await getDocs(q);

      const contentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Content[];

      setContent(contentData);
      setFilteredContent(contentData);
    } catch (err) {
      console.error('Error fetching content:', err);
      toast.error('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await deleteDoc(doc(db, 'content', deleteItem.id));
      toast.success('Contenido eliminado correctamente');
      setContent((prev) => prev.filter((item) => item.id !== deleteItem.id));
      setDeleteItem(null);
    } catch (err) {
      console.error('Error deleting content:', err);
      toast.error('Error al eliminar el contenido');
    }
  };

  const getPosterUrl = (posterPath: string) => {
    if (posterPath.startsWith('http')) return posterPath;
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Contenido</h1>
          <p className="text-gray-400 mt-1">
            {content.length} elementos en total
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/import')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Importar Nuevo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Buscar películas o series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1a1a1a] border-gray-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className={
              filterType === 'all'
                ? 'bg-red-600 hover:bg-red-700'
                : 'border-gray-700 text-gray-400 hover:text-white'
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            Todos
          </Button>
          <Button
            variant={filterType === 'movie' ? 'default' : 'outline'}
            onClick={() => setFilterType('movie')}
            className={
              filterType === 'movie'
                ? 'bg-red-600 hover:bg-red-700'
                : 'border-gray-700 text-gray-400 hover:text-white'
            }
          >
            <Film className="w-4 h-4 mr-2" />
            Películas
          </Button>
          <Button
            variant={filterType === 'tv' ? 'default' : 'outline'}
            onClick={() => setFilterType('tv')}
            className={
              filterType === 'tv'
                ? 'bg-red-600 hover:bg-red-700'
                : 'border-gray-700 text-gray-400 hover:text-white'
            }
          >
            <Tv className="w-4 h-4 mr-2" />
            Series
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontró contenido</p>
          <p className="text-gray-600 mt-2">
            Intenta con otra búsqueda o importa nuevo contenido
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all"
            >
              {/* Poster */}
              <div className="aspect-[2/3] relative">
                {item.poster_path ? (
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Film className="w-12 h-12 text-gray-600" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/admin/content/edit/${item.id}`)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteItem(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      item.media_type === 'movie'
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {item.media_type === 'movie' ? 'PELÍCULA' : 'SERIE'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <span className="text-xs">{item.vote_average?.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {item.release_date
                      ? new Date(item.release_date).getFullYear()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.genres?.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contenido?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. Se eliminará permanentemente{' '}
              <strong>{deleteItem?.title}</strong> de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
