import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  Users,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Zap,
  Target,
  FolderCheck,
  Layers,
  Megaphone,
  ShieldCheck,
  Cpu,
  DollarSign,
  Workflow,
  Share2,
  Flame,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import {
  WorkspaceProject,
  WorkspaceSkill,
  WorkspacePrompt,
  WorkspaceResource,
  Employee,
} from "@/types";

export interface TeamActivityOverviewCardProps {
  projects?: WorkspaceProject[];
  skills?: WorkspaceSkill[];
  prompts?: WorkspacePrompt[];
  resources?: WorkspaceResource[];
  employees?: Employee[];
  onSelectDepartment?: (department: string) => void;
  selectedDepartmentFilter?: string;
}

type TimeHorizon = "30d" | "quarter" | "year";
type ViewMode = "chart" | "grid" | "matrix";

interface DepartmentActivityData {
  department: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  updatesCount: number;
  updateFrequency: string; // e.g. "4.8 / sem"
  completedActivities: number;
  totalActivities: number;
  completionRate: number;
  activeContributors: number;
  trend: string;
  recentMilestone: string;
  recentMilestoneTime: string;
  weeklyTrend: number[]; // 4 weeks activity points
}

const DEPARTMENT_CONFIGS: Array<{
  name: string;
  alias: string[];
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultUpdates: Record<TimeHorizon, number>;
  defaultCompleted: Record<TimeHorizon, number>;
  defaultTotal: Record<TimeHorizon, number>;
  defaultContributors: number;
  defaultMilestone: string;
}> = [
  {
    name: "Tecnología & BI",
    alias: ["Tecnología", "IT", "Sistemas", "Tecnologia", "BI"],
    icon: Cpu,
    color: "#0284C7", // Sky Blue
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    defaultUpdates: { "30d": 38, quarter: 94, year: 280 },
    defaultCompleted: { "30d": 14, quarter: 32, year: 88 },
    defaultTotal: { "30d": 16, quarter: 36, year: 95 },
    defaultContributors: 9,
    defaultMilestone: "Agente IA de consultas SQL en BigQuery desplegado",
  },
  {
    name: "Ventas & Comercial",
    alias: ["Ventas", "Comercial"],
    icon: TrendingUp,
    color: "#D97706", // Amber
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    defaultUpdates: { "30d": 29, quarter: 76, year: 215 },
    defaultCompleted: { "30d": 11, quarter: 26, year: 68 },
    defaultTotal: { "30d": 13, quarter: 30, year: 78 },
    defaultContributors: 7,
    defaultMilestone: "Automatización de prospección B2B y transcripción CRM",
  },
  {
    name: "Operaciones & Logística",
    alias: ["Operaciones", "Logística", "Logistica"],
    icon: Workflow,
    color: "#0D7A5F", // Emerald/Teal
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    defaultUpdates: { "30d": 34, quarter: 88, year: 250 },
    defaultCompleted: { "30d": 13, quarter: 31, year: 82 },
    defaultTotal: { "30d": 15, quarter: 35, year: 90 },
    defaultContributors: 8,
    defaultMilestone: "Optimización de rutas y matriz de inventario predictivo",
  },
  {
    name: "Marketing & Comunicaciones",
    alias: ["Marketing", "Comunicaciones"],
    icon: Megaphone,
    color: "#8B5CF6", // Purple
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    defaultUpdates: { "30d": 24, quarter: 62, year: 175 },
    defaultCompleted: { "30d": 9, quarter: 21, year: 54 },
    defaultTotal: { "30d": 11, quarter: 25, year: 62 },
    defaultContributors: 5,
    defaultMilestone: "Generador de copys multicanal con Prompt de Marca",
  },
  {
    name: "Finanzas & Legal",
    alias: ["Finanzas", "Legal", "Contabilidad"],
    icon: DollarSign,
    color: "#059669", // Emerald
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    defaultUpdates: { "30d": 19, quarter: 51, year: 140 },
    defaultCompleted: { "30d": 8, quarter: 19, year: 48 },
    defaultTotal: { "30d": 9, quarter: 22, year: 55 },
    defaultContributors: 4,
    defaultMilestone:
      "Conciliación automática de facturas e informes de auditoría",
  },
  {
    name: "Talento Humano & RRHH",
    alias: ["RRHH", "Talento Humano", "Gestion Humana", "Gestión Humana"],
    icon: Users,
    color: "#EC4899", // Pink
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    defaultUpdates: { "30d": 22, quarter: 58, year: 160 },
    defaultCompleted: { "30d": 9, quarter: 22, year: 58 },
    defaultTotal: { "30d": 10, quarter: 24, year: 64 },
    defaultContributors: 6,
    defaultMilestone: "Onboarding interactivo AWARE para nuevos colaboradores",
  },
  {
    name: "Innovación & Estrategia",
    alias: ["Otra", "Estrategia", "Innovación", "Innovacion", "Dirección"],
    icon: Sparkles,
    color: "#B5731B", // Gold/Bronze
    bgColor: "bg-amber-50/60",
    borderColor: "border-amber-300/60",
    defaultUpdates: { "30d": 31, quarter: 82, year: 230 },
    defaultCompleted: { "30d": 12, quarter: 29, year: 76 },
    defaultTotal: { "30d": 14, quarter: 32, year: 82 },
    defaultContributors: 6,
    defaultMilestone: "Banco de Skills y Prompts para la Comunidad HumanAI",
  },
];

export function TeamActivityOverviewCard({
  projects = [],
  skills = [],
  prompts = [],
  resources = [],
  employees = [],
  onSelectDepartment,
  selectedDepartmentFilter,
}: TeamActivityOverviewCardProps) {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("quarter");
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(
    selectedDepartmentFilter || null,
  );

  // Compute departmental activity metrics dynamically combined with live data
  const deptDataList: DepartmentActivityData[] = useMemo(() => {
    return DEPARTMENT_CONFIGS.map((cfg) => {
      // Find projects belonging to this area
      const areaProjects = projects.filter((p) => {
        const area = (p.authorArea || p.dimension || "").toLowerCase();
        return cfg.alias.some((a) => area.includes(a.toLowerCase()));
      });

      const areaSkills = skills.filter((s) => {
        const area = (s.authorArea || "").toLowerCase();
        return cfg.alias.some((a) => area.includes(a.toLowerCase()));
      });

      const areaPrompts = prompts.filter((pr) => {
        const area = (pr.authorArea || "").toLowerCase();
        return cfg.alias.some((a) => area.includes(a.toLowerCase()));
      });

      const liveCompletedProjects = areaProjects.filter(
        (p) => p.status === "completado",
      ).length;
      const liveTotalProjects = areaProjects.length;
      const liveUpdatesCount =
        areaProjects.length * 3 +
        areaSkills.length * 2 +
        areaPrompts.length * 2;

      // Combine default baseline with live dataset
      const totalUpdates =
        cfg.defaultUpdates[timeHorizon] +
        (liveUpdatesCount > 0 ? liveUpdatesCount * 2 : 0);
      const totalCompleted =
        cfg.defaultCompleted[timeHorizon] + liveCompletedProjects;
      const totalActivities =
        cfg.defaultTotal[timeHorizon] +
        (liveTotalProjects > 0 ? liveTotalProjects : 2);

      const completionRate = Math.min(
        100,
        Math.round((totalCompleted / Math.max(1, totalActivities)) * 100),
      );

      // Estimate weekly cadence based on horizon
      const weeksCount =
        timeHorizon === "30d" ? 4 : timeHorizon === "quarter" ? 12 : 52;
      const weeklyFrequency = (totalUpdates / weeksCount).toFixed(1);

      // Dynamic 4-week trend simulation based on real updates
      const baseVal = Math.round(totalUpdates / 4);
      const weeklyTrend = [
        Math.max(2, baseVal - 3),
        Math.max(3, baseVal - 1),
        Math.max(4, baseVal + 2),
        Math.max(5, baseVal + 5),
      ];

      const latestProject = areaProjects.find((p) => p.title);
      const recentMilestone = latestProject?.title || cfg.defaultMilestone;

      return {
        department: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        bgColor: cfg.bgColor,
        borderColor: cfg.borderColor,
        updatesCount: totalUpdates,
        updateFrequency: `${weeklyFrequency}/sem`,
        completedActivities: totalCompleted,
        totalActivities,
        completionRate,
        activeContributors:
          cfg.defaultContributors + (areaProjects.length > 0 ? 1 : 0),
        trend: `+${Math.round(12 + Math.random() * 15)}%`,
        recentMilestone,
        recentMilestoneTime: "hace 2d",
        weeklyTrend,
      };
    });
  }, [projects, skills, prompts, timeHorizon]);

  // High level aggregated statistics
  const aggregateMetrics = useMemo(() => {
    const totalUpdates = deptDataList.reduce(
      (acc, d) => acc + d.updatesCount,
      0,
    );
    const totalCompleted = deptDataList.reduce(
      (acc, d) => acc + d.completedActivities,
      0,
    );
    const totalActivities = deptDataList.reduce(
      (acc, d) => acc + d.totalActivities,
      0,
    );
    const avgCompletionRate = Math.round(
      (totalCompleted / Math.max(1, totalActivities)) * 100,
    );

    // Find top active department
    const topDept = [...deptDataList].sort(
      (a, b) => b.updatesCount - a.updatesCount,
    )[0];
    const totalContributors = deptDataList.reduce(
      (acc, d) => acc + d.activeContributors,
      0,
    );

    return {
      totalUpdates,
      totalCompleted,
      totalActivities,
      avgCompletionRate,
      topDeptName: topDept?.department || "Tecnología & BI",
      topDeptUpdates: topDept?.updatesCount || 0,
      totalContributors,
    };
  }, [deptDataList]);

  // Chart data formatting for Recharts
  const chartData = useMemo(() => {
    return deptDataList.map((d) => ({
      name: d.department.split("&")[0].trim(), // Short label for X-axis
      fullName: d.department,
      "Actualizaciones de Proyectos": d.updatesCount,
      "Actividades Completadas": d.completedActivities,
      "Tasa de Completitud (%)": d.completionRate,
      color: d.color,
    }));
  }, [deptDataList]);

  const handleDeptClick = (deptName: string) => {
    const nextDept = selectedDept === deptName ? null : deptName;
    setSelectedDept(nextDept);
    if (onSelectDepartment) {
      onSelectDepartment(nextDept || "");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden mb-6 transition-all hover:border-amber-400/40"
    >
      {/* CARD HEADER & BAR */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-white to-slate-50 border-b border-ink/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Badge */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#2C3328] text-amber-400 shadow-xs flex-shrink-0 mt-0.5">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                  Panorama de Actividad del Equipo
                </h3>
                <span className="text-[10px] bg-[#B5731B]/10 text-[#B5731B] border border-[#B5731B]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Monitor Inter-Departamental
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5 max-w-2xl">
                Frecuencia de actualizaciones de proyectos, avance de hitos y
                completitud de actividades en cada departamento de la
                organización.
              </p>
            </div>
          </div>

          {/* Controls: Horizon & View Mode & Expand Toggle */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Time Horizon Selector */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-ink/10 shadow-2xs text-xs">
              <button
                onClick={() => setTimeHorizon("30d")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  timeHorizon === "30d"
                    ? "bg-[#2C3328] text-white shadow-2xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Últimos 30d
              </button>
              <button
                onClick={() => setTimeHorizon("quarter")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  timeHorizon === "quarter"
                    ? "bg-[#2C3328] text-white shadow-2xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Trimestre (Q3)
              </button>
              <button
                onClick={() => setTimeHorizon("year")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  timeHorizon === "year"
                    ? "bg-[#2C3328] text-white shadow-2xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Año 2026
              </button>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-ink/10 shadow-2xs text-xs">
              <button
                onClick={() => setViewMode("chart")}
                title="Vista Gráfico de Barras"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "chart"
                    ? "bg-amber-100 text-[#B5731B] font-bold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Vista Tarjetas por Área"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-amber-100 text-[#B5731B] font-bold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                title="Vista Matriz de Frecuencia"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "matrix"
                    ? "bg-amber-100 text-[#B5731B] font-bold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collapse/Expand Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 bg-white border border-ink/10 rounded-lg text-ink-muted hover:text-ink hover:bg-slate-50 transition-all"
              title={isExpanded ? "Ocultar detalles" : "Expandir detalles"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* HIGH LEVEL KPI SUMMARY ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-ink/5">
          {/* KPI 1: Total Updates */}
          <div className="bg-white/90 p-2.5 rounded-xl border border-ink/5 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              Actualizaciones
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-xl text-ink">
                {aggregateMetrics.totalUpdates}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ↗ +18%
              </span>
            </div>
            <p className="text-[9.5px] text-ink-muted truncate">
              Publicaciones e hitos reportados
            </p>
          </div>

          {/* KPI 2: Completed Activities */}
          <div className="bg-white/90 p-2.5 rounded-xl border border-ink/5 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Actividades Listas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-xl text-emerald-800">
                {aggregateMetrics.totalCompleted}
              </span>
              <span className="text-[10px] text-ink-muted font-medium">
                de {aggregateMetrics.totalActivities}
              </span>
            </div>
            <p className="text-[9.5px] text-emerald-700 font-semibold truncate">
              {aggregateMetrics.avgCompletionRate}% tasa de completitud
            </p>
          </div>

          {/* KPI 3: Top Department */}
          <div className="bg-white/90 p-2.5 rounded-xl border border-ink/5 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-600" />
              Área Más Activa
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-sm text-ink truncate">
                {aggregateMetrics.topDeptName}
              </span>
            </div>
            <p className="text-[9.5px] text-amber-700 font-semibold truncate">
              {aggregateMetrics.topDeptUpdates} actualizaciones regist.
            </p>
          </div>

          {/* KPI 4: Active Team Members */}
          <div className="bg-white/90 p-2.5 rounded-xl border border-ink/5 space-y-0.5">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-600" />
              Colaboradores
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-xl text-ink">
                {aggregateMetrics.totalContributors}
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                100% Red
              </span>
            </div>
            <p className="text-[9.5px] text-ink-muted truncate">
              Contribuyendo activamente
            </p>
          </div>
        </div>
      </div>

      {/* EXPANDABLE BODY */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-5 space-y-5"
          >
            {/* VIEW 1: RECHARTS BAR CHART + COMPLETION OVERVIEW */}
            {viewMode === "chart" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#B5731B]" />
                      Frecuencia de Actualizaciones vs. Actividades Completadas
                      por Departamento
                    </span>
                  </div>
                  {selectedDept && (
                    <button
                      onClick={() => handleDeptClick(selectedDept)}
                      className="text-[10.5px] font-bold text-[#B5731B] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1"
                    >
                      <Filter className="w-3 h-3" />
                      Limpiar filtro ({selectedDept})
                    </button>
                  )}
                </div>

                {/* Recharts Canvas Container */}
                <div className="h-72 w-full bg-slate-50/60 p-3 rounded-xl border border-ink/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 15, right: 20, bottom: 25, left: -10 }}
                      onClick={(state) => {
                        if (state && state.activeLabel) {
                          const matched = deptDataList.find((d) =>
                            d.department.startsWith(
                              state.activeLabel as string,
                            ),
                          );
                          if (matched) handleDeptClick(matched.department);
                        }
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: "#475569",
                          fontWeight: 600,
                        }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        tick={{ fontSize: 10, fill: "#64748B" }}
                        label={{
                          value: "Cantidad / Frecuencia",
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: 10, fill: "#94A3B8" },
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "#0D7A5F" }}
                        unit="%"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-ink/15 shadow-md p-3 rounded-xl text-xs space-y-1.5 z-50">
                                <p className="font-bold text-ink border-b border-ink/10 pb-1 flex items-center justify-between gap-3">
                                  <span>{data.fullName}</span>
                                  <span className="text-[10px] font-normal text-ink-muted">
                                    Clic para filtrar
                                  </span>
                                </p>
                                <div className="space-y-1 text-[11px]">
                                  <p className="text-[#B5731B] font-semibold flex items-center justify-between gap-4">
                                    <span>Actualizaciones:</span>
                                    <span className="font-bold">
                                      {data["Actualizaciones de Proyectos"]}
                                    </span>
                                  </p>
                                  <p className="text-emerald-700 font-semibold flex items-center justify-between gap-4">
                                    <span>Actividades Listas:</span>
                                    <span className="font-bold">
                                      {data["Actividades Completadas"]}
                                    </span>
                                  </p>
                                  <p className="text-sky-700 font-semibold flex items-center justify-between gap-4">
                                    <span>Completitud:</span>
                                    <span className="font-bold">
                                      {data["Tasa de Completitud (%)"]}%
                                    </span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs font-semibold text-slate-700">
                            {value}
                          </span>
                        )}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="Actualizaciones de Proyectos"
                        fill="#D97706"
                        radius={[6, 6, 0, 0]}
                        barSize={20}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-act-${index}`}
                            fill={
                              selectedDept && entry.fullName !== selectedDept
                                ? "#CBD5E1"
                                : "#D97706"
                            }
                          />
                        ))}
                      </Bar>
                      <Bar
                        yAxisId="left"
                        dataKey="Actividades Completadas"
                        fill="#0D7A5F"
                        radius={[6, 6, 0, 0]}
                        barSize={20}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-comp-${index}`}
                            fill={
                              selectedDept && entry.fullName !== selectedDept
                                ? "#E2E8F0"
                                : "#0D7A5F"
                            }
                          />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Tasa de Completitud (%)"
                        stroke="#0284C7"
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill: "#0284C7",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* VIEW 2: DEPARTMENT CARDS GRID */}
            {(viewMode === "grid" || viewMode === "chart") && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#B5731B]" />
                    Desglose de Frecuencia e Hitos por Departamento
                  </h4>
                  <span className="text-[10px] text-ink-muted">
                    Haz clic en un área para enfocar sus métricas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {deptDataList.map((dept) => {
                    const IconComp = dept.icon;
                    const isSelected = selectedDept === dept.department;

                    return (
                      <motion.div
                        key={dept.department}
                        whileHover={{ y: -2 }}
                        onClick={() => handleDeptClick(dept.department)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? "bg-amber-50/90 border-[#B5731B] shadow-sm ring-2 ring-[#B5731B]/30"
                            : "bg-white border-ink/10 hover:border-amber-300 hover:shadow-2xs"
                        }`}
                      >
                        {/* Selected Indicator Ribbon */}
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-[#B5731B] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                            Seleccionado
                          </div>
                        )}

                        {/* Top Area Info */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-lg ${dept.bgColor} border ${dept.borderColor}`}
                              style={{ color: dept.color }}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-ink line-clamp-1">
                                {dept.department}
                              </h5>
                              <p className="text-[10px] text-ink-muted flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                {dept.activeContributors} miembros activos
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Frequency & Completion Stats */}
                        <div className="grid grid-cols-2 gap-2 my-3 p-2 bg-slate-50 rounded-lg border border-ink/5">
                          <div>
                            <span className="text-[9.5px] font-semibold text-ink-muted block">
                              Actualizaciones
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="font-display font-extrabold text-base text-ink">
                                {dept.updatesCount}
                              </span>
                              <span className="text-[9px] text-[#B5731B] font-bold">
                                ({dept.updateFrequency})
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[9.5px] font-semibold text-ink-muted block">
                              Completitud
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="font-display font-extrabold text-base text-emerald-700">
                                {dept.completionRate}%
                              </span>
                              <span className="text-[9px] text-emerald-600 font-bold">
                                ({dept.completedActivities}/
                                {dept.totalActivities})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${dept.completionRate}%`,
                                backgroundColor: dept.color,
                              }}
                            />
                          </div>
                        </div>

                        {/* Recent Milestone */}
                        <div className="mt-2.5 pt-2 border-t border-ink/5 flex items-start justify-between gap-2 text-[10px]">
                          <div className="flex items-start gap-1 text-ink-muted line-clamp-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="italic">
                              {dept.recentMilestone}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
                            {dept.recentMilestoneTime}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: WEEKLY FREQUENCY MATRIX (HEATMAP / TIMELINE) */}
            {viewMode === "matrix" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#B5731B]" />
                    Matriz de Frecuencia Semanal por Departamento (Último Mes)
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-ink-muted">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 inline-block" />{" "}
                      Baja
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-300 inline-block" />{" "}
                      Media
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#B5731B] inline-block" />{" "}
                      Alta
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-ink/10 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-ink/10 text-left text-[10.5px] font-bold text-ink-muted">
                        <th className="pb-2 min-w-[140px]">Departamento</th>
                        <th className="pb-2 text-center min-w-[70px]">
                          Semana 1
                        </th>
                        <th className="pb-2 text-center min-w-[70px]">
                          Semana 2
                        </th>
                        <th className="pb-2 text-center min-w-[70px]">
                          Semana 3
                        </th>
                        <th className="pb-2 text-center min-w-[70px]">
                          Semana 4 (Actual)
                        </th>
                        <th className="pb-2 text-center min-w-[90px]">
                          Cadencia Semanal
                        </th>
                        <th className="pb-2 text-right min-w-[90px]">
                          Tasa Éxito
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {deptDataList.map((dept) => {
                        const IconComp = dept.icon;
                        const isSelected = selectedDept === dept.department;

                        return (
                          <tr
                            key={dept.department}
                            onClick={() => handleDeptClick(dept.department)}
                            className={`hover:bg-amber-50/50 transition-colors cursor-pointer ${
                              isSelected ? "bg-amber-100/60 font-semibold" : ""
                            }`}
                          >
                            <td className="py-2.5 font-bold text-ink flex items-center gap-2">
                              <IconComp
                                className="w-3.5 h-3.5"
                                style={{ color: dept.color }}
                              />
                              <span className="truncate">
                                {dept.department}
                              </span>
                            </td>

                            {dept.weeklyTrend.map((val, idx) => {
                              const intensityClass =
                                val > 10
                                  ? "bg-[#B5731B] text-white font-bold"
                                  : val > 5
                                    ? "bg-amber-200 text-amber-900 font-bold"
                                    : "bg-slate-200 text-slate-700";
                              return (
                                <td key={idx} className="py-2.5 text-center">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] ${intensityClass}`}
                                  >
                                    {val} act.
                                  </span>
                                </td>
                              );
                            })}

                            <td className="py-2.5 text-center font-semibold text-slate-700">
                              {dept.updateFrequency}
                            </td>

                            <td className="py-2.5 text-right font-bold text-emerald-700">
                              {dept.completionRate}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
