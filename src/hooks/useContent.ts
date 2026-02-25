import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { normalizeGenres } from '@/lib/genres';

export interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  video_url: string;
}

export interface Season {
  season_number: number;
  episodes: Record<string, Episode>;
}

export interface Content {
  id: string;
  media_type: 'movie' | 'tv';
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average: number;
  genres: string[];
  video_url?: string;
  seasons?: Record<string, Season>;
  display_options: {
    main_sections: string[];
    home_sections: string[];
    platforms: string[];
  };
  imported_by: string;
  imported_at: any;
}

/** Normalize a raw Firestore document into a Content object with proper genre names */
function normalizeContent(d: any): Content {
  return {
    ...d,
    genres: normalizeGenres(d.genres || []),
  };
}

// ─── Fetch all content once ───
export function useAllContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const contentRef = collection(db, 'content');
        const q = query(contentRef, orderBy('imported_at', 'desc'));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((d) =>
          normalizeContent({ id: d.id, ...d.data() })
        );

        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
}

// Re-export the old name for backward compat
export const useContent = useAllContent;

// ─── Fetch single content by id ───
export function useContentById(contentId: string) {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) return;

      try {
        setLoading(true);
        const docRef = doc(db, 'content', contentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent(
            normalizeContent({ id: docSnap.id, ...docSnap.data() })
          );
        } else {
          setError('Content not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  return { content, loading, error };
}

// ─── Filter by main_sections (Peliculas, Series, Anime, Doramas) ───

export function useContentByMainSection(section: string) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const contentRef = collection(db, 'content');
        // Only use array-contains — no orderBy to avoid requiring a composite index
        const q = query(
          contentRef,
          where('display_options.main_sections', 'array-contains', section)
        );
        const snapshot = await getDocs(q);

        const results = snapshot.docs.map((d) =>
          normalizeContent({ id: d.id, ...d.data() })
        );

        // Sort in memory instead of Firestore to avoid composite index requirement
        results.sort((a, b) => {
          const dateA = a.imported_at?.toDate ? a.imported_at.toDate() : new Date(a.imported_at || 0);
          const dateB = b.imported_at?.toDate ? b.imported_at.toDate() : new Date(b.imported_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setContent(results);
      } catch (err) {
        console.error(`Error fetching main_section "${section}":`, err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [section]);

  return { content, loading };
}

export function useMovies() {
  const { content, loading } = useContentByMainSection('movies');
  return { movies: content, loading };
}

export function useSeries() {
  const { content, loading } = useContentByMainSection('series');
  return { series: content, loading };
}

export function useAnime() {
  const { content, loading } = useContentByMainSection('animes');
  return { anime: content, loading };
}

export function useDoramas() {
  const { content, loading } = useContentByMainSection('doramas');
  return { doramas: content, loading };
}

// ─── Filter by home_sections (each content doc has home_sections array) ───

export function useContentByHomeSection(sectionKey: string) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      if (!sectionKey) return;
      try {
        setLoading(true);
        const contentRef = collection(db, 'content');
        // Only use array-contains — no orderBy/limit to avoid composite index requirement
        const q = query(
          contentRef,
          where('display_options.home_sections', 'array-contains', sectionKey)
        );
        const snapshot = await getDocs(q);

        const results = snapshot.docs.map((d) =>
          normalizeContent({ id: d.id, ...d.data() })
        );

        // Sort in memory and take first 20
        results.sort((a, b) => {
          const dateA = a.imported_at?.toDate ? a.imported_at.toDate() : new Date(a.imported_at || 0);
          const dateB = b.imported_at?.toDate ? b.imported_at.toDate() : new Date(b.imported_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setContent(results.slice(0, 20));
      } catch (err) {
        console.error(`Error fetching home_section "${sectionKey}":`, err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [sectionKey]);

  return { content, loading };
}

// ─── Filter by genre ───
// Genres are stored as numeric TMDB IDs (e.g. 878, 28) in Firebase.
// We fetch all content, normalize genres to names, then filter in-memory.

export function useContentByGenre(genre: string) {
  const { content: allContent, loading } = useAllContent();

  const content = useMemo(() => {
    if (!genre) return [];
    const lowerGenre = genre.toLowerCase();
    return allContent.filter((item) =>
      item.genres?.some((g) => g.toLowerCase() === lowerGenre)
    );
  }, [allContent, genre]);

  return { content, loading };
}

// ─── Derive unique home_sections keys & genres from all content ───

export function useDerivedSections() {
  const { content, loading } = useAllContent();

  const homeSections = useMemo(() => {
    const map = new Map<string, Content[]>();
    content.forEach((item) => {
      item.display_options?.home_sections?.forEach((key) => {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
      });
    });
    return map;
  }, [content]);

  const genres = useMemo(() => {
    const map = new Map<string, Content[]>();
    content.forEach((item) => {
      item.genres?.forEach((genre) => {
        if (!map.has(genre)) map.set(genre, []);
        map.get(genre)!.push(item);
      });
    });
    return map;
  }, [content]);

  const recentlyAdded = useMemo(() => {
    return content.filter((item) => {
      if (!item.imported_at) return false;
      const importedDate = item.imported_at.toDate
        ? item.imported_at.toDate()
        : new Date(item.imported_at);
      return importedDate.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
    });
  }, [content]);

  return { content, homeSections, genres, recentlyAdded, loading };
}
