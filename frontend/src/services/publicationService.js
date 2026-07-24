import api from './api';

export const publicationAPI = {
  getPublications: (params = {}) => api.get('/publications/', { params }),
  getPublication: (id) => api.get(`/publications/${id}/`),
  previewStats: (data) => api.post('/publications/preview/', data),
  createPublication: (data) => api.post('/publications/create/', data),
};