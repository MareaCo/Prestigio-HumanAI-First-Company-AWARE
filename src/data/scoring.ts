import { QUESTIONS, ACTITUD_QUESTIONS, type Dimension } from "./questions";
import { DIM_MAX, MAX_SCORE, TIERS, tierById, type TierData } from "./tiers";

export type DimScoresLocal = Record<Dimension, number>;

export function assignArchetype(
  scoreSER: number,
  respuestas?:
    | { q13?: string; q14?: string }
    | (number | null)[]
    | Record<string, unknown>
    | null,
): {
  arquetipo: "Escéptico" | "Táctico" | "Facilitador" | "Amplificador";
  a_una_evidencia: boolean;
  candado_no_aplicable: boolean;
} {
  let q13Val: string | number | undefined | null = undefined;
  let q14Val: string | number | undefined | null = undefined;

  if (Array.isArray(respuestas)) {
    // Array of 15 question option indices (0..3) from QUESTIONS
    if (respuestas[12] !== null && respuestas[12] !== undefined) {
      q13Val = respuestas[12];
    }
    if (respuestas[13] !== null && respuestas[13] !== undefined) {
      q14Val = respuestas[13];
    }
  } else if (respuestas && typeof respuestas === "object") {
    q13Val = respuestas.q13 ?? respuestas.Q13 ?? respuestas["13"];
    q14Val = respuestas.q14 ?? respuestas.Q14 ?? respuestas["14"];
  }

  const hasQ13 = q13Val !== undefined && q13Val !== null && q13Val !== "";
  const hasQ14 = q14Val !== undefined && q14Val !== null && q14Val !== "";
  const hasEvidenciaAnswers = hasQ13 || hasQ14;

  const isD = (val: string | number | undefined | null): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === "string") {
      const u = val.trim().toUpperCase();
      return u === "D" || u === "4";
    }
    if (typeof val === "number") {
      return val === 4 || val === 3; // score 4 or 0-indexed option 3
    }
    return false;
  };

  const q13D = isD(q13Val);
  const q14D = isD(q14Val);
  const evidenciaDura = q13D || q14D;

  if (scoreSER >= 18) {
    if (!hasEvidenciaAnswers) {
      // 4c: Si no tiene registradas las respuestas individuales de Q13/Q14:
      // NO lo re-etiquetes con el candado: aplicá solo los nuevos umbrales y marcalo con candado_no_aplicable = true.
      return {
        arquetipo: "Amplificador",
        a_una_evidencia: false,
        candado_no_aplicable: true,
      };
    }

    if (evidenciaDura) {
      return {
        arquetipo: "Amplificador",
        a_una_evidencia: false,
        candado_no_aplicable: false,
      };
    } else {
      return {
        arquetipo: "Facilitador",
        a_una_evidencia: true,
        candado_no_aplicable: false,
      };
    }
  }

  if (scoreSER >= 14) {
    return {
      arquetipo: "Facilitador",
      a_una_evidencia: false,
      candado_no_aplicable: !hasEvidenciaAnswers,
    };
  }

  if (scoreSER >= 10) {
    return {
      arquetipo: "Táctico",
      a_una_evidencia: false,
      candado_no_aplicable: !hasEvidenciaAnswers,
    };
  }

  return {
    arquetipo: "Escéptico",
    a_una_evidencia: false,
    candado_no_aplicable: !hasEvidenciaAnswers,
  };
}

export function getArquetipo(
  scoresSER: number,
  respuestas?:
    | { q13?: string; q14?: string }
    | (number | null)[]
    | Record<string, unknown>
    | null,
): "Escéptico" | "Táctico" | "Facilitador" | "Amplificador" {
  return assignArchetype(scoresSER, respuestas).arquetipo;
}

export function getSubperfil(
  scoresHACER: number,
):
  | "Aficionado"
  | "Explorador"
  | "Integrador"
  | "Director"
  | "Constructor"
  | "Orquestador" {
  if (scoresHACER <= 14) return "Aficionado";
  if (scoresHACER <= 19) return "Explorador";
  if (scoresHACER <= 24) return "Integrador";
  if (scoresHACER <= 29) return "Director";
  if (scoresHACER <= 34) return "Constructor";
  return "Orquestador";
}

export function getGapType(
  arquetipo: string,
  subperfil: string,
): "convencido_sin_herramientas" | "poder_sin_proposito" | "alineado" {
  const arqIndex = [
    "Escéptico",
    "Táctico",
    "Facilitador",
    "Amplificador",
  ].indexOf(arquetipo);
  const subIndex = [
    "Aficionado",
    "Explorador",
    "Integrador",
    "Director",
    "Constructor",
    "Orquestador",
  ].indexOf(subperfil);

  const isCanonical =
    (arqIndex === 0 && (subIndex === 0 || subIndex === 1)) ||
    (arqIndex === 1 && subIndex === 2) ||
    (arqIndex === 2 && (subIndex === 3 || subIndex === 4)) ||
    (arqIndex === 3 && subIndex === 5);

  if (isCanonical) return "alineado";

  const canonicalSubRange =
    arqIndex === 0
      ? [0, 1]
      : arqIndex === 1
        ? [2, 2]
        : arqIndex === 2
          ? [3, 4]
          : [5, 5];

  if (subIndex < canonicalSubRange[0]) {
    return "convencido_sin_herramientas";
  } else {
    return "poder_sin_proposito";
  }
}

export function computeScores(answers: (number | null)[]): {
  total: number;
  dimScores: DimScoresLocal;
  actitud: number;
  tecnico: number;
  scoresSER: number;
  scoresHACER: number;
  arquetipo: "Escéptico" | "Táctico" | "Facilitador" | "Amplificador";
  subperfil:
    | "Aficionado"
    | "Explorador"
    | "Integrador"
    | "Director"
    | "Constructor"
    | "Orquestador";
  gap: "convencido_sin_herramientas" | "poder_sin_proposito" | "alineado";
  a_una_evidencia: boolean;
  candado_no_aplicable: boolean;
  respuestas: Record<string, string>;
} {
  const dimScores: DimScoresLocal = {
    Mentalidad: 0,
    Emocionalidad: 0,
    Contexto: 0,
    Datos: 0,
    Automatización: 0,
    Calidad: 0,
    Autonomía: 0,
    Liderazgo: 0,
  };
  let actitud = 0;
  let tecnico = 0;

  const respuestas: Record<string, string> = {};

  QUESTIONS.forEach((q, i) => {
    const idx = answers[i];
    // If unanswered, score minimum (1) so total starts at 15 (MIN=15)
    const opt =
      idx !== null && idx !== undefined ? q.options[idx] : q.options[0];
    const score = opt?.score ?? 1;
    dimScores[q.dimension] += score;
    if (ACTITUD_QUESTIONS.includes(q.id)) actitud += score;
    else tecnico += score;

    respuestas[`q${q.id}`] = opt?.letter ?? "A";
  });

  const scoresSER = actitud;
  const scoresHACER = tecnico;
  const { arquetipo, a_una_evidencia, candado_no_aplicable } = assignArchetype(
    scoresSER,
    respuestas,
  );
  const subperfil = getSubperfil(scoresHACER);
  const gap = getGapType(arquetipo, subperfil);
  const total = actitud + tecnico;

  return {
    total,
    dimScores,
    actitud,
    tecnico,
    scoresSER,
    scoresHACER,
    arquetipo,
    subperfil,
    gap,
    a_una_evidencia,
    candado_no_aplicable,
    respuestas,
  };
}

export function getTier(total: number): TierData {
  return (
    TIERS.find((t) => total >= t.range[0] && total <= t.range[1]) ?? TIERS[0]
  );
}

export { tierById, DIM_MAX, MAX_SCORE };

export function getLowestDim(dimScores: DimScoresLocal): Dimension {
  let lowest: Dimension = "Contexto";
  let lowestPct = Infinity;
  (Object.keys(dimScores) as Dimension[]).forEach((d) => {
    const max = DIM_MAX[d] ?? 8;
    const pct = (dimScores[d] ?? 0) / max;
    if (pct < lowestPct) {
      lowestPct = pct;
      lowest = d;
    }
  });
  return lowest;
}

export function perfilFromTier(
  tierId: number,
): "Escéptico" | "Táctico" | "Facilitador" | "Amplificador" {
  if (tierId === 1) return "Escéptico";
  if (tierId <= 3) return "Táctico";
  if (tierId === 4) return "Facilitador";
  return "Amplificador";
}
