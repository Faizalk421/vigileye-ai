import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { useForm } from 'react-hook-form';
import {
  Lock,
  Key,
  ShieldCheck,
  Smartphone,
  QrCode,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Laptop,
  Save
} from 'lucide-react';

export default function SecurityPage() {
  const { user, updateProfileState } = useAuth();
  const { showToast } = useNotification();

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [twoFASecretData, setTwoFASecretData] = useState(null);
  const [twoFACodeInput, setTwoFACodeInput] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);

  // Security logs & active sessions
  const [securityData, setSecurityData] = useState({ events: [], activeSessions: [] });
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Password Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const loadSecurityLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await authService.getSecurityLogs();
      if (res.success && res.data) {
        setSecurityData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadSecurityLogs();
  }, []);

  const onChangePassword = async (data) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      showToast('Password updated successfully!', 'success');
      reset();
      loadSecurityLogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    }
  };

  const handleStart2FASetup = async () => {
    setIs2FALoading(true);
    try {
      const res = await authService.setup2FA();
      if (res.success && res.data) {
        setTwoFASecretData(res.data);
      }
    } catch (err) {
      showToast('Failed to initialize 2FA', 'error');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerifyAndEnable2FA = async () => {
    if (!twoFACodeInput || twoFACodeInput.length !== 6) {
      showToast('Please enter a 6-digit code', 'error');
      return;
    }
    setIs2FALoading(true);
    try {
      const res = await authService.verify2FA(twoFACodeInput);
      if (res.success) {
        setIs2FAEnabled(true);
        setTwoFASecretData(null);
        setTwoFACodeInput('');
        showToast('Two-Factor Authentication is now enabled!', 'success');
        loadSecurityLogs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid 2FA code', 'error');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Disable two-factor authentication?')) return;
    try {
      await authService.disable2FA();
      setIs2FAEnabled(false);
      showToast('2FA has been disabled.', 'success');
      loadSecurityLogs();
    } catch (err) {
      showToast('Failed to disable 2FA', 'error');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Revoke all other active device logins?')) return;
    try {
      await authService.revokeAllSessions();
      showToast('All other active sessions have been revoked.', 'success');
      loadSecurityLogs();
    } catch (err) {
      showToast('Failed to revoke sessions', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-emerald-400" />
            <span>Security & Authentication</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage your credentials, multi-factor authorization, and active devices.
          </p>
        </div>
      </div>

      {/* 1. Change Password Section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>Update Account Password</span>
        </h3>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Current Password</label>
            <input
              type="password"
              {...register('currentPassword', { required: 'Current password is required' })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {errors.currentPassword && (
              <p className="text-[10px] text-red-400">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">New Password</label>
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' }
              })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {errors.newPassword && (
              <p className="text-[10px] text-red-400">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword', { required: 'Please confirm new password' })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <span>Change Password</span>
            )}
          </button>
        </form>
      </div>

      {/* 2. Two-Factor Authentication (TOTP) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Two-Factor Authentication (2FA)</span>
          </h3>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              is2FAEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Add an extra layer of defense using Google Authenticator, Authy, or 1Password.
        </p>

        {is2FAEnabled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Your account is protected with TOTP 2FA.</span>
            </div>
            <button
              onClick={handleDisable2FA}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-950/40"
            >
              Disable 2FA
            </button>
          </div>
        ) : twoFASecretData ? (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 max-w-md">
            <h4 className="text-xs font-bold text-white">Scan QR Code with Authenticator App</h4>
            <div className="bg-white p-3 rounded-xl inline-block">
              <img src={twoFASecretData.qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500">Or enter secret key manually:</span>
              <p className="text-xs font-mono text-cyan-300 bg-slate-900 p-2 rounded-lg break-all">
                {twoFASecretData.secret}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={twoFACodeInput}
                onChange={(e) => setTwoFACodeInput(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-center font-mono text-white tracking-widest focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleVerifyAndEnable2FA}
                disabled={is2FALoading}
                className="w-full py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-colors"
              >
                Verify & Activate 2FA
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart2FASetup}
            disabled={is2FALoading}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Setup Two-Factor Authenticator</span>
          </button>
        )}
      </div>

      {/* 3. Active Sessions */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>Active Device Sessions</span>
          </h3>

          <button
            onClick={handleRevokeAllSessions}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600"
          >
            Log Out All Other Devices
          </button>
        </div>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="font-semibold text-white">Current Browser Session</p>
                <p className="text-[10px] text-slate-400">Chrome on Windows • Localhost Active</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Active Now</span>
          </div>

          {(securityData.activeSessions || []).slice(1).map((s, idx) => (
            <div key={s.id || idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-300">{s.userAgent || 'Web Browser'}</p>
                <p className="text-[10px] text-slate-500">IP: {s.ipAddress || '127.0.0.1'}</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Security Audit Log Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Security Audit Trail</span>
        </h3>

        <div className="space-y-2">
          {loadingLogs ? (
            <p className="text-xs text-slate-500">Loading audit events...</p>
          ) : securityData.events.length === 0 ? (
            <p className="text-xs text-slate-500">No security audit events recorded.</p>
          ) : (
            securityData.events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-200">{evt.eventType}</span>
                  <span className="text-slate-500 text-[11px] ml-2">({evt.location || 'Local Device'})</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(evt.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
