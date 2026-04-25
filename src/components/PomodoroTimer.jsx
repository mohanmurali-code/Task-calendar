import { useEffect, useRef } from "react";

const PHASES = {
  focus:       { label: "Focus",       duration: 25 * 60, color: "#f45d8f" },
  shortBreak:  { label: "Short Break", duration:  5 * 60, color: "#1fa97a" },
  longBreak:   { label: "Long Break",  duration: 15 * 60, color: "#7c4dff" },
};

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PomodoroTimer({ state, onTick, onSkip, onStop }) {
  const { activeTaskTitle, timeLeft, phase, sessionCount, isRunning } = state;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => onTick(), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTick]);

  const cfg = PHASES[phase];
  const progress = timeLeft / cfg.duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="pomodoro-pill">
      {/* SVG ring */}
      <svg width="68" height="68" className="pomo-ring" style={{ "--pomo-color": cfg.color }}>
        <circle cx="34" cy="34" r={RADIUS} className="pomo-track" />
        <circle
          cx="34" cy="34" r={RADIUS}
          className="pomo-progress"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ stroke: cfg.color }}
        />
        <text x="34" y="34" className="pomo-time" dominantBaseline="middle" textAnchor="middle">
          {mins}:{secs}
        </text>
      </svg>

      {/* Info */}
      <div className="pomo-info">
        <div className="pomo-phase" style={{ color: cfg.color }}>{cfg.label}</div>
        <div className="pomo-task" title={activeTaskTitle}>{activeTaskTitle}</div>
        <div className="pomo-dots">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={`pomo-dot ${i < (sessionCount % 4) ? "filled" : ""}`} style={i < (sessionCount % 4) ? { background: cfg.color } : {}} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="pomo-controls">
        <button className="pomo-btn" type="button" onClick={() => onTick("togglePlay")} title={isRunning ? "Pause" : "Play"}>
          {isRunning ? "⏸" : "▶"}
        </button>
        <button className="pomo-btn" type="button" onClick={onSkip} title="Skip phase">⏭</button>
        <button className="pomo-btn pomo-stop" type="button" onClick={onStop} title="Stop">✕</button>
      </div>
    </div>
  );
}
