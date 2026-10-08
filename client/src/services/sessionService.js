import { api } from './api';

export const sessionService = {
  async saveSession(sessionData) {
    const res = await api.post('/sessions', sessionData);
    return res.data;
  },

  async getSessions(params = {}) {
    const res = await api.get('/sessions', { params });
    return res.data;
  },

  async getSessionById(id) {
    const res = await api.get(`/sessions/${id}`);
    return res.data;
  },

  async deleteSession(id) {
    const res = await api.delete(`/sessions/${id}`);
    return res.data;
  },

  async clearAllSessions() {
    const res = await api.delete('/sessions/clear-all');
    return res.data;
  }
};
