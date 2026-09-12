import { useMemo } from "react";
import { TENSIONS, normalizeTensions } from "@/data/tensions";
import type { Diagnostic } from "@/types";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  personalTensions?: Record<string, number>;
  companyAverages?: Record<string, number>;
  diagnostics?: Diagnostic[];
  allDiagnostics?: Diagnostic[];
  title?: string;
  description?: string;
  isObservabilidad?: boolean;
}

const DEFAULT_AVGS: Record<string, number> = {
  "01": 2.8,
  "02": 3.1,
  "03": 2.5,
  "04": 3.1,
  "05": 3.2,
  "06": 2.7,
  "07": 3.5,
  "08": 2.9,
  "09": 3.8,
  "10": 3.0,
  "00": 3.6,
};

export function TensionsChart({
  personalTensions: rawPersonal,
  companyAverages: rawCompanyAverages,
  diagnostics,
  title = "Mapa de 10 Tensiones Culturales (Culture Map v2.1)",
  description = "Evaluación de 10 tensiones estratégicas + Meta-tensión Coherencia (Escala 1 a 5).",
  isObservabilidad = true,
}: Props) {
  const personalTensions = useMemo(
    () => (rawPersonal ? normalizeTensions(rawPersonal) : undefined),
    [rawPersonal],
  );

  // Compute stats across diagnostics if available
  const stats = useMemo(() => {
    if (!diagnostics || diagnostics.length === 0) {
      const companyAvgs = rawCompanyAverages ?? DEFAULT_AVGS;
      return {
        averages: companyAvgs,
        dispersions: {} as Record<string, number>,
        focos: {} as Record<string, boolean>,
        coherenciaAvg: companyAvgs["00"] ?? 3.6,
        count: 0,
      };
    }

    const sums: Record<string, number> = {};
    const values: Record<string, number[]> = {};

    TENSIONS.forEach((t) => {
      sums[t.id] = 0;
      values[t.id] = [];
    });

    diagnostics.forEach((d) => {
      const norm = normalizeTensions(d.tensiones);
      TENSIONS.forEach((t) => {
        const val = norm[t.id] ?? 3;
        sums[t.id] += val;
        values[t.id].push(val);
      });
    });

    const count = diagnostics.length || 1;
    const averages: Record<string, number> = {};
    const dispersions: Record<string, number> = {};
    const focos: Record<string, boolean> = {};

    TENSIONS.forEach((t) => {
      const avg = sums[t.id] / count;
      averages[t.id] = Math.round(avg * 10) / 10;

      // Calculate std deviation
      const variance =
        values[t.id].reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / count;
      const stdDev = Math.sqrt(variance);
      dispersions[t.id] = Math.round(stdDev * 100) / 100;

      // Foco condition: average near extreme (<= 2 or >= 4) with low dispersion (< 1.25)
      if ((avg <= 2.2 || avg >= 3.8) && stdDev <= 1.25) {
        focos[t.id] = true;
      } else {
        focos[t.id] = false;
      }
    });

    return {
      averages,
      dispersions,
      focos,
      coherenciaAvg: averages["00"] ?? 3.6,
      count,
    };
  }, [diagnostics, rawCompanyAverages]);

  const mainTensions = useMemo(() => TENSIONS.filter((t) => !t.esMeta), []);
  const metaTension = useMemo(() => TENSIONS.find((t) => t.esMeta), []);

  return (
    <div className="w-full bg-white rounded-2xl border border-ink/10 p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-ink/5 pb-4">
        <div>
          <span className="bg-[#C84B31]/10 text-[#C84B31] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md">
            Culture Map by Prestigio v2.1
          </span>
          <h3 className="font-display font-bold text-xl text-ink mt-1.5">
            {title}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-ink-muted shrink-0 flex-wrap">
          {personalTensions && (
            <div className="flex items-center gap-1.5 bg-cream/60 px-2.5 py-1 rounded-lg border border-ink/5">
              <span className="w-3.5 h-3.5 rounded-full bg-ink text-white font-black text-[7px] flex items-center justify-center">
                T
              </span>
              <span>Tú</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-cream/60 px-2.5 py-1 rounded-lg border border-ink/5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-500 text-white font-bold text-[7px] flex items-center justify-center">
              P
            </span>
            <span>Promedio Compañía</span>
          </div>
        </div>
      </div>

      {/* Meta-Tensión Header Indicator (Only in Observabilidad) */}
      {isObservabilidad && metaTension && (
        <div className="p-4 bg-gradient-to-r from-[#8C2B18] via-[#631B0E] to-[#2C0D07] text-white rounded-2xl border border-[#C84B31]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#C84B31] text-white font-black text-[9px] flex items-center justify-center shrink-0 border border-white/20">
                W
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-200">
                Meta-Tensión Clave: Coherencia Cultural
              </span>
            </div>
            <p className="text-xs text-rose-100/90 font-medium">
              Discurso vs Ejemplo: Modula la credibilidad de todo el mapa
              organizacional.
            </p>
            {metaTension.cita && (
              <p className="text-[11.5px] text-rose-200/90 italic font-poppins mt-1 border-l-2 border-rose-400/40 pl-2.5 py-0.5">
                "{metaTension.cita}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
            <div className="text-right">
              <span className="text-[10px] text-rose-200/90 block uppercase font-medium">
                Puntaje Coherencia
              </span>
              <span className="font-mono font-extrabold text-base text-white">
                {stats.coherenciaAvg.toFixed(1)} / 5.0
              </span>
            </div>
            {stats.coherenciaAvg >= 3.5 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>
        </div>
      )}

      {/* Main 10 Tensions */}
      <div className="space-y-6">
        {mainTensions.map((t) => {
          const personalVal = personalTensions
            ? personalTensions[t.id]
            : undefined;
          const avgVal = stats.averages[t.id] ?? DEFAULT_AVGS[t.id] ?? 3;
          const dispersion = stats.dispersions[t.id];
          const isFoco = stats.focos[t.id];

          const leftPoleTitle = t.leftPole;
          const rightPoleTitle = t.rightPole;

          return (
            <div
              key={t.id}
              className={`p-4 rounded-xl border transition-all ${
                isFoco
                  ? "bg-amber-50/40 border-amber-300/80 shadow-2xs"
                  : "bg-cream/20 border-ink/5 hover:border-ink/15"
              }`}
            >
              {/* Header line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted bg-white px-2 py-0.5 rounded border border-ink/10">
                    T{t.id} · {t.cluster}
                  </span>
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    {leftPoleTitle}{" "}
                    <span className="text-ink-muted font-normal lowercase">
                      ↔
                    </span>{" "}
                    {rightPoleTitle}
                  </span>
                </div>

                {isFoco && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 shrink-0">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Foco de Trabajo: Atrapada en un solo polo
                  </span>
                )}
              </div>

              {/* Powerful quote for Observabilidad */}
              {isObservabilidad && t.cita && (
                <p className="text-[11.5px] italic text-[#C84B31] font-poppins my-1.5 border-l-2 border-[#C84B31]/40 pl-2.5 py-0.5 leading-snug">
                  "{t.cita}"
                </p>
              )}

              {/* Bipolar Scale visual track */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-2">
                {/* Left Pole */}
                <span className="md:col-span-3 text-[11px] text-ink-soft leading-tight md:text-right font-medium">
                  {leftPoleTitle}
                </span>

                {/* 1-5 Track */}
                <div className="md:col-span-6 relative py-3">
                  <div className="h-2 w-full bg-cream rounded-full border border-ink/10 relative">
                    <div className="absolute inset-0 flex justify-between px-0.5 items-center">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <div
                          key={val}
                          className="w-1 h-1.5 bg-ink/20 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Company Average Indicator */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-500 border-2 border-white shadow-xs flex items-center justify-center -ml-2 transition-all duration-300"
                      style={{ left: `${((avgVal - 1) / 4) * 100}%` }}
                      title={`Promedio: ${avgVal.toFixed(1)}`}
                    >
                      <span className="text-[7px] font-bold text-white">P</span>
                    </div>

                    {/* Personal Rating Indicator */}
                    {personalVal !== undefined && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-ink border-2 border-cream shadow-md flex items-center justify-center -ml-2.5 transition-all duration-300 scale-110 z-10"
                        style={{ left: `${((personalVal - 1) / 4) * 100}%` }}
                        title={`Tú: ${personalVal}`}
                      >
                        <span className="text-[8px] font-black text-cream">
                          T
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Pole */}
                <span className="md:col-span-3 text-[11px] text-ink-soft leading-tight md:text-left font-medium">
                  {rightPoleTitle}
                </span>
              </div>

              {/* Score summary & dispersion details using Image 1 pill format and Image 2 figures */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-ink/5 gap-2 mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {personalVal !== undefined && (
                    <div className="inline-flex items-center gap-1.5 bg-ink text-white px-3 py-1 rounded-full text-[11px] shadow-2xs">
                      <span className="w-4 h-4 rounded-full bg-cream text-ink font-black text-[8px] flex items-center justify-center shrink-0">
                        T
                      </span>
                      <span>
                        Tú:{" "}
                        <strong className="font-extrabold text-white">
                          {personalVal}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-1.5 bg-[#F5F4F0] border border-ink/10 px-3.5 py-1 rounded-full text-[11.5px] text-ink-muted shadow-2xs">
                    <span className="w-4 h-4 rounded-full bg-slate-500 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                      P
                    </span>
                    <span>
                      Promedio:{" "}
                      <strong className="text-ink font-extrabold">
                        {avgVal.toFixed(1)} / 5.0
                      </strong>
                    </span>
                  </div>
                </div>

                {dispersion !== undefined && (
                  <span className="text-[10px] text-ink-muted font-mono bg-cream/50 px-2.5 py-1 rounded-full border border-ink/5 self-start sm:self-center">
                    Dispersión (σ): {dispersion.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
