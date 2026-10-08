/**
 * Smart Drowsiness Insight Engine
 * Generates non-medical, telemetry-driven observations and fatigue patterns.
 */

export const generateInsights = (sessions = []) => {
  if (!sessions || sessions.length === 0) {
    return [
      {
        id: 'no-data',
        type: 'Session trend',
        title: 'Begin Monitoring to Unlock Insights',
        description: 'Complete your first live eye-tracking session to receive personalized fatigue and blink patterns.',
        level: 'neutral',
        icon: 'Sparkles'
      }
    ];
  }

  const insights = [];

  // Calculate statistics across sessions
  const totalSessions = sessions.length;
  const totalBlinks = sessions.reduce((acc, s) => acc + (s.blinkCount || 0), 0);
  const totalDuration = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalDrowsiness = sessions.reduce((acc, s) => acc + (s.drowsinessCount || 0), 0);
  const avgBlinkRate = sessions.length > 0 ? (sessions.reduce((acc, s) => acc + (s.averageBlinkRate || 0), 0) / sessions.length) : 0;
  const avgEAR = sessions.length > 0 ? (sessions.reduce((acc, s) => acc + (s.avgEAR || 0), 0) / sessions.length) : 0;

  // 1. Session trend: Average duration
  const avgDurationMinutes = Math.round(totalDuration / 60 / (totalSessions || 1));
  insights.push({
    id: 'duration-trend',
    type: 'Session trend',
    title: 'Average Monitoring Session Duration',
    description: `Your average monitoring session is approximately ${avgDurationMinutes} minutes across ${totalSessions} recorded sessions.`,
    level: 'info',
    icon: 'Clock'
  });

  // 2. Detected pattern: Drowsiness & Fatigue frequency
  if (totalDrowsiness > 0) {
    const ratePerSession = (totalDrowsiness / totalSessions).toFixed(1);
    insights.push({
      id: 'drowsiness-pattern',
      type: 'Detected pattern',
      title: 'Drowsiness Frequency Analysis',
      description: `Observed an average of ${ratePerSession} eye closure alarm triggers per session. Consider scheduling 5-minute break intervals every 45 minutes.`,
      level: totalDrowsiness > 3 ? 'warning' : 'info',
      icon: 'AlertTriangle'
    });
  } else {
    insights.push({
      id: 'high-alertness',
      type: 'Monitoring insight',
      title: 'Consistent Alertness Maintained',
      description: 'Zero prolonged eye-closure incidents detected in recent sessions. Excellent visual focus.',
      level: 'success',
      icon: 'ShieldCheck'
    });
  }

  // 3. Monitoring insight: Blink rate evaluation
  if (avgBlinkRate < 12) {
    insights.push({
      id: 'low-blink-rate',
      type: 'Monitoring insight',
      title: 'Reduced Blink Rate Observed',
      description: `Your recorded blink rate averages ${avgBlinkRate.toFixed(1)} blinks/min (standard resting rate is typically 15-20). Screen stare fatigue may be present.`,
      level: 'warning',
      icon: 'Eye'
    });
  } else {
    insights.push({
      id: 'healthy-blink-rate',
      type: 'Monitoring insight',
      title: 'Optimal Eye Hydration Rhythm',
      description: `Your average blink frequency of ${avgBlinkRate.toFixed(1)} blinks/min indicates healthy eye moisture and active cognitive attention.`,
      level: 'success',
      icon: 'Eye'
    });
  }

  // 4. Session trend: EAR consistency
  if (avgEAR > 0.28) {
    insights.push({
      id: 'ear-baseline',
      type: 'Detected pattern',
      title: 'Strong Eye Aperture Metric',
      description: `Your mean Eye Aspect Ratio (EAR) is ${avgEAR.toFixed(2)}, demonstrating robust baseline eye openness during camera monitoring.`,
      level: 'info',
      icon: 'Activity'
    });
  }

  return insights;
};
