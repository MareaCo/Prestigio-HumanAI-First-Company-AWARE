import { useState, useEffect, useMemo } from "react";
import {
  Download,
  CheckSquare,
  Square,
  Building2,
  Pencil,
  Search,
  X,
  KeyRound,
  RotateCcw,
  Calendar,
  Sparkles,
  BarChart3,
  FolderPlus,
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
} from "lucide-react";
import { PERFIL_CONFIG, TIER_NAMES } from "@/data/constants";
import type { Diagnostic, Employee } from "@/types";
import { BatchReportModal } from "./BatchReportModal";
import { EditEmployeesModal } from "./EditEmployeesModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { ResetIntrospectionModal } from "./ResetIntrospectionModal";
import {
  ActivityTemporalFilter,
  TemporalFilterState,
} from "./ActivityTemporalFilter";
import { getActivityEventsFn } from "@/lib/bigquery.functions";
import {
  isDateInRange,
  getTodayDateStr,
  generateWeeksRange,
  formatDatePretty,
} from "@/lib/dateUtils";
import { useApp } from "@/context/AppContext";

interface Props {
  employees: Employee[];
  diagnostics: Diagnostic[];
  onOpenDetail: (employeeId: string) => void;
  onStartQuiz: (employeeId: string) => void;
  onReload?: () => void;
}

interface Row {
  employee: Employee;
  diagnostic: Diagnostic | null;
  // Temporal activity data in the active date window
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
  completedDimensionsCount: number;
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

export function EmployeeTable({
  employees,
  diagnostics,
  onOpenDetail,
  onStartQuiz,
  onReload,
}: Props) {
  const { role } = useApp();
  const isAdmin = role === "admin";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetIntrospectionModal, setShowResetIntrospectionModal] =
    useState(false);
  const [employeesToEdit, setEmployeesToEdit] = useState<Employee[]>([]);
  const [employeesToReset, setEmployeesToReset] = useState<Employee[]>([]);
  const [employeesToResetIntrospection, setEmployeesToResetIntrospection] =
    useState<Employee[]>([]);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [showActivityColumns, setShowActivityColumns] = useState(true);

  const todayStr = getTodayDateStr();
  const weeksList = useMemo(() => generateWeeksRange("2026-07-27"), []);

  const [temporalFilter, setTemporalFilter] = useState<TemporalFilterState>({
    mode: "all",
    selectedWeek: weeksList[0]?.weekKey || "",
    selectedDay: todayStr,
    startDate: "2026-07-27",
    endDate: todayStr,
    activityCategory: "all",
  });

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
        console.error("Error loading activity events for EmployeeTable:", err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows: Row[] = useMemo(() => {
    const { startDate, endDate } = temporalFilter;

    const list = employees.map((e) => {
      const diag = diagnostics.find((d) => d.employee_id === e.id) ?? null;

      // Filter events for this employee within the date range
      const empEvents = activityEvents.filter((ev) => {
        const matchesEmp =
          ev.employee_id === e.id ||
          (ev.user_email &&
            e.email &&
            ev.user_email.toLowerCase() === e.email.toLowerCase()) ||
          (ev.user_name &&
            e.name &&
            ev.user_name.toLowerCase() === e.name.toLowerCase());
        if (!matchesEmp) return false;
        return isDateInRange(ev.created_at, startDate, endDate);
      });

      // 1. Diagnóstico de Apropiación
      const diagEvents = empEvents.filter(
        (ev) => ev.category === "diagnostico",
      );
      let hasDiag = diagEvents.length > 0;
      let lastDiagDate = diagEvents[0]?.created_at;
      if (
        diag &&
        diag.created_at &&
        isDateInRange(diag.created_at, startDate, endDate)
      ) {
        hasDiag = true;
        if (!lastDiagDate) lastDiagDate = diag.created_at;
      }

      // 2. Matriz de tareas
      const matrizEvents = empEvents.filter((ev) => ev.category === "matriz");
      const hasMatriz = matrizEvents.length > 0;
      const lastMatrizDate = matrizEvents[0]?.created_at;

      // 3. Proyectos IA
      const proyectoEvents = empEvents.filter(
        (ev) => ev.category === "proyecto",
      );
      const hasProyecto = proyectoEvents.length > 0;
      const lastProyectoDate = proyectoEvents[0]?.created_at;

      // 4. Comunidad y MIA
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
        employee: e,
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

    list.sort((a, b) => {
      const sa = a.diagnostic?.total_score ?? -1;
      const sb = b.diagnostic?.total_score ?? -1;
      return sb - sa;
    });

    return list;
  }, [employees, diagnostics, activityEvents, temporalFilter]);

  // Extract unique companies for filter
  const companies = Array.from(
    new Set(
      employees
        .map((e) => e.empresa?.trim())
        .filter((emp): emp is string => Boolean(emp && emp.length > 0)),
    ),
  ).sort();

  const missingEmpresaCount = employees.filter(
    (e) => !e.empresa || !e.empresa.trim(),
  ).length;

  // Apply Name, Empresa and Temporal Activity filters
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const { employee } = row;

      // Filter by name, cedula or email
      if (searchName.trim()) {
        const q = searchName.toLowerCase().trim();
        const matchName = employee.name.toLowerCase().includes(q);
        const matchCedula = (employee.cedula || "").toLowerCase().includes(q);
        const matchEmail = (employee.email || "").toLowerCase().includes(q);
        const matchEmpresaPrincipal = (
          employee.empresa_principal ||
          employee.empresaPrincipal ||
          ""
        )
          .toLowerCase()
          .includes(q);
        if (!matchName && !matchCedula && !matchEmail && !matchEmpresaPrincipal)
          return false;
      }

      // Filter by empresa
      if (filterEmpresa) {
        if (filterEmpresa === "__none__") {
          if (employee.empresa && employee.empresa.trim()) return false;
        } else {
          if (employee.empresa?.trim() !== filterEmpresa) return false;
        }
      }

      // Filter by Activity Category
      if (
        temporalFilter.activityCategory === "diagnostico" &&
        !row.hasDiagnostico
      )
        return false;
      if (temporalFilter.activityCategory === "matriz" && !row.hasMatriz)
        return false;
      if (temporalFilter.activityCategory === "proyecto" && !row.hasProyecto)
        return false;
      if (temporalFilter.activityCategory === "comunidad" && !row.hasComunidad)
        return false;
      if (
        temporalFilter.activityCategory === "all_four" &&
        row.completedDimensionsCount < 4
      )
        return false;
      if (
        temporalFilter.activityCategory === "no_activity" &&
        row.totalActivitiesInPeriod > 0
      )
        return false;

      return true;
    });
  }, [rows, searchName, filterEmpresa, temporalFilter.activityCategory]);

  // Aggregate stats in the active temporal window
  const windowStats = useMemo(() => {
    const total = rows.length;
    const withDiag = rows.filter((r) => r.hasDiagnostico).length;
    const withMatriz = rows.filter((r) => r.hasMatriz).length;
    const withProyecto = rows.filter((r) => r.hasProyecto).length;
    const withComunidad = rows.filter((r) => r.hasComunidad).length;
    const withAllFour = rows.filter(
      (r) => r.completedDimensionsCount === 4,
    ).length;

    return {
      total,
      withDiag,
      withMatriz,
      withProyecto,
      withComunidad,
      withAllFour,
    };
  }, [rows]);

  const withCount = filteredRows.filter((r) => r.diagnostic).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const filteredIds = filteredRows.map((r) => r.employee.id);
  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const selectedRows = rows.filter((r) => selectedIds.includes(r.employee.id));

  const isTemporalActive =
    temporalFilter.mode !== "all" || temporalFilter.activityCategory !== "all";

  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5 shadow-xs space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">
              Colaboradores & Actividad
            </p>
            {isTemporalActive && (
              <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                Filtro temporal activo
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            {filteredRows.length} colaboradores
            {(searchName || filterEmpresa || isTemporalActive) && (
              <span className="text-amber-800 font-semibold">
                {" "}
                (filtrados de {rows.length})
              </span>
            )}{" "}
            · {withCount} con diagnóstico · {filteredRows.length - withCount}{" "}
            pendientes
          </p>
        </div>

        {/* Action Buttons - Admin Only */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Toggle activity columns */}
          <button
            type="button"
            onClick={() => setShowActivityColumns((prev) => !prev)}
            className={`rounded-[8px] px-3 py-2 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              showActivityColumns
                ? "bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100"
                : "bg-white text-ink border border-ink/20 hover:bg-cream"
            }`}
            title="Alternar vista de columnas de actividades (Perfil, Matriz, Proyectos, Comunidad)"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              {showActivityColumns
                ? "Ocultar columnas de actividad"
                : "Ver columnas de actividad"}
            </span>
          </button>

          {isAdmin && (
            <>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-ink-muted hover:text-ink px-2 py-1.5 font-medium cursor-pointer"
                >
                  Limpiar selección
                </button>
              )}

              {/* Restablecer Contraseña Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length > 0) {
                    setEmployeesToReset(
                      employees.filter((e) => selectedIds.includes(e.id)),
                    );
                  } else {
                    setEmployeesToReset(filteredRows.map((r) => r.employee));
                  }
                  setShowResetModal(true);
                }}
                className="rounded-[8px] bg-white border border-amber-300 hover:bg-amber-50 px-3 py-2 font-semibold text-xs flex items-center gap-1.5 text-amber-900 transition-all shadow-2xs cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  Restablecer contraseña
                  {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                </span>
              </button>

              {/* Resetear Introspección Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length > 0) {
                    setEmployeesToResetIntrospection(
                      employees.filter((e) => selectedIds.includes(e.id)),
                    );
                  } else {
                    setEmployeesToResetIntrospection(
                      filteredRows.map((r) => r.employee),
                    );
                  }
                  setShowResetIntrospectionModal(true);
                }}
                className="rounded-[8px] bg-white border border-rose-300 hover:bg-rose-50 px-3 py-2 font-semibold text-xs flex items-center gap-1.5 text-rose-900 transition-all shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>
                  Resetear introspección
                  {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                </span>
              </button>

              {/* Diligenciar Empresa Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length > 0) {
                    setEmployeesToEdit(
                      employees.filter((e) => selectedIds.includes(e.id)),
                    );
                  } else {
                    setEmployeesToEdit(filteredRows.map((r) => r.employee));
                  }
                  setShowEditModal(true);
                }}
                className="rounded-[8px] bg-white border border-ink/20 hover:bg-cream px-3 py-2 font-semibold text-xs flex items-center gap-1.5 text-ink transition-all shadow-2xs cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Diligenciar empresa
                  {selectedIds.length > 0
                    ? ` (${selectedIds.length})`
                    : ` (${filteredRows.length})`}
                </span>
              </button>

              {/* Descargar Informes Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length === 0) {
                    const withDiags = filteredRows
                      .filter((r) => r.diagnostic)
                      .map((r) => r.employee.id);
                    setSelectedIds(
                      withDiags.length > 0
                        ? withDiags
                        : filteredRows.map((r) => r.employee.id),
                    );
                  }
                  setShowBatchModal(true);
                }}
                className={`rounded-[8px] px-3.5 py-2 font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                  selectedIds.length > 0
                    ? "bg-amber-400 text-ink hover:bg-amber-300"
                    : "bg-ink text-white hover:bg-ink-soft"
                }`}
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Descargar informes
                  {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Activity Temporal Filter Control */}
      <ActivityTemporalFilter
        value={temporalFilter}
        onChange={setTemporalFilter}
        showCategoryFilter={true}
      />

      {/* Quick Summary Chips for the selected temporal window */}
      <div className="flex flex-wrap items-center gap-2 bg-cream/40 border border-ink/10 rounded-xl p-2.5 text-xs text-ink">
        <span className="font-bold text-[11px] uppercase tracking-wider text-ink-muted shrink-0 mr-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Resumen en período:
        </span>

        {/* Chip 1: Perfil de Apropiación */}
        <button
          type="button"
          onClick={() =>
            setTemporalFilter((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "diagnostico" ? "all" : "diagnostico",
            }))
          }
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            temporalFilter.activityCategory === "diagnostico"
              ? "bg-purple-900 text-white border-purple-950"
              : "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>
            Perfil de Apropiación: <strong>{windowStats.withDiag}</strong>
          </span>
        </button>

        {/* Chip 2: Matriz */}
        <button
          type="button"
          onClick={() =>
            setTemporalFilter((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "matriz" ? "all" : "matriz",
            }))
          }
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            temporalFilter.activityCategory === "matriz"
              ? "bg-blue-900 text-white border-blue-950"
              : "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          <span>
            Actividad en Matriz: <strong>{windowStats.withMatriz}</strong>
          </span>
        </button>

        {/* Chip 3: Proyectos */}
        <button
          type="button"
          onClick={() =>
            setTemporalFilter((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "proyecto" ? "all" : "proyecto",
            }))
          }
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            temporalFilter.activityCategory === "proyecto"
              ? "bg-emerald-900 text-white border-emerald-950"
              : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          <FolderPlus className="w-3 h-3" />
          <span>
            Proyectos IA: <strong>{windowStats.withProyecto}</strong>
          </span>
        </button>

        {/* Chip 4: Comunidad */}
        <button
          type="button"
          onClick={() =>
            setTemporalFilter((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "comunidad" ? "all" : "comunidad",
            }))
          }
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            temporalFilter.activityCategory === "comunidad"
              ? "bg-amber-900 text-white border-amber-950"
              : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>
            Comunidad & MIA: <strong>{windowStats.withComunidad}</strong>
          </span>
        </button>

        {/* Chip 5: Con las 4 */}
        <button
          type="button"
          onClick={() =>
            setTemporalFilter((prev) => ({
              ...prev,
              activityCategory:
                prev.activityCategory === "all_four" ? "all" : "all_four",
            }))
          }
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ml-auto ${
            temporalFilter.activityCategory === "all_four"
              ? "bg-teal-900 text-white border-teal-950"
              : "bg-teal-50 text-teal-950 border-teal-200 hover:bg-teal-100"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>
            Con las 4 completas: <strong>{windowStats.withAllFour}</strong>
          </span>
        </button>
      </div>

      {/* Filters Bar: Nombre & Empresa */}
      <div className="pt-2 border-t border-ink/10 flex flex-col sm:flex-row items-center gap-2.5">
        {/* Filter 1: By Name */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Filtrar por nombre, cédula o email..."
            className="w-full bg-cream/40 border border-ink/15 rounded-lg pl-9 pr-7 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
          />
          {searchName && (
            <button
              type="button"
              onClick={() => setSearchName("")}
              className="absolute right-2.5 top-2 text-ink-muted hover:text-ink text-xs p-0.5 cursor-pointer"
              title="Limpiar búsqueda por nombre"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter 2: By Company */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Building2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-700 pointer-events-none" />
          <select
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="w-full bg-cream/40 border border-ink/15 rounded-lg pl-9 pr-7 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium appearance-none cursor-pointer"
          >
            <option value="">Todas las empresas ({employees.length})</option>
            {companies.map((comp) => {
              const count = employees.filter(
                (e) => e.empresa?.trim() === comp,
              ).length;
              return (
                <option key={comp} value={comp}>
                  {comp} ({count})
                </option>
              );
            })}
            {missingEmpresaCount > 0 && (
              <option value="__none__">
                Sin empresa ({missingEmpresaCount})
              </option>
            )}
          </select>
          <div className="absolute right-2.5 top-2.5 pointer-events-none text-ink-muted text-[9px]">
            ▼
          </div>
        </div>

        {/* Clear Filters */}
        {(searchName || filterEmpresa || isTemporalActive) && (
          <button
            type="button"
            onClick={() => {
              setSearchName("");
              setFilterEmpresa("");
              setTemporalFilter({
                mode: "all",
                selectedWeek: weeksList[0]?.weekKey || "",
                selectedDay: todayStr,
                startDate: "2026-07-27",
                endDate: todayStr,
                activityCategory: "all",
              });
            }}
            className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300/80 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar todos los filtros</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: 420 }}
      >
        <table className="w-full text-[12.5px]">
          <thead className="sticky top-0 bg-white border-b border-ink/10 z-10">
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted">
              {isAdmin && (
                <th className="py-2.5 px-2 w-8">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    title={
                      allFilteredSelected
                        ? "Deseleccionar todos los filtrados"
                        : "Seleccionar todos los filtrados"
                    }
                    className="flex items-center text-ink-muted hover:text-ink cursor-pointer"
                  >
                    {selectedIds.length > 0 && allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-ink" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              <th className="py-2.5 pr-3 font-medium">Nombre</th>
              <th className="py-2.5 pr-3 font-medium">Empresa & Área</th>
              <th className="py-2.5 pr-3 font-medium">Perfil Global</th>
              <th className="py-2.5 pr-3 font-medium">Score</th>

              {/* Temporal Activity Columns */}
              {showActivityColumns && (
                <>
                  <th className="py-2.5 px-2 text-center font-medium text-purple-950 bg-purple-50/50">
                    🎯 Perfil Período
                  </th>
                  <th className="py-2.5 px-2 text-center font-medium text-blue-950 bg-blue-50/50">
                    📊 Matriz
                  </th>
                  <th className="py-2.5 px-2 text-center font-medium text-emerald-950 bg-emerald-50/50">
                    🚀 Proyectos
                  </th>
                  <th className="py-2.5 px-2 text-center font-medium text-amber-950 bg-amber-50/50">
                    🌐 Comunidad
                  </th>
                </>
              )}

              <th className="py-2.5 pr-3 text-right" />
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    isAdmin
                      ? showActivityColumns
                        ? 10
                        : 6
                      : showActivityColumns
                        ? 9
                        : 5
                  }
                  className="py-8 text-center text-ink-muted text-xs"
                >
                  No se encontraron colaboradores con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const { employee, diagnostic } = row;
                const isSelected = selectedIds.includes(employee.id);

                if (!diagnostic) {
                  return (
                    <tr
                      key={`${employee.id}-${idx}`}
                      className={`border-t border-ink/5 transition-colors ${
                        isSelected ? "bg-amber-50/50" : ""
                      }`}
                      style={{ background: isSelected ? "#FEF9EE" : "#FFFBF5" }}
                    >
                      {isAdmin && (
                        <td
                          className="py-2.5 px-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(employee.id)}
                            className="w-4 h-4 rounded border-ink/20 text-ink focus:ring-ink shrink-0 cursor-pointer accent-ink"
                          />
                        </td>
                      )}
                      <td
                        className="py-2.5 pr-3 text-ink cursor-pointer font-medium"
                        onClick={() => onStartQuiz(employee.id)}
                      >
                        <div className="font-semibold text-ink">
                          {employee.name}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {employee.email || employee.cedula || "—"}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-soft">
                        <div className="font-medium">
                          {employee.empresa || "—"}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {employee.area || "—"}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-muted">
                        Sin diagnóstico
                      </td>
                      <td className="py-2.5 pr-3 text-ink-muted">—</td>

                      {/* Temporal Activity Columns */}
                      {showActivityColumns && (
                        <>
                          <td className="py-2.5 px-2 text-center bg-purple-50/30">
                            {row.hasDiagnostico ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-purple-700" />
                                <span>Realizado</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center bg-blue-50/30">
                            {row.hasMatriz ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-blue-700" />
                                <span>{row.matrizCount} act</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center bg-emerald-50/30">
                            {row.hasProyecto ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>{row.proyectoCount} proy</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center bg-amber-50/30">
                            {row.hasComunidad ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-amber-700" />
                                <span>{row.comunidadCount} act</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px]">
                                —
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      <td className="py-2.5 pr-3 text-right text-[11px] font-medium text-tier1">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmployeesToResetIntrospection([employee]);
                                  setShowResetIntrospectionModal(true);
                                }}
                                title="Resetear introspección para iniciar de cero"
                                className="p-1 rounded text-ink-muted hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmployeesToReset([employee]);
                                  setShowResetModal(true);
                                }}
                                title="Restablecer contraseña"
                                className="p-1 rounded text-ink-muted hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmployeesToEdit([employee]);
                                  setShowEditModal(true);
                                }}
                                title="Editar empresa y datos"
                                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onStartQuiz(employee.id)}
                            className="hover:underline ml-1 cursor-pointer font-semibold text-emerald-800"
                          >
                            Iniciar →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                const cfg = PERFIL_CONFIG[diagnostic.perfil];

                return (
                  <tr
                    key={`${employee.id}-${idx}`}
                    className={`border-t border-ink/5 transition-colors ${
                      isSelected ? "bg-amber-50/70" : "hover:bg-cream"
                    }`}
                  >
                    {isAdmin && (
                      <td
                        className="py-2.5 px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(employee.id)}
                          className="w-4 h-4 rounded border-ink/20 text-ink focus:ring-ink shrink-0 cursor-pointer accent-ink"
                        />
                      </td>
                    )}
                    <td
                      className="py-2.5 pr-3 text-ink cursor-pointer font-medium"
                      onClick={() => onOpenDetail(employee.id)}
                    >
                      <div className="font-semibold text-ink">
                        {employee.name}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {employee.email || employee.cedula || "—"}
                      </div>
                    </td>
                    <td
                      className="py-2.5 pr-3 text-ink-soft cursor-pointer"
                      onClick={() => onOpenDetail(employee.id)}
                    >
                      <div className="font-medium">
                        {employee.empresa || "—"}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {employee.area || "—"}
                      </div>
                    </td>
                    <td
                      className="py-2.5 pr-3 cursor-pointer"
                      onClick={() => onOpenDetail(employee.id)}
                    >
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-medium inline-block"
                        style={{
                          background: cfg?.light || "#F1F5F9",
                          color: cfg?.dark || "#1E293B",
                        }}
                      >
                        {diagnostic.perfil}
                      </span>
                    </td>
                    <td
                      className="py-2.5 pr-3 text-ink font-bold cursor-pointer"
                      onClick={() => onOpenDetail(employee.id)}
                    >
                      {diagnostic.total_score}/60
                    </td>

                    {/* Temporal Activity Columns */}
                    {showActivityColumns && (
                      <>
                        {/* 1. Perfil en periodo */}
                        <td className="py-2.5 px-2 text-center bg-purple-50/30">
                          {row.hasDiagnostico ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-purple-700" />
                                <span>{diagnostic.perfil}</span>
                              </span>
                              {row.lastDiagnosticoDate && (
                                <span className="text-[9.5px] text-purple-700 mt-0.5">
                                  {formatDatePretty(
                                    row.lastDiagnosticoDate,
                                    false,
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-muted text-[11px]">
                              —
                            </span>
                          )}
                        </td>

                        {/* 2. Matriz */}
                        <td className="py-2.5 px-2 text-center bg-blue-50/30">
                          {row.hasMatriz ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-blue-700" />
                                <span>{row.matrizCount} tareas</span>
                              </span>
                              {row.lastMatrizDate && (
                                <span className="text-[9.5px] text-blue-700 mt-0.5">
                                  {formatDatePretty(row.lastMatrizDate, false)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-muted text-[11px]">
                              —
                            </span>
                          )}
                        </td>

                        {/* 3. Proyectos */}
                        <td className="py-2.5 px-2 text-center bg-emerald-50/30">
                          {row.hasProyecto ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>{row.proyectoCount} proy</span>
                              </span>
                              {row.lastProyectoDate && (
                                <span className="text-[9.5px] text-emerald-700 mt-0.5">
                                  {formatDatePretty(
                                    row.lastProyectoDate,
                                    false,
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-muted text-[11px]">
                              —
                            </span>
                          )}
                        </td>

                        {/* 4. Comunidad */}
                        <td className="py-2.5 px-2 text-center bg-amber-50/30">
                          {row.hasComunidad ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-amber-700" />
                                <span>{row.comunidadCount} act</span>
                              </span>
                              {row.lastComunidadDate && (
                                <span className="text-[9.5px] text-amber-700 mt-0.5">
                                  {formatDatePretty(
                                    row.lastComunidadDate,
                                    false,
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-muted text-[11px]">
                              —
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    <td className="py-2.5 pr-3 text-right text-[11px] text-ink-muted">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmployeesToResetIntrospection([employee]);
                                setShowResetIntrospectionModal(true);
                              }}
                              title="Resetear introspección para iniciar de cero"
                              className="p-1 rounded text-ink-muted hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmployeesToReset([employee]);
                                setShowResetModal(true);
                              }}
                              title="Restablecer contraseña"
                              className="p-1 rounded text-ink-muted hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmployeesToEdit([employee]);
                                setShowEditModal(true);
                              }}
                              title="Editar empresa y datos"
                              className="p-1 rounded text-ink-muted hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenDetail(employee.id)}
                          className="hover:text-ink hover:underline font-medium ml-1 cursor-pointer"
                        >
                          Ver detalle →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <BatchReportModal
        open={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        selectedRows={selectedRows}
      />

      <EditEmployeesModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        employeesToEdit={employeesToEdit}
        onSaved={() => {
          onReload?.();
        }}
      />

      <ResetPasswordModal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        employeesToReset={employeesToReset}
        onSaved={() => {
          onReload?.();
        }}
      />

      <ResetIntrospectionModal
        open={showResetIntrospectionModal}
        onClose={() => setShowResetIntrospectionModal(false)}
        employeesToReset={employeesToResetIntrospection}
        onSaved={() => {
          setSelectedIds([]);
          onReload?.();
        }}
      />
    </div>
  );
}
