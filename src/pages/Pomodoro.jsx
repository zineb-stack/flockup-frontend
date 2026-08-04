import { useState, useEffect, useRef } from "react";

const DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

function Pomodoro() {
  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function switchMode(m) {
    setMode(m);
    setSecondsLeft(DURATIONS[m]);
    setRunning(false);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="page">
      <div className="page-header">
        <h1>Minuteur Pomodoro</h1>
      </div>

      <div className="pomodoro-modes">
        <span className={`pomodoro-mode ${mode === "focus" ? "active" : ""}`} onClick={() => switchMode("focus")}>
          Focus
        </span>
        <span className={`pomodoro-mode ${mode === "short" ? "active" : ""}`} onClick={() => switchMode("short")}>
          Pause courte
        </span>
        <span className={`pomodoro-mode ${mode === "long" ? "active" : ""}`} onClick={() => switchMode("long")}>
          Pause longue
        </span>
      </div>

      <div className="pomodoro-timer">{minutes}:{seconds}</div>

      <div className="pomodoro-actions">
        <button className="btn-confirm" onClick={() => setRunning(!running)}>
          {running ? "Pause" : "Démarrer"}
        </button>
        <button className="btn-cancel" onClick={() => switchMode(mode)}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

export default Pomodoro;
