import api from './api';

export const aiService = {
  // Envoyer un message à l'AI
  chat: async (message, conversationId = null, contextData = {}) => {
    const response = await api.post('/ai/chat/', {
      message,
      conversation_id: conversationId,
      context_data: contextData
    });
    return response.data;
  },

  // Récupérer les conversations
  getConversations: async () => {
    const response = await api.get('/ai/conversations/');
    return response.data;
  },

  // Récupérer une conversation
  getConversation: async (id) => {
    const response = await api.get(`/ai/conversations/${id}/`);
    return response.data;
  },

  // Supprimer une conversation
  deleteConversation: async (id) => {
    const response = await api.delete(`/ai/conversations/${id}/delete/`);
    return response.data;
  },

  // Récupérer les suggestions
  getSuggestions: async (role = 'all') => {
    const response = await api.get(`/ai/suggestions/?role=${role}`);
    return response.data;
  }
};