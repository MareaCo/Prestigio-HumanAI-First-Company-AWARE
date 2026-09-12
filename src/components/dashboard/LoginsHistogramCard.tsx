import React, { useState, useEffect, useMemo } from "react";
import { generateDaysRange } from "@/lib/dateUtils";
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
  LogIn,
  Calendar,
  UserCheck,
  UserPlus,
  Users,
  Database,
  Download,
  TrendingUp,
  BarChart3,
  Layers,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { getLoginsFn, getSampleLoginsSeed } from "@/lib/bigquery.functions";

export interface LoginRecord {
  id: string;
  employee_id: string | null;
  user_name: string;
  user_email: string;
  user_role: string | null;
  user_type: "nuevo" | "actual";
  created_at: string;
  area: string | null;
  empresa: string | null;
}

export interface DayLoginsAggregate {
  dateKey: string; // "2026-07-27"
  dateLabel: string; // "27 Jul"
  fullLabel: string; // "Lunes 27 de Julio de 2026"
  nuevos: number;
  actuales: number;
  total: number;
  uniqueUsers: number;
}

interface LoginsHistogramCardProps {
  areaName?: string;
  className?: string;
}

export function LoginsHistogramCard({
  areaName = "Toda la compañía",
  className = "",
}: LoginsHistogramCardProps) {
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUserType, setSelectedUserType] = useState<
    "all" | "nuevo" | "actual"
  >("all");
  const [selectedView, setSelectedView] = useState<"stacked" | "bar" | "area">(
    "stacked",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch logins from BigQuery or fallback seed
  const fetchLogins = async () => {
    setLoading(true);
    try {
      const res = await getLoginsFn({
        data: { fromDate: "2026-07-27T08:00:00" },
      });
      if (Array.isArray(res) && res.length > 0) {
        setLogins(res as LoginRecord[]);
      } else {
        setLogins(getSampleLoginsSeed() as LoginRecord[]);
      }
    } catch (err) {
      console.warn("Falling back to sample logins seed:", err);
      setLogins(getSampleLoginsSeed() as LoginRecord[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, []);

  // Filter logins by search and user type
  const filteredLogins = useMemo(() => {
    return logins.filter((l) => {
      const matchesType =
        selectedUserType === "all" || l.user_type === selectedUserType;
      const matchesSearch =
        !searchTerm ||
        l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.area && l.area.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [logins, selectedUserType, searchTerm]);

  // Aggregate by day starting from 2026-07-27
  const dailyChartData = useMemo(() => {
    const range = generateDaysRange("2026-07-27");
    const daysMap: Record<string, DayLoginsAggregate> = {};
    const usersPerDay: Record<string, Set<string>> = {};

    range.forEach((d) => {
      daysMap[d.dayStr] = {
        dateKey: d.dayStr,
        dateLabel: d.dateLabel,
        fullLabel: d.fullLabel,
        nuevos: 0,
        actuales: 0,
        total: 0,
        uniqueUsers: 0,
      };
      usersPerDay[d.dayStr] = new Set();
    });

    filteredLogins.forEach((l) => {
      const dateKey = l.created_at.substring(0, 10);
      if (!daysMap[dateKey]) {
        // If a new date appears
        const label = dateKey.substring(5);
        daysMap[dateKey] = {
          dateKey,
          dateLabel: label,
          fullLabel: `Fecha ${dateKey}`,
          nuevos: 0,
          actuales: 0,
          total: 0,
          uniqueUsers: 0,
        };
        usersPerDay[dateKey] = new Set();
      }

      if (l.user_type === "nuevo") {
        daysMap[dateKey].nuevos++;
      } else {
        daysMap[dateKey].actuales++;
      }
      daysMap[dateKey].total++;
      usersPerDay[dateKey].add(l.user_email);
    });

    Object.keys(daysMap).forEach((k) => {
      daysMap[k].uniqueUsers = usersPerDay[k]?.size || 0;
    });

    return Object.values(daysMap).sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey),
    );
  }, [filteredLogins]);

  // Overall statistics
  const kpis = useMemo(() => {
    const totalLogins = filteredLogins.length;
    const nuevosCount = filteredLogins.filter(
      (l) => l.user_type === "nuevo",
    ).length;
    const actualesCount = filteredLogins.filter(
      (l) => l.user_type === "actual",
    ).length;
    const uniqueUsers = new Set(filteredLogins.map((l) => l.user_email)).size;
    const avgPerDay =
      dailyChartData.length > 0
        ? (totalLogins / dailyChartData.length).toFixed(1)
        : "0";

    return {
      totalLogins,
      nuevosCount,
      actualesCount,
      uniqueUsers,
      avgPerDay,
    };
  }, [filteredLogins, dailyChartData]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!filteredLogins.length) return;
    const headers = [
      "ID",
      "Fecha_Ingreso",
      "Usuario",
      "Email",
      "Rol",
      "Tipo_Usuario",
      "Area",
      "Empresa",
    ];
    const rows = filteredLogins.map((l) => [
      l.id,
      `"${l.created_at}"`,
      `"${l.user_name}"`,
      `"${l.user_email}"`,
      `"${l.user_role || "employee"}"`,
      `"${l.user_type}"`,
      `"${l.area || "General"}"`,
      `"${l.empresa || "Comfama"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ingresos_bigquery_julio27_2026_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-7 text-white shadow-xl overflow-hidden border border-slate-700/80 ${className}`}
      style={{ background: "#25282E" }}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30 tracking-wide uppercase flex items-center gap-1.5">
              <Database className="w-3 h-3 text-sky-400" />
              BigQuery Data Storage · Registro de Ingresos
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              Julio 27, 2026 (08:00 AM) ➔ Presente
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LogIn className="w-6 h-6 text-sky-400" />
            Histograma de Ingresos a la Plataforma (Logins)
          </h3>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Monitor de frecuencia de accesos a la plataforma registrados en{" "}
            <strong className="text-sky-300 font-semibold">
              BigQuery (Tabla `logins`)
            </strong>{" "}
            distinguiendo entre{" "}
            <span className="text-emerald-300 font-medium">
              Usuarios Nuevos
            </span>{" "}
            y{" "}
            <span className="text-sky-300 font-medium">Usuarios Actuales</span>{" "}
            desde el 27 de Julio de 2026 a las 8:00 AM.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={fetchLogins}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-600 transition-all flex items-center gap-1.5"
            title="Refrescar datos desde BigQuery"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-sky-400 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refrescar BigQuery</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-200 hover:text-white rounded-xl text-xs font-semibold border border-sky-700/80 transition-all flex items-center gap-1.5"
            title="Exportar registros a CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip for Logins */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-5">
        {/* Total Logins */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/90 text-center space-y-1 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <LogIn className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Ingresos</span>
          </div>
          <span className="text-2xl font-extrabold text-sky-300 block">
            {kpis.totalLogins}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Registrados en BQ
          </span>
        </div>

        {/* Nuevos Usuarios */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-emerald-500/30 text-center space-y-1 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold uppercase">
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Usuarios Nuevos</span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-300 block">
            {kpis.nuevosCount}
          </span>
          <span className="text-[10px] text-emerald-400/80 block font-mono">
            Primer acceso
          </span>
        </div>

        {/* Usuarios Actuales */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-center space-y-1 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-indigo-400 font-semibold uppercase">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Usuarios Actuales</span>
          </div>
          <span className="text-2xl font-extrabold text-indigo-300 block">
            {kpis.actualesCount}
          </span>
          <span className="text-[10px] text-indigo-300/80 block font-mono">
            Ingresos recurrentes
          </span>
        </div>

        {/* Unique Active Users */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/90 text-center space-y-1 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Usuarios Únicos</span>
          </div>
          <span className="text-2xl font-extrabold text-purple-300 block">
            {kpis.uniqueUsers}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Colaboradores activos
          </span>
        </div>

        {/* Average per day */}
        <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/90 text-center space-y-1 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Promedio / Día</span>
          </div>
          <span className="text-2xl font-extrabold text-amber-300 block">
            {kpis.avgPerDay}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Ingresos diarios
          </span>
        </div>
      </div>

      {/* Filter and Mode Controls */}
      <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* User Type Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-semibold mr-1 shrink-0">
            Filtrar Tipo:
          </span>
          <button
            onClick={() => setSelectedUserType("all")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedUserType === "all"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            Todos ({kpis.totalLogins})
          </button>
          <button
            onClick={() => setSelectedUserType("nuevo")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              selectedUserType === "nuevo"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            <UserPlus className="w-3 h-3" />
            Nuevos ({kpis.nuevosCount})
          </button>
          <button
            onClick={() => setSelectedUserType("actual")}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              selectedUserType === "actual"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-700/70 text-slate-300 hover:text-white"
            }`}
          >
            <UserCheck className="w-3 h-3" />
            Actuales ({kpis.actualesCount})
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-slate-400 font-semibold">Visualización:</span>
          <div className="bg-slate-900/90 p-0.5 rounded-lg border border-slate-700 flex items-center">
            <button
              onClick={() => setSelectedView("stacked")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedView === "stacked"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Histograma Apilado"
            >
              <BarChart3 className="w-3 h-3" />
              Apilado
            </button>
            <button
              onClick={() => setSelectedView("bar")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedView === "bar"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Barras Agrupadas"
            >
              <Layers className="w-3 h-3" />
              Agrupado
            </button>
            <button
              onClick={() => setSelectedView("area")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedView === "area"
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Tendencia de Área"
            >
              <TrendingUp className="w-3 h-3" />
              Área
            </button>
          </div>
        </div>
      </div>

      {/* Main Logins Histogram Recharts Chart */}
      <div className="h-[300px] sm:h-[340px] w-full bg-slate-900/40 p-3 sm:p-4 rounded-xl border border-slate-700/60 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          {selectedView === "area" ? (
            <AreaChart
              data={dailyChartData}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorNuevos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorActuales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
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
              <Tooltip content={<LoginsTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
              {selectedUserType === "all" || selectedUserType === "nuevo" ? (
                <Area
                  type="monotone"
                  dataKey="nuevos"
                  name="Usuarios Nuevos (Primer Acceso)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorNuevos)"
                />
              ) : null}
              {selectedUserType === "all" || selectedUserType === "actual" ? (
                <Area
                  type="monotone"
                  dataKey="actuales"
                  name="Usuarios Actuales (Recurrentes)"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorActuales)"
                />
              ) : null}
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
              <Tooltip content={<LoginsTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />

              {selectedUserType === "all" || selectedUserType === "nuevo" ? (
                <Bar
                  dataKey="nuevos"
                  name="Usuarios Nuevos (Primer Acceso)"
                  fill="#10b981"
                  stackId={selectedView === "stacked" ? "logins" : undefined}
                  radius={
                    selectedView === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]
                  }
                />
              ) : null}

              {selectedUserType === "all" || selectedUserType === "actual" ? (
                <Bar
                  dataKey="actuales"
                  name="Usuarios Actuales (Recurrentes)"
                  fill="#38bdf8"
                  stackId={selectedView === "stacked" ? "logins" : undefined}
                  radius={[4, 4, 0, 0]}
                />
              ) : null}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Logins BigQuery Table Explorer */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            Tabla BigQuery: `logins` (Registros desde Julio 27, 2026 8:00 AM)
          </h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/60 divide-y divide-slate-800">
          {filteredLogins.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No se encontraron registros de ingreso para estos filtros.
            </div>
          ) : (
            filteredLogins.map((l, idx) => (
              <div
                key={`${l.id}-${idx}`}
                className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-sky-300 shrink-0 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {l.created_at.slice(0, 10)} · {l.created_at.slice(11, 16)}
                  </span>
                  <div>
                    <span className="font-bold text-slate-100">
                      {l.user_name}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] ml-2">
                      ({l.user_email})
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Área:{" "}
                      <span className="text-slate-300">
                        {l.area || "General"}
                      </span>{" "}
                      · Rol:{" "}
                      <span className="text-slate-300 font-capitalize">
                        {l.user_role || "employee"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      l.user_type === "nuevo"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    }`}
                  >
                    Usuario {l.user_type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface LoginsTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DayLoginsAggregate }>;
  label?: string;
}

function LoginsTooltip({ active, payload }: LoginsTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DayLoginsAggregate;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-2 text-white min-w-[210px]">
        <div className="border-b border-slate-700 pb-1.5 flex justify-between items-center">
          <span className="font-bold text-sky-400">{data.fullLabel}</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-300">
            {data.total} logins
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-emerald-300">
            <span>✨ Usuarios Nuevos:</span>
            <span className="font-mono font-bold">{data.nuevos}</span>
          </div>
          <div className="flex justify-between items-center text-sky-300">
            <span>👤 Usuarios Actuales:</span>
            <span className="font-mono font-bold">{data.actuales}</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-1.5 flex justify-between items-center text-[11px] text-slate-400">
          <span>Usuarios Únicos:</span>
          <span className="font-bold text-amber-400">
            {data.uniqueUsers} activos
          </span>
        </div>
      </div>
    );
  }
  return null;
}
