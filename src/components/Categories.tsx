import { Link } from 'react-router-dom';
import { Film, Tv, Sparkles, Globe, Tag } from 'lucide-react';

const FIXED_CATEGORIES = [
  { id: 'peliculas', name: 'Peliculas', icon: <Film className="w-5 h-5" />, color: 'from-red-500 to-red-600', href: '/peliculas' },
  { id: 'series', name: 'Series', icon: <Tv className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', href: '/series' },
  { id: 'anime', name: 'Anime', icon: <Sparkles className="w-5 h-5" />, color: 'from-pink-500 to-rose-600', href: '/anime' },
  { id: 'doramas', name: 'Doramas', icon: <Globe className="w-5 h-5" />, color: 'from-green-500 to-emerald-600', href: '/doramas' },
];

const GENRE_COLORS = [
  'from-orange-500 to-red-500',
  'from-cyan-500 to-teal-600',
  'from-yellow-500 to-amber-600',
  'from-rose-400 to-pink-500',
  'from-indigo-500 to-blue-600',
  'from-emerald-500 to-green-600',
  'from-fuchsia-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

interface CategoriesProps {
  genres?: string[];
}

export function Categories({ genres = [] }: CategoriesProps) {
  const genreCategories = genres.slice(0, 8).map((genre, i) => ({
    id: genre,
    name: genre,
    icon: <Tag className="w-5 h-5" />,
    color: GENRE_COLORS[i % GENRE_COLORS.length],
    href: `/categoria/${encodeURIComponent(genre)}`,
  }));

  const allCategories = [...FIXED_CATEGORIES, ...genreCategories];

  return (
    <section className="py-8 lg:py-12">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">
          Explorar por Categoria
        </h2>

        <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {allCategories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className="relative group overflow-hidden rounded-xl p-4 lg:p-6 transition-all duration-300 hover:scale-105 flex-shrink-0 min-w-[120px]"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                  {category.icon}
                </div>
                <span className="text-white font-semibold text-sm lg:text-base whitespace-nowrap">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
