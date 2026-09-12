import { useState } from "react";
import { useMatriz, type Activity, type Quadrant } from "@/hooks/useMatriz";
import { tierById } from "@/data/scoring";
import {
  FolderKanban,
  CheckSquare,
  Square,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Props {
  tierId: number;
  diagnosticId: string | null;
  onConvertToProjects?: (activities: Activity[]) => void;
}

interface QuadDef {
  key: Quadrant;
  label: string;
  color: string;
  light: string;
  dark: string;
  minTier: number;
  method: string;
}

const QUADS: QuadDef[] = [
  {
    key: "q2",
    label: "Q2 · Asistentes & Asistentes Especializados",
    color: "#E8A83A",
    light: "#FEF6E6",
    dark: "#854F0B",
    minTier: 2,
    method: "Copiloto con prompts",
  },
  {
    key: "q4",
    label: "Q4 · Agentes & Generación de Código",
    color: "#1A6E9E",
    light: "#E6F2FB",
    dark: "#0C447C",
    minTier: 4,
    method: "Sistemas integrados",
  },
  {
    key: "q1",
    label: "Q1 · Ridiculist",
    color: "#E8534A",
    light: "#FDECEA",
    dark: "#993C1D",
    minTier: 1,
    method: "Eliminar o delegar",
  },
  {
    key: "q3",
    label: "Q3 · Automatización",
    color: "#3A8E6E",
    light: "#E6F5F0",
    dark: "#085041",
    minTier: 3,
    method: "Flujos autónomos",
  },
];

export function MatrizInteractiva({
  tierId,
  diagnosticId,
  onConvertToProjects,
}: Props) {
  const { activities, loading, alert, addActivity, removeActivity } = useMatriz(
    tierId,
    diagnosticId,
  );
  const [name, setName] = useState("");
  const [valor, setValor] = useState("");
  const [freq, setFreq] = useState("");
  const [mins, setMins] = useState<number | "">("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [conversionSuccessMsg, setConversionSuccessMsg] = useState<
    string | null
  >(null);

  const inputBorder =
    alert?.type === "error"
      ? "border-tier1"
      : alert?.type === "warn"
        ? "border-tier3"
        : "border-ink/10";

  async function handleAdd() {
    const minsNum = typeof mins === "number" ? mins : Number(mins);
    if (
      !name.trim() ||
      !valor ||
      !freq ||
      !mins ||
      isNaN(minsNum) ||
      minsNum <= 0
    ) {
      await addActivity(name, valor, freq, minsNum);
      return;
    }
    await addActivity(name, valor, freq, minsNum);
    setName("");
    setValor("");
    setFreq("");
    setMins("");
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === activities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activities.map((a) => a.id));
    }
  };

  const handleConvertSelected = () => {
    const selected = activities.filter((a) => selectedIds.includes(a.id));
    if (selected.length === 0) return;

    if (onConvertToProjects) {
      onConvertToProjects(selected);
      setConversionSuccessMsg(
        `¡${selected.length} ${
          selected.length === 1 ? "tarea convertida" : "tareas convertidas"
        } a Proyecto(s) de IA con éxito!`,
      );
      setTimeout(() => setConversionSuccessMsg(null), 4000);
      setSelectedIds([]);
    }
  };

  return (
    <section
      className="bg-white mb-5 border border-ink/5"
      style={{ borderRadius: 16, padding: "1.75rem" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-ink-muted">
            Matriz de actividades
          </p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            Describe tus actividades reales, quedan guardadas automáticamente y
            la IA sugiere su posición.
          </p>
        </div>

        {activities.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 self-start sm:self-auto font-medium"
          >
            {selectedIds.length === activities.length ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-ink" />
                Deseleccionar todo
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5" />
                Seleccionar todo ({activities.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Conversion Toast Notification */}
      {conversionSuccessMsg && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {conversionSuccessMsg}
          </span>
          <span className="text-[10px] uppercase tracking-wide bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
            Ver en tab Proyectos
          </span>
        </div>
      )}

      {/* Floating Action Bar when tasks are selected */}
      {selectedIds.length > 0 && (
        <div className="mt-4 p-3 bg-ink text-cream rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-ink font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-medium">
              {selectedIds.length === 1
                ? "1 tarea seleccionada de la matriz"
                : `${selectedIds.length} tareas seleccionadas de la matriz`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-[11px] text-cream/70 hover:text-white"
            >
              Deseleccionar
            </button>

            {onConvertToProjects && (
              <button
                type="button"
                onClick={handleConvertSelected}
                className="px-3.5 py-1.5 bg-amber-400 text-ink hover:bg-amber-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Pasar a Proyectos
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="mt-4 rounded-[12px] bg-cream p-5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: preparar el reporte semanal de ventas con datos del CRM"
          className={`w-full h-10 px-3 rounded-[8px] border bg-white text-[13px] focus:outline-none focus:border-ink transition-colors ${inputBorder}`}
        />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
          >
            <option value="">Valor…</option>
            <option value="alto">Alto valor</option>
            <option value="bajo">Bajo valor</option>
          </select>
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
            className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
          >
            <option value="">Frecuencia…</option>
            <option value="alta">Alta frecuencia</option>
            <option value="baja">Baja frecuencia</option>
          </select>
          <input
            type="number"
            min={1}
            value={mins}
            onChange={(e) =>
              setMins(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="Minutos"
            className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
          />
        </div>

        {alert && (
          <div
            className="mt-3 rounded-[8px] px-3 py-2 text-[12px]"
            style={{
              background: alert.type === "error" ? "#FDECEA" : "#FEF6E6",
              color: alert.type === "error" ? "#993C1D" : "#854F0B",
            }}
          >
            {alert.msg}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-4 w-full sm:w-auto rounded-[8px] bg-ink text-white text-[13px] font-medium px-[18px] py-[10px] hover:bg-ink-soft disabled:opacity-50"
        >
          {loading ? "Analizando…" : "+ Agregar a la Matriz"}
        </button>
      </div>

      {/* Quadrants */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUADS.map((q) => (
          <QuadrantCard
            key={q.key}
            def={q}
            activities={activities.filter((a) => a.quadrant === q.key)}
            tierId={tierId}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onRemove={removeActivity}
          />
        ))}
      </div>

      {/* Summary */}
      {activities.length > 0 && <ActivitySummary activities={activities} />}
    </section>
  );
}

function QuadrantCard({
  def,
  activities,
  tierId,
  selectedIds,
  onToggleSelect,
  onRemove,
}: {
  def: QuadDef;
  activities: Activity[];
  tierId: number;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const isLocked = tierId < def.minTier;
  const tierName = tierById(def.minTier).name;

  return (
    <div
      className="rounded-[12px] p-4 border transition-all"
      style={{
        background: isLocked ? "#F5F1EA" : def.light,
        borderColor: isLocked ? "rgba(0,0,0,0.06)" : def.color + "44",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: def.dark }}
        >
          {def.label}
        </p>
        <span className="text-[10px] text-ink-muted">
          {activities.length}/5
        </span>
      </div>
      <p className="text-[11px] mt-1" style={{ color: def.dark, opacity: 0.7 }}>
        {def.method}
      </p>
      {isLocked && (
        <p className="mt-2 text-[11px] italic text-ink-muted">
          Se habilita en el subperfil {tierName}
        </p>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {activities.length === 0 ? (
          <p className="text-[11px] text-ink-muted">Aún sin actividades.</p>
        ) : (
          activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              isSelected={selectedIds.includes(a.id)}
              onToggleSelect={onToggleSelect}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  isSelected,
  onToggleSelect,
  onRemove,
}: {
  activity: Activity;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={`bg-white rounded-[10px] p-2.5 border transition-all ${
        isSelected
          ? "border-amber-400 ring-2 ring-amber-300/40 shadow-xs"
          : "border-ink/10 hover:border-ink/20"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(activity.id)}
          className="mt-0.5 w-4 h-4 rounded border-ink/20 text-ink focus:ring-ink shrink-0 cursor-pointer accent-ink"
          title="Seleccionar para proyecto"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12px] font-medium text-ink leading-snug">
              {activity.name}
            </p>
            <button
              onClick={() => onRemove(activity.id)}
              className="text-ink-muted hover:text-tier1 text-[14px] leading-none p-0.5 shrink-0"
              aria-label="Eliminar"
            >
              ×
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {activity.mins} min · original
          </p>

          {activity.locked && (
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-ink/10 text-ink-muted">
              Pendiente de nivel
            </span>
          )}
          {activity.analysis &&
            (() => {
              const minsWithAI = Math.min(
                activity.mins,
                Math.max(0, activity.analysis.minutos_optimizados),
              );
              const minsSaved = Math.max(0, activity.mins - minsWithAI);
              const pctSaved =
                activity.mins > 0
                  ? Math.round((minsSaved / activity.mins) * 100)
                  : 0;

              return (
                <p
                  className="mt-1.5 text-[11px] leading-snug"
                  style={{ color: "#0E4B37" }}
                >
                  ↓ {minsWithAI} min con IA · ahorra {minsSaved} min ({pctSaved}
                  %)
                </p>
              );
            })()}
          {activity.unclear && (
            <p className="mt-1.5 text-[11px]" style={{ color: "#854F0B" }}>
              ⚠ Descripción poco clara — sin estimación
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivitySummary({ activities }: { activities: Activity[] }) {
  const counts = { q1: 0, q2: 0, q3: 0, q4: 0 };
  activities.forEach((a) => {
    counts[a.quadrant] += 1;
  });
  const locked = activities.filter((a) => a.locked).length;

  const parts: string[] = [];
  if (counts.q1) parts.push(`${counts.q1} en Q1 por eliminar`);
  if (counts.q2) parts.push(`${counts.q2} en Q2 para asistentes`);
  if (counts.q3) parts.push(`${counts.q3} en Q3 para automatizar`);
  if (counts.q4) parts.push(`${counts.q4} en Q4 para agentes`);

  return (
    <div className="mt-5 rounded-[10px] bg-cream p-4">
      <p className="text-[12px] text-ink">
        <span className="font-medium">
          {activities.length} actividades mapeadas:
        </span>{" "}
        {parts.join(" · ")}.
      </p>
      {locked > 0 && (
        <p className="mt-1 text-[11px] text-ink-soft">
          Tienes {locked}{" "}
          {locked === 1 ? "actividad pendiente" : "actividades pendientes"} de
          nivel — el plan de 30 días te llevará ahí.
        </p>
      )}
    </div>
  );
}
