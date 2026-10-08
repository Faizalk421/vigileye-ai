import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-900">
        <Link to="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Terms of Service</h1>
          <p className="text-xs text-slate-400">Effective Date: October 2026</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Important Safety & Non-Medical Device Notice</span>
          </div>
          <p>
            VigilEye AI is an experimental computer-vision assistive application. It is NOT certified as a medical diagnostic device, automotive safety device, or substitute for driver alertness and proper sleep. Never drive or operate machinery when feeling tired.
          </p>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">1. Acceptance of Terms</h3>
          <p>
            By accessing or creating an account on the VigilEye AI platform, you agree to be bound by these Terms of Service and all applicable local, national, and international laws.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">2. Nature of the Software</h3>
          <p>
            VigilEye AI provides real-time client-side face landmark tracking and Eye Aspect Ratio (EAR) calculations. Detection accuracy may vary based on ambient lighting, camera resolution, sunglasses, head angle, or physical occlusion.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">3. User Responsibilities</h3>
          <p>
            You agree not to rely solely on VigilEye AI for automotive or industrial safety. The vehicle operator or machine operator maintains 100% legal responsibility for maintaining situational awareness and safe operation at all times.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">4. Account Security</h3>
          <p>
            You are responsible for safeguarding your login credentials and enabling Two-Factor Authentication where appropriate. VigilEye AI cannot be held liable for unauthorized access resulting from compromised passwords.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">5. Modifications to Service</h3>
          <p>
            We reserve the right to modify, update, or discontinue features of the VigilEye AI software with or without notice.
          </p>
        </section>
      </div>
    </div>
  );
}
