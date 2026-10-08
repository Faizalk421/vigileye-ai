# VigilEye AI — Full-Stack Real-Time Eye Closure Detection & Drowsiness Safety System

[![VigilEye AI](https://img.shields.io/badge/VigilEye_AI-v2.0_Production_Ready-06b6d4.svg)](#)
[![MediaPipe Vision](https://img.shields.io/badge/MediaPipe_Vision-478_Landmarks-3b82f6.svg)](#)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](#)
[![Node.js](https://img.shields.io/badge/Node.js-Express_REST_API-22c55e.svg)](#)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-PostgreSQL_%2F_SQLite-8b5cf6.svg)](#)
[![Security](https://img.shields.io/badge/Security-JWT_%2B_2FA_%2B_RBAC-f59e0b.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Side_Vision-10b981.svg)](#)

> **VigilEye AI** is a full-stack web application designed for real-time driver fatigue monitoring, microsleep detection, and operator safety. Utilizing MediaPipe WASM and Eye Aspect Ratio (EAR) calculations directly in client memory, it delivers telemetry history, visual analytics, reports, notifications, and an admin console with zero raw video uploaded.

---

## 🌟 Core Features

- **478 Facial Landmarks**: High-frequency landmark detection using Google MediaPipe Face Landmarker.
- **Dual EAR Calculation**: Independent left and right Eye Aspect Ratio telemetry with temporal smoothing.
- **Intelligent Audio Alarms**: Real-time closure countdown with Web Audio API sound synthesis (Emergency Siren, Radar Ping, Digital Beep, Continuous Tone) and auto-reset when eyes reopen.
- **Biometric HUD Overlay**: Visual eye contour mapping, iris tracking, and baseline calibration indicators.
- **100% Privacy-Preserving**: No video, frames, or raw landmark coordinates ever leave the user's browser.
- **JWT & 2FA Security**: Multi-factor authorization (TOTP QR codes) and salted Bcrypt password hashing.
- **Session Telemetry Sync**: Automatically aggregates blinks, blink frequency, drowsiness events, longest closure duration, and mean EAR upon session completion.
- **Executive Safety Reports**: Daily, Weekly, and Monthly reports with PDF printing and CSV export.
- **Superuser Admin Dashboard**: User management directory, account suspension, and platform analytics.

---

## 🚀 Deployment Guide

### Option 1: One-Click / Docker Container Deployment
```bash
docker build -t vigileye-ai .
docker run -p 5000:5000 -e DATABASE_URL="postgresql://user:pass@host:5432/db" vigileye-ai
```

### Option 2: Deploy to Render / Railway / Fly.io

1. **Build Command:**
   ```bash
   npm run install:all && npm run build
   ```

2. **Start Command:**
   ```bash
   node server/src/server.js
   ```

3. **Required Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DATABASE_URL=postgresql://user:password@your-postgres-host:5432/vigileye?schema=public`
   - `JWT_SECRET=your-strong-production-jwt-secret`
   - `JWT_REFRESH_SECRET=your-strong-production-refresh-secret`
   - `CLIENT_URL=https://your-domain.com`

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Database Initialization & Seeding
```bash
npm run seed
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Web App:** [http://localhost:5173](http://localhost:5173)
- **REST API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 📡 REST API Directory

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api` | GET | Public | API overview and documentation |
| `/api/health` | GET | Public | Server health status |
| `/api/auth/register` | POST | Public | Register new account with validation |
| `/api/auth/login` | POST | Public | Login with email/username + 2FA check |
| `/api/auth/logout` | POST | Bearer | Revoke refresh token |
| `/api/auth/refresh` | POST | Public | Refresh expired access token |
| `/api/auth/forgot-password` | POST | Public | Request password reset token |
| `/api/auth/reset-password` | POST | Public | Submit new password with reset token |
| `/api/auth/verify-email` | POST | Public | Confirm account email verification token |
| `/api/auth/2fa/setup` | POST | Bearer | Generate TOTP secret and QR code |
| `/api/auth/2fa/verify` | POST | Bearer | Verify and enable 2FA |
| `/api/users/me` | GET / PUT | Bearer | Retrieve or update user profile |
| `/api/users/settings` | PUT | Bearer | Update eye thresholds & alarm config |
| `/api/users/security-logs` | GET | Bearer | View active device logins & audit trail |
| `/api/sessions` | GET / POST | Bearer | Query session history or record telemetry |
| `/api/analytics/overview` | GET | Bearer | Today's safety summary + Smart Insights |
| `/api/analytics/charts` | GET | Bearer | Multi-range timeline telemetry (`7d`, `30d`, etc.) |
| `/api/analytics/reports` | GET | Bearer | Executive safety report (CSV/PDF) |
| `/api/notifications` | GET | Bearer | User alert notifications center |
| `/api/admin/overview` | GET | Admin | System statistics & active user counts |
| `/api/admin/users` | GET | Admin | User directory with search & filters |
| `/api/admin/users/:id/status`| PATCH | Admin | Suspend/activate user or toggle role |
| `/api/admin/analytics` | GET | Admin | Platform-wide volume charts |

---

## 🛡️ Safety & Assistive Notice
VigilEye AI is an assistive computer vision system intended to support operator alertness. It is **not** a certified medical diagnostic device or automotive safety mechanism. Drivers and machine operators maintain sole legal responsibility for safe vehicle operation.
