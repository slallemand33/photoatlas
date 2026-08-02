import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type ScoreTone = "excellent" | "good" | "average" | "poor";

function getTone(score: number): { tone: ScoreTone; label: string } {
  if (score >= 85) return { tone: "excellent", label: "Excellent" };
  if (score >= 68) return { tone: "good", label: "Très bon" };
  if (score >= 50) return { tone: "average", label: "Correct" };
  return { tone: "poor", label: "Défavorable" };
}

export function ScoreIndicator({ score, compact = false }: { score: number; compact?: boolean }) {
  const status = getTone(score);
  const style = { "--score-angle": `${score * 3.6}deg` } as CSSProperties;

  return (
    <div className="score-indicator flex items-center gap-3" data-tone={status.tone} style={style}>
      <div
        className={cn(
          "score-indicator__ring grid shrink-0 place-items-center rounded-full p-1",
          compact ? "h-11 w-11" : "h-20 w-20",
        )}
        role="img"
        aria-label={`${status.label}, score ${score} sur 100`}
      >
        <div className="bg-card grid h-full w-full place-items-center rounded-full">
          <span
            className={cn("font-mono font-black tabular-nums", compact ? "text-sm" : "text-2xl")}
          >
            {score}
          </span>
        </div>
      </div>
      {!compact && (
        <div>
          <p className="score-indicator__label text-sm font-black tracking-[0.12em] uppercase">
            {status.label}
          </p>
          <p className="text-muted-foreground mt-1 text-sm font-semibold">{score} / 100</p>
        </div>
      )}
    </div>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const status = getTone(score);
  return (
    <div className="score-indicator w-full" data-tone={status.tone}>
      <div className="bg-muted h-2.5 overflow-hidden rounded-full" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[var(--score-color)] transition-[width] duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
