const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007';

async function fetchAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    ...restOptions,
  });
  if (!response.ok) {
    let errorMsg = `API error: ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export interface Movie {
  id?: number | string;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  genre_ids?: number[];
  genres?: string[];
  runtime?: number;
  imdb_rating?: string;
  tmdb_score?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
}

export const getRecommendations = (token?: string, userId = "1", topK = 5, shuffle = false) =>
  fetchAPI<Movie[]>(`/recommend/?user_id=${userId}&top_k=${topK}&shuffle=${shuffle}`, token ? {
    headers: { Authorization: `Bearer ${token}` },
  } : {});

export const searchMovies = (query: string) =>
  fetchAPI<Movie[]>(`/search/?query=${encodeURIComponent(query)}`);

export const getMoodRecommendations = (mood: string) =>
  fetchAPI<Movie[]>(`/mood/?mood=${encodeURIComponent(mood)}`);

export const getMoviesByTag = (tag: string) =>
  fetchAPI<Movie[]>(`/movies/tagged/${encodeURIComponent(tag)}`);

export const sendMessageToChatbot = (message: string, history: any[] = []) =>
  fetchAPI<ChatResponse>("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });

// AUTH ENDPOINTS
export const loginUser = async (formData: FormData) => {
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    params.append(key, value.toString());
  });

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: params,
  });
  
  if (!res.ok) {
    let errorMsg = "Login failed";
    try {
      const data = await res.json();
      if (data.detail) errorMsg = data.detail;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
};

export const signupUser = (data: any) =>
  fetchAPI<any>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const googleLogin = (token: string) =>
  fetchAPI<any>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const getMe = (token: string) =>
  fetchAPI<any>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const logoutUser = () =>
  fetchAPI<any>("/auth/logout", { method: "POST" });

// WATCHLIST ENDPOINTS
export const getWatchlist = (token: string) =>
  fetchAPI<Movie[]>("/watchlist", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToWatchlist = (movie: Movie, token: string) =>
  fetchAPI<any>("/watchlist/add", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  });

export const removeFromWatchlist = (movieId: string | number, token: string) =>
  fetchAPI<any>(`/watchlist/remove/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

// WATCHED ENDPOINTS
export const getWatched = (token: string) =>
  fetchAPI<Movie[]>("/watched", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToWatched = (movie: Movie, token: string) =>
  fetchAPI<any>("/watched/add", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  });

export const removeFromWatched = (movieId: string | number, token: string) =>
  fetchAPI<any>(`/watched/remove/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

// NOT INTERESTED ENDPOINTS
export const getNotInterested = (token: string) =>
  fetchAPI<Movie[]>("/not_interested", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToNotInterested = (movie: Movie, token: string) =>
  fetchAPI<any>("/not_interested/add", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  });

export const removeFromNotInterested = (movieId: string | number, token: string) =>
  fetchAPI<any>(`/not_interested/remove/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

// MOVIE OF THE DAY
export const getMovieOfTheDay = (token?: string) =>
  fetchAPI<Movie>("/motd/", token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {}
  );

// PROFILE
export const updateProfile = (name: string, token: string) =>
  fetchAPI<any>("/auth/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });

export const deleteAccount = (token: string) =>
  fetchAPI<any>("/auth/account", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
