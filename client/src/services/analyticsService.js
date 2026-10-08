import { api } from './api';

export const analyticsService = {
  async getOverview() {
    const res = await api.get('/analytics/overview');
    return res.data;
  },

  async getCharts(range = '7d') {
    const res = await api.get('/analytics/charts', { params: { range } });
    return res.data;
  },

  async getReports(period = 'weekly') {
    const res = await api.get('/analytics/reports', { params: { period } });
    return res.data;
  }
};
