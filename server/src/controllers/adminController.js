import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { hashPassword } from '../utils/hash.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      adminUsers,
      totalSessions,
      allSessions,
      totalDrowsinessEvents,
      recentUsers,
      recentSessions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.session.count(),
      prisma.session.findMany({ select: { durationSeconds: true } }),
      prisma.drowsinessEvent.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          role: true,
          isEmailVerified: true,
          isSuspended: true,
          createdAt: true,
          lastLoginAt: true
        }
      }),
      prisma.session.findMany({
        orderBy: { startTime: 'desc' },
        take: 5,
        include: {
          user: { select: { fullName: true, email: true } }
        }
      })
    ]);

    const totalDurationSeconds = allSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalMonitoringHours = Math.round((totalDurationSeconds / 3600) * 10) / 10;

    return successResponse(res, 'Admin overview statistics retrieved.', {
      stats: {
        totalUsers,
        activeUsers: totalUsers - suspendedUsers,
        verifiedUsers,
        suspendedUsers,
        adminUsers,
        totalSessions,
        totalMonitoringHours,
        totalDrowsinessEvents,
        systemStatus: 'Operational (Green)',
        uptime: '99.98%'
      },
      recentUsers,
      recentSessions
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      status
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(role && { role }),
      ...(status === 'active' && { isSuspended: false }),
      ...(status === 'suspended' && { isSuspended: true }),
      ...(search && {
        OR: [
          { fullName: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } }
        ]
      })
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          settings: true,
          _count: {
            select: { sessions: true, drowsinessEvents: true }
          }
        }
      })
    ]);

    const safeUsers = users.map(u => {
      const { passwordHash: _, twoFactorSecret: __, ...rest } = u;
      return rest;
    });

    return successResponse(res, 'Users retrieved successfully.', {
      users: safeUsers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        settings: true,
        sessions: {
          take: 10,
          orderBy: { startTime: 'desc' },
          include: { drowsinessEvents: true }
        },
        securityEvents: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = user;
    return successResponse(res, 'User details retrieved.', safeUser);
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isSuspended, role } = req.body;

    // Prevent suspending own admin account
    if (id === req.user.id && isSuspended === true) {
      return errorResponse(res, 'You cannot suspend your own admin account.', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(isSuspended !== undefined && { isSuspended }),
        ...(role !== undefined && { role })
      }
    });

    const { passwordHash: _, ...safeUser } = user;
    return successResponse(res, 'User status updated successfully.', safeUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return errorResponse(res, 'You cannot delete your own admin account.', 400);
    }

    await prisma.user.delete({ where: { id } });

    return successResponse(res, 'User and all related records deleted permanently.');
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const daysBack = 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    const [sessions, newUsers] = await Promise.all([
      prisma.session.findMany({
        where: { startTime: { gte: startDate } },
        orderBy: { startTime: 'asc' }
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const dateBuckets = {};
    for (let i = 0; i <= daysBack; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dateBuckets[key] = {
        date: key,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: 0,
        hours: 0,
        drowsinessIncidents: 0,
        newUsers: 0
      };
    }

    sessions.forEach(s => {
      const key = new Date(s.startTime).toISOString().split('T')[0];
      if (dateBuckets[key]) {
        dateBuckets[key].sessions += 1;
        dateBuckets[key].hours += parseFloat((s.durationSeconds / 3600).toFixed(2));
        dateBuckets[key].drowsinessIncidents += s.drowsinessCount;
      }
    });

    newUsers.forEach(u => {
      const key = new Date(u.createdAt).toISOString().split('T')[0];
      if (dateBuckets[key]) {
        dateBuckets[key].newUsers += 1;
      }
    });

    return successResponse(res, 'Admin system analytics retrieved.', {
      timeline: Object.values(dateBuckets)
    });
  } catch (error) {
    next(error);
  }
};
