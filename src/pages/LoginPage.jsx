import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
      twoFactorCode: '',
      rememberMe: true
    }
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await login(data.identifier, data.password, data.twoFactorCode);
      if (res.data?.requires2FA) {
        setRequires2FA(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Login failed. Please verify your email/username and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-black tracking-tight text-white">Sign In to VigilEye</h2>
        <p className="text-xs text-slate-400">Access your safety telemetry and live camera monitoring</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Identifier (Email/Username) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Email or Username</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              {...register('identifier', { required: 'Email or username is required' })}
              placeholder="Enter your email or username"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          {errors.identifier && (
            <p className="text-[11px] text-red-400">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* 2FA input if triggered */}
        {requires2FA && (
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-amber-500/40">
            <label className="text-xs font-semibold text-amber-300">2FA Authenticator Code</label>
            <input
              type="text"
              maxLength={6}
              {...register('twoFactorCode', { required: 'Please enter your 6-digit 2FA code' })}
              placeholder="123456"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-center font-mono text-white tracking-widest focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
          />
          <label htmlFor="rememberMe" className="text-xs text-slate-400 select-none">
            Remember this browser
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-cyan-400 font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
