import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    durationSeconds: z.number().int().min(0),
    blinkCount: z.number().int().min(0),
    averageBlinkRate: z.number().min(0),
    drowsinessCount: z.number().int().min(0),
    longestClosureSeconds: z.number().min(0),
    avgEAR: z.number().min(0).max(1),
    minEAR: z.number().min(0).max(1),
    deviceName: z.string().optional(),
    browser: z.string().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'INTERRUPTED']).optional(),
    notes: z.string().optional(),
    events: z.array(
      z.object({
        timestamp: z.string().datetime().optional(),
        durationSeconds: z.number().min(0),
        earAtTrigger: z.number().min(0).max(1),
        resolvedType: z.string().optional(),
        notes: z.string().optional()
      })
    ).optional()
  })
});
