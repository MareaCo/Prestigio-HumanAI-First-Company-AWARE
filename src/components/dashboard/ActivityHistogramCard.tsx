import React, { useState, useEffect, useMemo } from "react";
import { generateDaysRange } from "@/lib/dateUtils";
import {
  getActivityEventsFn,
  getSampleActivityEventsSeed,
} from "@/lib/bigquery.functions";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Calendar,
  LogIn,
  SlidersHorizontal,
  FolderPlus,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Download,
  Filter,
  Users,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
} from "lucide-react";

export interface ActivityEvent {
  id: string;
  timestamp: string; // ISO String starting >= 2026-07-27T08:00:00
  dateStr: string; // e.g. "27 Jul"
  timeStr: string; // e.g. "09:30 AM"
  hourBucket: string; // e.g. "27 Jul 08:00 - 12:00"
  userName: string;
  userArea: string;
  userRole: string;
  category: "sesion" | "matriz" | "proyecto" | "prompt_mia" | "diagnostico";
  actionTitle: string;
  description: string;
}

export interface DayActivityData {
  dateKey: string; // "2026-07-27"
  dateLabel: string; // "Lun 27 Jul"
  fullLabel: string; // "27 Jul 2026 (8:00 AM+)"
  sesiones: number;
  matriz: number;
  proyectos: number;
  promptsMia: number;
  diagnosticos: number;
  total: number;
  activeUsersCount: number;
}

// Fixed start date requested: July 27, 2026 08:00 AM
export const START_DATE_ISO = "2026-07-27T08:00:00";

interface ActivityHistogramCardProps {
  areaName?: string;
  className?: string;
}

export function ActivityHistogramCard({
  areaName = "Toda la compañía",
  className = "",
}: ActivityHistogramCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "all" | ActivityEvent["category"]
  >("all");
  const [selectedView, setSelectedView] = useState<"bar" | "stacked" | "area">(
    "stacked",
  );
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rawEvents, setRawEvents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real activity events from BigQuery or fallback seed
  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const res = await getActivityEventsFn({
          data: { fromDate: "2026-07-27T08:00:00" },
        });
        if (Array.isArray(res) && res.length > 0) {
          setRawEvents(res);
        } else {
          setRawEvents(getSampleActivityEventsSeed());
        }
      } catch (err) {
        console.warn(
          "Error loading activity events, falling back to seed:",
          err,
        );
        setRawEvents(getSampleActivityEventsSeed());
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Map raw events into ActivityEvent format (excluding logins/sessions which have their own separate histogram card)
  const allEvents: ActivityEvent[] = useMemo(() => {
    return rawEvents
      .filter((r) => r.category !== "sesion")
      .map((r) => {
        const ts = (r.created_at as string) || "2026-07-27T08:00:00.000Z";
        const dateObj = new Date(ts);

        const dateStr = dateObj.toLocaleDateString("es-CO", {
          day: "numeric",
          month: "short",
          timeZone: "America/Bogota",
        });
        const timeStr = dateObj.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "America/Bogota",
        });

        return {
          id: (r.id as string) || `act-${Math.random()}`,
          timestamp: ts,
          dateStr,
          timeStr,
          hourBucket: ts.substring(0, 10),
          userName: (r.user_name as string) || "Usuario Registrado",
          userArea: (r.user_area as string) || (r.area as string) || "General",
          userRole: (r.user_role as string) || "Colaborador",
          category: (r.category || "diagnostico") as ActivityEvent["category"],
          actionTitle: (r.action_title as string) || "Actividad de Usuario",
          description: (r.description as string) || "Registro en BigQuery",
        };
      });
  }, [rawEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchesArea =
        selectedArea === "all" || ev.userArea === selectedArea;
      const matchesCat =
        selectedMetric === "all" || ev.category === selectedMetric;
      const matchesSearch =
        !searchTerm ||
        ev.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.actionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.userArea.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesArea && matchesCat && matchesSearch;
    });
  }, [allEvents, selectedArea, selectedMetric, searchTerm]);

  // Aggregate by day for histogram
  const dailyChartData = useMemo(() => {
    const range = generateDaysRange("2026-07-27");
    const daysMap: Record<string, DayActivityData> = {};
    const userSetsPerDay: Record<string, Set<string>> = {};

    range.forEach((d) => {
      daysMap[d.dayStr] = {
        dateKey: d.dayStr,
        dateLabel: d.dateLabel,
        fullLabel: d.fullLabel,
        sesiones: 0,
        matriz: 0,
        proyectos: 0,
        promptsMia: 0,
        diagnosticos: 0,
        total: 0,
        activeUsersCount: 0,
      };
      userSetsPerDay[d.dayStr] = new Set();
    });

    filteredEvents.forEach((ev) => {
      const dateKey = ev.timestamp.substring(0, 10);
      if (daysMap[dateKey]) {
        if (ev.category === "sesion") daysMap[dateKey].sesiones++;
        if (ev.category === "matriz") daysMap[dateKey].matriz++;
        if (ev.category === "proyecto") daysMap[dateKey].proyectos++;
        if (ev.category === "prompt_mia") daysMap[dateKey].promptsMia++;
        if (ev.category === "diagnostico") daysMap[dateKey].diagnosticos++;
        daysMap[dateKey].total++;
        userSetsPerDay[dateKey]?.add(ev.userName);
      }
    });

    Object.keys(daysMap).forEach((k) => {
      daysMap[k].activeUsersCount = userSetsPerDay[k]?.size || 0;
    });

    return Object.values(daysMap);
  }, [filteredEvents]);

  // Overall totals
  const totals = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const sesiones = filteredEvents.filter(
      (e) => e.category === "sesion",
    ).length;
    const matriz = filteredEvents.filter((e) => e.category === "matriz").length;
    const proyectos = filteredEvents.filter(
      (e) => e.category === "proyecto",
    ).length;
    const promptsMia = filteredEvents.filter(
      (e) => e.category === "prompt_mia",
    ).length;
    const diagnosticos = filteredEvents.filter(
      (e) => e.category === "diagnostico",
    ).length;
    const uniqueUsers = new Set(filteredEvents.map((e) => e.userName)).size;

    return {
      totalEvents,
      sesiones,
      matriz,
      proyectos,
      promptsMia,
      diagnosticos,
      uniqueUsers,
    };
  }, [filteredEvents]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!filteredEvents.length) return;
    const headers = [
      "ID",
      "Fecha/Hora",
      "Usuario",
      "Rol",
      "Área",
      "Categoría",
      "Acción",
      "Descripción",
    ];
    const rows = filteredEvents.map((ev) => [
      ev.id,
      `"${ev.timestamp}"`,
      `"${ev.userName}"`,
      `"${ev.userRole}"`,
      `"${ev.userArea}"`,
      `"${ev.category}"`,
      `"${ev.actionTitle}"`,
      `"${ev.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `actividad_usuarios_julio27_2026_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-7 text-white shadow-xl overflow-hidden border border-slate-700/80 ${className}`}
      style={{ background: "#2D3036" }}
    >
      {/* Header Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 tracking-wide uppercase flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Histograma de Uso de la Plataforma
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              Inicio: 27 de Julio 2026, 08:00 AM ➔ Presente
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Actividad Reciente e Indicadores de Adopción
          </h3>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Distribución temporal de diagnósticos de introspección, actividad en
            Matriz, Proyectos IA y Consultas MIA desde el{" "}
            <strong className="text-white font-semibold">
              27 de Julio de 2026 a las 8:00 AM
            </strong>
            . (Los Ingresos a la App se contabilizan en la gráfica dedicada más
            abajo).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-600 transition-all flex items-center gap-1.5"
            title="Exportar datos a CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/90 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Total Eventos</span>
          </div>
          <span className="text-xl font-bold text-white block">
            {totals.totalEvents}
          </span>
          <span className="text-[10px] text-indigo-300 block font-mono">
            Desde 27 Jul 8am
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-rose-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-rose-400 font-semibold uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Introspección</span>
          </div>
          <span className="text-xl font-bold text-rose-300 block">
            {totals.diagnosticos}
          </span>
          <span className="text-[10px] text-rose-300/80 block font-mono">
            Evaluaciones
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/90 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Matriz Ridiculist</span>
          </div>
          <span className="text-xl font-bold text-amber-300 block">
            {totals.matriz}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Tareas cargadas
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/90 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Proyectos IA</span>
          </div>
          <span className="text-xl font-bold text-emerald-300 block">
            {totals.proyectos}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Copilotos Q3
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/90 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Consultas MIA</span>
          </div>
          <span className="text-xl font-bold text-purple-300 block">
            {totals.promptsMia}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Prompts & Asistente
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/90 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>Usuarios Únicos</span>
          </div>
          <span className="text-xl font-bold text-rose-300 block">
            {totals.uniqueUsers}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Colaboradores
          </span>
        </div>
      </div>

      {/* Filter and View Selection Controls */}
      <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Metric Series Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-semibold mr-1 shrink-0">
            Filtrar Métrica:
          </span>
          <button
            onClick={() => setSelectedMetric("all")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedMetric === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            Todas ({totals.totalEvents})
          </button>
          <button
            onClick={() => setSelectedMetric("diagnostico")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              selectedMetric === "diagnostico"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Introspección ({totals.diagnosticos})
          </button>
          <button
            onClick={() => setSelectedMetric("matriz")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              selectedMetric === "matriz"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Matriz ({totals.matriz})
          </button>
          <button
            onClick={() => setSelectedMetric("proyecto")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              selectedMetric === "proyecto"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            <FolderPlus className="w-3 h-3" />
            Proyectos ({totals.proyectos})
          </button>
          <button
            onClick={() => setSelectedMetric("prompt_mia")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              selectedMetric === "prompt_mia"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            MIA/Prompts ({totals.promptsMia})
          </button>
        </div>

        {/* Visualization Style Switcher */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-slate-400 font-semibold">
            Tipo de Visualización:
          </span>
          <div className="bg-slate-900/90 p-0.5 rounded-lg border border-slate-700 flex items-center">
            <button
              onClick={() => setSelectedView("stacked")}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedView === "stacked"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Histograma Apilado"
            >
              <BarChart3 className="w-3 h-3" />
              Apilado
            </button>
            <button
              onClick={() => setSelectedView("bar")}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedView === "bar"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Histograma Agrupado"
            >
              <Layers className="w-3 h-3" />
              Agrupado
            </button>
            <button
              onClick={() => setSelectedView("area")}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedView === "area"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Área Acumulada"
            >
              <TrendingUp className="w-3 h-3" />
              Tendencia
            </button>
          </div>
        </div>
      </div>

      {/* Main Histogram Recharts Chart */}
      <div className="h-[320px] sm:h-[360px] w-full bg-slate-900/40 p-3 sm:p-4 rounded-xl border border-slate-700/60 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          {selectedView === "area" ? (
            <AreaChart
              data={dailyChartData}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient
                  id="colorIntrospeccion"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.5}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="sesiones"
                name="Ingresos App (Logins)"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#colorIngresos)"
              />
              <Area
                type="monotone"
                dataKey="diagnosticos"
                name="Introspección Completada"
                stroke="#f43f5e"
                fillOpacity={1}
                fill="url(#colorIntrospeccion)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={dailyChartData}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.5}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />

              {selectedMetric === "all" || selectedMetric === "diagnostico" ? (
                <Bar
                  dataKey="diagnosticos"
                  name="Diagnóstico Introspección"
                  fill="#f43f5e"
                  stackId={selectedView === "stacked" ? "a" : undefined}
                  radius={[4, 4, 0, 0]}
                />
              ) : null}

              {selectedMetric === "all" || selectedMetric === "matriz" ? (
                <Bar
                  dataKey="matriz"
                  name="Actividad en Matriz"
                  fill="#fbbf24"
                  stackId={selectedView === "stacked" ? "a" : undefined}
                  radius={[4, 4, 0, 0]}
                />
              ) : null}

              {selectedMetric === "all" || selectedMetric === "proyecto" ? (
                <Bar
                  dataKey="proyectos"
                  name="Proyectos IA Creados"
                  fill="#34d399"
                  stackId={selectedView === "stacked" ? "a" : undefined}
                  radius={[4, 4, 0, 0]}
                />
              ) : null}

              {selectedMetric === "all" || selectedMetric === "prompt_mia" ? (
                <Bar
                  dataKey="promptsMia"
                  name="Consultas MIA / Prompts"
                  fill="#c084fc"
                  stackId={selectedView === "stacked" ? "a" : undefined}
                  radius={[4, 4, 0, 0]}
                />
              ) : null}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Log Details Explorer Table */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Registro Detallado de Eventos (Julio 27, 2026 8:00 AM ➔ Presente)
          </h4>
          <span className="text-xs text-slate-400">
            Mostrando {filteredEvents.length} eventos registrados
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/60 divide-y divide-slate-800">
          {filteredEvents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No hay eventos coincidentes para este filtro.
            </div>
          ) : (
            filteredEvents.map((ev, idx) => (
              <div
                key={`${ev.id}-${idx}`}
                className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-amber-400 shrink-0 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {ev.dateStr} · {ev.timeStr}
                  </span>
                  <div>
                    <span className="font-bold text-slate-200">
                      {ev.userName}
                    </span>
                    <span className="text-slate-400 ml-2">({ev.userArea})</span>
                    <p className="text-slate-300 font-medium text-[11px] mt-0.5">
                      {ev.actionTitle}:{" "}
                      <span className="text-slate-400 font-normal">
                        {ev.description}
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={`self-start sm:self-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    ev.category === "matriz"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : ev.category === "proyecto"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : ev.category === "prompt_mia"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {ev.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DayActivityData }>;
  label?: string;
}

/**
 * Custom Tooltip for Recharts Histogram
 */
function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DayActivityData;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-2 text-white min-w-[220px]">
        <div className="border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span className="font-bold text-amber-400">{data.fullLabel}</span>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono text-[10px]">
            {data.activeUsersCount} activos
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40">
            <span className="font-medium">📝 Introspección Completada:</span>
            <span className="font-mono font-bold text-sm">
              {data.diagnosticos}
            </span>
          </div>
          <div className="flex justify-between items-center text-amber-300">
            <span>📋 Matriz Ridiculist:</span>
            <span className="font-mono font-bold">{data.matriz}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-300">
            <span>🚀 Proyectos IA:</span>
            <span className="font-mono font-bold">{data.proyectos}</span>
          </div>
          <div className="flex justify-between items-center text-purple-300">
            <span>💬 Consultas MIA:</span>
            <span className="font-mono font-bold">{data.promptsMia}</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-1.5 text-[10px] text-slate-400 italic">
          *Los Ingresos a la App se registran en la gráfica dedicada más abajo.
        </div>
      </div>
    );
  }
  return null;
}
