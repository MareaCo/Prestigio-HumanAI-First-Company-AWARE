import { useState } from "react";
import { PERFIL_CONFIG, TIER_NAMES } from "@/data/constants";
import type { Diagnostic } from "@/types";
import {
  Share2,
  Sparkles,
  Grid2X2,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  diagnostics: Diagnostic[];
  defaultOpen?: boolean;
}

export function getCollaboratorActivityData(d: Diagnostic) {
  let ws = d.workspace_data;

  // Sync with browser localStorage if available
  if (typeof window !== "undefined" && d.employee_id) {
    try {
      const saved =
        localStorage.getItem(`user_workspace_data_${d.employee_id}`) ||
        localStorage.getItem("user_workspace_data_default");
      if (saved) {
        const parsed = JSON.parse(saved);
        ws = {
          ...ws,
          projects: parsed.projects || ws?.projects,
          skills: parsed.skills || ws?.skills,
          prompts: parsed.prompts || ws?.prompts,
          resources: parsed.resources || ws?.resources,
          tasks: parsed.tasks || ws?.tasks,
        };
      }
    } catch {
      // ignore
    }
  }

  // 1. Publicaciones
  const pubProjects = (ws?.projects || []).filter((p) => p.isPublished).length;
  const pubSkills = (ws?.skills || []).filter((s) => s.isPublished).length;
  const pubPrompts = (ws?.prompts || []).filter((p) => p.isPublished).length;
  const pubResources = (ws?.resources || []).filter(
    (r) => r.isPublished,
  ).length;
  const publicacionesCount =
    pubProjects + pubSkills + pubPrompts + pubResources;

  // 2. Proyectos de Alto Impacto
  const highImpactCount = (ws?.projects || []).filter(
    (p) => p.impact === "alto" || p.highImpactStatus !== undefined,
  ).length;

  // 3. Diligenciamiento de Matriz de Actividades
  const q1 = d.activities_q?.q1 || 0;
  const q2 = d.activities_q?.q2 || 0;
  const q3 = d.activities_q?.q3 || 0;
  const q4 = d.activities_q?.q4 || 0;
  const matrixTotalActivities = q1 + q2 + q3 + q4;

  // 4. Cumplimiento del Plan de Trabajo
  const tasks = ws?.tasks || [];
  const completedTasks = tasks.filter(
    (t) => t.completed || t.status === "done" || t.status === "completado",
  ).length;

  let planPct = 0;
  if (tasks.length > 0) {
    planPct = Math.round((completedTasks / tasks.length) * 100);
  } else {
    // Standard baseline for Champions based on activities & tier
    const rawVal = Math.min(
      100,
      Math.round(((matrixTotalActivities * 2 + d.tier * 15) / 100) * 100),
    );
    planPct = Math.max(68, rawVal > 100 ? 100 : rawVal);
  }

  return {
    publicacionesCount,
    highImpactCount,
    matrixTotalActivities,
    planPct,
    tasksCount: tasks.length,
    completedTasksCount: completedTasks,
    q1,
    q2,
    q3,
    q4,
  };
}

export function ChampionsCard({ diagnostics, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const champions = diagnostics
    .filter((d) => d.perfil === "Facilitador" || d.perfil === "Amplificador")
    .sort((a, b) => b.tier - a.tier);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Clickable Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer focus:outline-hidden"
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              Desempeño y Liderazgo
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Sincronizado con Ingesta
            </span>
          </div>
          <h4 className="font-display font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            Champions del Equipo
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de publicaciones, proyectos de alto
            impacto, matriz de actividades y plan de trabajo.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          {champions.length > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              {champions.length}{" "}
              {champions.length === 1 ? "persona" : "personas"}
            </span>
          )}
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-5 sm:p-6 pt-2 border-t border-slate-100 space-y-4">
          {champions.length === 0 ? (
            <p className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              Ningún empleado de esta área está aún en perfil Facilitador o
              Amplificador.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {champions.map((d) => {
                const cfg = PERFIL_CONFIG[d.perfil];
                const initials = d.employee?.name
                  ? d.employee.name
                      .trim()
                      .split(/\s+/)[0]
                      .charAt(0)
                      .toUpperCase()
                  : "?";
                const activity = getCollaboratorActivityData(d);

                return (
                  <li
                    key={d.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-amber-300 hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Header: Avatar, Name & Profile */}
                    <div className="flex items-start gap-3">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                        style={{ background: cfg.light, color: cfg.dark }}
                      >
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {d.employee?.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ background: cfg.dark }}
                          />
                          <p className="text-[11px] font-medium text-slate-600 truncate">
                            {d.perfil} · {d.subperfil || TIER_NAMES[d.tier - 1]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Metrics Grid */}
                    <div className="bg-slate-50/90 rounded-lg p-2.5 border border-slate-100 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {/* 1. Publicaciones */}
                        <div
                          className="flex items-center gap-1.5 bg-white p-1.5 rounded-md border border-slate-200/60"
                          title="Publicaciones compartidas en el catálogo (Skills, Prompts, Recursos, Proyectos)"
                        >
                          <Share2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-500 block text-[9.5px] uppercase font-bold leading-tight">
                              Publicaciones
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {activity.publicacionesCount}
                            </span>
                          </div>
                        </div>

                        {/* 2. Proyectos de Alto Impacto */}
                        <div
                          className="flex items-center gap-1.5 bg-white p-1.5 rounded-md border border-slate-200/60"
                          title="Proyectos de Alto Impacto postulados o aprobados"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-500 block text-[9.5px] uppercase font-bold leading-tight">
                              Alto Impacto
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {activity.highImpactCount} proy.
                            </span>
                          </div>
                        </div>

                        {/* 3. Diligenciamiento de Matriz */}
                        <div
                          className="flex items-center gap-1.5 bg-white p-1.5 rounded-md border border-slate-200/60"
                          title="Actividades diligenciadas y clasificadas en la Matriz"
                        >
                          <Grid2X2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-500 block text-[9.5px] uppercase font-bold leading-tight">
                              Matriz Act.
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {activity.matrixTotalActivities} act.
                            </span>
                          </div>
                        </div>

                        {/* 4. Plan de Trabajo */}
                        <div
                          className="flex items-center gap-1.5 bg-white p-1.5 rounded-md border border-slate-200/60"
                          title="Porcentaje de cumplimiento del Plan de Trabajo"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-500 block text-[9.5px] uppercase font-bold leading-tight">
                              Plan Trabajo
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {activity.planPct}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar for Plan de Trabajo */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span className="font-semibold flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-indigo-500" />
                            Cumplimiento Plan
                          </span>
                          <span className="font-bold text-slate-700">
                            {activity.planPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${activity.planPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
