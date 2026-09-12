import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import type { Diagnostic } from "@/types";
import { DIMENSIONS, DIM_MAX, PERFIL_CONFIG } from "@/data/constants";
import { getLowestDim, tierById } from "@/data/scoring";
import type { Dimension } from "@/data/questions";
import { CompatibilityMatrix } from "@/components/report/CompatibilityMatrix";
import { Top3Tensions } from "@/components/report/Top3Tensions";
import {
  Zap,
  Building2,
  Calendar,
  User,
  Sparkles,
  CheckCircle2,
  Target,
} from "lucide-react";

interface Props {
  diagnostic: Diagnostic;
  companyAverages?: Record<string, number>;
}

// Archetype detailed definitions (A.2)
const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Escéptico:
    "El perfil Escéptico refleja a quienes aún no han dado el paso de integrar la IA como una herramienta de valor en su día a día. Desde la duda —consciente o inconsciente— tiende a postergar la experimentación y a justificar con excusas la falta de acción, perdiendo la oportunidad de descubrir su verdadero potencial. Aunque es legítimo sentir temor frente a una transformación tan profunda, el mayor riesgo no está en equivocarse al usar la IA, sino en quedarse al margen de una tendencia que ya redefine la forma de trabajar y competir en el mundo.",
  Táctico:
    "El perfil Táctico representa el primer paso consciente hacia la apropiación de la IA. Es un estilo que ya se atreve a experimentar, viendo en la tecnología una aliada para resolver tareas repetitivas y ganar eficiencia en el día a día. Aunque su uso aún es moderado y principalmente práctico, reconoce que el mundo digital está cambiando las reglas de juego y que la IA será un factor determinante en ese cambio. Su reto consiste en ampliar la mirada: pasar de lo inmediato a lo estratégico, de la eficiencia puntual al impacto colectivo.",
  Facilitador:
    "El perfil Facilitador simboliza el tránsito entre la adopción inicial y la apropiación consciente de la IA. Es un estilo que ya incorpora la inteligencia artificial en su día a día, tanto para resolver retos de productividad como para apoyar decisiones estratégicas, pero que todavía está expandiendo su mirada hacia todo el potencial que puede generar en el negocio. Su mayor fortaleza radica en ser un conector: impulsa a los más escépticos y tácticos a avanzar, abre espacios de aprendizaje compartido y convierte su propia experiencia en motor pedagógico para otros.",
  Amplificador:
    "El perfil Amplificador representa el estilo más pertinente para el mundo de hoy. No se limita a usar la IA como una herramienta más, sino que la integra de manera consciente y estratégica para potenciar la productividad en lo táctico, generar valor real para clientes en lo estratégico y, sobre todo, liberar espacio para dedicar su energía a lo que más importa: la creatividad, la innovación y el desarrollo humano. Los Amplificadores comprenden que la IA no sustituye su criterio, lo amplifica; no reemplaza su liderazgo, lo eleva.",
};

// Friendly labels for gap types
const GAP_LABELS: Record<string, string> = {
  convencido_sin_herramientas: "Actitud+ (Sin Herramientas)",
  poder_sin_proposito: "Técnica+ (Sin Propósito)",
  alineado: "Alineación Coherente",
  rezago: "Rezago (Brecha Doble)",
};

const GAP_DESCRIPTIONS: Record<string, string> = {
  convencido_sin_herramientas:
    "Alta motivación y visión de oportunidad en la IA, pero carencia de destrezas prácticas y herramientas instrumentales para materializar el impacto en tareas concretas.",
  poder_sin_proposito:
    "Excelente habilidad práctica y dominio de herramientas de IA, pero baja convicción o desalineación estratégica con los objetivos y propósito del negocio.",
  alineado:
    "Equilibrio óptimo e integración armónica entre la actitud (SER) y la destreza técnica (HACER). Avanza con solidez estratégica y ejecución fluida.",
  rezago:
    "Bajo nivel de convicción inicial sumado a baja práctica instrumental. Requiere alfabetización básica y primeros hábitos guiados.",
};

const GAP_DIRECTIONS: Record<string, string> = {
  convencido_sin_herramientas:
    "Sugerencia de movimiento: Movete a la derecha en destreza práctica (HACER), no hacia arriba en actitud.",
  poder_sin_proposito:
    "Sugerencia de movimiento: Movete hacia arriba en alineación y propósito (SER), no más hacia la derecha en técnica.",
  alineado:
    "Sugerencia de movimiento: Mantené el equilibrio y desplazate hacia el cuadrante de liderazgo para movilizar a otros.",
  rezago:
    "Sugerencia de movimiento: Iniciá el movimiento en destreza práctica básica para destrabar el proceso.",
};

// H1 Catalogue for "Tu único foco" (A.5)
const H1_CATALOGUE: Record<Dimension, { title: string; action: string }> = {
  Mentalidad: {
    title: "Estructurá borradores dictándole a la IA en tu móvil",
    action:
      "Prueba a dictarle un borrador de idea de 1 minuto a la IA en tu móvil para que te lo estructure en 3 párrafos limpios.",
  },
  Emocionalidad: {
    title: "Utilizá la IA como contrapeso y abogado del diablo",
    action:
      "Establece el hábito de usar la IA para evaluar alternativas o hacer de abogado del diablo en 2 decisiones esta semana.",
  },
  Contexto: {
    title: "Creá un prompt con tu Rol, Objetivo y Formato",
    action:
      "Crea un prompt simple que especifique tu Rol, Objetivo y el formato en el que esperas las respuestas.",
  },
  Datos: {
    title: "Analizá tendencias copiando un informe en la IA",
    action:
      "Copia y pega un conjunto de datos pequeño de un informe en la IA y pídele que identifique las 3 tendencias clave.",
  },
  Automatización: {
    title: "Mapeá los pasos de una tarea repetitiva diaria",
    action:
      "Identifica una tarea repetitiva diaria que tome más de 15 minutos y dibuja sus pasos simples en un papel.",
  },
  Calidad: {
    title: "Pedile a la IA que revise sus borradores con una rúbrica",
    action:
      "Pide siempre a la IA que revise sus propios borradores con una rúbrica de calidad específica antes de enviártelos.",
  },
  Autonomía: {
    title: "Usá la IA para resolver dudas técnicas en directo",
    action:
      "Usa la IA para realizar búsquedas rápidas o explicaciones de conceptos técnicos en lugar de buscar manualmente.",
  },
  Liderazgo: {
    title: "Compartí un prompt de ahorro de tiempo con un colega",
    action:
      "Comparte un prompt que te haya ahorrado al menos 10 minutos con un colega de tu equipo cercano.",
  },
};

const AVG_LINE = [4.7, 5.0, 4.2, 3.3, 3.8, 3.0, 4.0, 4.5];
const TOP_LINE = [9.7, 9.0, 9.2, 9.2, 9.2, 8.7, 8.8, 9.0];

export function IndividualReport({ diagnostic, companyAverages }: Props) {
  const tier = tierById(diagnostic.tier);
  const empName = diagnostic.employee?.name || "Colaborador";
  const empArea = diagnostic.employee?.area || null;
  const empEmail = diagnostic.employee?.email || null;
  const createdDate = new Date(diagnostic.created_at).toLocaleDateString(
    "es-CO",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  const arquetipo = diagnostic.arquetipo || "Táctico";
  const perfil = diagnostic.perfil || arquetipo;
  const perfilCfg =
    PERFIL_CONFIG[perfil as keyof typeof PERFIL_CONFIG] ||
    PERFIL_CONFIG.Táctico;
  const subperfil = diagnostic.subperfil || "Explorador";
  const gapType = diagnostic.gap || "alineado";
  const gapLabel = GAP_LABELS[gapType] ?? "Alineación Coherente";

  // Clean single quotes for quote (A.2)
  const cleanQuote = useMemo(() => {
    let q = tier.quote || "";
    q = q.replace(/^["'“”«»]+|["'“”«»]+$/g, "").trim();
    return q;
  }, [tier.quote]);

  // Dimension scores and bug fix for minimum dimension (A.5)
  const dimScores = diagnostic.dim_scores;

  const { lowestDim, minPct, allHundred } = useMemo(() => {
    let minD: Dimension = "Contexto";
    let minP = Infinity;
    let countHundred = 0;

    DIMENSIONS.forEach((d) => {
      const raw = Number(
        (dimScores as unknown as Record<string, number>)[d] ?? 0,
      );
      const max = DIM_MAX[d] ?? 8;
      const pct = Math.round((raw / max) * 100);

      if (pct === 100) countHundred++;

      if (pct < minP) {
        minP = pct;
        minD = d;
      }
    });

    return {
      lowestDim: minD,
      minPct: minP === Infinity ? 0 : minP,
      allHundred: countHundred === DIMENSIONS.length,
    };
  }, [dimScores]);

  // Radar user data
  const userData = useMemo(() => {
    return DIMENSIONS.map((d) => {
      const score = Number(
        (dimScores as unknown as Record<string, number>)[d] ?? 0,
      );
      const max = DIM_MAX[d] ?? 8;
      const minScore = max / 4;
      const normalized =
        minScore === max ? 0 : ((score - minScore) / (max - minScore)) * 10;
      return Math.min(10, Math.max(0, Number(normalized.toFixed(1))));
    });
  }, [dimScores]);

  // High dimensions (>= 70%) for Strengths (A.4)
  const strongDims = useMemo(() => {
    return DIMENSIONS.filter((d) => {
      const raw = Number(
        (dimScores as unknown as Record<string, number>)[d] ?? 0,
      );
      const max = DIM_MAX[d] ?? 8;
      return raw / max >= 0.7;
    });
  }, [dimScores]);

  // Veredicto sentence selection (A.2)
  const veredictoElement = useMemo(() => {
    switch (gapType) {
      case "convencido_sin_herramientas":
        return (
          <>
            <span className="text-ink">
              Tienes la mentalidad para liderar la adopción, pero todavía no las
              herramientas para materializarla.
            </span>{" "}
            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
              Tu salto no es de actitud — es de destreza.
            </span>
          </>
        );
      case "poder_sin_proposito":
        return (
          <>
            <span className="text-ink">
              Dominas la herramienta mejor que la mayoría, pero todavía no la
              has puesto al servicio de algo que importe.
            </span>{" "}
            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
              Tu salto no es técnico — es de propósito.
            </span>
          </>
        );
      case "alineado":
        return (
          <>
            <span className="text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
              Actitud y destreza te van parejas.
            </span>{" "}
            <span className="text-ink">
              Tu siguiente reto ya no es tuyo: es llevar a otros a donde tú ya
              estás.
            </span>
          </>
        );
      case "rezago":
      default:
        return (
          <>
            <span className="text-ink">
              Todavía no hay evidencia ni de intención ni de práctica.
            </span>{" "}
            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
              El primer paso no es una herramienta — es una hora de tu tiempo
              esta semana.
            </span>
          </>
        );
    }
  }, [gapType]);

  const h1Item = H1_CATALOGUE[lowestDim] ?? H1_CATALOGUE.Contexto;

  return (
    <div className="space-y-6 print:p-0">
      {/* A.1 ENCABEZADO */}
      <div className="bg-white rounded-2xl border border-ink/10 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl text-white shrink-0 shadow-xs uppercase"
            style={{ backgroundColor: perfilCfg.dark }}
          >
            {empName
              ? empName.trim().split(/\s+/)[0].charAt(0).toUpperCase()
              : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted bg-cream px-2 py-0.5 rounded border border-ink/5">
                INFORME PERSONALIZADO
              </span>
            </div>
            <h2 className="text-xl font-poppins font-extrabold text-ink mt-0.5 leading-tight">
              {empName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft mt-1">
              {diagnostic.employee?.cedula && (
                <span className="font-medium text-ink">
                  C.C. {diagnostic.employee.cedula}
                </span>
              )}
              {diagnostic.employee?.empresa && (
                <span className="font-medium text-ink">
                  · {diagnostic.employee.empresa}
                </span>
              )}
              {empArea && (
                <span className="flex items-center gap-1 font-medium text-ink">
                  <Building2 className="w-3.5 h-3.5 text-ink-muted" />
                  Área: {empArea}
                </span>
              )}
              {empEmail && <span className="text-ink-muted">· {empEmail}</span>}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/5 text-xs text-ink-muted">
          <span className="text-[10px] uppercase tracking-wider font-semibold">
            FECHA DE DIAGNÓSTICO
          </span>
          <span className="font-semibold text-ink flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            {createdDate}
          </span>
        </div>
      </div>

      {/* A.2 BLOQUE DE PERFIL COMPUESTO (UNIFICADO) */}
      <div className="bg-white rounded-2xl border border-ink/10 p-6 shadow-sm">
        {/* Fila superior: 2 columnas */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Columna Izquierda */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full uppercase font-bold tracking-wider text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                PERFIL COMPUESTO DE APROPIACIÓN IA · NIVEL {tier.id} DE 6
              </span>
              <span className="inline-block rounded-full font-bold text-[11px] px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                Brecha: {gapLabel}
              </span>
            </div>

            <h1 className="font-poppins font-black leading-tight flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xl sm:text-3xl text-emerald-700">
              <span>{arquetipo}</span>
              <span className="text-ink-muted/30 font-light font-sans">—</span>
              <span className="text-ink font-poppins italic font-semibold">
                {subperfil}
              </span>
            </h1>

            <p className="text-sm text-ink-soft italic font-poppins">
              "{cleanQuote}"
            </p>
          </div>

          {/* Columna Derecha: Tarjeta NIVEL IA */}
          <div className="bg-cream/30 p-4 rounded-xl border border-ink/10 flex flex-col justify-center items-center sm:items-end text-center sm:text-right min-w-[170px] w-full md:w-auto shrink-0">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
              NIVEL IA (PUNTAJE)
            </span>
            <div className="my-1 flex items-baseline gap-1">
              <span className="text-3xl font-poppins font-black text-ink">
                {diagnostic.total_score}
              </span>
              <span className="text-xs text-ink-muted">/60</span>
            </div>
            <span className="text-xs font-semibold text-ink">
              Nivel {tier.id} · {subperfil}
            </span>
          </div>
        </div>

        <hr className="border-t border-ink/10 my-5" />

        {/* DESCRIPCIÓN DEL ARQUETIPO */}
        <div className="text-[14px] text-ink-soft leading-relaxed text-justify space-y-2">
          <p>
            El perfil <strong>{arquetipo}</strong>{" "}
            {ARCHETYPE_DESCRIPTIONS[arquetipo]?.replace(
              /^El perfil [^ ]+ /,
              "",
            ) || ""}
          </p>
        </div>

        <hr className="border-t border-ink/10 my-5" />

        {/* FRASE-VEREDICTO */}
        <div className="border-l-4 border-accent-brand pl-4 py-1 font-poppins text-base sm:text-lg leading-snug">
          {veredictoElement}
        </div>

        {/* ⚠ SPECIAL CASE: flag a_una_evidencia */}
        {diagnostic.a_una_evidencia && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/60 border-2 border-dashed border-emerald-500/70 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Estás a una evidencia de ser Amplificador: lidera un espacio de
              aprendizaje o documenta una métrica de impacto.
            </span>
          </div>
        )}
      </div>

      {/* A.3 RADAR & A.4 FORTALEZAS & A.5 ÁREA DE OPORTUNIDAD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* A.3 Radar */}
        <div className="bg-white rounded-2xl border border-ink/10 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
              Comparativa Radial (Escala 0-10)
            </span>
            <p className="mt-0.5 text-xs text-ink-soft">
              Tu perfil en las 8 dimensiones vs. promedio y top 10%.
            </p>
          </div>
          <div style={{ height: 260 }} className="mt-4">
            <Radar
              data={{
                labels: DIMENSIONS.map((d) =>
                  d === "Datos"
                    ? "Actitud (Datos)"
                    : d === "Liderazgo"
                      ? "Liderazgo/Impacto"
                      : d,
                ),
                datasets: [
                  {
                    label: "Tú",
                    data: userData,
                    backgroundColor: tier.color + "15",
                    borderColor: tier.color,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: tier.color,
                  },
                  {
                    label: "Promedio",
                    data: AVG_LINE,
                    borderColor: "#94a3b8",
                    backgroundColor: "transparent",
                    borderDash: [3, 3],
                    pointRadius: 0,
                    borderWidth: 1.5,
                  },
                  {
                    label: "Top 10%",
                    data: TOP_LINE,
                    borderColor: "#10b981",
                    backgroundColor: "transparent",
                    borderDash: [4, 3],
                    pointRadius: 0,
                    borderWidth: 1.5,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  r: {
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: { display: false, stepSize: 2 },
                    grid: { color: "rgba(0,0,0,0.05)" },
                    angleLines: { color: "rgba(0,0,0,0.05)" },
                    pointLabels: {
                      font: { size: 9, weight: "bold" },
                      color: "#374151",
                    },
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-ink-muted justify-center">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 rounded-full"
                style={{ background: tier.color }}
              />
              Tú
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-400" />
              Promedio
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-500" />
              Top 10%
            </span>
          </div>
        </div>

        {/* Narrative Side: Strengths & Opportunity Area */}
        <div className="flex flex-col gap-4">
          {/* A.4 Tus mayores fortalezas */}
          {strongDims.length > 0 && (
            <div className="bg-white rounded-2xl border border-ink/10 p-5 shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                Tus mayores fortalezas
              </span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {strongDims.map((d) => (
                  <span
                    key={d}
                    className="inline-block rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold text-[11px] px-2.5 py-0.5"
                  >
                    {d === "Datos"
                      ? "Actitud (Datos & Conexión)"
                      : d === "Liderazgo"
                        ? "Liderazgo/Impacto"
                        : d}
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-[12px] text-ink-soft leading-relaxed">
                Destacas especialmente en estos ejes de adopción. Síguelos
                utilizando como palanca para expandir tu apropiación.
              </p>
            </div>
          )}

          {/* A.5 Área de Oportunidad + Tu Único Foco */}
          <div className="bg-white rounded-2xl border border-ink/10 p-5 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                Área de Oportunidad Prioritaria
              </span>

              {allHundred ? (
                <div className="mt-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
                  Sin brecha técnica detectable — tu foco ya no es aprender, es
                  movilizar a otros.
                </div>
              ) : (
                <>
                  <h3 className="font-poppins font-bold text-base mt-2 text-ink flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    {lowestDim === "Datos"
                      ? "Actitud (Datos & Conexión)"
                      : lowestDim === "Liderazgo"
                        ? "Liderazgo/Impacto"
                        : lowestDim}
                  </h3>
                  <div className="mt-2.5 bg-cream/40 rounded-lg p-3 border border-ink/5 flex items-baseline justify-between">
                    <span className="text-[11px] text-ink-soft font-medium">
                      Nivel de desarrollo
                    </span>
                    <span className="text-sm font-bold text-ink">
                      {minPct}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* DEBAJO: Bloque "TU ÚNICO FOCO" */}
            {!allHundred && (
              <div className="mt-4 bg-amber-50/80 border-l-4 border-amber-500 border border-amber-200/70 p-4 rounded-r-xl rounded-l-xs shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    TU ÚNICO FOCO · {lowestDim} ({minPct}%)
                  </span>
                </div>
                <h4 className="font-bold text-ink text-sm mt-1.5 leading-snug">
                  {h1Item.title}
                </h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  <strong>Esta semana:</strong> {h1Item.action}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* A.6 MATRIZ 4x6 */}
      <div className="space-y-2">
        <CompatibilityMatrix
          activeArquetipo={arquetipo}
          activeSubperfil={subperfil}
        />
        {/* Description of gap — ONLY place in report where this appears — plus direction line */}
        <div className="bg-white p-4 rounded-xl border border-ink/10 text-xs space-y-1.5 shadow-2xs">
          <p className="text-ink-soft leading-relaxed">
            <strong>Brecha actual ({gapLabel}):</strong>{" "}
            {GAP_DESCRIPTIONS[gapType]}
          </p>
          <p className="text-emerald-800 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded border border-emerald-200/80 inline-block">
            {GAP_DIRECTIONS[gapType]}
          </p>
        </div>
      </div>

      {/* A.7 TUS 3 MAYORES DIFERENCIAS CON LA COMPAÑÍA */}
      <Top3Tensions
        personalTensions={diagnostic.tensiones}
        companyAverages={companyAverages}
      />
    </div>
  );
}
