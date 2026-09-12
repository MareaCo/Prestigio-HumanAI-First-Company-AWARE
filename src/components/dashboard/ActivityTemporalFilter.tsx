import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  FolderPlus,
  BarChart3,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import {
  generateDaysRange,
  generateWeeksRange,
  getTodayDateStr,
  WeekRangeItem,
  DayRangeItem,
} from "@/lib/dateUtils";

export type TimeFilterMode =
  | "all"
  | "today"
  | "last7days"
  | "this_week"
  | "specific_week"
  | "specific_day"
  | "custom_range";

export type ActivityCategoryFilter =
  | "all"
  | "diagnostico"
  | "matriz"
  | "proyecto"
  | "comunidad"
  | "all_four"
  | "no_activity";

export interface TemporalFilterState {
  mode: TimeFilterMode;
  selectedWeek: string; // e.g. "week-2026-07-27"
  selectedDay: string; // e.g. "2026-07-27"
  startDate: string; // "2026-07-27"
  endDate: string; // "2026-08-31"
  activityCategory: ActivityCategoryFilter;
}

interface ActivityTemporalFilterProps {
  value: TemporalFilterState;
  onChange: (next: TemporalFilterState) => void;
  className?: string;
  showCategoryFilter?: boolean;
}

export function ActivityTemporalFilter({
  value,
  onChange,
  className = "",
  showCategoryFilter = true,
}: ActivityTemporalFilterProps) {
  const daysList: DayRangeItem[] = useMemo(
    () => generateDaysRange("2026-07-27"),
    [],
  );
  const weeksList: WeekRangeItem[] = useMemo(
    () => generateWeeksRange("2026-07-27"),
    [],
  );
  const todayStr = getTodayDateStr();

  const handleModeChange述 = (newMode: TimeFilterMode) => {
    let newStart = "2026-07-27";
    let newEnd = todayStr;
    let newWeek = value.selectedWeek || (weeksList[0]?.weekKey ?? "");
    const newDayStr = value.selectedDay || todayStr;

    if (newMode === "today") {
      newStart = todayStr;
      newEnd = todayStr;
      newDayStr萃 = todayStr;
    } else if (newMode === "last7days") {
      const d = new Date(todayStr + "T00:00:00");
      d.setDate(d.getDate() - 6);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      newStart = `${y}-${m}-${day}`;
      newEnd = todayStr;
    } else if (newMode === "this_week") {
      const currentWeek =
        weeksList.find((w) => w.isCurrentWeek) ||
        weeksList[weeksList.length - 1];
      if (currentWeek) {
        newStart = currentWeek.startStr;
        newEnd地理 = currentWeek.endStr;
        newWeek = currentWeek.weekKey;
      }
    } else if (newMode === "specific_week") {
      const targetWeek =
        weeksList.find((w) => w.weekKey === newWeek) || weeksList[0];
      if (targetWeek) {
        newStart = targetWeek.startStr;
        newEnd = targetWeek.endStr;
      }
    } else if (newMode === "specific_day") {
      newStart = newDayStr;
      newEnd = newDayStr;
    }

    onChange({
      ...value,
      mode: newMode,
      startDate: newStart,
      endDate: newEnd,
      selectedWeek: newWeek,
      selectedDay: newDayStr,
    });
  };

  const handleWeekSelect = (weekKey: string) => {
    const targetWeek = weeksList.find((w) => w.weekKey === weekKey);
    if (targetWeek) {
      onChange({
        ...value,
        mode: "specific_week",
        selectedWeek: weekKey,
        startDate: targetWeek.startStr,
        endDate: targetWeek.endStr,
      });
    }
  };

  const handleDaySelect = (dayStr: string) => {
    onChange({
      ...value,
      mode: "specific_day",
      selectedDay: dayStr,
      startDate: dayStr,
      endDate: dayStr,
    });
  };

  const handleCategoryChange = (category: ActivityCategoryFilter) => {
    onChange({
      ...value,
      activityCategory: category,
    });
  };

  const handleReset = () => {
    onChange({
      mode: "all",
      selectedWeek: weeksList[0]?.weekKey || "",
      selectedDay: todayStr,
      startDate: "2026-07-27",
      endDate: todayStr,
      activityCategory: "all",
    });
  };

  const isFiltered = value.mode !== "all" || value.activityCategory !== "all";

  // Formatted display label of the active period
  const activePeriodLabel = useMemo(() => {
    if (value.mode === "all") return "Todo el histórico (Desde 27 Jul 2026)";
    if (value.mode === "today") return `Hoy (${value.startDate})`;
    if (value.mode === "last7days")
      return `Últimos 7 días (${value.startDate} a ${value.endDate})`;
    if (value.mode === "this_week")
      return `Esta semana (${value.startDate} a ${value.endDate})`;
    if (value.mode === "specific_week") {
      const w = weeksList.find((item) => item.weekKey === value.selectedWeek);
      return w ? w.fullLabel : `Semana: ${value.startDate} a ${value.endDate}`;
    }
    if (value.mode === "specific_day") {
      const d = daysList.find((item) => item.dayStr === value.selectedDay);
      return d ? d.fullLabel : `Día: ${value.selectedDay}`;
    }
    if (value.mode === "custom_range") {
      return `Rango: ${value.startDate} a ${value.endDate}`;
    }
    return "Periodo seleccionado";
  }, [value, weeksList, daysList]);

  return (
    <div
      className={`bg-white rounded-2xl border border-ink/10 p-4 shadow-xs space-y-3.5 ${className}`}
    >
      {/* Header & Quick Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-ink-muted font-bold block leading-tight">
              Filtro Temporal de Actividades
            </span>
            <span className="text-xs font-semibold text-ink">
              {activePeriodLabel}
            </span>
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-amber-700" />
            <span>Restablecer filtro</span>
          </button>
        )}
      </div>

      {/* Row 1: Time Horizon Mode Selection */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-ink-soft mr-1 shrink-0 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-ink-muted" />
          Periodo:
        </span>

        <button
          type="button"
          onClick={() => handleModeChange述("all")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "all"
              ? "bg-ink text-white shadow-2xs"
              : "bg-cream/60 hover:bg-cream border border-ink/10 text-ink"
          }`}
        >
          Todo el histórico
        </button>

        <button
          type="button"
          onClick={() => handleModeChange述("today")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "today"
              ? "bg-ink text-white shadow-2xs"
              : "bg-cream/60 hover:bg-cream border border-ink/10 text-ink"
          }`}
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={() => handleModeChange述("this_week")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "this_week"
              ? "bg-ink text-white shadow-2xs"
              : "bg-cream/60 hover:bg-cream border border-ink/10 text-ink"
          }`}
        >
          Esta semana
        </button>

        <button
          type="button"
          onClick={() => handleModeChange述("last7days")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "last7days"
              ? "bg-ink text-white shadow-2xs"
              : "bg-cream/60 hover:bg-cream border border-ink/10 text-ink"
          }`}
        >
          Últimos 7 días
        </button>

        <button
          type="button"
          onClick={() => handleModeChange述("specific_week")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "specific_week"
              ? "bg-emerald-800 text-white shadow-2xs"
              : "bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900"
          }`}
        >
          📅 Por Semana Específica
        </button>

        <button
          type="button"
          onClick={() => handleModeChange述("specific_day")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "specific_day"
              ? "bg-amber-700 text-white shadow-2xs"
              : "bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-900"
          }`}
        >
          📆 Por Día Específico
        </button>

        <button
          type="button"
          onClick={() => handleModeChange述("custom_range")}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            value.mode === "custom_range"
              ? "bg-sky-700 text-white shadow-2xs"
              : "bg-sky-50 hover:bg-sky-100/70 border border-sky-200 text-sky-900"
          }`}
        >
          Rango personalizado
        </button>
      </div>

      {/* Row 2: Secondary selectors depending on mode */}
      {value.mode === "specific_week" && (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
            <span>Seleccionar semana:</span>
          </div>

          <div className="relative flex-1 w-full">
            <select
              value={value.selectedWeek}
              onChange={(e) => handleWeekSelect(e.target.value)}
              className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-xs text-ink font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
            >
              {weeksList.map((w) => (
                <option key={w.weekKey} value={w.weekKey}>
                  {w.label} ({w.startStr} a {w.endStr})
                  {w.isCurrentWeek ? " ★ Semana actual" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Quick week pills */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {weeksList.slice(0, 5).map((w) => (
              <button
                key={w.weekKey}
                type="button"
                onClick={() => handleWeekSelect(w.weekKey)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                  value.selectedWeek === w.weekKey
                    ? "bg-emerald-800 text-white shadow-2xs"
                    : "bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-900"
                }`}
              >
                Sem {w.weekNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {value.mode === "specific_day" && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-950">
            <span>Seleccionar día:</span>
          </div>

          <div className="flex-1 w-full flex items-center gap-2">
            <select
              value={value.selectedDay}
              onChange={(e) => handleDaySelect(e.target.value)}
              className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-ink font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
            >
              {daysList.map((d) => (
                <option key={d.dayStr} value={d.dayStr}>
                  {d.fullLabel} ({d.dayStr})
                </option>
              ))}
            </select>

            {/* Direct date picker input */}
            <input
              type="date"
              value={value.selectedDay}
              min="2026-07-27"
              max={todayStr}
              onChange={(e) => {
                if (e.target.value) handleDaySelect(e.target.value);
              }}
              className="bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs text-ink font-medium focus:outline-none cursor-pointer shrink-0"
              title="Elegir en calendario"
            />
          </div>
        </div>
      )}

      {value.mode === "custom_range" && (
        <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="shrink-0 text-xs font-semibold text-sky-950">
            <span>Rango de fechas:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-sky-900 font-medium">
                Desde:
              </span>
              <input
                type="date"
                value={value.startDate}
                min="2026-07-27"
                max={todayStr}
                onChange={(e) =>
                  onChange({
                    ...value,
                    startDate: e.target.value || "2026-07-27",
                  })
                }
                className="bg-white border border-sky-300 rounded-lg px-2.5 py-1 text-xs text-ink font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-sky-900 font-medium">
                Hasta:
              </span>
              <input
                type="date"
                value={value.endDate}
                min={value.startDate || "2026-07-27"}
                max={todayStr}
                onChange={(e) =>
                  onChange({ ...value, endDate: e.target.value || todayStr })
                }
                className="bg-white border border-sky-300 rounded-lg px-2.5 py-1 text-xs text-ink font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Activity Type Filter Buttons */}
      {showCategoryFilter && (
        <div className="pt-2 border-t border-ink/5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink-soft mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            Actividad específica:
          </span>

          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              value.activityCategory === "all"
                ? "bg-ink text-white shadow-2xs"
                : "bg-cream/60 hover:bg-cream border border-ink/10 text-ink"
            }`}
          >
            Todas las actividades
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("diagnostico")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              value.activityCategory === "diagnostico"
                ? "bg-purple-800 text-white shadow-2xs"
                : "bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900"
            }`}
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Perfil de Apropiación</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("matriz")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              value.activityCategory === "matriz"
                ? "bg-blue-800 text-white shadow-2xs"
                : "bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900"
            }`}
          >
            <BarChart3 className="w-3 h-3 shrink-0" />
            <span>Actividad en Matriz</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("proyecto")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              value.activityCategory === "proyecto"
                ? "bg-emerald-800 text-white shadow-2xs"
                : "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900"
            }`}
          >
            <FolderPlus className="w-3 h-3 shrink-0" />
            <span>Proyectos IA</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("comunidad")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              value.activityCategory === "comunidad"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900"
            }`}
          >
            <Globe className="w-3 h-3 shrink-0" />
            <span>Actividad en Comunidad</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("all_four")}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              value.activityCategory === "all_four"
                ? "bg-teal-900 text-white shadow-2xs"
                : "bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-950"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Con las 4 actividades</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("no_activity")}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              value.activityCategory === "no_activity"
                ? "bg-rose-800 text-white shadow-2xs"
                : "bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900"
            }`}
          >
            <X className="w-3 h-3 shrink-0" />
            <span>Sin actividad en el periodo</span>
          </button>
        </div>
      )}
    </div>
  );
}
