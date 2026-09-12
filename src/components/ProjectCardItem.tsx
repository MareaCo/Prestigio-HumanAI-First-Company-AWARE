import React, { useState } from "react";
import {
  Users,
  Globe,
  Share2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Target,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import type { WorkspaceProject } from "@/types";
import { COMPANY_STRATEGIC_OBJECTIVES } from "@/lib/constants";

interface ProjectCardItemProps {
  project: WorkspaceProject;
  onUpdateStatus: (
    id: string,
    status: "idea" | "en_proceso" | "completado",
  ) => void;
  onUpdateParticipants: (id: string, participants: string) => void;
  onTogglePublish: (id: string) => void;
  onToggleObjective: (id: string, objectiveId: string) => void;
  onUpdateDocField: (
    id: string,
    field: "keyOutcome" | "usedPrompt" | "resourceLink",
    value: string,
  ) => void;
  onDelete: (id: string) => void;
}

export function ProjectCardItem({
  project,
  onUpdateStatus,
  onUpdateParticipants,
  onTogglePublish,
  onToggleObjective,
  onUpdateDocField,
  onDelete,
}: ProjectCardItemProps) {
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Check objective helper
  const isObjectiveChecked = (objId: string) => {
    return project.strategicObjectives?.includes(objId) ?? false;
  };

  // Calculate documentation progress
  const docFieldsCount = [
    Boolean(project.keyOutcome?.trim()),
    Boolean(project.usedPrompt?.trim()),
    Boolean(project.resourceLink?.trim()),
  ].filter(Boolean).length;

  const handleCopyPrompt = () => {
    if (!project.usedPrompt) return;
    navigator.clipboard.writeText(project.usedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getObjectiveIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return Zap;
      case "Target":
        return Target;
      case "TrendingUp":
        return TrendingUp;
      case "Lightbulb":
        return Lightbulb;
      case "ShieldCheck":
        return ShieldCheck;
      default:
        return Target;
    }
  };

  return (
    <div className="p-4 bg-white border border-ink/10 rounded-xl hover:border-ink/20 transition-all shadow-2xs space-y-3.5">
      {/* Top Header: Dimensions + Publish Toggle + Delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {project.dimension || "General"}
            </span>
            {project.impact === "alto" || project.highImpactStatus ? (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                  (project.highImpactStatus || "postulado") === "aprobado"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : (project.highImpactStatus || "postulado") === "rechazado"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-[#EFEFE9] text-[#2C3328] border border-[#70756B]/40 font-extrabold"
                }`}
              >
                <Sparkles className="w-3 h-3 shrink-0 text-[#70756B]" />
                {(project.highImpactStatus || "postulado") === "aprobado"
                  ? "Alto Impacto Aprobado"
                  : (project.highImpactStatus || "postulado") === "rechazado"
                    ? `Postulación Rechazada (${project.impact})`
                    : "Postulado a Alto Impacto"}
              </span>
            ) : (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  project.impact === "medio"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Impacto {project.impact}
              </span>
            )}

            {project.isPublished && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                <Globe className="w-3 h-3" />
                Publicado en Comunidad
              </span>
            )}
          </div>

          <h4 className="font-bold text-sm text-ink pt-0.5">{project.title}</h4>
          {project.description && (
            <p className="text-xs text-ink-muted">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Publicar en Comunidad Button */}
          <button
            onClick={() => onTogglePublish(project.id)}
            title={
              project.isPublished
                ? "Haz clic para retirar de la Comunidad"
                : "Haz clic para publicar este proyecto en la Comunidad HumanAI"
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
              project.isPublished
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                : "bg-cream text-ink hover:bg-amber-500 hover:text-white border border-ink/10"
            }`}
          >
            {project.isPublished ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publicado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Publicar en Comunidad</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDelete(project.id)}
            className="text-ink-muted hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Eliminar proyecto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Participantes / Otras personas que participaron */}
      <div className="pt-2 border-t border-ink/5">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-ink-muted shrink-0 font-medium">
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-semibold text-ink">Participantes:</span>
          </div>
          <input
            type="text"
            value={project.participants || ""}
            onChange={(e) => onUpdateParticipants(project.id, e.target.value)}
            placeholder="Ej. Juan Pérez, Ana Restrepo, Equipo de Ventas…"
            className="flex-1 bg-cream/40 hover:bg-cream focus:bg-white border border-transparent hover:border-ink/10 focus:border-ink/20 rounded-md px-2.5 py-1 text-xs text-ink focus:outline-none transition-all placeholder:italic placeholder:text-ink-muted/50"
          />
        </div>
      </div>

      {/* Objetivos Estratégicos ALIGN (Checkboxes) */}
      <div className="pt-2 border-t border-ink/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-ink flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-600" />
            Alineación con Objetivos Estratégicos (ALIGN):
          </span>
          <span className="text-[10px] text-ink-muted">
            {project.strategicObjectives?.length || 0} de 5 alineados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {COMPANY_STRATEGIC_OBJECTIVES.map((obj) => {
            const checked = isObjectiveChecked(obj.id);
            const IconComponent = getObjectiveIcon(obj.iconName);

            return (
              <label
                key={obj.id}
                className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  checked
                    ? `${obj.bg} ${obj.border} font-medium shadow-2xs`
                    : "bg-cream/30 border-ink/10 hover:bg-cream/60 text-ink-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleObjective(project.id, obj.id)}
                  className="mt-0.5 rounded border-ink/20 text-ink focus:ring-amber-400 accent-amber-600 shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <IconComponent
                      className="w-3 h-3 shrink-0"
                      style={{ color: obj.color }}
                    />
                    <span
                      className={`text-[11px] leading-tight truncate ${
                        checked ? "font-bold text-ink" : ""
                      }`}
                    >
                      {obj.shortTitle}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Documentación del Proyecto (Cero Fricción) */}
      <div className="pt-2 border-t border-ink/5">
        <button
          onClick={() => setShowDocPanel(!showDocPanel)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-amber-50/50 hover:bg-amber-50 border border-amber-200/50 text-xs font-medium text-amber-950 transition-all"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">
              Documentación Rápida del Proyecto (Cero Fricción)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 ml-1">
              {docFieldsCount}/3 Completado
            </span>
          </div>

          <div className="flex items-center gap-1 text-ink-muted">
            <span className="text-[10px]">
              {showDocPanel ? "Ocultar" : "Editar Ficha"}
            </span>
            {showDocPanel ? (
              <ChevronUp className="w-3.5 h-3.5 text-amber-800" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
            )}
          </div>
        </button>

        {showDocPanel && (
          <div className="mt-2.5 p-3.5 bg-slate-50/80 border border-ink/10 rounded-xl space-y-3 animate-in fade-in duration-150">
            {/* Field 1: Key Outcome / Resultado Clave */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1 flex items-center justify-between">
                <span>📝 Resultado o Aprendizaje Clave (1 frase)</span>
                <span className="text-[10px] text-ink-muted font-normal">
                  ¿Qué beneficio o ahorro se logró?
                </span>
              </label>
              <input
                type="text"
                value={project.keyOutcome || ""}
                onChange={(e) =>
                  onUpdateDocField(project.id, "keyOutcome", e.target.value)
                }
                placeholder="Ej. Redujimos de 4 horas a 15 min la entrega del informe semanal y ahorramos 12h/mes…"
                className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Field 2: Prompt / Flujo Utilizado */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-ink">
                  🤖 Prompt o Instrucción Clave Utilizada (Opcional)
                </label>
                {project.usedPrompt && (
                  <button
                    onClick={handleCopyPrompt}
                    className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Prompt</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={project.usedPrompt || ""}
                onChange={(e) =>
                  onUpdateDocField(project.id, "usedPrompt", e.target.value)
                }
                placeholder="Pega aquí la instrucción principal o el sistema de prompts configurado…"
                className="w-full p-2 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Field 3: Link / Herramienta */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-ink">
                  🔗 Enlace a la Herramienta / Bot / Documento (Opcional)
                </label>
                {project.resourceLink && (
                  <a
                    href={project.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Abrir Enlace</span>
                  </a>
                )}
              </div>
              <input
                type="url"
                value={project.resourceLink || ""}
                onChange={(e) =>
                  onUpdateDocField(project.id, "resourceLink", e.target.value)
                }
                placeholder="Ej. https://chatgpt.com/g/... o https://docs.google.com/..."
                className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer: Status + Creation Date */}
      <div className="pt-2 border-t border-ink/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-ink-muted text-xs font-medium">Estado:</span>
          <select
            value={project.status}
            onChange={(e) =>
              onUpdateStatus(
                project.id,
                e.target.value as "idea" | "en_proceso" | "completado",
              )
            }
            className="bg-cream border border-ink/10 rounded-md px-2.5 py-1 text-xs font-semibold text-ink focus:outline-none focus:border-amber-400"
          >
            <option value="idea">💡 Idea</option>
            <option value="en_proceso">⚙️ En Proceso</option>
            <option value="completado">✅ Completado</option>
          </select>
        </div>

        <span className="text-ink-muted text-[11px]">
          Creado el {project.createdAt}
        </span>
      </div>
    </div>
  );
}
