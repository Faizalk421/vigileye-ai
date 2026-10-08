import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, User, Mail, Globe, Calendar, Phone, ShieldAlert, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: '1995-06-15',
      country: 'United States',
      phone: '',
      termsAccepted: false
    }
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await registerAuth(data);
      if (res.success) {
        navigate('/onboarding');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-black tracking-tight text-white">Create VigilEye Account</h2>
        <p className="text-xs text-slate-400">Setup your account for telemetry and personalized calibrations</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Full Name & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              placeholder="Alex Johnson"
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {errors.fullName && <p className="text-[10px] text-red-400">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <input
              type="text"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Min 3 chars' }
              })}
              placeholder="alexj"
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {errors.username && <p className="text-[10px] text-red-400">{errors.username.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <input
            type="email"
            {...register('email', { required: 'Valid email is required' })}
            placeholder="alex@example.com"
            className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
          {errors.email && <p className="text-[10px] text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 chars' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                    message: 'Include Upper, Lower, Number & Symbol'
                  }
                })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 pr-9 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                validate: (val) => val === passwordVal || 'Passwords do not match'
              })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* DOB & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
            <input
              type="date"
              {...register('dob')}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Country</label>
            <input
              type="text"
              {...register('country')}
              placeholder="United States"
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Phone (Optional) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Phone Number (Optional)</label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Accept terms */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="termsAccepted"
            {...register('termsAccepted', { required: 'You must accept the terms' })}
            className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
          />
          <label htmlFor="termsAccepted" className="text-[11px] text-slate-400 leading-tight select-none">
            I agree to the{' '}
            <Link to="/terms" className="text-cyan-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-[10px] text-red-400">{errors.termsAccepted.message}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-cyan-400 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
