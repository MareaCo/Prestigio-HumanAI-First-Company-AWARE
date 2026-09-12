import { DIMENSIONS, DIM_MAX } from "@/data/constants";
import type { Diagnostic } from "@/types";

interface Props {
  teamDiagnostics: Diagnostic[];
  allDiagnostics: Diagnostic[];
}

function avgDim(diags: Diagnostic[], dim: (typeof DIMENSIONS)[number]) {
  if (diags.length === 0) return 0;
  return (
    diags.reduce((s, d) => s + (d.dim_scores?.[dim] ?? 0), 0) / diags.length
  );
}

export function DimensionsCard({ teamDiagnostics, allDiagnostics }: Props) {
  const teamAvg = Object.fromEntries(
    DIMENSIONS.map((d) => [d, avgDim(teamDiagnostics, d)]),
  );
  const companyAvg = Object.fromEntries(
    DIMENSIONS.map((d) => [d, avgDim(allDiagnostics, d)]),
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ink/10 shadow-xs min-w-0 overflow-hidden">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">
        Dimensiones equipo vs. compañía
      </p>
      <div className="mt-4 space-y-3">
        {DIMENSIONS.map((dim) => {
          const t = teamAvg[dim] ?? 0;
          const c = companyAvg[dim] ?? 0;
          const max = DIM_MAX[dim];
          return (
            <div key={dim} className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-[11px] sm:text-[12px] text-ink-soft truncate w-20 sm:w-24 shrink-0 font-medium">
                {dim}
              </span>
              <div className="relative flex-1 h-2 rounded-full bg-ink/10 overflow-hidden min-w-[50px]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(c / max) * 100}%`,
                    background: "#B5B5AE",
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(t / max) * 100}%`,
                    background: "#2D3036",
                  }}
                />
              </div>
              <span className="text-[11px] sm:text-[12px] text-ink font-semibold w-11 sm:w-12 text-right shrink-0">
                {t.toFixed(1)}/{max}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-[10.5px] sm:text-[11px] text-ink-muted font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ink shrink-0" /> este equipo
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "#B5B5AE" }}
          />{" "}
          promedio compañía
        </span>
      </div>
    </div>
  );
}
