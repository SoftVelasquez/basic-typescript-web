import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  Film,
  Tv,
  ArrowLeft,
  Loader2,
  Play,
} from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Content, Episode } from '@/hooks/useContent';

const GENRES = [
  'Acción',
  'Aventura',
  'Animación',
  'Comedia',
  'Crimen',
  'Documental',
  'Drama',
  'Familia',
  'Fantasía',
  'Historia',
  'Terror',
  'Música',
  'Misterio',
  'Romance',
  'Ciencia Ficción',
  'Película de TV',
  'Suspense',
  'Bélica',
  'Western',
  'Anime',
  'Dorama',
];

const SECTIONS = [
  { id: 'trending', label: 'Tendencias' },
  { id: 'new_releases', label: 'Nuevos Lanzamientos' },
  { id: 'popular', label: 'Populares' },
  { id: 'top_rated', label: 'Mejor Valorados' },
];

const MAIN_SECTIONS = [
  { id: 'peliculas', label: 'Peliculas' },
  { id: 'series', label: 'Series' },
  { id: 'anime', label: 'Anime' },
  { id: 'doramas', label: 'Doramas' },
];

const HOME_SECTIONS = [
  { id: 'en_estreno', label: 'En Estreno / Emision' },
  { id: 'recien_agregado', label: 'Recien Agregado' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'populares', label: 'Populares' },
  { id: 'mejor_valorados', label: 'Mejor Valorados' },
  { id: 'recomendados', label: 'Recomendados' },
];

export default function AdminContentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [content, setContent] = useState<Partial<Content>>({
    media_type: 'movie',
    title: '',
    original_title: '',
    overview: '',
    poster_path: '',
    backdrop_path: '',
    release_date: '',
    vote_average: 0,
    genres: [],
    video_url: '',
    display_options: {
      main_sections: [],
      home_sections: [],
      platforms: [],
    },
    seasons: {},
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchContent();
    }
  }, [id, isEditing]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'content', id!);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Content;
        setContent({
          ...data,
          display_options: data.display_options || {
            main_sections: [],
            home_sections: [],
            platforms: [],
          },
        });
      } else {
        toast.error('Contenido no encontrado');
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      toast.error('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.title || !content.overview) {
      toast.error('Título y descripción son obligatorios');
      return;
    }

    try {
      setSaving(true);

      const contentData = {
        ...content,
        imported_at: serverTimestamp(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'content', id), contentData);
        toast.success('Contenido actualizado correctamente');
      } else {
        const newId = Date.now().toString();
        await setDoc(doc(db, 'content', newId), {
          ...contentData,
          id: parseInt(newId),
        });
        toast.success('Contenido creado correctamente');
      }

      navigate('/admin/content');
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Error al guardar el contenido');
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setContent((prev) => ({
      ...prev,
      genres: prev.genres?.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...(prev.genres || []), genre],
    }));
  };

  const toggleMainSection = (sectionId: string) => {
    setContent((prev) => ({
      ...prev,
      display_options: {
        ...prev.display_options,
        main_sections: prev.display_options?.main_sections?.includes(sectionId)
          ? prev.display_options.main_sections.filter((s) => s !== sectionId)
          : [...(prev.display_options?.main_sections || []), sectionId],
        home_sections: prev.display_options?.home_sections || [],
        platforms: prev.display_options?.platforms || [],
      },
    }));
  };

  const toggleHomeSection = (sectionId: string) => {
    setContent((prev) => ({
      ...prev,
      display_options: {
        ...prev.display_options,
        main_sections: prev.display_options?.main_sections || [],
        home_sections: prev.display_options?.home_sections?.includes(sectionId)
          ? prev.display_options.home_sections.filter((s) => s !== sectionId)
          : [...(prev.display_options?.home_sections || []), sectionId],
        platforms: prev.display_options?.platforms || [],
      },
    }));
  };

  const toggleSection = (sectionId: string) => {
    toggleMainSection(sectionId);
  };

  // Season & Episode Management
  const addSeason = () => {
    const seasonNumber = Object.keys(content.seasons || {}).length + 1;
    setContent((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNumber]: {
          season_number: seasonNumber,
          episodes: {},
        },
      },
    }));
  };

  const addEpisode = (seasonNumber: number) => {
    const season = content.seasons?.[seasonNumber];
    if (!season) return;

    const episodeNumber = Object.keys(season.episodes).length + 1;
    setContent((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNumber]: {
          ...season,
          episodes: {
            ...season.episodes,
            [episodeNumber]: {
              episode_number: episodeNumber,
              name: `Episodio ${episodeNumber}`,
              overview: '',
              still_path: '',
              video_url: '',
            },
          },
        },
      },
    }));
  };

  const updateEpisode = (
    seasonNumber: number,
    episodeNumber: number,
    field: keyof Episode,
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNumber]: {
          ...prev.seasons![seasonNumber],
          episodes: {
            ...prev.seasons![seasonNumber].episodes,
            [episodeNumber]: {
              ...prev.seasons![seasonNumber].episodes[episodeNumber],
              [field]: value,
            },
          },
        },
      },
    }));
  };

  const removeEpisode = (seasonNumber: number, episodeNumber: number) => {
    setContent((prev) => {
      const newSeasons = { ...prev.seasons };
      delete newSeasons[seasonNumber].episodes[episodeNumber];
      return { ...prev, seasons: newSeasons };
    });
  };

  const removeSeason = (seasonNumber: number) => {
    setContent((prev) => {
      const newSeasons = { ...prev.seasons };
      delete newSeasons[seasonNumber];
      return { ...prev, seasons: newSeasons };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/content')}
          className="border-gray-700 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Editar Contenido' : 'Nuevo Contenido'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isEditing ? content.title : 'Crea nuevo contenido para la plataforma'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1a1a1a] border-gray-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Imágenes & Video</TabsTrigger>
          <TabsTrigger value="sections">Secciones</TabsTrigger>
          {content.media_type === 'tv' && (
            <TabsTrigger value="episodes">Episodios</TabsTrigger>
          )}
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Media Type */}
          <div className="space-y-2">
            <Label className="text-white">Tipo de Contenido</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={content.media_type === 'movie' ? 'default' : 'outline'}
                onClick={() => setContent((prev) => ({ ...prev, media_type: 'movie' }))}
                className={
                  content.media_type === 'movie'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-gray-700 text-gray-400'
                }
              >
                <Film className="w-4 h-4 mr-2" />
                Película
              </Button>
              <Button
                type="button"
                variant={content.media_type === 'tv' ? 'default' : 'outline'}
                onClick={() => setContent((prev) => ({ ...prev, media_type: 'tv' }))}
                className={
                  content.media_type === 'tv'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border-gray-700 text-gray-400'
                }
              >
                <Tv className="w-4 h-4 mr-2" />
                Serie
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-white">Título</Label>
            <Input
              value={content.title}
              onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Título del contenido"
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
          </div>

          {/* Original Title */}
          <div className="space-y-2">
            <Label className="text-white">Título Original (opcional)</Label>
            <Input
              value={content.original_title || ''}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, original_title: e.target.value }))
              }
              placeholder="Título original"
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <Label className="text-white">Descripción</Label>
            <Textarea
              value={content.overview}
              onChange={(e) => setContent((prev) => ({ ...prev, overview: e.target.value }))}
              placeholder="Descripción del contenido"
              rows={4}
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
          </div>

          {/* Release Date */}
          <div className="space-y-2">
            <Label className="text-white">Fecha de Estreno</Label>
            <Input
              type="date"
              value={content.release_date || ''}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, release_date: e.target.value }))
              }
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
          </div>

          {/* Vote Average */}
          <div className="space-y-2">
            <Label className="text-white">Puntuación (0-10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={content.vote_average}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, vote_average: parseFloat(e.target.value) }))
              }
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <Label className="text-white">Géneros</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    content.genres?.includes(genre)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          {/* Poster Path */}
          <div className="space-y-2">
            <Label className="text-white">URL del Póster (TMDB)</Label>
            <div className="flex gap-2">
              <Input
                value={content.poster_path}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, poster_path: e.target.value }))
                }
                placeholder="/ruta/al/poster.jpg"
                className="bg-[#1a1a1a] border-gray-700 text-white flex-1"
              />
              {content.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${content.poster_path}`}
                  alt="Preview"
                  className="w-16 h-24 object-cover rounded"
                />
              )}
            </div>
            <p className="text-gray-500 text-sm">
              Ejemplo: /qJ2tW6WMUDux911r6m7haRef0WH.jpg
            </p>
          </div>

          {/* Backdrop Path */}
          <div className="space-y-2">
            <Label className="text-white">URL del Fondo (TMDB)</Label>
            <div className="flex gap-2">
              <Input
                value={content.backdrop_path || ''}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, backdrop_path: e.target.value }))
                }
                placeholder="/ruta/al/backdrop.jpg"
                className="bg-[#1a1a1a] border-gray-700 text-white flex-1"
              />
              {content.backdrop_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${content.backdrop_path}`}
                  alt="Preview"
                  className="w-32 h-18 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label className="text-white">
              {content.media_type === 'movie' ? 'URL del Video' : 'URL del Trailer'}
            </Label>
            <Input
              value={content.video_url || ''}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, video_url: e.target.value }))
              }
              placeholder="https://ejemplo.com/video.mp4"
              className="bg-[#1a1a1a] border-gray-700 text-white"
            />
            {content.video_url && (
              <a
                href={content.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 text-sm hover:underline inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Probar video
              </a>
            )}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          {/* Main Sections */}
          <div className="space-y-2">
            <Label className="text-white">Secciones Principales (donde aparece)</Label>
            <p className="text-gray-500 text-sm">
              Selecciona en que paginas principales aparecera este contenido (Peliculas, Series, Anime, Doramas)
            </p>
            <div className="flex flex-wrap gap-2">
              {MAIN_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => toggleMainSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    content.display_options?.main_sections?.includes(section.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Home Sections */}
          <div className="space-y-2">
            <Label className="text-white">Secciones del Inicio</Label>
            <p className="text-gray-500 text-sm">
              Selecciona en que secciones del inicio aparecera este contenido
            </p>
            <div className="flex flex-wrap gap-2">
              {HOME_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => toggleHomeSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    content.display_options?.home_sections?.includes(section.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Home Section */}
          <div className="space-y-2">
            <Label className="text-white">Seccion personalizada del Inicio</Label>
            <p className="text-gray-500 text-sm">
              Agrega una seccion personalizada. Escribe un identificador (ej: accion_navidad) y presiona Enter.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="nombre_de_seccion"
                className="bg-[#1a1a1a] border-gray-700 text-white flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim().toLowerCase().replace(/\s+/g, '_');
                    if (val) {
                      toggleHomeSection(val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
            {/* Show current custom sections */}
            <div className="flex flex-wrap gap-2 mt-2">
              {content.display_options?.home_sections
                ?.filter((s) => !HOME_SECTIONS.some((h) => h.id === s))
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleHomeSection(s)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    {s} x
                  </button>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Episodes Tab (TV only) */}
        {content.media_type === 'tv' && (
          <TabsContent value="episodes" className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-white">Temporadas y Episodios</Label>
              <Button
                type="button"
                onClick={addSeason}
                variant="outline"
                className="border-gray-700 text-gray-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Temporada
              </Button>
            </div>

            {Object.entries(content.seasons || {}).map(([seasonNum, season]) => (
              <div key={seasonNum} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    Temporada {season.season_number}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => addEpisode(season.season_number)}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-400"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Episodio
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeSeason(season.season_number)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(season.episodes).map(([epNum, episode]) => (
                    <div
                      key={epNum}
                      className="bg-[#0a0a0a] rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          Episodio {episode.episode_number}
                        </span>
                        <Button
                          type="button"
                          onClick={() =>
                            removeEpisode(season.season_number, episode.episode_number)
                          }
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <Input
                        value={episode.name}
                        onChange={(e) =>
                          updateEpisode(
                            season.season_number,
                            episode.episode_number,
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="Nombre del episodio"
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />

                      <Textarea
                        value={episode.overview}
                        onChange={(e) =>
                          updateEpisode(
                            season.season_number,
                            episode.episode_number,
                            'overview',
                            e.target.value
                          )
                        }
                        placeholder="Descripción del episodio"
                        rows={2}
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />

                      <Input
                        value={episode.still_path}
                        onChange={(e) =>
                          updateEpisode(
                            season.season_number,
                            episode.episode_number,
                            'still_path',
                            e.target.value
                          )
                        }
                        placeholder="Ruta de imagen (TMDB)"
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />

                      <Input
                        value={episode.video_url}
                        onChange={(e) =>
                          updateEpisode(
                            season.season_number,
                            episode.episode_number,
                            'video_url',
                            e.target.value
                          )
                        }
                        placeholder="URL del video"
                        className="bg-[#1a1a1a] border-gray-700 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        )}
      </Tabs>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-gray-800">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEditing ? 'Guardar Cambios' : 'Crear Contenido'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/content')}
          className="border-gray-700 text-gray-400"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
