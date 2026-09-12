import { useState } from "react";

interface Props {
  activeArquetipo: string;
  activeSubperfil: string;
  readOnly?: boolean;
}

const ARQUETIPOS = ["Amplificador", "Facilitador", "Táctico", "Escéptico"];
const SUBPERFILES = [
  "Aficionado",
  "Explorador",
  "Integrador",
  "Director",
  "Constructor",
  "Orquestador",
];

// Helper to determine if a cell is on the canonical diagonal
function isDiagonal(arq: string, sub: string): boolean {
  const arqIdx = ARQUETIPOS.indexOf(arq);
  const subIdx = SUBPERFILES.indexOf(sub);

  // Grid coordinates mapping (4 rows, 6 columns)
  // Amplificador (rowIdx 0) -> Orquestador (subIdx 5)
  // Facilitador (rowIdx 1) -> Director (subIdx 3), Constructor (subIdx 4)
  // Táctico (rowIdx 2) -> Integrador (subIdx 2)
  // Escéptico (rowIdx 3) -> Aficionado (subIdx 0), Explorador (subIdx 1)

  return (
    (arqIdx === 3 && (subIdx === 0 || subIdx === 1)) ||
    (arqIdx === 2 && subIdx === 2) ||
    (arqIdx === 1 && (subIdx === 3 || subIdx === 4)) ||
    (arqIdx === 0 && subIdx === 5)
  );
}

// Get the gap type for a grid cell
function getCellGapType(
  arq: string,
  sub: string,
): "convencido_sin_herramientas" | "poder_sin_proposito" | "alineado" {
  const arqIdx = ARQUETIPOS.indexOf(arq);
  const subIdx = SUBPERFILES.indexOf(sub);

  if (isDiagonal(arq, sub)) return "alineado";

  // High SER, low HACER -> Row index is larger (near bottom/Escéptico) but Col index is smaller (near left/Aficionado)
  // Let's adjust for the fact that ARQUETIPOS array is reversed [Amplificador (0), Facilitador (1), Táctico (2), Escéptico (3)]
  // We want to compare the original 0-indexed values:
  const serIndex = 3 - arqIdx; // Escéptico is 0, Amplificador is 3

  const canonicalSubRange =
    serIndex === 0
      ? [0, 1]
      : serIndex === 1
        ? [2, 2]
        : serIndex === 2
          ? [3, 4]
          : [5, 5];

  if (subIdx < canonicalSubRange[0]) {
    return "convencido_sin_herramientas";
  } else {
    return "poder_sin_proposito";
  }
}

export function CompatibilityMatrix({
  activeArquetipo,
  activeSubperfil,
  readOnly = false,
}: Props) {
  const [hoveredCell, setHoveredCell] = useState<{
    arq: string;
    sub: string;
  } | null>(null);

  const displayedCell = hoveredCell || {
    arq: activeArquetipo,
    sub: activeSubperfil,
  };
  const cellGap = getCellGapType(displayedCell.arq, displayedCell.sub);

  let cellDescription = "";
  let cellTitle = "";

  if (cellGap === "alineado") {
    cellTitle = "Zona Coherente (Alineado)";
    cellDescription = `Equilibrio óptimo entre el SER (propósito y mentalidad) y el HACER (ejecución técnica). La persona avanza con coherencia estratégica.`;
  } else if (cellGap === "convencido_sin_herramientas") {
    cellTitle = "Brecha: Convencido sin Herramientas (Actitud+)";
    cellDescription = `Alta motivación y creencia en la IA, pero carece de la destreza práctica o herramientas para materializar el impacto en su día a día.`;
  } else {
    cellTitle = "Brecha: Poder sin Propósito (Técnica+)";
    cellDescription = `Excelente dominio técnico y habilidad práctica con herramientas, pero baja convicción o alineamiento cultural con la visión estratégica.`;
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-ink/10 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg text-ink">
          Matriz de Compatibilidad (4x6)
        </h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Posición del colaborador según Arquetipo (SER) vs. Subperfil (HACER).
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px] pb-2">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-1 text-center font-display text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            <div>Arquetipo \ HACER</div>
            {SUBPERFILES.map((sub) => (
              <div key={sub} className="py-1">
                {sub}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="space-y-1">
            {ARQUETIPOS.map((arq) => {
              const isUserArq = arq === activeArquetipo;
              return (
                <div key={arq} className="grid grid-cols-7 gap-1 items-center">
                  {/* Left Label */}
                  <div className="font-display text-[10px] font-bold text-ink-muted uppercase tracking-wider text-right pr-2">
                    {arq}
                  </div>

                  {/* 6 Columns */}
                  {SUBPERFILES.map((sub) => {
                    const isUserSub = sub === activeSubperfil;
                    const isCurrentCell = isUserArq && isUserSub;
                    const isDiag = isDiagonal(arq, sub);
                    const cellGapType = getCellGapType(arq, sub);

                    const isHovered =
                      hoveredCell?.arq === arq && hoveredCell?.sub === sub;

                    let bgClass = "bg-cream/40";
                    if (isDiag) bgClass = "bg-green-50/50";
                    if (cellGapType === "convencido_sin_herramientas")
                      bgClass = "bg-amber-50/30";
                    if (cellGapType === "poder_sin_proposito")
                      bgClass = "bg-blue-50/30";

                    return (
                      <button
                        key={sub}
                        disabled={readOnly}
                        onMouseEnter={() =>
                          !readOnly && setHoveredCell({ arq, sub })
                        }
                        onMouseLeave={() => !readOnly && setHoveredCell(null)}
                        className={`aspect-[4/3] rounded-lg border flex flex-col items-center justify-center relative transition-all duration-200 ${bgClass} ${
                          isCurrentCell
                            ? "border-ink border-2 ring-2 ring-ink/20 shadow-md scale-105 z-10"
                            : isHovered
                              ? "border-ink/60 bg-cream/80 scale-[1.02] shadow-sm z-10"
                              : "border-ink/10 hover:border-ink/30"
                        }`}
                      >
                        {isDiag && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                        )}
                        {isCurrentCell && (
                          <span className="w-2.5 h-2.5 rounded-full bg-ink animate-ping absolute" />
                        )}
                        <span
                          className={`text-[10px] font-semibold ${isCurrentCell ? "text-ink font-bold" : "text-ink-muted"}`}
                        >
                          {isCurrentCell ? "TÚ" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-5 p-4 rounded-xl bg-cream/30 border border-ink/5 flex gap-3 items-start">
        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-ink" />
        <div>
          <h4 className="text-[12px] font-bold text-ink uppercase tracking-wider">
            {cellTitle} {hoveredCell ? "(Vista Previa)" : "(Tu ubicación)"}
          </h4>
          <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
            {cellDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
