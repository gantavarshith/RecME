const API_BASE_URL = "http://localhost:8000";

async function fetchAPI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
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

export const getRecommendations = (userId = "1", topK = 12) =>
  fetchAPI<Movie[]>(`/recommend/?user_id=${userId}&top_k=${topK}`);

export const searchMovies = (query: string) =>
  fetchAPI<Movie[]>(`/search/?query=${encodeURIComponent(query)}`);

export const getMoodRecommendations = (mood: string) =>
  fetchAPI<Movie[]>(`/mood/?mood=${encodeURIComponent(mood)}`);

export const sendMessageToChatbot = (message: string) =>
  fetchAPI<ChatResponse>("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
