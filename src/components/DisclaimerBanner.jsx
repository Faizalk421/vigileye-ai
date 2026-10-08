/**
 * DisclaimerBanner Component
 * Clarifies safety, privacy, and assistive non-medical device status.
 */

import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl bg-slate-900/90 border border-slate-800 p-3 md:p-4 text-xs text-slate-400 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>

        <div className="space-y-1 pr-6 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Assistive Safety & Privacy Notice</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              100% Client-Side
            </span>
          </div>
          <p className="leading-relaxed">
            This application is an assistive drowsiness detection tool designed to help maintain alertness. It is <strong className="text-slate-300">not a certified medical device</strong> or a replacement for adequate rest while driving or operating equipment. All webcam frames are processed locally inside your browser via MediaPipe WebAssembly; no video or image data is ever recorded or uploaded.
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
