import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createSession = async (req, res, next) => {
  try {
    const {
      startTime,
      endTime,
      durationSeconds,
      blinkCount,
      averageBlinkRate,
      drowsinessCount,
      longestClosureSeconds,
      avgEAR,
      minEAR,
      deviceName,
      browser,
      status,
      notes,
      events = []
    } = req.body;

    const session = await prisma.session.create({
      data: {
        userId: req.user.id,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        durationSeconds: durationSeconds || 0,
        blinkCount: blinkCount || 0,
        averageBlinkRate: averageBlinkRate || 0,
        drowsinessCount: drowsinessCount || events.length,
        longestClosureSeconds: longestClosureSeconds || 0,
        avgEAR: avgEAR || 0,
        minEAR: minEAR || 0,
        deviceName: deviceName || 'Webcam',
        browser: browser || 'Browser',
        status: status || 'COMPLETED',
        notes: notes || null,
        drowsinessEvents: {
          create: events.map(evt => ({
            userId: req.user.id,
            timestamp: evt.timestamp ? new Date(evt.timestamp) : new Date(),
            durationSeconds: evt.durationSeconds || 1.5,
            earAtTrigger: evt.earAtTrigger || 0.15,
            resolvedType: evt.resolvedType || 'AUTO_ALARM_RESET',
            notes: evt.notes || null
          }))
        }
      },
      include: {
        drowsinessEvents: true
      }
    });

    // Create a notification if drowsiness occurred
    if (drowsinessCount > 0 || events.length > 0) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Drowsiness Events Detected',
          message: `Session completed with ${drowsinessCount || events.length} fatigue alarm trigger(s).`,
          type: 'DROWSINESS',
          link: `/history/${session.id}`
        }
      });
    }

    return successResponse(res, 'Monitoring session saved successfully.', session, 201);
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'startTime',
      order = 'desc',
      startDate,
      endDate,
      status,
      search
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user.id,
      ...(status && { status }),
      ...(startDate && endDate && {
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(search && {
        OR: [
          { notes: { contains: search } },
          { deviceName: { contains: search } }
        ]
      })
    };

    const [total, sessions] = await Promise.all([
      prisma.session.count({ where }),
      prisma.session.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: order.toLowerCase() },
        include: {
          drowsinessEvents: true
        }
      })
    ]);

    return successResponse(res, 'Sessions retrieved successfully.', {
      sessions,
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

export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findFirst({
      where: {
        id,
        userId: req.user.role === 'ADMIN' ? undefined : req.user.id
      },
      include: {
        drowsinessEvents: {
          orderBy: { timestamp: 'asc' }
        },
        user: {
          select: { id: true, fullName: true, username: true, email: true }
        }
      }
    });

    if (!session) {
      return errorResponse(res, 'Monitoring session not found.', 404);
    }

    return successResponse(res, 'Session details retrieved.', session);
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findFirst({
      where: {
        id,
        userId: req.user.role === 'ADMIN' ? undefined : req.user.id
      }
    });

    if (!session) {
      return errorResponse(res, 'Session not found or unauthorized.', 404);
    }

    await prisma.session.delete({ where: { id } });

    return successResponse(res, 'Session deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const clearAllSessions = async (req, res, next) => {
  try {
    await prisma.session.deleteMany({
      where: { userId: req.user.id }
    });

    return successResponse(res, 'All monitoring session history cleared.');
  } catch (error) {
    next(error);
  }
};
