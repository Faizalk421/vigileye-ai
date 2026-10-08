import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional().nullable(),
    dob: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    timezone: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    occupation: z.string().max(100).optional().nullable(),
    emergencyContact: z.string().max(100).optional().nullable(),
    avatarUrl: z.string().optional().nullable()
  })
});

export const updateSettingsSchema = z.object({
  body: z.object({
    earThreshold: z.number().min(0.05).max(0.6).optional(),
    drowsinessThreshold: z.number().min(0.5).max(10).optional(),
    alarmVolume: z.number().min(0).max(1).optional(),
    alarmPattern: z.string().optional(),
    isMuted: z.boolean().optional(),
    showMesh: z.boolean().optional(),
    showLabels: z.boolean().optional(),
    smoothingFrames: z.number().int().min(1).max(15).optional(),
    selectedCameraId: z.string().optional(),
    darkMode: z.boolean().optional(),
    compactMode: z.boolean().optional(),
    localProcessingOnly: z.boolean().optional(),
    allowAnalytics: z.boolean().optional()
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(8)
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword']
  })
});
