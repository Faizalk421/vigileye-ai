import { api } from './api';

export const adminService = {
  async getOverview() {
    const res = await api.get('/admin/overview');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  async toggleUserStatus(id, updateData) {
    const res = await api.patch(`/admin/users/${id}/status`, updateData);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  async getAdminAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  }
};
