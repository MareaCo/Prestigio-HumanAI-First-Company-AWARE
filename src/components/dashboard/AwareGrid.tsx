import { AWARE_STAGES } from "@/data/constants";
import type { AwareScores } from "@/hooks/useDashboard";
import type { Diagnostic } from "@/types";

function colorFor(score: number) {
  if (score >= 70) return { bg: "#EBF6F1", fg: "#0D7A5F", bar: "#0D7A5F" };
  if (score >= 40) return { bg: "#FBF5E8", fg: "#A87028", bar: "#A87028" };
  return { bg: "#FDF0EE", fg: "#C84B31", bar: "#C84B31" };
}

interface AwareGridProps {
  scores: AwareScores | null;
  diagnostics?: Diagnostic[];
}

export function AwareGrid({ scores, diagnostics = [] }: AwareGridProps) {
  // 1. AWAKE KPIs: Total profiles and distribution across company
  const totalProfiles = diagnostics.length;
  const escepticos = diagnostics.filter((d) => d.perfil === "Escéptico").length;
  const tacticos = diagnostics.filter((d) => d.perfil === "Táctico").length;
  const facilitadores = diagnostics.filter(
    (d) => d.perfil === "Facilitador",
  ).length;
  const amplificadores = diagnostics.filter(
    (d) => d.perfil === "Amplificador",
  ).length;

  const escPct =
    totalProfiles > 0 ? Math.round((escepticos / totalProfiles) * 100) : 0;
  const tacPct =
    totalProfiles > 0 ? Math.round((tacticos / totalProfiles) * 100) : 0;
  const facPct =
    totalProfiles > 0 ? Math.round((facilitadores / totalProfiles) * 100) : 0;
  const ampPct =
    totalProfiles > 0 ? Math.round((amplificadores / totalProfiles) * 100) : 0;

  // 2. WATCH KPIs: Tension average across company
  let totalTensionsSum = 0;
  let totalTensionsCount = 0;
  diagnostics.forEach((d) => {
    if (d.tensiones) {
      Object.values(d.tensiones).forEach((val) => {
        totalTensionsSum += Number(val || 0);
        totalTensionsCount += 1;
      });
    }
  });
  const avgTensionScore =
    totalTensionsCount > 0
      ? (totalTensionsSum / totalTensionsCount).toFixed(1)
      : "3.8";

  // 3. ALIGN KPIs: Activity Matrix Q counts + 24-Box Arquetipo/Subperfil distribution
  let q1Sum = 0;
  let q2Sum = 0;
  let q3Sum = 0;
  let q4Sum = 0;
  const activeBoxes = new Set<string>();

  diagnostics.forEach((d) => {
    if (d.activities_q) {
      q1Sum += d.activities_q.q1 || 0;
      q2Sum += d.activities_q.q2 || 0;
      q3Sum += d.activities_q.q3 || 0;
      q4Sum += d.activities_q.q4 || 0;
    }
    const arq = d.arquetipo || d.perfil || "Táctico";
    const sub = d.subperfil || "Explorador";
    activeBoxes.add(`${arq}-${sub}`);
  });

  // 4. REDUCATE KPIs: Personal plans generated and completed
  const plansGenerated = totalProfiles;
  // Estimate completed personal plans based on high adoption profiles or completed roadmaps
  const plansCompleted = diagnostics.filter(
    (d) =>
      d.perfil === "Amplificador" || d.perfil === "Facilitador" || d.tier >= 4,
  ).length;
  const completionPct =
    plansGenerated > 0
      ? Math.round((plansCompleted / plansGenerated) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 min-w-0">
      {AWARE_STAGES.map((s) => {
        const score = scores?.[s.key] ?? null;
        let c =
          score === null
            ? { bg: "#F0F0EC", fg: "#888880", bar: "#B5B5AE" }
            : colorFor(score);

        if (s.key === "awake") {
          c = { bg: "#EBF6F1", fg: "#0D7A5F", bar: "#0D7A5F" };
        } else if (s.key === "watch") {
          c = { bg: "#FDF0EE", fg: "#C84B31", bar: "#C84B31" };
        } else if (s.key === "align") {
          c = { bg: "#F0F0EC", fg: "#888880", bar: "#888880" };
        } else if (s.key === "reducate") {
          c = { bg: "#F3F7E6", fg: "#96a900", bar: "#96a900" };
        } else if (s.key === "experiment") {
          c = { bg: "#FBF5E8", fg: "#A87028", bar: "#A87028" };
        }

        return (
          <div
            key={s.key}
            className="rounded-[14px] p-3.5 text-center flex flex-col justify-between shadow-xs border border-black/5"
            style={{ background: c.bg, color: c.fg }}
          >
            <div>
              <p
                className="font-display font-bold"
                style={{ fontSize: "1.5rem", lineHeight: 1 }}
              >
                {s.letter}
              </p>
              <p
                className="mt-1.5 uppercase tracking-wider font-semibold opacity-80"
                style={{ fontSize: 9.5 }}
              >
                {s.name}
              </p>
              <p
                className="uppercase tracking-wider font-medium opacity-70"
                style={{ fontSize: 8.5 }}
              >
                {s.esName}
              </p>
              <p style={{ fontSize: "1.35rem", fontWeight: 600, marginTop: 2 }}>
                {score === null ? "—" : score}
              </p>
              <div
                className="mt-1.5 h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(0,0,0,0.08)" }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${score ?? 0}%`, background: c.bar }}
                />
              </div>

              {/* Card Badge */}
              <div className="mt-2 text-center">
                <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 text-ink/80">
                  {s.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
