import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Cpu, Eye, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-900">
        <Link to="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Privacy Policy & Biometric Architecture</h1>
          <p className="text-xs text-slate-400">Strict Client-Side Neural Processing Guarantee</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-1">Our Core Privacy Commitment</span>
            <p>
              VigilEye AI does NOT record, stream, save, or upload webcam video footage, face pictures, or raw 478 biometric landmark coordinates to our servers or third parties. All computer vision execution runs directly within your web browser.
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">1. Edge Biometric Processing</h3>
          <p>
            MediaPipe Face Landmarker WASM models execute in client-side browser memory. Facial landmarks and Eye Aspect Ratio (EAR) calculations happen on your device at up to 60 FPS without network transmission.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">2. What Data Is Stored in the Cloud</h3>
          <p>
            When you complete a session, only high-level numerical telemetry is synchronized with your account for analytics purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Session start and end timestamps and duration</li>
            <li>Aggregated blink count and blinks-per-minute rate</li>
            <li>Number of drowsiness alarm triggers and longest eye-closure duration (seconds)</li>
            <li>Average session Eye Aspect Ratio (EAR) metric</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">3. User Controls & Data Purging</h3>
          <p>
            You have full control over your telemetry. Through the <Link to="/privacy-center" className="text-cyan-400 hover:underline">Privacy Center</Link>, you can download an archive of your data (JSON/CSV) or permanently purge all monitoring history and account records at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">4. Cookies & Security</h3>
          <p>
            We use secure JSON Web Tokens (JWT) stored in client storage for session authentication. We do not sell user data to advertising networks.
          </p>
        </section>
      </div>
    </div>
  );
}
