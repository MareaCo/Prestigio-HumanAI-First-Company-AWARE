import { Fragment } from "react";
import { AWARE_STAGES } from "@/data/constants";
import type { AwareScores } from "@/hooks/useDashboard";

const THRESHOLD = 60;

export function DiagnosticBoard({ scores }: { scores: AwareScores | null }) {
  const weakStages = AWARE_STAGES.filter(
    (s) => (scores?.[s.key] ?? 0) < THRESHOLD,
  );
  const worst =
    weakStages.length > 0
      ? weakStages.reduce(
          (min, s) =>
            (scores?.[s.key] ?? 0) < (scores?.[min.key] ?? 0) ? s : min,
          weakStages[0],
        )
      : null;

  return (
    <div
      className="rounded-2xl p-7 text-white"
      style={{ background: "#2D3036" }}
    >
      <p
        className="uppercase"
        style={{ fontSize: 10, opacity: 0.5, letterSpacing: "0.1em" }}
      >
        Tablero Diagnóstico · Cambio Organizacional
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {AWARE_STAGES.map((s, i) => {
          const score = scores?.[s.key] ?? 0;
          const weak = score < THRESHOLD;
          return (
            <Fragment key={s.key}>
              {i > 0 && (
                <span style={{ opacity: 0.4 }} className="text-[13px]">
                  +
                </span>
              )}
              <span
                className="rounded-full"
                style={{
                  background: weak ? "#C8512A" : "rgba(255,255,255,0.08)",
                  padding: "4px 10px",
                  fontSize: 13,
                }}
              >
                {s.name}
              </span>
            </Fragment>
          );
        })}
      </div>

      <p
        className="font-display mt-5"
        style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          color: worst ? "#FF8A80" : "#ffffff",
        }}
      >
        = {worst ? worst.failure : "Human AI First Company ✓"}
      </p>

      {weakStages.length > 0 && (
        <p className="mt-3 text-[12px]" style={{ opacity: 0.7 }}>
          Etapas por debajo del umbral (&lt; {THRESHOLD}):{" "}
          {weakStages.map((s) => s.name).join(" · ")}. Priorizar acciones en{" "}
          <strong style={{ color: "#FF8A80" }}>{worst?.name}</strong> —{" "}
          {worst?.failure.split(" — ")[1] ?? ""}.
        </p>
      )}
    </div>
  );
}
