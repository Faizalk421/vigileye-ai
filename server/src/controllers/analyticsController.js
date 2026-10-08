import { prisma } from '../config/db.js';
import { successResponse } from '../utils/response.js';
import { generateInsights } from '../services/insightEngine.js';

export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [allSessions, todaySessions] = await Promise.all([
      prisma.session.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' }
      }),
      prisma.session.findMany({
        where: {
          userId,
          startTime: { gte: startOfToday }
        }
      })
    ]);

    // Today's metrics
    const todayMonitoringTime = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const todayBlinks = todaySessions.reduce((acc, s) => acc + s.blinkCount, 0);
    const todayDrowsiness = todaySessions.reduce((acc, s) => acc + s.drowsinessCount, 0);
    const todayLongestClosure = todaySessions.reduce((max, s) => Math.max(max, s.longestClosureSeconds), 0);
    const todayAvgEAR = todaySessions.length > 0
      ? todaySessions.reduce((acc, s) => acc + s.avgEAR, 0) / todaySessions.length
      : 0;
    const todayAvgBlinkRate = todaySessions.length > 0
      ? todaySessions.reduce((acc, s) => acc + s.averageBlinkRate, 0) / todaySessions.length
      : 0;

    // Lifetime totals
    const totalMonitoringTime = allSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalBlinks = allSessions.reduce((acc, s) => acc + s.blinkCount, 0);
    const totalDrowsiness = allSessions.reduce((acc, s) => acc + s.drowsinessCount, 0);
    const totalSessionsCount = allSessions.length;
    const lifetimeAvgEAR = allSessions.length > 0
      ? allSessions.reduce((acc, s) => acc + s.avgEAR, 0) / allSessions.length
      : 0;

    // Smart Insights
    const insights = generateInsights(allSessions);

    return successResponse(res, 'Analytics overview fetched.', {
      today: {
        sessionCount: todaySessions.length,
        monitoringTimeSeconds: todayMonitoringTime,
        blinkCount: todayBlinks,
        averageBlinkRate: Math.round(todayAvgBlinkRate * 10) / 10,
        drowsinessCount: todayDrowsiness,
        longestClosureSeconds: Math.round(todayLongestClosure * 10) / 10,
        avgEAR: Math.round(todayAvgEAR * 100) / 100
      },
      lifetime: {
        sessionCount: totalSessionsCount,
        monitoringTimeSeconds: totalMonitoringTime,
        blinkCount: totalBlinks,
        drowsinessCount: totalDrowsiness,
        avgEAR: Math.round(lifetimeAvgEAR * 100) / 100
      },
      insights
    });
  } catch (error) {
    next(error);
  }
};

export const getChartAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { range = '7d' } = req.query; // today, 7d, 30d, 3m, 6m, 1y

    let daysBack = 7;
    if (range === 'today') daysBack = 1;
    else if (range === '30d') daysBack = 30;
    else if (range === '3m') daysBack = 90;
    else if (range === '6m') daysBack = 180;
    else if (range === '1y') daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        startTime: { gte: startDate }
      },
      orderBy: { startTime: 'asc' },
      include: {
        drowsinessEvents: true
      }
    });

    // Group into time buckets
    const timelineMap = {};

    // Initialize daily buckets
    for (let i = 0; i <= daysBack; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      timelineMap[key] = {
        date: key,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        monitoringMinutes: 0,
        blinkCount: 0,
        averageBlinkRate: 0,
        drowsinessCount: 0,
        avgEAR: 0,
        sessionCount: 0
      };
    }

    sessions.forEach(s => {
      const key = new Date(s.startTime).toISOString().split('T')[0];
      if (timelineMap[key]) {
        timelineMap[key].monitoringMinutes += Math.round(s.durationSeconds / 60);
        timelineMap[key].blinkCount += s.blinkCount;
        timelineMap[key].drowsinessCount += s.drowsinessCount;
        timelineMap[key].avgEAR += s.avgEAR;
        timelineMap[key].averageBlinkRate += s.averageBlinkRate;
        timelineMap[key].sessionCount += 1;
      }
    });

    const chartData = Object.values(timelineMap).map(item => ({
      ...item,
      avgEAR: item.sessionCount > 0 ? parseFloat((item.avgEAR / item.sessionCount).toFixed(2)) : 0.28,
      averageBlinkRate: item.sessionCount > 0 ? parseFloat((item.averageBlinkRate / item.sessionCount).toFixed(1)) : 0
    }));

    return successResponse(res, 'Chart analytics retrieved.', {
      range,
      totalSessions: sessions.length,
      chartData,
      sessions: sessions.slice(-10) // recent 10 sessions for comparison table
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'weekly' } = req.query; // daily, weekly, monthly

    const now = new Date();
    let days = period === 'daily' ? 1 : period === 'monthly' ? 30 : 7;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        startTime: { gte: fromDate }
      },
      orderBy: { startTime: 'desc' },
      include: { drowsinessEvents: true }
    });

    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalBlinks = sessions.reduce((acc, s) => acc + s.blinkCount, 0);
    const totalDrowsiness = sessions.reduce((acc, s) => acc + s.drowsinessCount, 0);
    const longestClosure = sessions.reduce((max, s) => Math.max(max, s.longestClosureSeconds), 0);
    const avgEAR = sessions.length > 0 ? (sessions.reduce((acc, s) => acc + s.avgEAR, 0) / sessions.length) : 0;
    const avgBlinkRate = sessions.length > 0 ? (sessions.reduce((acc, s) => acc + s.averageBlinkRate, 0) / sessions.length) : 0;

    // Determine peak hours / most active period
    const hourlyCounts = {};
    sessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    let peakHour = 'Afternoon (2 PM - 4 PM)';
    let maxHourCount = 0;
    Object.entries(hourlyCounts).forEach(([h, count]) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        const hr = parseInt(h, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const formattedHr = hr % 12 === 0 ? 12 : hr % 12;
        peakHour = `${formattedHr}:00 ${ampm} - ${formattedHr + 1}:00 ${ampm}`;
      }
    });

    const report = {
      period,
      generatedAt: now.toISOString(),
      summary: {
        totalMonitoringMinutes: Math.round(totalSeconds / 60),
        totalMonitoringFormatted: `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`,
        totalSessions: sessions.length,
        totalBlinks,
        averageBlinkRate: Math.round(avgBlinkRate * 10) / 10,
        totalDrowsinessEvents: totalDrowsiness,
        longestEyeClosureSeconds: Math.round(longestClosure * 10) / 10,
        averageEAR: Math.round(avgEAR * 100) / 100,
        peakMonitoringPeriod: peakHour,
        safetyRating: totalDrowsiness === 0 ? 'Optimal (Grade A)' : totalDrowsiness < 3 ? 'Good (Grade B)' : 'Attention Required (Grade C)'
      },
      sessions
    };

    return successResponse(res, 'Report generated successfully.', report);
  } catch (error) {
    next(error);
  }
};
