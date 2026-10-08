import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { alarmService } from '../services/alarmService';
import confetti from 'canvas-confetti';
import {
  Eye,
  Camera,
  Sliders,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Play
} from 'lucide-react';

export default function OnboardingWizard() {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Settings State for Onboarding
  const [earThreshold, setEarThreshold] = useState(0.21);
  const [drowsinessThreshold, setDrowsinessThreshold] = useState(1.5);
  const [alarmPattern, setAlarmPattern] = useState('siren');
  const [alarmVolume, setAlarmVolume] = useState(0.8);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermissionGranted(true);
      // Stop stream right after test
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.warn('Camera permission denied or unavailable:', err);
      setCameraPermissionGranted(false);
    }
  };

  const handleTestAlarm = () => {
    alarmService.setVolume(alarmVolume);
    alarmService.setPattern(alarmPattern);
    alarmService.testAlarm(1500);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await authService.updateSettings({
        earThreshold,
        drowsinessThreshold,
        alarmPattern,
        alarmVolume
      });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        navigate('/monitor');
      }, 1000);
    } catch (err) {
      navigate('/monitor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950">
              <Eye className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-sm font-black tracking-tight text-white">
              VigilEye <span className="text-cyan-400 font-light">Onboarding</span>
            </span>
          </div>
          <div className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Step {step} of 6
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/25">
              <Sparkles className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black text-white">Welcome to VigilEye AI, {user?.fullName || 'Driver'}!</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your real-time edge computer vision drowsiness monitor. Let's calibrate your eye metrics and alarm preferences in under 60 seconds.
            </p>
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 text-left flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>All facial video frames remain 100% on your laptop. Zero video is ever uploaded.</span>
            </div>
          </div>
        )}

        {/* Step 2: Camera Access */}
        {step === 2 && (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Enable Camera Access</h3>
            <p className="text-xs text-slate-400">
              VigilEye processes live frames on your GPU/CPU locally to compute your Eye Aspect Ratio.
            </p>
            <div>
              <button
                type="button"
                onClick={requestCamera}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 mx-auto ${
                  cameraPermissionGranted
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                }`}
              >
                {cameraPermissionGranted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Camera Permission Verified</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Test Camera Permission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Eye Baseline Calibration */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-bold text-white">Baseline Eye Aspect Ratio (EAR)</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Default threshold is set to 0.21. Eyes with EAR below this threshold are detected as closed.
            </p>
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">EAR Threshold:</span>
                <span className="text-cyan-400 font-mono text-sm">{earThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.12"
                max="0.32"
                step="0.01"
                value={earThreshold}
                onChange={(e) => setEarThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.12 (Strict / Narrow Eyes)</span>
                <span>0.21 (Recommended)</span>
                <span>0.32 (Wide Eyes)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Alarm Sound */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-bold text-white">Choose Alarm Tone & Volume</h3>
            <p className="text-xs text-slate-400">
              Select the audible alert that will sound when prolonged eye closure is detected.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'siren', label: 'Emergency Siren' },
                { id: 'radar', label: 'Pulsing Radar' },
                { id: 'digital', label: 'Digital Beep' },
                { id: 'continuous', label: 'Continuous Tone' }
              ].map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setAlarmPattern(pattern.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    alarmPattern === pattern.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pattern.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleTestAlarm}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Test Audio Alarm</span>
            </button>
          </div>
        )}

        {/* Step 5: Drowsiness Sensitivity */}
        {step === 5 && (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-bold text-white">Set Drowsiness Sensitivity</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              How many seconds of continuous eye closure trigger the safety alarm?
            </p>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Closure Trigger Delay:</span>
                <span className="text-cyan-400 font-mono text-sm">{drowsinessThreshold.toFixed(1)} seconds</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={drowsinessThreshold}
                onChange={(e) => setDrowsinessThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.8s (Ultra Sensitive)</span>
                <span>1.5s (Standard)</span>
                <span>4.0s (Relaxed)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Ready */}
        {step === 6 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">You're All Set!</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your profile and computer-vision parameters are configured. Start your live camera session and monitor eye closure in real-time.
            </p>
          </div>
        )}

        {/* Step Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Launch Live Monitor</span>
              <Play className="w-3.5 h-3.5 fill-slate-950" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
