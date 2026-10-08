import { api } from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async logout(refreshToken) {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },

  async getMe() {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateMe(profileData) {
    const res = await api.put('/users/me', profileData);
    return res.data;
  },

  async updateSettings(settingsData) {
    const res = await api.put('/users/settings', settingsData);
    return res.data;
  },

  async changePassword(passwords) {
    const res = await api.post('/users/change-password', passwords);
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password, confirmPassword) {
    const res = await api.post('/auth/reset-password', { token, password, confirmPassword });
    return res.data;
  },

  async verifyEmail(token) {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  },

  async setup2FA() {
    const res = await api.post('/auth/2fa/setup');
    return res.data;
  },

  async verify2FA(token) {
    const res = await api.post('/auth/2fa/verify', { token });
    return res.data;
  },

  async disable2FA() {
    const res = await api.post('/auth/2fa/disable');
    return res.data;
  },

  async getSecurityLogs() {
    const res = await api.get('/users/security-logs');
    return res.data;
  },

  async revokeAllSessions() {
    const res = await api.post('/users/revoke-sessions');
    return res.data;
  },

  async exportUserData() {
    const res = await api.get('/users/export-data');
    return res.data;
  },

  async deleteAccount() {
    const res = await api.delete('/users/me');
    return res.data;
  }
};
