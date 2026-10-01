import { useEffect, useState } from "react";

interface LoadingStateProps {
  stages: string[];
  stageIntervalMs?: number;
}

export function LoadingState({
  stages,
  stageIntervalMs = 1800,
}: LoadingStateProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    if (stages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1 < stages.length ? prev + 1 : prev));
    }, stageIntervalMs);

    return () => clearInterval(interval);
  }, [stages, stageIntervalMs]);

  const currentStage = stages[currentStageIndex] || stages[0];

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" />
      <div className="loading-status-text">{currentStage}</div>
      {stages.length > 1 && (
        <div className="loading-stage-indicator">
          <span>
            Stage {currentStageIndex + 1} of {stages.length}
          </span>
        </div>
      )}
    </div>
  );
}
