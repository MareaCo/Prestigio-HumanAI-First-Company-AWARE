import { TENSIONS, normalizeTensions } from "@/data/tensions";

interface Props {
  personalTensions?: Record<string, number>;
  companyAverages?: Record<string, number>;
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

function getTensionReading(tId: string, diff: number): string {
  if (Math.abs(diff) < 0.1) {
    return "Tu posicionamiento coincide exactamente con la media de la organización.";
  }

  const targetTension = TENSIONS.find((t) => t.id === tId);

  if (diff > 0) {
    if (targetTension) {
      return `Te orientas con mayor fuerza hacia "${targetTension.rightPole}" (${targetTension.rightDesc}) que el promedio de la compañía.`;
    }
    return "Tu puntuación se orienta con mayor fuerza hacia el polo derecho que el promedio.";
  } else {
    if (targetTension) {
      return `Te orientas más hacia "${targetTension.leftPole}" (${targetTension.leftDesc}) que el promedio de la organización.`;
    }
    return "Tu puntuación se orienta más hacia el polo izquierdo que el promedio de la compañía.";
  }
}

export function Top3Tensions({
  personalTensions: rawPersonal,
  companyAverages = DEFAULT_AVGS,
}: Props) {
  if (!rawPersonal) return null;

  const personalTensions = normalizeTensions(rawPersonal);

  // Exclude meta-tensions (esMeta / id "00") for collaborator report
  const mainTensions = TENSIONS.filter((t) => !t.esMeta && t.id !== "00");

  // Calculate abs(personal - company) for main tensions and sort descending
  const sortedTensions = mainTensions
    .map((t) => {
      const personalVal = personalTensions[t.id] ?? 3;
      const avgVal = companyAverages[t.id] ?? DEFAULT_AVGS[t.id] ?? 3;
      const diff = personalVal - avgVal;
      const absDiff = Math.abs(diff);
      return {
        tension: t,
        personalVal,
        avgVal,
        diff,
        absDiff,
      };
    })
    .sort((a, b) => b.absDiff - a.absDiff)
    .slice(0, 3); // Top 3 ONLY

  return (
    <div className="w-full bg-white rounded-2xl border border-ink/10 p-5 shadow-sm">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-ink/5 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
            Alineación Cultural Organizacional
          </span>
          <h3 className="font-poppins font-bold text-lg text-ink mt-0.5">
            Tus 3 Mayores Diferencias con la Compañía
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            Tensiones donde tu percepción más se distancia del promedio de la
            organización.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-ink-muted shrink-0 bg-cream/30 px-3 py-1.5 rounded-lg border border-ink/5">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-ink text-white font-bold text-[8px] flex items-center justify-center">
              T
            </span>
            <span className="font-medium text-ink">Tú</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-400 text-white font-bold text-[8px] flex items-center justify-center">
              P
            </span>
            <span className="font-medium text-ink-muted">
              Promedio Compañía
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedTensions.map(({ tension: t, personalVal, avgVal, diff }) => {
          const readingLine = getTensionReading(t.id, diff);
          const leftPoleTitle = t.leftPole;
          const rightPoleTitle = t.rightPole;

          return (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-cream/20 border border-ink/5 hover:border-ink/15 transition-all"
            >
              {/* Header line with cluster tag badge and title */}
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
              </div>

              {/* Bipolar Scale visual track */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center my-2">
                {/* Left Pole text */}
                <span className="md:col-span-3 text-[11px] text-ink-soft leading-tight md:text-right font-medium">
                  {leftPoleTitle}
                </span>

                {/* 1-5 Track */}
                <div className="md:col-span-6 relative py-3">
                  <div className="h-2 w-full bg-cream rounded-full border border-ink/10 relative">
                    <div className="absolute inset-0 flex justify-between px-0.5 items-center">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <div
                          key={v}
                          className="w-1 h-1.5 bg-ink/20 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Company Average Indicator (P) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-500 border-2 border-white shadow-xs flex items-center justify-center -ml-2 transition-all duration-300"
                      style={{ left: `${((avgVal - 1) / 4) * 100}%` }}
                      title={`Promedio Compañía: ${avgVal.toFixed(1)}`}
                    >
                      <span className="text-[7px] font-bold text-white">P</span>
                    </div>

                    {/* Personal Indicator (T) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-ink border-2 border-cream shadow-md flex items-center justify-center -ml-2.5 transition-all duration-300 scale-110 z-10"
                      style={{ left: `${((personalVal - 1) / 4) * 100}%` }}
                      title={`Tú: ${personalVal}`}
                    >
                      <span className="text-[8px] font-black text-cream">
                        T
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Pole text */}
                <span className="md:col-span-3 text-[11px] text-ink-soft leading-tight md:text-left font-medium">
                  {rightPoleTitle}
                </span>
              </div>

              {/* Bottom score summary pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-ink/5 gap-2 mt-2">
                <div className="flex items-center gap-2 flex-wrap">
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

                <span className="text-[10px] text-ink-muted font-mono bg-cream/50 px-2.5 py-1 rounded-full border border-ink/5 self-start sm:self-center">
                  Diferencia:{" "}
                  {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                </span>
              </div>

              {/* Natural Language Reading Line */}
              <div className="mt-3 pt-2.5 border-t border-ink/5 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C84B31] mt-1.5 shrink-0" />
                <p className="text-[12px] text-ink font-medium leading-relaxed">
                  {readingLine}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
