import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getRecommendations = async (userId, topK = 10) => {
    const response = await api.get('/recommend/', {
        params: { user_id: userId, top_k: topK }
    });
    return response.data;
};

export const searchMovies = async (query) => {
    const response = await api.get('/search/', {
        params: { query }
    });
    return response.data;
};

export const getMoodRecommendations = async (mood) => {
    const response = await api.get('/mood/', {
        params: { mood }
    });
    return response.data;
};

export const sendMessageToChatbot = async (message) => {
    const response = await api.post('/chatbot/chat', { message });
    return response.data;
};

export default api;
