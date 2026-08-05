import axios from "axios";

const API_BASE_URL = "https://flockup-backend.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function getCurrentUserId() {
  return localStorage.getItem("userId") || "966031f0-8526-4fe3-872a-5d7548743679";
}

export const getUsers = () => api.get("/users/");
export const getUser = (userId) => api.get(`/users/${userId}`);
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);

export const getHabits = (userId) => api.get(`/habits/${userId}`);
export const createHabit = (userId, habit) => api.post(`/habits/${userId}`, habit);
export const logHabit = (habitId, completed = true) =>
  api.post(`/habits/${habitId}/log?completed=${completed}`);
export const getHabitCalendar = (habitId, year, month) =>
  api.get(`/habits/${habitId}/calendar?year=${year}&month=${month}`);

export const getTasks = (userId) => api.get(`/tasks/${userId}`);
export const createTask = (userId, task) => api.post(`/tasks/${userId}`, task);
export const toggleTask = (taskId) => api.put(`/tasks/${taskId}/toggle`);

export const getChannels = () => api.get("/channels/");
export const getMyChannels = (userId) => api.get(`/channels/user/${userId}`);
export const joinChannel = (channelId, userId) => api.post(`/channels/${channelId}/join/${userId}`);

export const getPredict = (habitId) => api.get(`/predict/${habitId}`);

export default api;

export const getTasksByDate = (userId, dateStr) => api.get(`/tasks/${userId}/by-date/${dateStr}`);

export const searchUsers = (query) => api.get(`/users/search/${query}`);
export const inviteUser = (channelId, userId) => api.post(`/channels/${channelId}/invite/${userId}`);
export const getPendingMembers = (channelId) => api.get(`/channels/${channelId}/pending`);
export const approveMember = (channelId, userId) => api.post(`/channels/${channelId}/approve/${userId}`);
export const rejectMember = (channelId, userId) => api.post(`/channels/${channelId}/reject/${userId}`);

export const updateHabit = (habitId, data) => api.put(`/habits/${habitId}`, data);
export const deleteHabit = (habitId) => api.delete(`/habits/${habitId}`);


export const uploadPost = (userId, formData) =>
  api.post(`/posts/${userId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getChannelPosts = (channelId) => api.get(`/posts/channel/${channelId}`);

export const getChannelPostsFull = (channelId) => api.get(`/posts/channel/${channelId}/full`);
export const reactToPost = (postId, userId, emoji) => api.post(`/posts/${postId}/react/${userId}`, { emoji });
export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId, userId, text) => api.post(`/posts/${postId}/comments/${userId}`, { text });
export const deletePost = (postId) => api.delete(`/posts/${postId}`);
export const deleteComment = (commentId) => api.delete(`/posts/comments/${commentId}`);
export const getChannelRanking = (channelId) => api.get(`/channels/${channelId}/ranking`);

export const getRecommendedChannels = (userId) => api.get(`/channels/recommended/${userId}`);

export const deleteUser = (userId) => api.delete(`/users/${userId}`);