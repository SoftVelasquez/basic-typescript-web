/**
 * TMDB Genre ID to Spanish name mapping.
 * Used to normalize genres that may be stored as numeric IDs in Firebase.
 */
export const TMDB_GENRE_MAP: Record<number | string, string> = {
  28: 'Accion',
  12: 'Aventura',
  16: 'Animacion',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasia',
  36: 'Historia',
  27: 'Terror',
  10402: 'Musica',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia Ficcion',
  10770: 'Pelicula de TV',
  53: 'Suspense',
  10752: 'Belica',
  37: 'Western',
};

/**
 * Normalizes a genre value: if it's a numeric string or number (TMDB genre ID),
 * maps it to its Spanish name. Otherwise returns the original string.
 */
export function normalizeGenre(genre: string | number): string {
  const numericValue = typeof genre === 'number' ? genre : Number(genre);
  if (!isNaN(numericValue) && TMDB_GENRE_MAP[numericValue]) {
    return TMDB_GENRE_MAP[numericValue];
  }
  return String(genre);
}

/**
 * Normalizes an array of genres, mapping any numeric IDs to their Spanish names.
 */
export function normalizeGenres(genres: (string | number)[]): string[] {
  if (!genres || !Array.isArray(genres)) return [];
  return genres.map(normalizeGenre);
}
