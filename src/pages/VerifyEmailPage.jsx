import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { CheckCircle2, ShieldAlert, ArrowRight, MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in link.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification token is invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 text-center space-y-5">
      {status === 'verifying' && (
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-white">Verifying Email Address...</h2>
          <p className="text-xs text-slate-400">Please hold on while we activate your account</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MailCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Email Verified Successfully!</h2>
          <p className="text-xs text-slate-300">
            Your VigilEye account has been validated. You now have full access to safety history and telemetry sync.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Verification Failed</h2>
          <p className="text-xs text-red-300">{message}</p>
          <Link
            to="/dashboard"
            className="inline-block text-xs font-semibold text-cyan-400 hover:underline pt-2"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
