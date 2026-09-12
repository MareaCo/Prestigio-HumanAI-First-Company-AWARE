import { useState, useMemo } from "react";
import type { Diagnostic } from "@/types";
import { TENSIONS, normalizeTensions } from "@/data/tensions";
import {
  ActivityTemporalFilter,
  TemporalFilterState,
} from "@/components/dashboard/ActivityTemporalFilter";
import {
  generateWeeksRange,
  getTodayDateStr,
  isDateInRange,
  formatDatePretty,
} from "@/lib/dateUtils";
import {
  Users,
  Award,
  TrendingUp,
  Compass,
  ShieldAlert,
  Sparkles,
  Building2,
  Calendar,
  RotateCcw,
  Search,
  Filter,
} from "lucide-react";

interface Props {
  diagnostics: Diagnostic[];
  companyName?: string;
}

const ARQUETIPOS = [
  "Amplificador",
  "Facilitador",
  "Táctico",
  "Escéptico",
] as const;
const SUBPERFILES = [
  "Aficionado",
  "Explorador",
  "Integrador",
  "Director",
  "Constructor",
  "Orquestador",
] as const;

function isDiagonal(arq: string, sub: string): boolean {
  const arqIdx = ARQUETIPOS.indexOf(arq as (typeof ARQUETIPOS)[number]);
  const subIdx = SUBPERFILES.indexOf(sub as (typeof SUBPERFILES)[number]);
  return (
    (arqIdx === 3 && (subIdx === 0 || subIdx === 1)) ||
    (arqIdx === 2 && subIdx === 2) ||
    (arqIdx === 1 && (subIdx === 3 || subIdx === 4)) ||
    (arqIdx === 0 && subIdx === 5)
  );
}

export function CLevelReport({
  diagnostics,
  companyName = "Organización",
}: Props) {
  const todayStr = getTodayDateStr();
  const weeksList = useMemo(() => generateWeeksRange("2026-07-27"), []);

  // Temporal filter state
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilterState>({
    mode: "all",
    selectedWeek:
      weeksList.find((w) => w.isCurrentWeek)?.weekKey ||
      weeksList[0]?.weekKey ||
      "",
    selectedDay: todayStr,
    startDate: "2026-07-27",
    endDate: todayStr,
    activityCategory: "all",
  });

  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique areas from diagnostics
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    diagnostics.forEach((d) => {
      if (d.employee?.area) {
        areas.add(d.employee.area);
      }
    });
    return Array.from(areas).sort();
  }, [diagnostics]);

  // Filter diagnostics based on temporalFilter, areaFilter, and searchQuery
  const filteredDiagnostics = useMemo(() => {
    const { startDate, endDate, activityCategory } = temporalFilter;

    return diagnostics.filter((d) => {
      // 1. Temporal filter
      const diagDate =
        d.created_at ||
        ((d as Record<string, unknown>).submitted_at as string) ||
        d.employee?.created_at ||
        "2026-07-27T08:30:00.000Z";
      const inDate = isDateInRange(diagDate, startDate, endDate);
      if (!inDate) return false;

      // 2. Activity Category filter
      if (activityCategory === "diagnostico") {
        // Matches evaluation records
      } else if (activityCategory === "matriz") {
        const hasMatriz =
          (d.activities_q?.items && d.activities_q.items.length > 0) ||
          (d.activities_q?.q1 || 0) +
            (d.activities_q?.q2 || 0) +
            (d.activities_q?.q3 || 0) +
            (d.activities_q?.q4 || 0) >
            0;
        if (!hasMatriz) return false;
      } else if (activityCategory === "proyecto") {
        const rawWs = (d as Record<string, unknown>).workspace_data;
        const workspaceData = rawWs as Record<string, unknown> | undefined;
        const hasProjects =
          workspaceData &&
          Array.isArray(workspaceData.projects) &&
          workspaceData.projects.length > 0;
        if (!hasProjects) return false;
      }

      // 3. Area filter
      if (areaFilter !== "all" && d.employee?.area !== areaFilter) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const empName = (d.employee?.name || "").toLowerCase();
        const empArea = (d.employee?.area || "").toLowerCase();
        const arq = (d.arquetipo || d.perfil || "").toLowerCase();
        const sub = (d.subperfil || "").toLowerCase();
        if (
          !empName.includes(q) &&
          !empArea.includes(q) &&
          !arq.includes(q) &&
          !sub.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [diagnostics, temporalFilter, areaFilter, searchQuery]);

  const totalN = filteredDiagnostics.length;
  const grandTotal = diagnostics.length;

  // Compute metrics based on filtered diagnostics
  const stats = useMemo(() => {
    if (totalN === 0) {
      return {
        avgScore: 0,
        gapCounts: {
          convencido_sin_herramientas: 0,
          poder_sin_proposito: 0,
          alineado: 0,
          rezago: 0,
        },
        arqCounts: {
          Amplificador: 0,
          Facilitador: 0,
          Táctico: 0,
          Escéptico: 0,
        },
        champions: [],
        dominantGap: "alineado",
        dominantGapPct: 0,
        maxGapCount: 0,
      };
    }

    let sumScore = 0;
    const gapCounts: Record<string, number> = {
      convencido_sin_herramientas: 0,
      poder_sin_proposito: 0,
      alineado: 0,
      rezago: 0,
    };
    const arqCounts: Record<string, number> = {
      Amplificador: 0,
      Facilitador: 0,
      Táctico: 0,
      Escéptico: 0,
    };
    const champions: { name: string; score: number }[] = [];

    filteredDiagnostics.forEach((d) => {
      sumScore += d.total_score || 0;
      const arq = d.arquetipo || "Táctico";
      const sub = d.subperfil || "Explorador";
      const gap = d.gap || "alineado";

      arqCounts[arq] = (arqCounts[arq] || 0) + 1;
      gapCounts[gap] = (gapCounts[gap] || 0) + 1;

      if (isDiagonal(arq, sub)) {
        const empName =
          d.employee?.name || `Colaborador ${d.employee_id?.slice(0, 4) ?? ""}`;
        champions.push({ name: empName, score: d.total_score });
      }
    });

    const avgScore = Math.round((sumScore / totalN) * 10) / 10;

    // Find dominant gap
    let dominantGap = "alineado";
    let maxGapCount = 0;
    Object.entries(gapCounts).forEach(([g, count]) => {
      if (count > maxGapCount) {
        maxGapCount = count;
        dominantGap = g;
      }
    });

    const dominantGapPct = Math.round((maxGapCount / totalN) * 100);

    return {
      avgScore,
      gapCounts,
      arqCounts,
      champions,
      dominantGap,
      dominantGapPct,
      maxGapCount,
    };
  }, [filteredDiagnostics, totalN]);

  // Tension headline logic (B.2)
  const tensionHeadline = useMemo(() => {
    if (totalN === 0) {
      return "No hay registros en el período temporal seleccionado para evaluar tensiones.";
    }

    const actPlusCount = stats.gapCounts.convencido_sin_herramientas || 0;
    const podSinPropCount = stats.gapCounts.poder_sin_proposito || 0;
    const rezagoCount = stats.gapCounts.rezago || 0;

    if (actPlusCount / totalN > 0.5) {
      return `Tu equipo tiene la actitud, pero le faltan las herramientas: ${actPlusCount} de ${totalN} están en brecha "convencido sin herramientas". El riesgo no es resistencia — es entusiasmo que no aterriza.`;
    }
    if (podSinPropCount / totalN > 0.5) {
      return `Tu equipo sabe operar la herramienta, pero no hacia dónde. El riesgo no es capacidad — es esfuerzo disperso.`;
    }
    if (rezagoCount / totalN > 0.5) {
      return `La adopción todavía no arrancó. El riesgo no es elegir mal la herramienta — es que nadie la esté usando.`;
    }
    return `Tu equipo presenta un nivel equilibrado entre actitud y capacidad técnica para la adopción de IA.`;
  }, [stats, totalN]);

  // Investment recommendation (B.6)
  const investmentRec = useMemo(() => {
    if (totalN === 0) {
      return "Selecciona un rango temporal con colaboradores para ver recomendaciones de inversión.";
    }

    switch (stats.dominantGap) {
      case "convencido_sin_herramientas":
        return "Formación técnica, no motivacional. La actitud ya está instalada; el retorno inmediato está en subir la destreza práctica y proveer herramientas habilitadoras.";
      case "poder_sin_proposito":
        return "Alineación estratégica y definición de casos de uso de negocio. La capacidad técnica existe; el retorno está en orientarla a objetivos prioritarios de valor.";
      case "rezago":
        return "Iniciación guiada y alfabetización básica. El retorno inicial está en eliminar barreras de entrada y crear hábitos de uso simples y recurrentes.";
      case "alineado":
      default:
        return "Escalamiento y co-creación de soluciones avanzadas. El retorno está en empoderar a los referentes internos para multiplicar su impacto en la organización.";
    }
  }, [stats.dominantGap, totalN]);

  // Define Group Tension (B.5)
  const groupTensionAnalysis = useMemo(() => {
    if (!filteredDiagnostics || filteredDiagnostics.length === 0) return null;

    let highestDivergenceTension = TENSIONS[0];
    let maxSpread = -1;
    let hasDissidence = false;
    let tensionAvg = 3;

    TENSIONS.forEach((t) => {
      let sum = 0;
      let leftCount = 0; // <= 2
      let rightCount = 0; // >= 4

      filteredDiagnostics.forEach((d) => {
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
  }, [filteredDiagnostics, totalN]);

  // Arquetipos text for B.3 KPI 2
  const arqDistText = useMemo(() => {
    const parts = [];
    if (stats.arqCounts.Amplificador)
      parts.push(`${stats.arqCounts.Amplificador} Amplificadores`);
    if (stats.arqCounts.Facilitador)
      parts.push(`${stats.arqCounts.Facilitador} Facilitadores`);
    if (stats.arqCounts.Táctico)
      parts.push(`${stats.arqCounts.Táctico} Tácticos`);
    if (stats.arqCounts.Escéptico)
      parts.push(`${stats.arqCounts.Escéptico} Escépticos`);
    return parts.join(" · ") || "Sin datos en el filtro";
  }, [stats.arqCounts]);

  const dominantGapLabelMap: Record<string, string> = {
    convencido_sin_herramientas: "Convencido sin Herramientas (Actitud+)",
    poder_sin_proposito: "Poder sin Propósito (Técnica+)",
    alineado: "Alineación Coherente",
    rezago: "Rezago de Adopción",
  };

  const isFilterActive =
    temporalFilter.mode !== "all" ||
    temporalFilter.activityCategory !== "all" ||
    areaFilter !== "all" ||
    searchQuery.trim() !== "";

  const handleResetFilter = () => {
    setTemporalFilter({
      mode: "all",
      selectedWeek:
        weeksList.find((w) => w.isCurrentWeek)?.weekKey ||
        weeksList[0]?.weekKey ||
        "",
      selectedDay: todayStr,
      startDate: "2026-07-27",
      endDate: todayStr,
      activityCategory: "all",
    });
    setAreaFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* 0. TEMPORAL & CATEGORY FILTER FOR AWAKE */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Filtro Temporal · AWAKE
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Distribución en Matriz 4x6 & Arquetipos
              </span>
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 mt-1">
              <Calendar className="w-5 h-5 text-emerald-700" />
              Filtro Temporal de Apropiación y Ubicación del Equipo
            </h3>
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer filtro
            </button>
          )}
        </div>

        {/* Temporal filter component */}
        <ActivityTemporalFilter
          value={temporalFilter}
          onChange={setTemporalFilter}
          showCategoryFilter={true}
        />

        {/* Area & Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Area Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 shrink-0">
              Área:
            </span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              aria-label="Filtrar por Área"
              className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Todas las Áreas ({grandTotal})</option>
              {availableAreas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar colaborador o perfil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Summary badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">
              Período Activo:
            </span>
            <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {temporalFilter.mode === "all"
                ? "Todo el Histórico (Desde 27 Jul 2026)"
                : temporalFilter.mode === "today"
                  ? `Hoy (${formatDatePretty(todayStr, false)})`
                  : temporalFilter.mode === "this_week"
                    ? `Esta Semana (${temporalFilter.startDate} a ${temporalFilter.endDate})`
                    : `${temporalFilter.startDate} al ${temporalFilter.endDate}`}
            </span>
            {temporalFilter.activityCategory !== "all" && (
              <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                Categoría:{" "}
                {temporalFilter.activityCategory === "matriz"
                  ? "Solo Matriz de Actividades"
                  : temporalFilter.activityCategory === "proyecto"
                    ? "Solo Proyectos IA"
                    : temporalFilter.activityCategory === "diagnostico"
                      ? "Solo Diagnósticos"
                      : temporalFilter.activityCategory}
              </span>
            )}
            {areaFilter !== "all" && (
              <span className="bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                Área: {areaFilter}
              </span>
            )}
            {searchQuery && (
              <span className="bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                Búsqueda: "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-semibold text-[11px] text-slate-600">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              Colaboradores en filtro:{" "}
              <strong className="text-emerald-800 font-bold text-xs">
                {totalN}
              </strong>{" "}
              de {grandTotal}
            </span>
          </div>
        </div>
      </div>

      {/* B.1 ENCABEZADO */}
      <div className="bg-white rounded-2xl border border-ink/10 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-poppins font-black text-ink flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent-brand shrink-0" />
            Mapa de Apropiación IA · {companyName}
          </h1>
          <p className="text-xs text-ink-soft mt-1">
            Análisis consolidado de {totalN} colaborador
            {totalN !== 1 ? "es" : ""} diagnosticado{totalN !== 1 ? "s" : ""} en
            el período activo ({grandTotal} registrados en total).
          </p>
        </div>

        <div className="bg-cream/40 p-4 rounded-xl border border-ink/10 text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
            NIVEL IA PROMEDIO DEL EQUIPO
          </span>
          <div className="my-0.5 flex items-baseline justify-end gap-1">
            <span className="text-3xl font-poppins font-black text-ink">
              {stats.avgScore}
            </span>
            <span className="text-xs text-ink-muted">/60</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {totalN} colaboradores evaluados
          </span>
        </div>
      </div>

      {/* B.2 TITULAR DE TENSIÓN */}
      <div className="bg-white rounded-2xl border border-ink/10 p-6 shadow-sm border-l-4 border-l-accent-brand">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-brand block mb-2">
          Diagnóstico del Riesgo y Estado de la Adopción
        </span>
        <p className="font-poppins text-lg md:text-xl font-bold text-ink leading-relaxed">
          "{tensionHeadline}"
        </p>
      </div>

      {/* B.3 TRES KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: % en brecha dominante */}
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
              Brecha Dominante
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-poppins font-black text-ink">
              {stats.dominantGapPct}%
            </span>
            <span className="text-xs text-ink-muted ml-1.5 font-medium">
              del equipo
            </span>
            <p className="text-xs font-bold text-amber-800 mt-1">
              {dominantGapLabelMap[stats.dominantGap] ?? stats.dominantGap}
            </p>
          </div>
          <span className="text-[11px] text-ink-soft">
            {stats.maxGapCount} de {totalN || 1} personas concentran esta
            brecha.
          </span>
        </div>

        {/* KPI 2: Distribución por arquetipos */}
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
              Distribución por Arquetipo
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <p className="text-base font-poppins font-bold text-ink leading-snug">
              {arqDistText}
            </p>
          </div>
          <span className="text-[11px] text-ink-soft">
            Cálculo dinámico basado en mentalidad y visión.
          </span>
        </div>

        {/* KPI 3: Champions / Coherentes */}
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
              Referentes Internos / Champions
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-poppins font-black text-emerald-700">
              {stats.champions.length}
            </span>
            <span className="text-xs text-ink-muted ml-1.5 font-medium">
              en alineación coherente
            </span>
            {stats.champions.length > 0 && stats.champions.length <= 5 && (
              <p className="text-xs font-semibold text-ink mt-1 truncate">
                {stats.champions.map((c) => c.name).join(", ")}
              </p>
            )}
          </div>
          <span className="text-[11px] text-ink-soft">
            Líderes naturales para jalonar la adopción en pares.
          </span>
        </div>
      </div>

      {/* B.4 MATRIZ 4x6 DEL EQUIPO */}
      <div className="bg-white rounded-2xl border border-ink/10 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-poppins font-bold text-lg text-ink">
              Matriz de Ubicación del Equipo (4x6)
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Distribución de los colaboradores según Arquetipo (SER) vs
              Subperfil (HACER).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Mostrando:
            </span>
            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
              {totalN} de {grandTotal} colaboradores
            </span>
          </div>
        </div>

        {totalN === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3 my-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              No hay colaboradores registrados en el período o filtro
              seleccionado.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Prueba cambiando la semana, ajustando las fechas del filtro o
              haciendo clic en "Restablecer filtro".
            </p>
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ver Todo el Histórico
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[680px] pb-2">
              {/* Header row */}
              <div className="grid grid-cols-7 gap-1.5 text-center font-display text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
                <div className="py-1">Arquetipo \ HACER</div>
                {SUBPERFILES.map((sub) => (
                  <div
                    key={sub}
                    className="py-1 bg-cream/40 rounded border border-ink/5"
                  >
                    {sub}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-1.5">
                {ARQUETIPOS.map((arq) => (
                  <div
                    key={arq}
                    className="grid grid-cols-7 gap-1.5 items-stretch"
                  >
                    {/* Left Label */}
                    <div className="font-display text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center justify-end pr-2 bg-cream/20 rounded p-1">
                      {arq}
                    </div>

                    {/* 6 Columns */}
                    {SUBPERFILES.map((sub) => {
                      const cellMembers = filteredDiagnostics.filter((d) => {
                        const dArq = d.arquetipo || "Táctico";
                        const dSub = d.subperfil || "Explorador";
                        return dArq === arq && dSub === sub;
                      });

                      const isDiag = isDiagonal(arq, sub);
                      const cellBg = isDiag
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                        : "bg-sky-50/50 border-sky-200 text-sky-950";

                      return (
                        <div
                          key={sub}
                          className={`min-h-[76px] p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all ${cellBg}`}
                        >
                          <div className="flex justify-between items-center text-[9px] font-bold opacity-60">
                            <span>{isDiag ? "COHERENTE" : ""}</span>
                            <span>
                              {cellMembers.length > 0
                                ? `${cellMembers.length} p.`
                                : ""}
                            </span>
                          </div>

                          <div className="space-y-1 my-1 max-h-[100px] overflow-y-auto">
                            {cellMembers.map((m) => {
                              const name =
                                m.employee?.name ||
                                `Emp ${m.employee_id?.slice(0, 4) ?? ""}`;
                              return (
                                <div
                                  key={m.id}
                                  className="bg-white/90 border border-ink/10 rounded px-1.5 py-0.5 text-[10px] font-medium text-ink flex justify-between items-center shadow-2xs"
                                  title={`${name} (${m.total_score}/60)`}
                                >
                                  <span className="truncate max-w-[70px]">
                                    {name}
                                  </span>
                                  <span className="font-mono text-[9px] text-ink-muted font-bold shrink-0">
                                    {m.total_score}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business language cluster reading */}
        <div className="mt-4 p-4 rounded-xl bg-cream/30 border border-ink/5 text-xs text-ink-soft leading-relaxed flex items-start gap-2.5">
          <Compass className="w-4 h-4 text-accent-brand shrink-0 mt-0.5" />
          <p>
            <strong>Lectura de Negocio:</strong>{" "}
            {totalN > 0 ? (
              <>
                La mayor concentración del equipo se encuentra en el perfil{" "}
                <strong>
                  {dominantGapLabelMap[stats.dominantGap] ?? stats.dominantGap}
                </strong>
                . Esta distribución señala una oportunidad de habilitación
                práctica focalizada para desbloquear el siguiente nivel de
                productividad organizacional.
              </>
            ) : (
              <>
                No hay colaboradores en el rango actual para emitir una lectura
                de negocio.
              </>
            )}
          </p>
        </div>
      </div>

      {/* B.6 DÓNDE INVERTIR */}
      <div className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl border border-emerald-800 shadow-sm">
        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block mb-1">
          RECOMENDACIÓN ESTRATÉGICA DE INVERSIÓN
        </span>
        <h4 className="font-poppins font-bold text-lg text-white mb-2">
          ¿Dónde poner el foco para maximizar el retorno?
        </h4>
        <p className="text-sm text-emerald-100 leading-relaxed font-medium">
          {investmentRec}
        </p>
      </div>
    </div>
  );
}
