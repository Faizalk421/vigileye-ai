import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ShieldCheck,
  Zap,
  Activity,
  Bell,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Eye className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              VigilEye <span className="text-cyan-400 font-light">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Next-Gen Computer Vision • 100% Client-Side Privacy</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
          Real-Time Eye Closure & <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Intelligent Drowsiness Alarm
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Monitor eye closure and micro-sleep events using 478 MediaPipe facial landmarks
          while ensuring your camera stream never leaves your personal browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Free Live Monitoring</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:text-white hover:bg-slate-800 transition-all"
          >
            View Demo Dashboard
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur text-left">
            <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-sm font-bold text-white">478 Facial Landmarks</h4>
            <p className="text-xs text-slate-400 mt-1">High-precision MediaPipe neural vision mesh</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur text-left">
            <Activity className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Dual EAR Metrics</h4>
            <p className="text-xs text-slate-400 mt-1">Left and right eye aperture ratio calculations</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur text-left">
            <Bell className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Multi-Tone Audio Alarm</h4>
            <p className="text-xs text-slate-400 mt-1">Auto-resetting sound synthesized via Web Audio</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur text-left">
            <ShieldCheck className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Zero Video Uploads</h4>
            <p className="text-xs text-slate-400 mt-1">Camera frames remain completely local on device</p>
          </div>
        </div>
      </section>

      {/* How It Works Architecture Pipeline */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-900 px-6">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How VigilEye AI Operates</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Privacy-first edge computer vision architecture from sensor to alarm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">1</div>
              <h4 className="text-sm font-bold text-white">Webcam Stream</h4>
              <p className="text-xs text-slate-400">Captured locally in browser memory</p>
            </div>
            <div className="hidden md:block text-slate-600 font-bold">➔</div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">2</div>
              <h4 className="text-sm font-bold text-white">MediaPipe AI</h4>
              <p className="text-xs text-slate-400">Extracts 478 face coordinates in real-time</p>
            </div>
            <div className="hidden md:block text-slate-600 font-bold">➔</div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">3</div>
              <h4 className="text-sm font-bold text-white">EAR Math</h4>
              <p className="text-xs text-slate-400">Computes vertical vs horizontal eye ratio</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Medical Disclaimer */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Safety & Experimental Assistive Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            VigilEye AI is an experimental computer-vision assistive application designed to encourage driver and operator alertness.
            It is NOT a certified medical device, automotive safety system, or replacement for adequate rest and responsible vehicle operation.
            Always pull over immediately in a safe location if you feel fatigued.
          </p>
        </div>
      </section>
    </div>
  );
}
