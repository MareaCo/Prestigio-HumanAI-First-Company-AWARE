import { Doughnut } from "react-chartjs-2";
import { TIER_NAMES, TIER_COLORS } from "@/data/constants";
import { registerCharts } from "@/lib/charts";
import type { Diagnostic } from "@/types";

registerCharts();

export function AreaBar({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const counts = TIER_NAMES.map(
    (_, i) => diagnostics.filter((d) => d.tier === i + 1).length,
  );
  const total = diagnostics.length || 1;

  const data = {
    labels: TIER_NAMES,
    datasets: [
      {
        data: counts,
        backgroundColor: TIER_COLORS,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        DISTRIBUCIÓN DE NIVELES
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Aficionado · Regular · Integrador · Director · Constructor · Orquestador
      </p>

      <div className="mt-4" style={{ height: 220 }}>
        <Doughnut
          data={data}
          options={{
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: { legend: { display: false } },
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {TIER_NAMES.map((name, i) => (
          <div
            key={name}
            className="flex items-center gap-2 text-[12px] text-ink-soft"
          >
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{ background: TIER_COLORS[i] }}
            />
            <span>
              {name} · {Math.round((counts[i] / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
