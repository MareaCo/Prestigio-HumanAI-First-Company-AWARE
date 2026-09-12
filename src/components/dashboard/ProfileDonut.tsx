import { Doughnut } from "react-chartjs-2";
import { PERFIL_CONFIG } from "@/data/constants";
import { registerCharts } from "@/lib/charts";
import type { Diagnostic } from "@/types";

registerCharts();

const PERFILES = [
  "Escéptico",
  "Táctico",
  "Facilitador",
  "Amplificador",
] as const;

export function ProfileDonut({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const counts: Record<(typeof PERFILES)[number], number> = {
    Escéptico: 0,
    Táctico: 0,
    Facilitador: 0,
    Amplificador: 0,
  };
  diagnostics.forEach((d) => {
    counts[d.perfil] = (counts[d.perfil] ?? 0) + 1;
  });
  const total = diagnostics.length || 1;

  const data = {
    labels: [...PERFILES],
    datasets: [
      {
        data: PERFILES.map((p) => counts[p]),
        backgroundColor: PERFILES.map((p) => PERFIL_CONFIG[p].color),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Distribución de perfiles
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Escéptico · Táctico · Facilitador · Amplificador
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

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {PERFILES.map((p) => (
          <div
            key={p}
            className="flex items-center gap-2 text-[12px] text-ink-soft"
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: PERFIL_CONFIG[p].color }}
            />
            <span>
              {p} · {Math.round((counts[p] / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
