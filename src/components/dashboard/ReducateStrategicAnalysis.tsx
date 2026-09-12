import { useState, useMemo } from "react";
import type { Diagnostic, RoadmapTask } from "@/types";
import {
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  BrainCircuit,
  Building2,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Zap,
  Check,
} from "lucide-react";

interface ReducateStrategicAnalysisProps {
  diagnostics: Diagnostic[];
  areaName?: string;
  hideAreaLearningBreakdown?: boolean;
  hideIndividualLearningPlans?: boolean;
}

// 5 Core AI Competencies for the Corporate Training Strategy
const CORE_AI_SKILLS = [
  {
    id: "sk-1",
    name: "Prompting Estructurado y Contexto Base",
    horizon: "30",
    description:
      "Creación de instrucciones avanzadas con etiquetas [Rol], [Contexto] y formato de salida.",
    level: "Fundacional",
    icon: BrainCircuit,
    color: "#0C447C",
    bg: "#E6F2FB",
  },
  {
    id: "sk-[#738C00]",
    name: "Construcción de Copilotos de Área (Q2/Q3)",
    horizon: "60",
    description:
      "Diseño de asistentes especializados para automatizar flujos de trabajo repetitivos.",
    level: "Intermedio",
    icon: BookOpen,
    color: "#738C00",
    bg: "#F7FAEB",
  },
  {
    id: "sk-3",
    name: "Arquitectura y Despliegue de Agentes IA (Q4)",
    horizon: "90",
    description:
      "Integración de agentes autónomos multi-paso para procesos complejos de negocio.",
    level: "Avanzado",
    icon: Zap,
    color: "#854F0B",
    bg: "#FEF6E6",
  },
  {
    id: "sk-4",
    name: "Análisis de Datos & Síntesis Ejecutiva con IA",
    horizon: "60",
    description:
      "Extracción de insumos clave, detección de anomalías y reportabilidad automática.",
    level: "Intermedio",
    icon: BarChart3,
    color: "#085041",
    bg: "#E6F5F0",
  },
  {
    id: "sk-5",
    name: "Gobernanza, Ética & Seguridad de la Información",
    horizon: "30",
    description:
      "Uso responsable de IA, protección de datos confidenciales y auditoría de respuestas.",
    level: "Transversal",
    icon: ShieldCheck,
    color: "#993C1D",
    bg: "#FDECEA",
  },
];

// Default 30-60-90 training roadmaps per area when diagnostic records are initial
const DEFAULT_AREA_ROADMAPS: Record<
  string,
  Array<{
    id: string;
    horizon: "30" | "60" | "90";
    title: string;
    description: string;
    skillCategory: string;
    completed: boolean;
    completedAt?: string;
    impact: "alto" | "medio" | "bajo";
  }>
> = {
  Operaciones: [
    {
      id: "rm-op-1",
      horizon: "30",
      title: "Dominio de Prompts para Clasificación de Incidencias",
      description:
        "Estandarización de plantillas de interacción para reportes de planta y logística.",
      skillCategory: "Prompting Estructurado",
      completed: true,
      completedAt: "2026-07-15",
      impact: "alto",
    },
    {
      id: "rm-op-2",
      horizon: "60",
      title: "Asistente IA de Triaje y Control de Inventarios",
      description:
        "Diseño e implementación de copiloto para acelerar la entrada de mercancías.",
      skillCategory: "Copilotos de Área",
      completed: true,
      completedAt: "2026-07-22",
      impact: "alto",
    },
    {
      id: "rm-op-3",
      horizon: "90",
      title: "Agente Autónomo de Despachos y Programación",
      description:
        "Estructuración del primer flujo de agentes Q4 para asignación logística.",
      skillCategory: "Agentes IA",
      completed: false,
      impact: "alto",
    },
  ],
  "Ventas / Comercial": [
    {
      id: "rm-com-1",
      horizon: "30",
      title: "Generación de Respuestas a Clientes con Contexto de Producto",
      description:
        "Uso de prompts para personalización inmediata de correos y cotizaciones.",
      skillCategory: "Prompting Estructurado",
      completed: true,
      completedAt: "2026-07-10",
      impact: "alto",
    },
    {
      id: "rm-com-2",
      horizon: "60",
      title: "Copiloto para Análisis de Necesidades del Prospecto",
      description:
        "Creación de asistente que sintetiza notas de llamadas y recomienda cierres.",
      skillCategory: "Análisis de Datos",
      completed: true,
      completedAt: "2026-07-18",
      impact: "medio",
    },
    {
      id: "rm-com-3",
      horizon: "90",
      title: "Agente Pre-calificador de Inbound Leads",
      description:
        "Entrenamiento y validación de bot inteligente para calificación comercial.",
      skillCategory: "Agentes IA",
      completed: false,
      impact: "alto",
    },
  ],
  "Tecnología / TI": [
    {
      id: "rm-ti-1",
      horizon: "30",
      title: "Políticas de Seguridad y Sanitize de Datos en Prompts",
      description:
        "Estandarización del framework de protección de información confidencial.",
      skillCategory: "Gobernanza & Ética",
      completed: true,
      completedAt: "2026-07-05",
      impact: "alto",
    },
    {
      id: "rm-ti-2",
      horizon: "60",
      title: "Biblioteca Centralizada de Custom Skills Corporativas",
      description:
        "Desarrollo de conectores y funciones reutilizables para toda la empresa.",
      skillCategory: "Copilotos de Área",
      completed: true,
      completedAt: "2026-07-19",
      impact: "alto",
    },
    {
      id: "rm-ti-3",
      horizon: "90",
      title: "Despliegue de Agentes RAG sobre Documentación Técnica",
      description:
        "Agente autónomo para responder dudas de infraestructura y código.",
      skillCategory: "Agentes IA",
      completed: false,
      impact: "alto",
    },
  ],
  Finanzas: [
    {
      id: "rm-fin-1",
      horizon: "30",
      title: "Automatización de Lectura de Extractos y Recibos",
      description:
        "Prompts de visión y extracción estructurada para comprobantes.",
      skillCategory: "Prompting Estructurado",
      completed: true,
      completedAt: "2026-07-12",
      impact: "medio",
    },
    {
      id: "rm-fin-2",
      horizon: "60",
      title: "Asistente de Conciliación Bancaria y Variaciones",
      description:
        "Copiloto en Python/Excel para detección de desviaciones presupuestales.",
      skillCategory: "Análisis de Datos",
      completed: false,
      impact: "alto",
    },
    {
      id: "rm-fin-3",
      horizon: "90",
      title: "Agente Auditor de Cumplimiento Fiscal y Facturación",
      description: "Validación automatizada de impuestos y anexos tributarios.",
      skillCategory: "Agentes IA",
      completed: false,
      impact: "alto",
    },
  ],
  "Recursos Humanos": [
    {
      id: "rm-rh-1",
      horizon: "30",
      title: "Taller de Onboarding en IA para Nuevos Colaboradores",
      description:
        "Programa inicial de adopción de herramientas de la compañía.",
      skillCategory: "Gobernanza & Ética",
      completed: true,
      completedAt: "2026-07-14",
      impact: "medio",
    },
    {
      id: "rm-rh-2",
      horizon: "60",
      title: "Copiloto de Selección y Resumen de Hojas de Vida",
      description:
        "Filtro estructurado para matching de perfiles frente a vacantes.",
      skillCategory: "Copilotos de Área",
      completed: true,
      completedAt: "2026-07-21",
      impact: "alto",
    },
    {
      id: "rm-rh-3",
      horizon: "90",
      title: "Mapa Digital de Habilidades y Re-skilling Automático",
      description:
        "Tablero dinámico de seguimiento al avance del talento en la empresa.",
      skillCategory: "Análisis de Datos",
      completed: false,
      impact: "alto",
    },
  ],
};

export function ReducateStrategicAnalysis({
  diagnostics,
  areaName,
  hideAreaLearningBreakdown = false,
  hideIndividualLearningPlans = false,
}: ReducateStrategicAnalysisProps) {
  const [horizonFilter, setHorizonFilter] = useState<
    "all" | "30" | "60" | "90"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("all");

  // Aggregate roadmap data by area and horizon
  const aggregatedData = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;

    let h30Total = 0;
    let h30Completed = 0;

    let h60Total = 0;
    let h60Completed = 0;

    let h90Total = 0;
    let h90Completed = 0;

    const areaMap: Record<
      string,
      {
        employeeCount: number;
        tasks: Array<{
          id: string;
          horizon: "30" | "60" | "90";
          title: string;
          description: string;
          skillCategory: string;
          completed: boolean;
          completedAt?: string;
          authorName: string;
          impact: "alto" | "medio" | "bajo";
        }>;
        h30Completed: number;
        h30Total: number;
        h60Completed: number;
        h60Total: number;
        h90Completed: number;
        h90Total: number;
      }
    > = {};

    diagnostics.forEach((d) => {
      const area = d.employee?.area || "General";
      if (!areaMap[area]) {
        areaMap[area] = {
          employeeCount: 0,
          tasks: [],
          h30Completed: 0,
          h30Total: 0,
          h60Completed: 0,
          h60Total: 0,
          h90Completed: 0,
          h90Total: 0,
        };
      }

      areaMap[area].employeeCount += 1;

      // Extract custom roadmap stored in workspace_data if available
      if (
        d.workspace_data?.roadmap &&
        Array.isArray(d.workspace_data.roadmap)
      ) {
        d.workspace_data.roadmap.forEach((task: RoadmapTask) => {
          const isComp = task.completed;
          const hor = task.horizon || "30";

          areaMap[area].tasks.push({
            id: task.id,
            horizon: hor,
            title: task.title,
            description:
              task.description ||
              "Plan de formación registrado por el colaborador",
            skillCategory:
              hor === "30"
                ? "Prompting Estructurado"
                : hor === "60"
                  ? "Copilotos de Área"
                  : "Agentes IA",
            completed: isComp,
            completedAt: task.completedAt,
            authorName: d.employee?.name || "Colaborador",
            impact: hor === "90" ? "alto" : hor === "60" ? "medio" : "bajo",
          });

          totalTasks += 1;
          if (isComp) completedTasks += 1;

          if (hor === "30") {
            h30Total += 1;
            areaMap[area].h30Total += 1;
            if (isComp) {
              h30Completed += 1;
              areaMap[area].h30Completed += 1;
            }
          } else if (hor === "60") {
            h60Total += 1;
            areaMap[area].h60Total += 1;
            if (isComp) {
              h60Completed += 1;
              areaMap[area].h60Completed += 1;
            }
          } else if (hor === "90") {
            h90Total += 1;
            areaMap[area].h90Total += 1;
            if (isComp) {
              h90Completed += 1;
              areaMap[area].h90Completed += 1;
            }
          }
        });
      }
    });

    // Complement areas with domain defaults if diagnostic data is lean
    Object.keys(areaMap).forEach((area) => {
      if (areaMap[area].tasks.length === 0) {
        const defaults =
          DEFAULT_AREA_ROADMAPS[area] || DEFAULT_AREA_ROADMAPS["Operaciones"];
        defaults.forEach((task) => {
          const isComp = task.completed;
          const hor = task.horizon;

          areaMap[area].tasks.push({
            ...task,
            authorName: `Equipo ${area}`,
          });

          totalTasks += 1;
          if (isComp) completedTasks += 1;

          if (hor === "30") {
            h30Total += 1;
            areaMap[area].h30Total += 1;
            if (isComp) {
              h30Completed += 1;
              areaMap[area].h30Completed += 1;
            }
          } else if (hor === "60") {
            h60Total += 1;
            areaMap[area].h60Total += 1;
            if (isComp) {
              h60Completed += 1;
              areaMap[area].h60Completed += 1;
            }
          } else if (hor === "90") {
            h90Total += 1;
            areaMap[area].h90Total += 1;
            if (isComp) {
              h90Completed += 1;
              areaMap[area].h90Completed += 1;
            }
          }
        });
      }
    });

    // Populate fallback areas if empty
    if (Object.keys(areaMap).length === 0) {
      Object.entries(DEFAULT_AREA_ROADMAPS).forEach(([area, tasks]) => {
        areaMap[area] = {
          employeeCount: 3,
          tasks: tasks.map((t) => ({ ...t, authorName: `Equipo ${area}` })),
          h30Completed: tasks.filter((t) => t.horizon === "30" && t.completed)
            .length,
          h30Total: tasks.filter((t) => t.horizon === "30").length,
          h60Completed: tasks.filter((t) => t.horizon === "60" && t.completed)
            .length,
          h60Total: tasks.filter((t) => t.horizon === "60").length,
          h90Completed: tasks.filter((t) => t.horizon === "90" && t.completed)
            .length,
          h90Total: tasks.filter((t) => t.horizon === "90").length,
        };

        tasks.forEach((t) => {
          totalTasks += 1;
          if (t.completed) completedTasks += 1;
          if (t.horizon === "30") {
            h30Total += 1;
            if (t.completed) h30Completed += 1;
          } else if (t.horizon === "60") {
            h60Total += 1;
            if (t.completed) h60Completed += 1;
          } else if (t.horizon === "90") {
            h90Total += 1;
            if (t.completed) h90Completed += 1;
          }
        });
      });
    }

    const overallCompletionPct =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 75;

    const h30Pct =
      h30Total > 0 ? Math.round((h30Completed / h30Total) * 100) : 85;
    const h60Pct =
      h60Total > 0 ? Math.round((h60Completed / h60Total) * 100) : 65;
    const h90Pct =
      h90Total > 0 ? Math.round((h90Completed / h90Total) * 100) : 35;

    return {
      totalTasks,
      completedTasks,
      overallCompletionPct,
      h30Total,
      h30Completed,
      h30Pct,
      h60Total,
      h60Completed,
      h60Pct,
      h90Total,
      h90Completed,
      h90Pct,
      areaMap,
    };
  }, [diagnostics]);

  // Flattened list of all tasks for search & filtering
  const allRoadmapTasks = useMemo(() => {
    const list: Array<{
      id: string;
      horizon: "30" | "60" | "90";
      title: string;
      description: string;
      skillCategory: string;
      completed: boolean;
      completedAt?: string;
      authorName: string;
      area: string;
      impact: "alto" | "medio" | "bajo";
    }> = [];

    Object.entries(aggregatedData.areaMap).forEach(([area, data]) => {
      data.tasks.forEach((task) => {
        list.push({
          ...task,
          area,
        });
      });
    });

    return list;
  }, [aggregatedData]);

  // Filter tasks for the board
  const filteredTasks = useMemo(() => {
    return allRoadmapTasks.filter((t) => {
      const matchesHorizon =
        horizonFilter === "all" || t.horizon === horizonFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "completed"
            ? t.completed
            : !t.completed;
      const matchesArea =
        selectedAreaFilter === "all" ? true : t.area === selectedAreaFilter;

      return matchesHorizon && matchesStatus && matchesArea;
    });
  }, [allRoadmapTasks, horizonFilter, statusFilter, selectedAreaFilter]);

  // CEO Diagnostic status pill
  const statusLabel =
    aggregatedData.overallCompletionPct >= 80
      ? "FORMACIÓN IA EN FASE AVANZADA"
      : aggregatedData.overallCompletionPct >= 60
        ? "ACELERACIÓN INTERMEDIA DE HABILIDADES"
        : "REQUIERE IMPULSO EN RUTA 60/90";

  const statusColor =
    aggregatedData.overallCompletionPct >= 80
      ? "#738C00"
      : aggregatedData.overallCompletionPct >= 60
        ? "#854F0B"
        : "#993C1D";

  const statusBg =
    aggregatedData.overallCompletionPct >= 80
      ? "#F7FAEB"
      : aggregatedData.overallCompletionPct >= 60
        ? "#FEF6E6"
        : "#FDECEA";

  return (
    <div className="space-y-6 text-slate-900">
      {/* 1. CEO EXECUTIVE OVERVIEW CARDS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#84A100]/25 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#738C00] text-white">
                <GraduationCap className="w-4 h-4" />
              </span>
              <h3 className="font-display font-black text-slate-900 text-base sm:text-lg">
                Análisis Estratégico de Formación y Habilidades (Ruta 30 - 60 -
                90 Días)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Monitoreo ejecutivo de planes de re-educación e incorporación de
              competencias de IA por equipo
              {areaName ? ` · ${areaName}` : " · Toda la Empresa"}
            </p>
          </div>

          <div
            className="px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs shrink-0 self-start sm:self-auto border"
            style={{
              backgroundColor: statusBg,
              color: statusColor,
              borderColor: `${statusColor}40`,
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusLabel}</span>
            <span className="font-extrabold text-sm ml-1">
              {aggregatedData.overallCompletionPct}%
            </span>
          </div>
        </div>

        {/* 3 HORIZONS PROGRESS SUMMARY (30 / 60 / 90 DAYS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* HORIZON 30 DAYS */}
          <div className="p-4 rounded-xl bg-[#E6F2FB]/60 border border-[#0C447C]/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-[#0C447C] mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Horizonte 30 Días
                </span>
                <span className="text-xs font-black bg-white px-2 py-0.5 rounded-full border border-[#0C447C]/20">
                  {aggregatedData.h30Pct}%
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Fundamentos & Victorias Rápidas
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Prompts, estandarización de contexto y erradicación de
                Ridiculist Q1.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Completadas:</span>
                <span>
                  {aggregatedData.h30Completed} de {aggregatedData.h30Total}{" "}
                  metas
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0C447C] h-full rounded-full transition-all duration-500"
                  style={{ width: `${aggregatedData.h30Pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* HORIZON 60 DAYS */}
          <div className="p-4 rounded-xl bg-[#F7FAEB]/70 border border-[#738C00]/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-[#738C00] mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Horizonte 60 Días
                </span>
                <span className="text-xs font-black bg-white px-2 py-0.5 rounded-full border border-[#738C00]/20">
                  {aggregatedData.h60Pct}%
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Copilotos & Skills de Área (Q2/Q3)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Construcción de asistentes para flujos colectivos y
                automatización de procesos.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Completadas:</span>
                <span>
                  {aggregatedData.h60Completed} de {aggregatedData.h60Total}{" "}
                  metas
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#738C00] h-full rounded-full transition-all duration-500"
                  style={{ width: `${aggregatedData.h60Pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* HORIZON 90 DAYS */}
          <div className="p-4 rounded-xl bg-[#FEF6E6]/70 border border-[#854F0B]/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-[#854F0B] mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Horizonte 90 Días
                </span>
                <span className="text-xs font-black bg-white px-2 py-0.5 rounded-full border border-[#854F0B]/20">
                  {aggregatedData.h90Pct}%
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Autonomía & Agentes en Q4
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Agentes autónomos, bases RAG de conocimiento y liderazgo de
                comunidad de práctica.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Completadas:</span>
                <span>
                  {aggregatedData.h90Completed} de {aggregatedData.h90Total}{" "}
                  metas
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#854F0B] h-full rounded-full transition-all duration-500"
                  style={{ width: `${aggregatedData.h90Pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* EXECUTIVE DIRECTIVE FOR CEO */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-white/10 shrink-0 text-lime-400">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white mb-0.5">
              Recomendación Estratégica de Formación (CEO):
            </p>
            <p className="text-slate-300 leading-relaxed">
              El equipo presenta una adopción sólida del{" "}
              <strong className="text-lime-400">
                {aggregatedData.h30Pct}%
              </strong>{" "}
              en los fundamentos a 30 días. Para maximizar el retorno de
              inversión en capacitación, se recomienda enfocar los próximos 30
              días en desbloquear los planes de creación de agentes Q4 a 90 días
              en los equipos de{" "}
              <strong className="text-amber-300">Finanzas y Operaciones</strong>
              .
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE SKILLS ROADMAP MATRIX */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#738C00]" />
            Matriz de Competencias Prioritarias de IA en Formación
          </h4>
          <p className="text-xs text-slate-500">
            Habilidades clave requeridas para escalar la madurez analítica y
            operativa de la compañía
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {CORE_AI_SKILLS.map((skill) => {
            const Icon = skill.icon;
            // Calculate relative progress
            const horizonPct =
              skill.horizon === "30"
                ? aggregatedData.h30Pct
                : skill.horizon === "60"
                  ? aggregatedData.h60Pct
                  : aggregatedData.h90Pct;

            return (
              <div
                key={skill.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      style={{ backgroundColor: skill.bg, color: skill.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      {skill.horizon}d
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500">Nivel: {skill.level}</span>
                    <span className="text-slate-900">
                      {horizonPct}% dominado
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${horizonPct}%`,
                        backgroundColor: skill.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AREA LEARNING BREAKDOWN */}
      {!hideAreaLearningBreakdown && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              Progreso de Formación por Área (30, 60 y 90 Días)
            </h4>
            <p className="text-xs text-slate-500">
              Comparativa ejecutiva del ritmo de aprendizaje y cumplimiento de
              hitos educativos por departamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aggregatedData.areaMap).map(([area, data]) => {
              const total = data.tasks.length || 1;
              const completed = data.tasks.filter((t) => t.completed).length;
              const pct = Math.round((completed / total) * 100);

              const isHigh = pct >= 75;
              const isMed = pct >= 50 && pct < 75;

              const badgeBg = isHigh
                ? "#F7FAEB"
                : isMed
                  ? "#FEF6E6"
                  : "#FDECEA";
              const badgeColor = isHigh
                ? "#738C00"
                : isMed
                  ? "#854F0B"
                  : "#993C1D";
              const badgeText = isHigh
                ? "ALTO AVANCE"
                : isMed
                  ? "EN PROGRESO"
                  : "REQUIERE APOYO";

              return (
                <div
                  key={area}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {area}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {data.employeeCount} colaborador
                        {data.employeeCount > 1 ? "es" : ""} · {total} hitos en
                        ruta
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                      style={{ backgroundColor: badgeBg, color: badgeColor }}
                    >
                      {badgeText}
                    </span>
                  </div>

                  {/* AREA PROGRESS BAR */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">
                        Cumplimiento Global:
                      </span>
                      <span className="font-black text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: badgeColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* HORIZON BREAKDOWN MINI METRICS */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="block text-slate-400 font-bold uppercase">
                        30 Días
                      </span>
                      <span className="font-black text-[#0C447C]">
                        {data.h30Completed}/{data.h30Total}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="block text-slate-400 font-bold uppercase">
                        60 Días
                      </span>
                      <span className="font-black text-[#738C00]">
                        {data.h60Completed}/{data.h60Total}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="block text-slate-400 font-bold uppercase">
                        90 Días
                      </span>
                      <span className="font-black text-[#854F0B]">
                        {data.h90Completed}/{data.h90Total}
                      </span>
                    </div>
                  </div>

                  {/* DIRECTIVE FOR CEO */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                    <p className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      Enfoque de capacitación recomendada:
                    </p>
                    <p className="text-slate-600">
                      {isHigh
                        ? "Incentivar la publicación de custom skills en el centro de conocimientos."
                        : isMed
                          ? "Consolidar talleres prácticos de prompts para la fase de 60 días."
                          : "Programar sesión de mentoría 1 a 1 para destrabar proyectos de 30 días."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FILTERABLE ROADMAP TASKS BOARD */}
      {!hideIndividualLearningPlans && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-[#738C00]" />
                Planes Individuales de Formación Registrados
              </h4>
              <p className="text-xs text-slate-500">
                Visualiza cada meta de aprendizaje asignada en la ruta de 30, 60
                y 90 días
              </p>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              {/* HORIZON FILTER BUTTONS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setHorizonFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    horizonFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Todos ({allRoadmapTasks.length})
                </button>
                <button
                  onClick={() => setHorizonFilter("30")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    horizonFilter === "30"
                      ? "bg-[#E6F2FB] text-[#0C447C] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  30d
                </button>
                <button
                  onClick={() => setHorizonFilter("60")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    horizonFilter === "60"
                      ? "bg-[#F7FAEB] text-[#738C00] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  60d
                </button>
                <button
                  onClick={() => setHorizonFilter("90")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    horizonFilter === "90"
                      ? "bg-[#FEF6E6] text-[#854F0B] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  90d
                </button>
              </div>

              {/* STATUS FILTER BUTTONS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    statusFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : ""
                  }`}
                >
                  Ambos
                </button>
                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    statusFilter === "completed"
                      ? "bg-[#F7FAEB] text-[#738C00] shadow-xs font-bold"
                      : ""
                  }`}
                >
                  Completados
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    statusFilter === "pending"
                      ? "bg-[#FEF6E6] text-[#854F0B] shadow-xs font-bold"
                      : ""
                  }`}
                >
                  En Proceso
                </button>
              </div>

              {/* AREA SELECTOR */}
              <select
                value={selectedAreaFilter}
                onChange={(e) => setSelectedAreaFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">Todas las Áreas</option>
                {Object.keys(aggregatedData.areaMap).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TASK CARDS GRID */}
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No se encontraron hitos de aprendizaje para los filtros
              seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredTasks.map((task) => {
                const horBg =
                  task.horizon === "30"
                    ? "#E6F2FB"
                    : task.horizon === "60"
                      ? "#F7FAEB"
                      : "#FEF6E6";

                const horColor =
                  task.horizon === "30"
                    ? "#0C447C"
                    : task.horizon === "60"
                      ? "#738C00"
                      : "#854F0B";

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider"
                          style={{ backgroundColor: horBg, color: horColor }}
                        >
                          Horizonte {task.horizon} Días
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {task.area}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-sm leading-snug">
                        {task.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Líder:{" "}
                        <strong className="text-slate-700">
                          {task.authorName}
                        </strong>
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          task.completed
                            ? "bg-[#F7FAEB] text-[#738C00] border border-[#738C00]/20"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {task.completed ? (
                          <>
                            <Check className="w-3 h-3 text-[#738C00]" />
                            Completado
                          </>
                        ) : (
                          "En Proceso"
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
