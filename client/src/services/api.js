import axios from 'axios';

// 设置API基础URL
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

// 论坛相关API
export const getForumCategories = () => {
  return axios.get('/api/forum/categories');
};

export const getTopics = (params = {}) => {
  return axios.get('/api/forum/topics', { params });
};

export const getTopic = (id) => {
  return axios.get(`/api/forum/topics/${id}`);
};

export const createTopic = (data) => {
  return axios.post('/api/forum/topics', data);
};

export const updateTopic = (id, data) => {
  return axios.put(`/api/forum/topics/${id}`, data);
};

export const deleteTopic = (id) => {
  return axios.delete(`/api/forum/topics/${id}`);
};

export const getComments = (topicId, params = {}) => {
  return axios.get(`/api/forum/topics/${topicId}/comments`, { params });
};

export const createComment = (topicId, data) => {
  return axios.post(`/api/forum/topics/${topicId}/comments`, data);
};

export const deleteComment = (id) => {
  return axios.delete(`/api/forum/comments/${id}`);
};

export const toggleTopicLike = (topicId, like = true) => {
  return axios.post(`/api/forum/topics/${topicId}/like`, { like });
};

export const toggleCommentLike = (commentId, like = true) => {
  return axios.post(`/api/forum/comments/${commentId}/like`, { like });
}; 