import { useMemo } from "react";
import type { Diagnostic } from "@/types";
import { TENSIONS, normalizeTensions } from "@/data/tensions";
import { ShieldAlert } from "lucide-react";

interface Props {
  diagnostics: Diagnostic[];
}

export function GroupTensionCard({ diagnostics }: Props) {
  const totalN = diagnostics.length || 1;

  const groupTensionAnalysis = useMemo(() => {
    if (!diagnostics || diagnostics.length === 0) return null;

    const mainTensions = TENSIONS.filter((t) => !t.esMeta && t.id !== "00");
    let highestDivergenceTension = mainTensions[0] || TENSIONS[0];
    let maxSpread = -1;
    let hasDissidence = false;
    let tensionAvg = 3;

    mainTensions.forEach((t) => {
      let sum = 0;
      let leftCount = 0; // <= 2
      let rightCount = 0; // >= 4

      diagnostics.forEach((d) => {
        const norm = normalizeTensions(d.tensiones);
        const val = norm[t.id] ?? 3;
        sum += val;
        if (val <= 2) leftCount++;
        if (val >= 4) rightCount++;
      });

      const avg = sum / totalN;
      const spread = Math.abs(avg - 3);

      if (
        leftCount > 0 &&
        rightCount > 0 &&
        (leftCount + rightCount) / totalN >= 0.4
      ) {
        hasDissidence = true;
      }

      if (spread > maxSpread) {
        maxSpread = spread;
        highestDivergenceTension = t;
        tensionAvg = Math.round(avg * 10) / 10;
      }
    });

    const leftTitle = highestDivergenceTension.leftPole;
    const rightTitle = highestDivergenceTension.rightPole;

    let executiveReading = "";
    if (tensionAvg > 3.2) {
      executiveReading = `El equipo manifiesta una inclinación clara hacia "${rightTitle}" (${highestDivergenceTension.rightDesc.toLowerCase()}).`;
    } else if (tensionAvg < 2.8) {
      executiveReading = `El equipo se inclina decididamente hacia "${leftTitle}" (${highestDivergenceTension.leftDesc.toLowerCase()}).`;
    } else {
      executiveReading = `El equipo se ubica en un punto intermedio respecto a "${highestDivergenceTension.name}".`;
    }

    return {
      tension: highestDivergenceTension,
      tensionAvg,
      leftTitle,
      rightTitle,
      executiveReading,
      hasDissidence,
    };
  }, [diagnostics, totalN]);

  if (!groupTensionAnalysis) return null;

  return (
    <div className="bg-[#2D3036] text-white p-5 sm:p-6 rounded-2xl border border-white/10 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        La Tensión Cultural Determinante del Equipo
      </div>
      <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white">
        {groupTensionAnalysis.leftTitle} vs {groupTensionAnalysis.rightTitle}
      </h3>
      <p className="text-xs text-gray-300">
        Puntuación Promedio del Equipo:{" "}
        <strong className="text-amber-400 font-mono text-sm font-bold">
          {groupTensionAnalysis.tensionAvg} / 5.0
        </strong>
      </p>

      <p className="text-sm text-gray-200 leading-relaxed pt-1">
        {groupTensionAnalysis.executiveReading}
      </p>

      {groupTensionAnalysis.hasDissidence && (
        <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
          <strong>Atención C-Level:</strong> Existe una disidencia interna
          relevante en esta tensión (algunos colaboradores se posicionan
          fuertemente en el polo de {groupTensionAnalysis.leftTitle} y otros en{" "}
          {groupTensionAnalysis.rightTitle}). Esto refleja visiones operativas
          encontradas dentro de la organización que requieren alineación
          directa.
        </div>
      )}
    </div>
  );
}
