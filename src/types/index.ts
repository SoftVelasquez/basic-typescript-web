export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  backdrop?: string;
  rating: number;
  year: number;
  duration: string;
  genres: string[];
  type: 'movie' | 'series';
  seasons?: number;
  episodes?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export interface Category {
  id: string;
  name: string;
  movies: Movie[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  myList: string[];
}
