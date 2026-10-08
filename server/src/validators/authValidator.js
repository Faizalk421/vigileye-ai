import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex, 'Password must include uppercase, lowercase, a number, and a special character'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
    dob: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    termsAccepted: z.boolean().refine(val => val === true, 'You must accept the Terms and Privacy Policy')
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
    twoFactorCode: z.string().optional()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(passwordRegex, 'Password must include uppercase, lowercase, a number, and a special character'),
    confirmPassword: z.string().min(8, 'Confirm password is required')
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
});

export const twoFactorVerifySchema = z.object({
  body: z.object({
    token: z.string().length(6, 'TOTP token must be 6 digits')
  })
});
