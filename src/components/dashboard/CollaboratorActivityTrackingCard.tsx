import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Sparkles,
  BarChart3,
  FolderPlus,
  Globe,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Download,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import {
  ActivityTemporalFilter,
  TemporalFilterState,
} from "./ActivityTemporalFilter";
import {
  getActivityEventsFn,
  getProjectsFn,
  getCommunitySkillsFn,
} from "@/lib/bigquery.functions";
import {
  isDateInRange,
  getTodayDateStr,
  generateWeeksRange,
  formatDatePretty,
} from "@/lib/dateUtils";
import type { Diagnostic, Employee } from "@/types";
import { PERFIL_CONFIG } from "@/data/constants";

interface Props {
  employees: Employee[];
  diagnostics: Diagnostic[];
  onOpenEmployeeDetail?: (employeeId: string) => void;
  className?: string;
  defaultTimeHorizon?: string;
}

export interface EmployeeTemporalActivitySummary {
  employee: Employee;
  diagnostic: Diagnostic | null;
  // Activity flags in the selected timeframe
  hasDiagnostico: boolean;
  diagnosticoCount: number;
  lastDiagnosticoDate?: string;
  hasMatriz: boolean;
  matrizCount: number;
  lastMatrizDate?: string;
  hasProyecto: boolean;
  proyectoCount: number;
  lastProyectoDate?: string;
  hasComunidad: boolean;
  comunidadCount: number;
  lastComunidadDate?: string;
  totalActivitiesInPeriod: number;
  completedDimensionsCount: number; // 0 to 4
}

interface ActivityEventRecord {
  id?: string;
  employee_id?: string;
  user_name?: string;
  user_email?: string;
  category?: string;
  event_type?: string;
  action?: string;
  description?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export function CollaboratorActivityTrackingCard({
  employees,
  diagnostics,
  onOpenEmployeeDetail,
  className = "",
}: Props) {
  const todayStr = getTodayDateStr();
  const weeksList = useMemo(() => generateWeeksRange("2026-07-27"), []);

  // Temporal filter state
  const [filterState, setFilterState] = useState<TemporalFilterState>({
    mode: "this_week",
    selectedWeek:
      weeksList.find((w) => w.isCurrentWeek)?.weekKey ||
      weeksList[0]?.weekKey ||
      "",
    selectedDay: todayStr,
    startDate: weeksList.find((w) => w.isCurrentWeek)?.startStr || "2026-07-27",
    endDate: weeksList.find((w) => w.isCurrentWeek)?.endStr || todayStr,
    activityCategory: "all",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("__all__");
  const [selectedCompany, setSelectedCompany] = useState<string>("__all__");
  const [activityEvents, setActivityEvents] = useState<ActivityEventRecord[]>(
    [],
  );
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Load activity events
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingEvents(true);
        const events = await getActivityEventsFn({
          data: { fromDate: "2026-07-27T08:00:00" },
        });
        if (isMounted && Array.isArray(events)) {
          setActivityEvents(events);
        }
      } catch (err) {
        console.error("Error loading activity events for tracking:", err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute activities per employee in the selected temporal range
  const employeeSummaries: EmployeeTemporalActivitySummary[] = useMemo(() => {
    const { startDate, endDate } = filterState;

    return employees.map((emp) => {
      const diag = diagnostics.find((d) => d.employee_id === emp.id) || null;

      // Filter events for this employee within the date range
      const empEvents = activityEvents.filter((ev) => {
        const matchesEmp =
          ev.employee_id === emp.id ||
          (ev.user_email &&
            emp.email &&
            ev.user_email.toLowerCase() === emp.email.toLowerCase()) ||
          (ev.user_name &&
            emp.name &&
            ev.user_name.toLowerCase() === emp.name.toLowerCase());
        if (!matchesEmp) return false;
        return isDateInRange(ev.created_at, startDate, endDate);
      });

      // 1. Diagnóstico de Apropiación
      const diagEvents = empEvents.filter(
        (ev) => ev.category === "diagnostico",
      );
      let hasDiag = diagEvents.length > 0;
      let lastDiagDate = diagEvents[0]?.created_at;

      // Check if diagnostic itself was created/completed in date range
      if (
        diag &&
        diag.created_at &&
        isDateInRange(diag.created_at, startDate, endDate)
      ) {
        hasDiag = true;
        if (!lastDiagDate) lastDiagDate = diag.created_at;
      }

      // 2. Actividad en Matriz
      const matrizEvents = empEvents.filter((ev) => ev.category === "matriz");
      const hasMatriz = matrizEvents.length > 0;
      const lastMatrizDate = matrizEvents[0]?.created_at;

      // 3. Proyectos IA
      const proyectoEvents = empEvents.filter(
        (ev) => ev.category === "proyecto",
      );
      const hasProyecto = proyectoEvents.length > 0;
      const lastProyectoDate = proyectoEvents[0]?.created_at;

      // 4. Actividad en Comunidad (comunidad or prompt_mia)
      const comunidadEvents = empEvents.filter(
        (ev) => ev.category === "comunidad" || ev.category === "prompt_mia",
      );
      const hasComunidad = comunidadEvents.length > 0;
      const lastComunidadDate = comunidadEvents[0]?.created_at;

      const completedCount =
        (hasDiag ? 1 : 0) +
        (hasMatriz ? 1 : 0) +
        (hasProyecto ? 1 : 0) +
        (hasComunidad ? 1 : 0);

      const totalActivities =
        (hasDiag ? Math.max(1, diagEvents.length) : 0) +
        matrizEvents.length +
        proyectoEvents.length +
        comunidadEvents.length;

      return {
        employee: emp,
        diagnostic: diag,
        hasDiagnostico: hasDiag,
        diagnosticoCount: diagEvents.length || (hasDiag ? 1 : 0),
        lastDiagnosticoDate: lastDiagDate,
        hasMatriz,
        matrizCount: matrizEvents.length,
        lastMatrizDate,
        hasProyecto,
        proyectoCount: proyectoEvents.length,
        lastProyectoDate,
        hasComunidad,
        comunidadCount: comunidadEvents.length,
        lastComunidadDate,
        totalActivitiesInPeriod: totalActivities,
        completedDimensionsCount: completedCount,
      };
    });
  }, [employees, diagnostics, activityEvents, filterState]);

  // Aggregate Metrics for the Selected Timeframe
  const metrics = useMemo(() => {
    const total = employeeSummaries.length;
    const withAnyActivity = employeeSummaries.filter(
      (s) => s.totalActivitiesInPeriod > 0,
    ).length;
    const withDiag = employeeSummaries.filter((s) => s.hasDiagnostico).length;
    const withMatriz = employeeSummaries.filter((s) => s.hasMatriz).length;
    const withProyecto = employeeSummaries.filter((s) => s.hasProyecto).length;
    const withComunidad = employeeSummaries.filter(
      (s) => s.hasComunidad,
    ).length;
    const withAllFour = employeeSummaries.filter(
      (s) => s.completedDimensionsCount === 4,
    ).length;

    return {
      total,
      withAnyActivity,
      withDiag,
      withMatriz,
      withProyecto,
      withComunidad,
      withAllFour,
    };
  }, [employeeSummaries]);

  // Filter list by search query, company, area, and activity category
  const filteredSummaries = useMemo(() => {
    return employeeSummaries.filter((item) => {
      const { employee } = item;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mName = employee.name.toLowerCase().includes(q);
        const mEmail = (employee.email || "").toLowerCase().includes(q);
        const mCedula = (employee.cedula || "").toLowerCase().includes(q);
        const mArea = (employee.area || "").toLowerCase().includes(q);
        const mCompany = (employee.empresa || "").toLowerCase().includes(q);
        if (!mName && !mEmail && !mCedula && !mArea && !mCompany) return false;
      }

      // Company filter
      if (selectedCompany !== "__all__") {
        if (employee.empresa !== selectedCompany) return false;
      }

      // Area filter
      if (selectedArea !== "__all__") {
        if (employee.area !== selectedArea) return false;
      }

      // Activity Category filter
      if (
        filterState.activityCategory === "diagnostico" &&
        !item.hasDiagnostico
      )
        return false;
      if (filterState.activityCategory === "matriz" && !item.hasMatriz)
        return false;
      if (filterState.activityCategory === "proyecto" && !item.hasProyecto)
        return false;
      if (filterState.activityCategory === "comunidad" && !item.hasComunidad)
        return false;
      if (
        filterState.activityCategory === "all_four" &&
        item.completedDimensionsCount < 4
      )
        return false;
      if (
        filterState.activityCategory === "no_activity" &&
        item.totalActivitiesInPeriod > 0
      )
        return false;

      return true;
    });
  }, [
    employeeSummaries,
    searchQuery,
    selectedCompany,
    selectedArea,
    filterState.activityCategory,
  ]);

  // Unique companies and areas for dropdowns
  const companyOptions = useMemo(() => {
    return Array.from(
      new Set(employees.map((e) => e.empresa).filter(Boolean) as string[]),
    ).sort();
  }, [employees]);

  const areaOptions = useMemo(() => {
    return Array.from(
      new Set(employees.map((e) => e.area).filter(Boolean) as string[]),
    ).sort();
  }, [employees]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      "Colaborador",
      "Email",
      "Cédula",
      "Empresa",
      "Área",
      "Perfil Apropiación",
      "Score",
      "Perfil Realizado en Periodo",
      "Fecha Perfil",
      "Actividad en Matriz",
      "Eventos Matriz",
      "Proyectos IA",
      "Eventos Proyectos",
      "Actividad en Comunidad",
      "Eventos Comunidad",
      "Total Actividades",
    ];

    const csvRows = filteredSummaries.map((s) => [
      `"${s.employee.name}"`,
      `"${s.employee.email || ""}"`,
      `"${s.employee.cedula || ""}"`,
      `"${s.employee.empresa || ""}"`,
      `"${s.employee.area || ""}"`,
      `"${s.diagnostic?.perfil || "Sin diagnóstico"}"`,
      s.diagnostic?.total_score ?? "",
      s.hasDiagnostico ? "SÍ" : "NO",
      `"${s.lastDiagnosticoDate ? formatDatePretty(s.lastDiagnosticoDate, false) : ""}"`,
      s.hasMatriz ? "SÍ" : "NO",
      s.matrizCount,
      s.hasProyecto ? "SÍ" : "NO",
      s.proyectoCount,
      s.hasComunidad ? "SÍ" : "NO",
      s.comunidadCount,
      s.totalActivitiesInPeriod,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Seguimiento_Actividades_${filterState.startDate}_al_${filterState.endDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      className={`bg-white rounded-2xl border border-ink/10 p-5 sm:p-6 shadow-xs space-y-5 ${className}`}
    >
      {/* Title & Quick description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Observabilidad Temporal
            </span>
            <span className="text-xs text-ink-muted">
              HumanAI First Company®
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-ink mt-1">
            Seguimiento de Apropiación y Actividad por Días o Semanas
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Identifica quiénes han completado su diagnóstico, trabajado en la
            matriz, avanzado en proyectos e interactuado en la comunidad en el
            período seleccionado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink bg-cream/70 hover:bg-cream border border-ink/15 rounded-lg transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
          title="Descargar reporte en CSV con los filtros aplicados"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Exportar reporte (.csv)</span>
        </button>
      </div>

      {/* Interactive Temporal & Activity Filter */}
      <ActivityTemporalFilter
        value={filterState}
        onChange={setFilterState}
        showCategoryFilter={true}
      />

      {/* KPI Cards: 4 Core Dimensions in the Selected Window */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Metric 1: Perfil de Apropiación */}
        <div
          onClick={() =>
            setFilterState((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "diagnostico" ? "all" : "diagnostico",
            }))
          }
          className={`rounded-xl p-3.5 border transition-all cursor-pointer ${
            filterState.activityCategory === "diagnostico"
              ? "bg-purple-900 text-white border-purple-950 shadow-xs"
              : "bg-purple-50/70 border-purple-200/80 hover:bg-purple-100/70 text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                filterState.activityCategory === "diagnostico"
                  ? "text-purple-200"
                  : "text-purple-900"
              }`}
            >
              1. Perfil Apropiación
            </span>
            <Sparkles
              className={`w-4 h-4 ${
                filterState.activityCategory === "diagnostico"
                  ? "text-purple-200"
                  : "text-purple-700"
              }`}
            />
          </div>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1.5 leading-none">
            {metrics.withDiag}
            <span
              className={`text-xs font-normal ml-1 ${
                filterState.activityCategory === "diagnostico"
                  ? "text-purple-200"
                  : "text-ink-muted"
              }`}
            >
              / {metrics.total}
            </span>
          </p>
          <p
            className={`text-[11px] mt-1 truncate ${
              filterState.activityCategory === "diagnostico"
                ? "text-purple-200"
                : "text-purple-900 font-medium"
            }`}
          >
            {metrics.total > 0
              ? `${Math.round((metrics.withDiag / metrics.total) * 100)}% evaluados`
              : "0%"}
          </p>
        </div>

        {/* Metric 2: Actividad en Matriz */}
        <div
          onClick={() =>
            setFilterState((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "matriz" ? "all" : "matriz",
            }))
          }
          className={`rounded-xl p-3.5 border transition-all cursor-pointer ${
            filterState.activityCategory === "matriz"
              ? "bg-blue-900 text-white border-blue-950 shadow-xs"
              : "bg-blue-50/70 border-blue-200/80 hover:bg-blue-100/70 text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                filterState.activityCategory === "matriz"
                  ? "text-blue-200"
                  : "text-blue-900"
              }`}
            >
              2. Matriz de Tareas
            </span>
            <BarChart3
              className={`w-4 h-4 ${
                filterState.activityCategory === "matriz"
                  ? "text-blue-200"
                  : "text-blue-700"
              }`}
            />
          </div>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1.5 leading-none">
            {metrics.withMatriz}
            <span
              className={`text-xs font-normal ml-1 ${
                filterState.activityCategory === "matriz"
                  ? "text-blue-200"
                  : "text-ink-muted"
              }`}
            >
              / {metrics.total}
            </span>
          </p>
          <p
            className={`text-[11px] mt-1 truncate ${
              filterState.activityCategory === "matriz"
                ? "text-blue-200"
                : "text-blue-900 font-medium"
            }`}
          >
            {metrics.total > 0
              ? `${Math.round((metrics.withMatriz / metrics.total) * 100)}% en matriz`
              : "0%"}
          </p>
        </div>

        {/* Metric 3: Proyectos IA */}
        <div
          onClick={() =>
            setFilterState((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "proyecto" ? "all" : "proyecto",
            }))
          }
          className={`rounded-xl p-3.5 border transition-all cursor-pointer ${
            filterState.activityCategory === "proyecto"
              ? "bg-emerald-900 text-white border-emerald-950 shadow-xs"
              : "bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/70 text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                filterState.activityCategory === "proyecto"
                  ? "text-emerald-200"
                  : "text-emerald-900"
              }`}
            >
              3. Proyectos IA
            </span>
            <FolderPlus
              className={`w-4 h-4 ${
                filterState.activityCategory === "proyecto"
                  ? "text-emerald-200"
                  : "text-emerald-700"
              }`}
            />
          </div>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1.5 leading-none">
            {metrics.withProyecto}
            <span
              className={`text-xs font-normal ml-1 ${
                filterState.activityCategory === "proyecto"
                  ? "text-emerald-200"
                  : "text-ink-muted"
              }`}
            >
              / {metrics.total}
            </span>
          </p>
          <p
            className={`text-[11px] mt-1 truncate ${
              filterState.activityCategory === "proyecto"
                ? "text-emerald-200"
                : "text-emerald-900 font-medium"
            }`}
          >
            {metrics.total > 0
              ? `${Math.round((metrics.withProyecto / metrics.total) * 100)}% activos`
              : "0%"}
          </p>
        </div>

        {/* Metric 4: Comunidad HumanAI */}
        <div
          onClick={() =>
            setFilterState((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "comunidad" ? "all" : "comunidad",
            }))
          }
          className={`rounded-xl p-3.5 border transition-all cursor-pointer ${
            filterState.activityCategory === "comunidad"
              ? "bg-amber-900 text-white border-amber-950 shadow-xs"
              : "bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/70 text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                filterState.activityCategory === "comunidad"
                  ? "text-amber-200"
                  : "text-amber-900"
              }`}
            >
              4. Comunidad & MIA
            </span>
            <Globe
              className={`w-4 h-4 ${
                filterState.activityCategory === "comunidad"
                  ? "text-amber-200"
                  : "text-amber-700"
              }`}
            />
          </div>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1.5 leading-none">
            {metrics.withComunidad}
            <span
              className={`text-xs font-normal ml-1 ${
                filterState.activityCategory === "comunidad"
                  ? "text-amber-200"
                  : "text-ink-muted"
              }`}
            >
              / {metrics.total}
            </span>
          </p>
          <p
            className={`text-[11px] mt-1 truncate ${
              filterState.activityCategory === "comunidad"
                ? "text-amber-200"
                : "text-amber-900 font-medium"
            }`}
          >
            {metrics.total > 0
              ? `${Math.round((metrics.withComunidad / metrics.total) * 100)}% interacción`
              : "0%"}
          </p>
        </div>

        {/* Metric 5: Total Engagement */}
        <div
          onClick={() =>
            setFilterState((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "all_four" ? "all" : "all_four",
            }))
          }
          className={`rounded-xl p-3.5 border transition-all cursor-pointer col-span-2 sm:col-span-4 lg:col-span-1 ${
            filterState.activityCategory === "all_four"
              ? "bg-teal-900 text-white border-teal-950 shadow-xs"
              : "bg-teal-50/70 border-teal-200/80 hover:bg-teal-100/70 text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                filterState.activityCategory === "all_four"
                  ? "text-teal-200"
                  : "text-teal-950"
              }`}
            >
              4 Actividades
            </span>
            <CheckCircle2
              className={`w-4 h-4 ${
                filterState.activityCategory === "all_four"
                  ? "text-teal-200"
                  : "text-teal-700"
              }`}
            />
          </div>
          <p className="text-xl sm:text-2xl font-display font-bold mt-1.5 leading-none">
            {metrics.withAllFour}
            <span
              className={`text-xs font-normal ml-1 ${
                filterState.activityCategory === "all_four"
                  ? "text-teal-200"
                  : "text-ink-muted"
              }`}
            >
              / {metrics.total}
            </span>
          </p>
          <p
            className={`text-[11px] mt-1 truncate ${
              filterState.activityCategory === "all_four"
                ? "text-teal-200"
                : "text-teal-950 font-medium"
            }`}
          >
            Adopción completa
          </p>
        </div>
      </div>

      {/* Filter Row: Search & Company / Area */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por colaborador, email o cédula..."
            className="w-full bg-cream/40 border border-ink/15 rounded-lg pl-9 pr-4 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
          />
        </div>

        {/* Company select */}
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full sm:w-48 bg-cream/40 border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium cursor-pointer"
        >
          <option value="__all__">Todas las empresas</option>
          {companyOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Area select */}
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full sm:w-48 bg-cream/40 border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium cursor-pointer"
        >
          <option value="__all__">Todas las áreas</option>
          {areaOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Breakdown Table: Collaborator Activity Details */}
      <div className="border border-ink/10 rounded-xl overflow-hidden">
        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-cream/70 sticky top-0 border-b border-ink/10 text-[10.5px] uppercase tracking-wider text-ink-muted font-semibold z-10">
              <tr>
                <th className="py-2.5 px-3 text-left">Colaborador</th>
                <th className="py-2.5 px-2 text-left">Empresa & Área</th>
                <th className="py-2.5 px-2 text-center text-purple-950">
                  🎯 1. Apropiación
                </th>
                <th className="py-2.5 px-2 text-center text-blue-950">
                  📊 2. Matriz
                </th>
                <th className="py-2.5 px-2 text-center text-emerald-950">
                  🚀 3. Proyectos
                </th>
                <th className="py-2.5 px-2 text-center text-amber-950">
                  🌐 4. Comunidad
                </th>
                <th className="py-2.5 px-2 text-center">Nivel Adopción</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-ink-muted text-xs"
                  >
                    No se encontraron colaboradores con actividad en el período
                    seleccionado.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item) => {
                  const { employee, diagnostic } = item;
                  const cfg = diagnostic
                    ? PERFIL_CONFIG[diagnostic.perfil]
                    : null;

                  return (
                    <tr
                      key={employee.id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-ink leading-tight">
                          {employee.name}
                        </div>
                        <div className="text-[11px] text-ink-muted leading-tight mt-0.5">
                          {employee.email || employee.cedula || "—"}
                        </div>
                      </td>

                      {/* Empresa & Area */}
                      <td className="py-2.5 px-2 text-ink-soft text-[11.5px]">
                        <div
                          className="font-medium truncate max-w-[130px]"
                          title={employee.empresa || "—"}
                        >
                          {employee.empresa || "—"}
                        </div>
                        <div
                          className="text-[10.5px] text-ink-muted truncate max-w-[130px]"
                          title={employee.area || "—"}
                        >
                          {employee.area || "—"}
                        </div>
                      </td>

                      {/* Dimension 1: Perfil de Apropiación */}
                      <td className="py-2.5 px-2 text-center">
                        {item.hasDiagnostico ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-purple-700" />
                              <span>{diagnostic?.perfil || "Evaluado"}</span>
                            </span>
                            {item.lastDiagnosticoDate && (
                              <span className="text-[9.5px] text-purple-700/80 mt-0.5">
                                {formatDatePretty(
                                  item.lastDiagnosticoDate,
                                  false,
                                )}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Dimension 2: Matriz de Tareas */}
                      <td className="py-2.5 px-2 text-center">
                        {item.hasMatriz ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-blue-700" />
                              <span>Activo ({item.matrizCount})</span>
                            </span>
                            {item.lastMatrizDate && (
                              <span className="text-[9.5px] text-blue-700/80 mt-0.5">
                                {formatDatePretty(item.lastMatrizDate, false)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Dimension 3: Proyectos IA */}
                      <td className="py-2.5 px-2 text-center">
                        {item.hasProyecto ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>{item.proyectoCount} Proy</span>
                            </span>
                            {item.lastProyectoDate && (
                              <span className="text-[9.5px] text-emerald-700/80 mt-0.5">
                                {formatDatePretty(item.lastProyectoDate, false)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Dimension 4: Actividad en Comunidad */}
                      <td className="py-2.5 px-2 text-center">
                        {item.hasComunidad ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-amber-700" />
                              <span>{item.comunidadCount} Interac</span>
                            </span>
                            {item.lastComunidadDate && (
                              <span className="text-[9.5px] text-amber-700/80 mt-0.5">
                                {formatDatePretty(
                                  item.lastComunidadDate,
                                  false,
                                )}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Completion Progress Bar */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-2 rounded-full bg-cream border border-ink/10 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                item.completedDimensionsCount === 4
                                  ? "bg-teal-600"
                                  : item.completedDimensionsCount >= 2
                                    ? "bg-amber-500"
                                    : item.completedDimensionsCount === 1
                                      ? "bg-blue-500"
                                      : "bg-transparent"
                              }`}
                              style={{
                                width: `${(item.completedDimensionsCount / 4) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-ink">
                            {item.completedDimensionsCount}/4
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        {onOpenEmployeeDetail && (
                          <button
                            type="button"
                            onClick={() => onOpenEmployeeDetail(employee.id)}
                            className="text-xs font-semibold text-ink hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Detalle</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
