import { useState, useMemo, useEffect } from "react";
import type { Diagnostic, WorkspaceProject } from "@/types";
import { ANDRES_MATRIZ_ACTIVITIES, ANDRES_PROJECTS } from "@/data/seedData";
import {
  ActivityTemporalFilter,
  TemporalFilterState,
} from "@/components/dashboard/ActivityTemporalFilter";
import {
  generateWeeksRange,
  getTodayDateStr,
  isDateInRange,
  formatDatePretty,
} from "@/lib/dateUtils";
import { getActivityEventsFn } from "@/lib/bigquery.functions";
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Sparkles,
  ArrowUpRight,
  Zap,
  Filter,
  BarChart2,
  FolderKanban,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Activity,
  Search,
  Calendar,
  Clock,
  RotateCcw,
} from "lucide-react";

interface AlignStrategicAnalysisProps {
  diagnostics: Diagnostic[];
  areaName?: string;
  hideAreaAlignmentBreakdown?: boolean;
  hideRegisteredProjects?: boolean;
}

// Corporate Strategic Objectives defined for company alignment analysis
const COMPANY_OBJECTIVES = [
  {
    id: "obj-5",
    title: "Nuevas Propuestas de Valor Cliente / Consumidor",
    description:
      "Diseño y desarrollo de productos, servicios y experiencias transformadas por Inteligencia Artificial.",
    targetArea: "Producto, Innovación y Clientes",
    weight: 20,
    icon: Lightbulb,
    color: "#5B21B6",
    bg: "#F3E8FF",
  },
  {
    id: "obj-4",
    title: "Gobernanza, Cultura & Adopción Responsable",
    description:
      "Uso ético, prompts estructurados y desarrollo de habilidades en toda la plantilla.",
    targetArea: "Recursos Humanos y Liderazgo",
    weight: 15,
    icon: ShieldCheck,
    color: "#085041",
    bg: "#E6F5F0",
  },
  {
    id: "obj-3",
    title: "Aceleración Comercial & Expansión de Clientes (Q2)",
    description:
      "Uso de copilotos y asistentes IA para personalizar propuestas y acelerar ventas.",
    targetArea: "Comercial, Ventas y Marketing",
    weight: 20,
    icon: TrendingUp,
    color: "#854F0B",
    bg: "#FEF6E6",
  },
  {
    id: "obj-1",
    title: "Automatización e Integración de IA (Q3/Q4)",
    description:
      "Despliegue de agentes autónomos y flujos integrados que reduzcan trabajo manual.",
    targetArea: "Tecnología y Operaciones",
    weight: 25,
    icon: Zap,
    color: "#0C447C",
    bg: "#E6F2FB",
  },
  {
    id: "obj-2",
    title: "Eficiencia Operativa & Erradicación de Ridiculist (Q1)",
    description:
      "Eliminación o delegación de micro-tareas repetitivas de bajo valor.",
    targetArea: "Todas las áreas",
    weight: 20,
    icon: Target,
    color: "#993C1D",
    bg: "#FDECEA",
  },
];

// Default representative project benchmarks when collaborator records are sparse
const DEFAULT_AREA_PROJECTS: Record<
  string,
  Array<{
    id: string;
    title: string;
    description: string;
    dimension: string;
    status: "idea" | "en_proceso" | "completado";
    impact: "alto" | "medio" | "bajo";
    quadrant: "q1" | "q2" | "q3" | "q4";
    alignedObjectiveId: string;
    alignmentScore: number; // 0 - 100
  }>
> = {
  Operaciones: [
    {
      id: "p-op-1",
      title: "Agente IA de Triaje y Enrutamiento de Pedidos",
      description:
        "Agente autónomo para procesar órdenes entrantes y asignar prioridades automáticamente.",
      dimension: "Automatización",
      status: "en_proceso",
      impact: "alto",
      quadrant: "q4",
      alignedObjectiveId: "obj-1",
      alignmentScore: 95,
    },
    {
      id: "p-op-2",
      title: "Automatización de Reportes Diarios de Logística",
      description: "Generador de síntesis ejecutiva conectando datos del ERP.",
      dimension: "Datos",
      status: "completado",
      impact: "alto",
      quadrant: "q3",
      alignedObjectiveId: "obj-2",
      alignmentScore: 90,
    },
    {
      id: "p-op-3",
      title: "Consolidación Manual de Excel y Facturas",
      description: "Proceso tradicional de digitación repetitiva de planillas.",
      dimension: "Contexto",
      status: "idea",
      impact: "bajo",
      quadrant: "q1",
      alignedObjectiveId: "obj-2",
      alignmentScore: 30,
    },
  ],
  "Ventas / Comercial": [
    {
      id: "p-com-1",
      title: "Copiloto de Propuestas Comerciales Personalizadas",
      description:
        "Asistente IA para redactar propuestas ajustadas a las necesidades del cliente.",
      dimension: "Calidad",
      status: "en_proceso",
      impact: "alto",
      quadrant: "q2",
      alignedObjectiveId: "obj-3",
      alignmentScore: 92,
    },
    {
      id: "p-com-2",
      title: "Agente de Calificación Automática de Inbound Leads",
      description:
        "Bot que pre-califica prospectos antes de asignarlos al equipo de ventas.",
      dimension: "Automatización",
      status: "completado",
      impact: "alto",
      quadrant: "q4",
      alignedObjectiveId: "obj-1",
      alignmentScore: 96,
    },
    {
      id: "p-com-4",
      title: "Nuevas Propuestas de Valor e Interacción con Consumidor",
      description:
        "Co-creación asistida por IA de experiencias y ofertas hiper-personalizadas.",
      dimension: "Innovación",
      status: "en_proceso",
      impact: "alto",
      quadrant: "q4",
      alignedObjectiveId: "obj-5",
      alignmentScore: 95,
    },
    {
      id: "p-com-3",
      title: "Actualización Manual de Bitácora de CRM",
      description:
        "Carga repetitiva de registros de llamadas y correos sin integraciones.",
      dimension: "Contexto",
      status: "idea",
      impact: "bajo",
      quadrant: "q1",
      alignedObjectiveId: "obj-2",
      alignmentScore: 25,
    },
  ],
  "Tecnología / TI": [
    {
      id: "p-ti-1",
      title: "Sistemas Integrados RAG para Base de Conocimiento",
      description:
        "Búsqueda semántica en documentos técnicos y manuales corporativos.",
      dimension: "Automatización",
      status: "completado",
      impact: "alto",
      quadrant: "q4",
      alignedObjectiveId: "obj-1",
      alignmentScore: 98,
    },
    {
      id: "p-ti-2",
      title: "Librería Centralizada de Prompts Verificados",
      description:
        "Estandarización de plantillas de prompts seguros para la organización.",
      dimension: "Liderazgo",
      status: "en_proceso",
      impact: "medio",
      quadrant: "q2",
      alignedObjectiveId: "obj-4",
      alignmentScore: 88,
    },
  ],
  Finanzas: [
    {
      id: "p-fin-1",
      title: "Agente de Conciliación Bancaria y Cuentas por Cobrar",
      description:
        "Análisis cruzado automático entre extractos bancarios y facturación.",
      dimension: "Automatización",
      status: "en_proceso",
      impact: "alto",
      quadrant: "q4",
      alignedObjectiveId: "obj-1",
      alignmentScore: 94,
    },
    {
      id: "p-fin-2",
      title: "Revisión Manual de Recibos y Viáticos",
      description: "Verificación persona a persona de comprobantes físicos.",
      dimension: "Calidad",
      status: "idea",
      impact: "bajo",
      quadrant: "q1",
      alignedObjectiveId: "obj-2",
      alignmentScore: 35,
    },
  ],
  "Recursos Humanos": [
    {
      id: "p-rh-1",
      title: "Asistente IA para Onboarding y Consultas de Empleados",
      description:
        "Respuestas automáticas a dudas sobre beneficios, políticas y certificaciones.",
      dimension: "Autonomía",
      status: "completado",
      impact: "medio",
      quadrant: "q2",
      alignedObjectiveId: "obj-4",
      alignmentScore: 85,
    },
    {
      id: "p-rh-2",
      title: "Mapeo de Brechas de Talento y Rutas de Aprendizaje AI",
      description:
        "Evaluación continua del progreso de los colaboradores en el marco AWARE.",
      dimension: "Mentalidad",
      status: "en_proceso",
      impact: "alto",
      quadrant: "q3",
      alignedObjectiveId: "obj-4",
      alignmentScore: 90,
    },
  ],
};

export function AlignStrategicAnalysis({
  diagnostics,
  areaName,
  hideAreaAlignmentBreakdown = false,
  hideRegisteredProjects = false,
}: AlignStrategicAnalysisProps) {
  const todayStr = getTodayDateStr();
  const weeksList = useMemo(() => generateWeeksRange("2026-07-27"), []);

  // Temporal filter state for Align section
  const [temporalFilter, setTemporalFilter] = useState<TemporalFilterState>({
    mode: "all",
    selectedWeek:
      weeksList.find((w) => w.isCurrentWeek)?.weekKey ||
      weeksList[0]?.weekKey ||
      "",
    selectedDay: todayStr,
    startDate: "2026-07-27",
    endDate: todayStr,
    activityCategory: "all",
  });

  const [activityEvents, setActivityEvents] = useState<
    Record<string, unknown>[]
  >([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch real activity events from BigQuery
  useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        setLoadingEvents(true);
        const res = await getActivityEventsFn({
          data: { fromDate: "2026-07-27T08:00:00" },
        });
        if (isMounted && Array.isArray(res)) {
          setActivityEvents(res as Record<string, unknown>[]);
        }
      } catch (err) {
        console.error("Error loading activity events in Align:", err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    }
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("all");
  const [postulationTab, setPostulationTab] = useState<
    "all" | "postulado" | "aprobado" | "rechazado"
  >("all");
  const [isPostulationsOpen, setIsPostulationsOpen] = useState<boolean>(false);

  // States for Accordion 1: Workspace Activities Matrix
  const [isActivitiesMatrixOpen, setIsActivitiesMatrixOpen] =
    useState<boolean>(false);
  const [activitiesAreaFilter, setActivitiesAreaFilter] =
    useState<string>("all");
  const [activitiesSearch, setActivitiesSearch] = useState<string>("");

  // States for Accordion 2: Workspace Projects Matrix
  const [isProjectsMatrixOpen, setIsProjectsMatrixOpen] =
    useState<boolean>(false);
  const [projectsAreaFilter, setProjectsAreaFilter] = useState<string>("all");
  const [projectsStatusFilter, setProjectsStatusFilter] =
    useState<string>("all");
  const [projectsSearch, setProjectsSearch] = useState<string>("");

  // Extract all workspace activities from diagnostics and localStorage
  const allWorkspaceActivities = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      mins?: number;
      quadrant: "q1" | "q2" | "q3" | "q4";
      rationale?: string;
      authorName: string;
      authorArea: string;
      source: string;
      createdAt?: string;
    }> = [];

    diagnostics.forEach((d) => {
      const authorName = d.employee?.name || "Colaborador";
      const authorArea = d.employee?.area || "General";
      const diagDate =
        d.created_at ||
        ((d as Record<string, unknown>).submitted_at as string | undefined) ||
        "2026-07-27T08:30:00.000Z";

      // 1. Introspection activities
      if (d.activities_q?.items && Array.isArray(d.activities_q.items)) {
        d.activities_q.items.forEach((act, idx) => {
          items.push({
            id: act.id || `diag-act-${d.id}-${idx}`,
            name: act.name,
            mins: act.mins,
            quadrant: (act.quadrant as "q1" | "q2" | "q3" | "q4") || "q2",
            rationale:
              act.analysis?.rationale ||
              "Actividad registrada en evaluación de introspección",
            authorName,
            authorArea,
            source: "Introspección",
            createdAt:
              ((act as Record<string, unknown>).createdAt as string) ||
              diagDate,
          });
        });
      }

      // 2. Workspace roadmap tasks / activities
      if (d.workspace_data?.tasks && Array.isArray(d.workspace_data.tasks)) {
        d.workspace_data.tasks.forEach(
          (
            task: {
              id?: string;
              title?: string;
              name?: string;
              duration?: number;
              quadrant?: string;
              description?: string;
              horizon?: string;
              createdAt?: string;
            },
            idx: number,
          ) => {
            items.push({
              id: task.id || `ws-task-${d.id}-${idx}`,
              name: task.title || task.name || "Tarea sin título",
              mins: task.duration || 30,
              quadrant: (task.quadrant as "q1" | "q2" | "q3" | "q4") || "q2",
              rationale:
                task.description ||
                `Tarea de espacio de trabajo (${task.horizon || "30 días"})`,
              authorName,
              authorArea,
              source: "Espacio de Trabajo",
              createdAt: task.createdAt || diagDate,
            });
          },
        );
      }

      // 3. LocalStorage check for specific employee
      if (typeof window !== "undefined") {
        try {
          const empKey = d.employee_id || d.id;
          const savedMatriz = localStorage.getItem(
            `matriz_activities_${empKey}`,
          );
          if (savedMatriz) {
            const parsed = JSON.parse(savedMatriz);
            if (Array.isArray(parsed)) {
              parsed.forEach(
                (
                  act: {
                    id?: string;
                    name?: string;
                    mins?: number;
                    quadrant?: string;
                    analysis?: { rationale?: string };
                    createdAt?: string;
                  },
                  idx: number,
                ) => {
                  if (!items.some((e) => e.id === act.id)) {
                    items.push({
                      id: act.id || `local-act-${empKey}-${idx}`,
                      name: act.name || "Actividad sin nombre",
                      mins: act.mins,
                      quadrant:
                        (act.quadrant as "q1" | "q2" | "q3" | "q4") || "q2",
                      rationale:
                        act.analysis?.rationale ||
                        "Actividad registrada en workspace individual",
                      authorName,
                      authorArea,
                      source: "Espacio de Trabajo",
                      createdAt: act.createdAt || diagDate,
                    });
                  }
                },
              );
            }
          }
        } catch (_e) {
          // Ignore storage read errors
        }
      }
    });

    // Check default localStorage key
    if (typeof window !== "undefined") {
      try {
        const savedDefaultMatriz = localStorage.getItem(
          "matriz_activities_default",
        );
        if (savedDefaultMatriz) {
          const parsed = JSON.parse(savedDefaultMatriz);
          if (Array.isArray(parsed)) {
            parsed.forEach(
              (
                act: {
                  id?: string;
                  name?: string;
                  mins?: number;
                  quadrant?: string;
                  analysis?: { rationale?: string };
                  createdAt?: string;
                },
                idx: number,
              ) => {
                if (!items.some((e) => e.id === act.id)) {
                  items.push({
                    id: act.id || `local-act-default-${idx}`,
                    name: act.name || "Actividad sin nombre",
                    mins: act.mins,
                    quadrant:
                      (act.quadrant as "q1" | "q2" | "q3" | "q4") || "q2",
                    rationale:
                      act.analysis?.rationale ||
                      "Actividad registrada en workspace de colaborador",
                    authorName: "Andrés Piedrahita",
                    authorArea: "Tecnología",
                    source: "Espacio de Trabajo",
                    createdAt: act.createdAt || "2026-07-27T08:30:00.000Z",
                  });
                }
              },
            );
          }
        }
      } catch (_e) {
        // Ignore storage read errors
      }
    }

    // Fallback seed activities if list is sparse
    if (items.length === 0) {
      ANDRES_MATRIZ_ACTIVITIES.forEach((act, idx) => {
        items.push({
          id: act.id || `seed-act-${idx}`,
          name: act.name,
          mins: act.mins,
          quadrant: (act.quadrant as "q1" | "q2" | "q3" | "q4") || "q2",
          rationale:
            act.analysis?.rationale ||
            "Actividad declarada en espacio de trabajo",
          authorName: "Andrés Piedrahita",
          authorArea: "Tecnología",
          source: "Espacio de Trabajo",
          createdAt: "2026-07-27T08:30:00.000Z",
        });
      });
    }

    return items;
  }, [diagnostics]);

  // Extract all workspace projects from diagnostics and localStorage
  const allWorkspaceProjects = useMemo(() => {
    const projs: Array<{
      id: string;
      title: string;
      description: string;
      dimension?: string;
      status: "idea" | "en_proceso" | "completado";
      impact: "alto" | "medio" | "bajo";
      quadrant: "q1" | "q2" | "q3" | "q4";
      authorName: string;
      authorArea: string;
      createdAt?: string;
    }> = [];

    diagnostics.forEach((d) => {
      const authorName = d.employee?.name || "Colaborador";
      const authorArea = d.employee?.area || "General";
      const diagDate =
        d.created_at ||
        ((d as Record<string, unknown>).submitted_at as string | undefined) ||
        "2026-07-27T08:30:00.000Z";

      if (
        d.workspace_data?.projects &&
        Array.isArray(d.workspace_data.projects)
      ) {
        d.workspace_data.projects.forEach((p: WorkspaceProject) => {
          const q: "q1" | "q2" | "q3" | "q4" =
            p.impact === "alto" ? "q4" : p.impact === "medio" ? "q2" : "q1";

          if (!projs.some((existing) => existing.id === p.id)) {
            projs.push({
              id: p.id,
              title: p.title,
              description: p.description,
              dimension: p.dimension || "General",
              status: p.status,
              impact: p.impact,
              quadrant: q,
              authorName: p.authorName || authorName,
              authorArea: p.authorArea || authorArea,
              createdAt: p.createdAt || diagDate,
            });
          }
        });
      }

      if (typeof window !== "undefined") {
        try {
          const empKey = d.employee_id || d.id;
          const savedProjs = localStorage.getItem(
            `user_workspace_data_${empKey}_projects`,
          );
          if (savedProjs) {
            const parsed = JSON.parse(savedProjs);
            if (Array.isArray(parsed)) {
              parsed.forEach((p: WorkspaceProject) => {
                if (!projs.some((e) => e.id === p.id)) {
                  const q: "q1" | "q2" | "q3" | "q4" =
                    p.impact === "alto"
                      ? "q4"
                      : p.impact === "medio"
                        ? "q2"
                        : "q1";
                  projs.push({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    dimension: p.dimension || "General",
                    status: p.status,
                    impact: p.impact,
                    quadrant: q,
                    authorName: p.authorName || authorName,
                    authorArea: p.authorArea || authorArea,
                    createdAt: p.createdAt || diagDate,
                  });
                }
              });
            }
          }
        } catch (_e) {
          // Ignore storage read errors
        }
      }
    });

    if (typeof window !== "undefined") {
      try {
        const savedDefaultProjs = localStorage.getItem(
          "user_workspace_data_default_projects",
        );
        if (savedDefaultProjs) {
          const parsed = JSON.parse(savedDefaultProjs);
          if (Array.isArray(parsed)) {
            parsed.forEach((p: WorkspaceProject) => {
              if (!projs.some((e) => e.id === p.id)) {
                const q: "q1" | "q2" | "q3" | "q4" =
                  p.impact === "alto"
                    ? "q4"
                    : p.impact === "medio"
                      ? "q2"
                      : "q1";
                projs.push({
                  id: p.id,
                  title: p.title,
                  description: p.description,
                  dimension: p.dimension || "General",
                  status: p.status,
                  impact: p.impact,
                  quadrant: q,
                  authorName: "Andrés Piedrahita",
                  authorArea: "Tecnología",
                  createdAt: p.createdAt || "2026-07-27T08:30:00.000Z",
                });
              }
            });
          }
        }
      } catch (_e) {
        // Ignore storage read errors
      }
    }

    if (projs.length === 0) {
      ANDRES_PROJECTS.forEach((p) => {
        const q: "q1" | "q2" | "q3" | "q4" =
          p.impact === "alto" ? "q4" : p.impact === "medio" ? "q2" : "q1";
        projs.push({
          id: p.id,
          title: p.title,
          description: p.description,
          dimension: p.dimension || "General",
          status: p.status,
          impact: p.impact,
          quadrant: q,
          authorName: "Andrés Piedrahita",
          authorArea: "Tecnología",
          createdAt: p.createdAt || "2026-07-27T08:30:00.000Z",
        });
      });
    }

    return projs;
  }, [diagnostics]);

  // Filtered workspace activities with temporal + search + area filters
  const filteredWorkspaceActivities = useMemo(() => {
    const { startDate, endDate, activityCategory } = temporalFilter;
    if (activityCategory === "proyecto") return [];

    return allWorkspaceActivities.filter((act) => {
      // 1. Temporal filter
      const inDateRange = isDateInRange(act.createdAt, startDate, endDate);
      if (!inDateRange) return false;

      // 2. Area filter
      const matchesArea =
        activitiesAreaFilter === "all" ||
        act.authorArea === activitiesAreaFilter;

      // 3. Search query
      const matchesSearch =
        !activitiesSearch.trim() ||
        act.name.toLowerCase().includes(activitiesSearch.toLowerCase()) ||
        act.authorName.toLowerCase().includes(activitiesSearch.toLowerCase()) ||
        (act.rationale &&
          act.rationale.toLowerCase().includes(activitiesSearch.toLowerCase()));

      return matchesArea && matchesSearch;
    });
  }, [
    allWorkspaceActivities,
    activitiesAreaFilter,
    activitiesSearch,
    temporalFilter,
  ]);

  // Filtered workspace projects with temporal + status + area + search filters
  const filteredWorkspaceProjects = useMemo(() => {
    const { startDate, endDate, activityCategory } = temporalFilter;
    if (activityCategory === "matriz") return [];

    return allWorkspaceProjects.filter((proj) => {
      // 1. Temporal filter
      const inDateRange = isDateInRange(proj.createdAt, startDate, endDate);
      if (!inDateRange) return false;

      // 2. Area filter
      const matchesArea =
        projectsAreaFilter === "all" || proj.authorArea === projectsAreaFilter;

      // 3. Status filter
      const matchesStatus =
        projectsStatusFilter === "all" || proj.status === projectsStatusFilter;

      // 4. Search query
      const matchesSearch =
        !projectsSearch.trim() ||
        proj.title.toLowerCase().includes(projectsSearch.toLowerCase()) ||
        proj.description.toLowerCase().includes(projectsSearch.toLowerCase()) ||
        proj.authorName.toLowerCase().includes(projectsSearch.toLowerCase());

      return matchesArea && matchesStatus && matchesSearch;
    });
  }, [
    allWorkspaceProjects,
    projectsAreaFilter,
    projectsStatusFilter,
    projectsSearch,
    temporalFilter,
  ]);

  // Local storage map for organizational decisions on high impact postulations
  const [decisionsMap, setDecisionsMap] = useState<
    Record<
      string,
      {
        status: "aprobado" | "rechazado" | "postulado";
        evaluatedAt?: string;
        notes?: string;
        newImpact?: "alto" | "medio" | "bajo";
      }
    >
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("org_high_impact_decisions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleDecision = (
    projId: string,
    status: "aprobado" | "rechazado",
    newImpact?: "alto" | "medio" | "bajo",
    notes?: string,
  ) => {
    const nextMap = {
      ...decisionsMap,
      [projId]: {
        status,
        evaluatedAt: new Date().toISOString(),
        notes: notes || decisionsMap[projId]?.notes || "",
        newImpact: newImpact || (status === "aprobado" ? "alto" : "medio"),
      },
    };
    setDecisionsMap(nextMap);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "org_high_impact_decisions",
        JSON.stringify(nextMap),
      );
    }
  };

  // Extract all collaborator registered projects & activities
  const aggregatedData = useMemo(() => {
    let totalQ1 = 0;
    let totalQ2 = 0;
    let totalQ3 = 0;
    let totalQ4 = 0;

    const { startDate, endDate, activityCategory } = temporalFilter;

    const areaMap: Record<
      string,
      {
        employeeCount: number;
        q1: number;
        q2: number;
        q3: number;
        q4: number;
        projects: Array<{
          id: string;
          title: string;
          description: string;
          dimension: string;
          status: "idea" | "en_proceso" | "completado";
          impact: "alto" | "medio" | "bajo";
          highImpactStatus?: "postulado" | "aprobado" | "rechazado";
          highImpactDecisionNotes?: string;
          highImpactEvaluatedAt?: string;
          quadrant: "q1" | "q2" | "q3" | "q4";
          authorName?: string;
          alignedObjectiveId: string;
          alignmentScore: number;
        }>;
      }
    > = {};

    diagnostics.forEach((d) => {
      const area = d.employee?.area || "General";
      const diagDate =
        d.created_at ||
        ((d as Record<string, unknown>).submitted_at as string | undefined) ||
        "2026-07-27T08:30:00.000Z";
      const isDiagInDate = isDateInRange(diagDate, startDate, endDate);

      if (!areaMap[area]) {
        areaMap[area] = {
          employeeCount: 0,
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
          projects: [],
        };
      }

      if (isDiagInDate) {
        areaMap[area].employeeCount += 1;
      }

      // Process actual activities logged in items
      if (activityCategory !== "proyecto" && d.activities_q) {
        if (d.activities_q.items && Array.isArray(d.activities_q.items)) {
          d.activities_q.items.forEach((item, idx) => {
            const itemDate =
              ((item as Record<string, unknown>).createdAt as string) ||
              diagDate;
            if (!isDateInRange(itemDate, startDate, endDate)) return;

            const quad = item.quadrant || "q2";
            if (quad === "q1") {
              totalQ1 += 1;
              areaMap[area].q1 += 1;
            } else if (quad === "q2") {
              totalQ2 += 1;
              areaMap[area].q2 += 1;
            } else if (quad === "q3") {
              totalQ3 += 1;
              areaMap[area].q3 += 1;
            } else if (quad === "q4") {
              totalQ4 += 1;
              areaMap[area].q4 += 1;
            }

            const isStrategic = quad === "q4" || quad === "q3" || quad === "q2";
            const textContent =
              (item.name || "") + " " + (item.analysis?.rationale || "");
            const isValueProp =
              /cliente|consumidor|propuesta|valor|experiencia|producto|innovaci[oó]n/i.test(
                textContent,
              );

            areaMap[area].projects.push({
              id: item.id || `act-${d.id}-${idx}`,
              title: item.name,
              description:
                item.analysis?.rationale ||
                `Actividad clasificada en ${quad.toUpperCase()}`,
              dimension:
                quad === "q4"
                  ? "Automatización"
                  : quad === "q2"
                    ? "Calidad"
                    : "Eficiencia",
              status:
                quad === "q4"
                  ? "completado"
                  : quad === "q3"
                    ? "en_proceso"
                    : "idea",
              impact: quad === "q4" ? "alto" : quad === "q2" ? "medio" : "bajo",
              quadrant: quad,
              authorName: d.employee?.name || "Colaborador",
              alignedObjectiveId: isValueProp
                ? "obj-5"
                : quad === "q4" || quad === "q3"
                  ? "obj-1"
                  : quad === "q2"
                    ? "obj-3"
                    : "obj-2",
              alignmentScore: isStrategic ? (quad === "q4" ? 95 : 85) : 35,
            });
          });
        } else if (isDiagInDate) {
          const q1 = d.activities_q.q1 || 0;
          const q2 = d.activities_q.q2 || 0;
          const q3 = d.activities_q.q3 || 0;
          const q4 = d.activities_q.q4 || 0;

          totalQ1 += q1;
          totalQ2 += q2;
          totalQ3 += q3;
          totalQ4 += q4;

          areaMap[area].q1 += q1;
          areaMap[area].q2 += q2;
          areaMap[area].q3 += q3;
          areaMap[area].q4 += q4;
        }
      }

      // Process workspace projects logged by collaborator
      if (
        activityCategory !== "matriz" &&
        d.workspace_data?.projects &&
        Array.isArray(d.workspace_data.projects)
      ) {
        d.workspace_data.projects.forEach((proj: WorkspaceProject) => {
          const projDate = proj.createdAt || diagDate;
          if (!isDateInRange(projDate, startDate, endDate)) return;

          const quad =
            proj.impact === "alto"
              ? "q4"
              : proj.impact === "medio"
                ? "q2"
                : "q1";
          const textContent =
            (proj.title || "") + " " + (proj.description || "");
          const isValueProp =
            /cliente|consumidor|propuesta|valor|experiencia|producto|innovaci[oó]n/i.test(
              textContent,
            );

          const primaryObj =
            proj.strategicObjectives?.[0] ||
            (isValueProp
              ? "obj-5"
              : proj.impact === "alto"
                ? "obj-1"
                : proj.impact === "medio"
                  ? "obj-3"
                  : "obj-2");

          areaMap[area].projects.push({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            dimension: proj.dimension || "General",
            status: proj.status,
            impact: proj.impact,
            quadrant: quad,
            authorName: d.employee?.name || "Colaborador",
            strategicObjectives: proj.strategicObjectives || [primaryObj],
            alignedObjectiveId: primaryObj,
            alignmentScore:
              proj.impact === "alto" ? 92 : proj.impact === "medio" ? 78 : 40,
          });
        });
      }
    });

    // If an area has no logged projects yet and we are in "all" mode, complement with domain defaults
    if (temporalFilter.mode === "all") {
      Object.keys(areaMap).forEach((area) => {
        if (areaMap[area].projects.length === 0) {
          const defaults =
            DEFAULT_AREA_PROJECTS[area] || DEFAULT_AREA_PROJECTS["Operaciones"];
          areaMap[area].projects = defaults.map((p) => ({
            ...p,
            authorName: `Equipo ${area}`,
          }));
        }
      });

      // Ensure default areas exist if diagnostics list is small or filtered
      if (Object.keys(areaMap).length === 0) {
        Object.entries(DEFAULT_AREA_PROJECTS).forEach(([area, projs]) => {
          areaMap[area] = {
            employeeCount: 3,
            q1: 2,
            q2: 4,
            q3: 3,
            q4: 2,
            projects: projs.map((p) => ({
              ...p,
              authorName: `Equipo ${area}`,
            })),
          };
        });
      }
    }

    // Compute Global Alignment Score (0 to 100)
    let totalProjects = 0;
    let sumAlignmentScores = 0;
    let highImpactCount = 0;
    let mediumImpactCount = 0;
    let lowImpactCount = 0;

    Object.values(areaMap).forEach((areaData) => {
      areaData.projects.forEach((p) => {
        totalProjects += 1;
        sumAlignmentScores += p.alignmentScore;
        if (p.alignmentScore >= 85) highImpactCount += 1;
        else if (p.alignmentScore >= 65) mediumImpactCount += 1;
        else lowImpactCount += 1;
      });
    });

    const globalAlignmentIndex =
      totalProjects > 0 ? Math.round(sumAlignmentScores / totalProjects) : 82;

    const totalActivities = totalQ1 + totalQ2 + totalQ3 + totalQ4 || 1;
    const strategicActivitiesRatio = Math.round(
      ((totalQ2 + totalQ3 + totalQ4) / totalActivities) * 100,
    );

    return {
      totalQ1,
      totalQ2,
      totalQ3,
      totalQ4,
      areaMap,
      globalAlignmentIndex,
      totalProjects,
      highImpactCount,
      mediumImpactCount,
      lowImpactCount,
      strategicActivitiesRatio,
    };
  }, [diagnostics, temporalFilter]);

  // All projects list flattened for filterable board
  const allProjectsList = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      dimension: string;
      status: "idea" | "en_proceso" | "completado";
      impact: "alto" | "medio" | "bajo";
      highImpactStatus?: "postulado" | "aprobado" | "rechazado";
      highImpactDecisionNotes?: string;
      highImpactEvaluatedAt?: string;
      quadrant: "q1" | "q2" | "q3" | "q4";
      area: string;
      authorName?: string;
      alignedObjectiveId: string;
      alignmentScore: number;
    }> = [];

    Object.entries(aggregatedData.areaMap).forEach(([area, data]) => {
      data.projects.forEach((proj) => {
        const dec = decisionsMap[proj.id];
        const effectiveStatus =
          dec?.status ||
          proj.highImpactStatus ||
          (proj.impact === "alto" ? "postulado" : undefined);
        const effectiveImpact = dec?.newImpact || proj.impact;

        list.push({
          ...proj,
          area,
          impact: effectiveImpact,
          highImpactStatus: effectiveStatus,
          highImpactDecisionNotes: dec?.notes || proj.highImpactDecisionNotes,
          highImpactEvaluatedAt: dec?.evaluatedAt || proj.highImpactEvaluatedAt,
        });
      });
    });

    return list;
  }, [aggregatedData, decisionsMap]);

  // High Impact Postulations list for organizational decision making
  const highImpactPostulationsList = useMemo(() => {
    return allProjectsList.filter(
      (p) =>
        p.impact === "alto" ||
        p.highImpactStatus !== undefined ||
        decisionsMap[p.id] !== undefined,
    );
  }, [allProjectsList, decisionsMap]);

  const postulationCounts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    highImpactPostulationsList.forEach((p) => {
      const st = p.highImpactStatus || "postulado";
      if (st === "aprobado") approved += 1;
      else if (st === "rechazado") rejected += 1;
      else pending += 1;
    });

    return {
      pending,
      approved,
      rejected,
      total: highImpactPostulationsList.length,
    };
  }, [highImpactPostulationsList]);

  const filteredPostulations = useMemo(() => {
    if (postulationTab === "all") return highImpactPostulationsList;
    return highImpactPostulationsList.filter((p) => {
      const st = p.highImpactStatus || "postulado";
      return st === postulationTab;
    });
  }, [highImpactPostulationsList, postulationTab]);

  // Filter projects by impact & area
  const filteredProjects = useMemo(() => {
    return allProjectsList.filter((p) => {
      const matchesImpact =
        selectedFilter === "all"
          ? true
          : selectedFilter === "high"
            ? p.alignmentScore >= 85
            : selectedFilter === "medium"
              ? p.alignmentScore >= 65 && p.alignmentScore < 85
              : p.alignmentScore < 65;

      const matchesArea =
        selectedAreaFilter === "all" ? true : p.area === selectedAreaFilter;

      return matchesImpact && matchesArea;
    });
  }, [allProjectsList, selectedFilter, selectedAreaFilter]);

  // Executive strategic diagnostic badge
  const alignmentStatusText =
    aggregatedData.globalAlignmentIndex >= 80
      ? "ALTA ALINEACIÓN ESTRATÉGICA"
      : aggregatedData.globalAlignmentIndex >= 65
        ? "ALINEACIÓN EN DESARROLLO"
        : "DESALINEACIÓN DETECTADA";

  const alignmentStatusColor =
    aggregatedData.globalAlignmentIndex >= 80
      ? "#0D7A5F"
      : aggregatedData.globalAlignmentIndex >= 65
        ? "#854F0B"
        : "#993C1D";

  const alignmentStatusBg =
    aggregatedData.globalAlignmentIndex >= 80
      ? "#EBF6F1"
      : aggregatedData.globalAlignmentIndex >= 65
        ? "#FEF6E6"
        : "#FDECEA";

  return (
    <div className="space-y-6 text-slate-900">
      {/* 0. TEMPORAL & CATEGORY FILTER */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Filtro Temporal · ALIGN
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Alineación Estratégica & Matriz de Actividades
              </span>
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 mt-1">
              <Calendar className="w-5 h-5 text-slate-700" />
              Filtro Temporal de Actividades e Iniciativas
            </h3>
          </div>

          {temporalFilter.mode !== "all" && (
            <button
              onClick={() =>
                setTemporalFilter({
                  mode: "all",
                  selectedWeek:
                    weeksList.find((w) => w.isCurrentWeek)?.weekKey ||
                    weeksList[0]?.weekKey ||
                    "",
                  selectedDay: todayStr,
                  startDate: "2026-07-27",
                  endDate: todayStr,
                  activityCategory: "all",
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer filtro
            </button>
          )}
        </div>

        {/* Temporal filter component */}
        <ActivityTemporalFilter
          value={temporalFilter}
          onChange={setTemporalFilter}
          showCategoryFilter={true}
        />

        {/* Summary badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">
              Período Activo:
            </span>
            <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {temporalFilter.mode === "all"
                ? "Todo el Histórico (Desde 27 Jul 2026)"
                : temporalFilter.mode === "today"
                  ? `Hoy (${formatDatePretty(todayStr, false)})`
                  : temporalFilter.mode === "this_week"
                    ? `Esta Semana (${temporalFilter.startDate} a ${temporalFilter.endDate})`
                    : `${temporalFilter.startDate} al ${temporalFilter.endDate}`}
            </span>
            {temporalFilter.activityCategory !== "all" && (
              <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                Categoría:{" "}
                {temporalFilter.activityCategory === "matriz"
                  ? "Solo Matriz de Actividades"
                  : temporalFilter.activityCategory === "proyecto"
                    ? "Solo Proyectos IA"
                    : temporalFilter.activityCategory === "diagnostico"
                      ? "Solo Diagnósticos"
                      : temporalFilter.activityCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-semibold text-[11px] text-slate-500">
            <span>
              Actividades en filtro:{" "}
              <strong className="text-slate-800">
                {filteredWorkspaceActivities.length}
              </strong>
            </span>
            <span>•</span>
            <span>
              Proyectos en filtro:{" "}
              <strong className="text-slate-800">
                {filteredWorkspaceProjects.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 1. CEO EXECUTIVE KPI OVERVIEW */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        {/* 4 CORE EXECUTIVE METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Índice de Alineación
              </span>
              <BarChart2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
              {aggregatedData.globalAlignmentIndex}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Coherencia global con metas clave
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#E6F2FB]/60 border border-[#0C447C]/20">
            <div className="flex items-center justify-between text-[#0C447C] mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Proyectos Q3 / Q4
              </span>
              <Zap className="w-4 h-4 text-[#0C447C]" />
            </div>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#0C447C]">
              {aggregatedData.highImpactCount}
            </p>
            <p className="text-[11px] text-[#0C447C]/80 mt-1">
              Agentes y Automatizaciones de alto impacto
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FEF6E6]/60 border border-[#854F0B]/20">
            <div className="flex items-center justify-between text-[#854F0B] mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Copilotos Activos Q2
              </span>
              <FolderKanban className="w-4 h-4 text-[#854F0B]" />
            </div>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#854F0B]">
              {aggregatedData.mediumImpactCount}
            </p>
            <p className="text-[11px] text-[#854F0B]/80 mt-1">
              Asistentes de apoyo en flujo diario
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FDECEA]/60 border border-[#993C1D]/20">
            <div className="flex items-center justify-between text-[#993C1D] mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Carga Ridiculist Q1
              </span>
              <AlertTriangle className="w-4 h-4 text-[#993C1D]" />
            </div>
            <p className="font-display font-black text-2xl sm:text-3xl text-[#993C1D]">
              {aggregatedData.totalQ1}
            </p>
            <p className="text-[11px] text-[#993C1D]/80 mt-1">
              Tareas manuales para automatizar o delegar
            </p>
          </div>
        </div>

        {/* CEO STRATEGIC INSIGHT BOX */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-white/10 shrink-0 text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white mb-0.5">
              Dictamen Estratégico para Dirección (CEO):
            </p>
            <p className="text-slate-300 leading-relaxed">
              El{" "}
              <strong className="text-amber-300">
                {aggregatedData.strategicActivitiesRatio}%
              </strong>{" "}
              de las iniciativas y actividades declaradas se enfocan en
              Copilotos (Q2), Automatizaciones (Q3) y Agentes IA (Q4). Se
              recomienda reasignar la capacidad atrapada en la Ridiculist (Q1)
              para impulsar 2 proyectos estratégicos de automatización en
              Operaciones y Comercial.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORPORATE OBJECTIVES MAPPING MATRIX */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            Coherencia con los Objetivos Estratégicos de la Compañía
          </h4>
          <p className="text-xs text-slate-500">
            Mapeo directo de proyectos registrados frente a los pilares de
            transformación corporativa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPANY_OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            // Count matching projects mapped to this objective
            const matchingProjects = allProjectsList.filter(
              (p) =>
                p.alignedObjectiveId === obj.id ||
                (p.strategicObjectives &&
                  p.strategicObjectives.includes(obj.id)),
            );

            return (
              <div
                key={obj.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      style={{ backgroundColor: obj.bg, color: obj.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {obj.title}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Peso: {obj.weight}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {obj.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Área clave:{" "}
                    <strong className="text-slate-800">{obj.targetArea}</strong>
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {matchingProjects.length} iniciativa
                    {matchingProjects.length !== 1 ? "s" : ""} alineadas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. POSTULACIONES A PROYECTOS DE ALTO IMPACTO (DECISIÓN ORGANIZACIONAL - ACORDEÓN C-LEVEL) */}
      <div className="bg-white rounded-2xl border border-amber-200/90 shadow-xs bg-gradient-to-b from-amber-50/20 to-white overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setIsPostulationsOpen(!isPostulationsOpen)}
          className="w-full text-left p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/30 transition-colors focus:outline-hidden"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Observabilidad · ALIGN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Gobernanza
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                {isPostulationsOpen
                  ? "Clic para contraer"
                  : "Clic para desplegar"}
              </span>
            </div>
            <h4 className="font-display font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              Postulaciones a Proyectos de Alto Impacto
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Determinación de impacto: Las propuestas declaradas por los
              colaboradores como Alto Impacto actúan como postulaciones para
              evaluación y decisión formal de la organización.
            </p>
          </div>

          {/* Metric Badges & Accordion Trigger */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {postulationCounts.pending} Postulaciones Pendientes
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100/90 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {postulationCounts.approved} Aprobadas
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                {postulationCounts.rejected} Reajustadas
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-900 shrink-0">
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  isPostulationsOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </button>

        {/* Accordion Body */}
        {isPostulationsOpen && (
          <div className="p-5 sm:p-6 pt-0 border-t border-amber-100/80 space-y-5">
            {/* Filter Sub-Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600 w-fit mt-4">
              <button
                onClick={() => setPostulationTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  postulationTab === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Todas ({postulationCounts.total})
              </button>
              <button
                onClick={() => setPostulationTab("postulado")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  postulationTab === "postulado"
                    ? "bg-amber-500 text-white shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Pendientes ({postulationCounts.pending})
              </button>
              <button
                onClick={() => setPostulationTab("aprobado")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  postulationTab === "aprobado"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Aprobados ({postulationCounts.approved})
              </button>
              <button
                onClick={() => setPostulationTab("rechazado")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  postulationTab === "rechazado"
                    ? "bg-rose-600 text-white shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Rechazados / Reajustados ({postulationCounts.rejected})
              </button>
            </div>

            {/* Postulations Grid */}
            {filteredPostulations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No hay postulaciones de alto impacto registradas en esta
                categoría.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPostulations.map((item, idx) => {
                  const currentStatus = item.highImpactStatus || "postulado";
                  const isApproved = currentStatus === "aprobado";
                  const isRejected = currentStatus === "rechazado";
                  const isPending = !isApproved && !isRejected;

                  return (
                    <div
                      key={`post-${item.id}-${idx}`}
                      className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                        isApproved
                          ? "bg-emerald-50/40 border-emerald-300"
                          : isRejected
                            ? "bg-slate-50 border-slate-200 opacity-85"
                            : "bg-white border-amber-300/90 shadow-xs"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                              {item.area} · {item.dimension}
                            </span>
                            {item.authorName && (
                              <span className="text-[10px] font-medium text-slate-500">
                                Por: {item.authorName}
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          {isApproved && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Alto Impacto Aprobado
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 shrink-0">
                              <AlertTriangle className="w-3 h-3 text-slate-500" />
                              Postulación Rechazada ({item.impact})
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              Postulado a Alto Impacto
                            </span>
                          )}
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm leading-snug">
                          {item.title}
                        </h5>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Decision Controls */}
                      <div className="pt-3 border-t border-slate-200/60 space-y-2 bg-slate-50/80 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            Decisión de la Organización:
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            Score Alineación: {item.alignmentScore}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleDecision(
                                item.id,
                                "aprobado",
                                "alto",
                                "Aprobado por el comité de la organización",
                              )
                            }
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                              isApproved
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aceptar / Aprobar
                          </button>

                          <button
                            onClick={() =>
                              handleDecision(
                                item.id,
                                "rechazado",
                                "medio",
                                "Postulación rechazada. Reajustado a Impacto Medio",
                              )
                            }
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                              isRejected
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-white text-rose-800 border border-rose-300 hover:bg-rose-50"
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Rechazar / Reajustar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. AREA ALIGNMENT BREAKDOWN (MATRIZ POR ÁREA) */}
      {!hideAreaAlignmentBreakdown && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                Nivel de Alineación Estratégica por Área
              </h4>
              <p className="text-xs text-slate-500">
                Coherencia entre las iniciativas de cada equipo y la estrategia
                de la compañía
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aggregatedData.areaMap).map(([area, data]) => {
              const areaProjectsCount = data.projects.length;
              const avgAreaAlignment =
                areaProjectsCount > 0
                  ? Math.round(
                      data.projects.reduce(
                        (acc, curr) => acc + curr.alignmentScore,
                        0,
                      ) / areaProjectsCount,
                    )
                  : 75;

              const isHigh = avgAreaAlignment >= 80;
              const isMed = avgAreaAlignment >= 65 && avgAreaAlignment < 80;

              const badgeBg = isHigh
                ? "#EBF6F1"
                : isMed
                  ? "#FEF6E6"
                  : "#FDECEA";
              const badgeColor = isHigh
                ? "#0D7A5F"
                : isMed
                  ? "#854F0B"
                  : "#993C1D";
              const badgeLabel = isHigh
                ? "ALINEADO"
                : isMed
                  ? "EN DESARROLLO"
                  : "RIESGO DE DESALINEACIÓN";

              const totalQ = data.q1 + data.q2 + data.q3 + data.q4 || 1;
              const q1Pct = Math.round((data.q1 / totalQ) * 100);
              const q2Pct = Math.round((data.q2 / totalQ) * 100);
              const q34Pct = Math.round(((data.q3 + data.q4) / totalQ) * 100);

              return (
                <div
                  key={area}
                  className="rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 bg-slate-50/40 space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {area}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {data.employeeCount} colaborador
                        {data.employeeCount > 1 ? "es" : ""} ·{" "}
                        {areaProjectsCount} iniciativa
                        {areaProjectsCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                      style={{ backgroundColor: badgeBg, color: badgeColor }}
                    >
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">
                        Alineación Estratégica:
                      </span>
                      <span className="font-black text-slate-900">
                        {avgAreaAlignment}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${avgAreaAlignment}%`,
                          backgroundColor: badgeColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quadrant breakdown mini bar */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Mezcla de Cuadrantes (Q1 vs Q2 vs Q3/Q4):
                    </span>
                    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-200">
                      <div
                        style={{ width: `${q1Pct}%` }}
                        className="bg-[#E8534A]"
                        title={`Q1 Ridiculist: ${q1Pct}%`}
                      />
                      <div
                        style={{ width: `${q2Pct}%` }}
                        className="bg-[#E8A83A]"
                        title={`Q2 Asistentes: ${q2Pct}%`}
                      />
                      <div
                        style={{ width: `${q34Pct}%` }}
                        className="bg-[#1A6E9E]"
                        title={`Q3/Q4 Automatización & Agentes: ${q34Pct}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                      <span className="text-[#993C1D]">Q1: {data.q1}</span>
                      <span className="text-[#854F0B]">Q2: {data.q2}</span>
                      <span className="text-[#0C447C]">
                        Q3/Q4: {data.q3 + data.q4}
                      </span>
                    </div>
                  </div>

                  {/* Direct Action Directive for CEO */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-700">
                    <p className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      Acción recomendada CEO:
                    </p>
                    <p className="text-slate-600">
                      {isHigh
                        ? "Escalar proyectos exitosos hacia otras áreas y consolidar biblioteca de prompts."
                        : isMed
                          ? "Proveer plantillas de copilotos Q2 para acelerar entregables."
                          : "Intervenir para sustituir tareas de captura manual por agente Q4."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACCORDION 1: MATRIZ DE ACTIVIDADES EN ESPACIOS DE TRABAJO */}
      <div className="border border-amber-200/90 rounded-2xl bg-amber-50/20 shadow-2xs overflow-hidden transition-all">
        <div
          onClick={() => setIsActivitiesMatrixOpen(!isActivitiesMatrixOpen)}
          className="p-5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/30 hover:bg-amber-100/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100 transition-colors"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200/80">
                OBSERVABILIDAD • ALIGN
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                MATRIZ DE ACTIVIDADES
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-amber-700 bg-amber-50">
                {isActivitiesMatrixOpen
                  ? "Clic para contraer"
                  : "Clic para desplegar"}
              </span>
            </div>

            <h4 className="font-display font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              1. Matriz de Actividades en Espacios de Trabajo
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              Distribución por cuadrantes (Q1 Ridiculist, Q2 Copilotos, Q3
              Automatización, Q4 Agentes IA) de todas las actividades operativas
              e introspectivas creadas por los usuarios en sus espacios de
              trabajo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-200">
                Q2:{" "}
                {
                  filteredWorkspaceActivities.filter((a) => a.quadrant === "q2")
                    .length
                }
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-100/90 text-sky-900 border border-sky-200">
                Q4:{" "}
                {
                  filteredWorkspaceActivities.filter((a) => a.quadrant === "q4")
                    .length
                }
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100/90 text-rose-900 border border-rose-200">
                Q1:{" "}
                {
                  filteredWorkspaceActivities.filter((a) => a.quadrant === "q1")
                    .length
                }
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-900 border border-emerald-200">
                Q3:{" "}
                {
                  filteredWorkspaceActivities.filter((a) => a.quadrant === "q3")
                    .length
                }
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white border border-amber-200 text-amber-700">
              {isActivitiesMatrixOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {isActivitiesMatrixOpen && (
          <div className="p-5 bg-white border-t border-amber-100 space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar actividad o colaborador..."
                  value={activitiesSearch}
                  onChange={(e) => setActivitiesSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Área:
                </span>
                <select
                  value={activitiesAreaFilter}
                  onChange={(e) => setActivitiesAreaFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">Todas las Áreas</option>
                  {Array.from(
                    new Set(allWorkspaceActivities.map((a) => a.authorArea)),
                  ).map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2x2 QUADRANTS GRID FOR ACTIVITIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Q2: COPILOTOS Y ASISTENTES */}
              <div className="rounded-xl border border-amber-200/90 bg-amber-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#FEF6E6] border-b border-[#F2E5D3] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#854F0B] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E8A83A]"></span>
                      Q2 · Copilotos & Asistentes
                    </h5>
                    <p className="text-[10px] text-[#854F0B]/80">
                      Alto Valor / Baja Frecuencia
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#854F0B] border border-[#F2E5D3]">
                    {
                      filteredWorkspaceActivities.filter(
                        (a) => a.quadrant === "q2",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceActivities.filter(
                    (a) => a.quadrant === "q2",
                  ).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay actividades en Q2
                    </p>
                  ) : (
                    filteredWorkspaceActivities
                      .filter((a) => a.quadrant === "q2")
                      .map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-lg bg-white border border-amber-100/80 shadow-2xs space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {act.name}
                            </h6>
                            {act.mins && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                {act.mins} min/sem
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {act.authorName}
                            </span>
                            <span>•</span>
                            <span>{act.authorArea}</span>
                          </div>
                          {act.rationale && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-0.5">
                              {act.rationale}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Q4: AGENTES IA & INTEGRACION */}
              <div className="rounded-xl border border-sky-200/90 bg-sky-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#E6F2FB] border-b border-[#BDE0FE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#0C447C] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1A6E9E]"></span>
                      Q4 · Agentes IA & Integración
                    </h5>
                    <p className="text-[10px] text-[#0C447C]/80">
                      Alto Valor / Alta Frecuencia
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#0C447C] border border-[#BDE0FE]">
                    {
                      filteredWorkspaceActivities.filter(
                        (a) => a.quadrant === "q4",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceActivities.filter(
                    (a) => a.quadrant === "q4",
                  ).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay actividades en Q4
                    </p>
                  ) : (
                    filteredWorkspaceActivities
                      .filter((a) => a.quadrant === "q4")
                      .map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-lg bg-white border border-sky-100/80 shadow-2xs space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {act.name}
                            </h6>
                            {act.mins && (
                              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded shrink-0">
                                {act.mins} min/sem
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {act.authorName}
                            </span>
                            <span>•</span>
                            <span>{act.authorArea}</span>
                          </div>
                          {act.rationale && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-0.5">
                              {act.rationale}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Q1: RIDICULIST */}
              <div className="rounded-xl border border-rose-200/90 bg-rose-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#FDECEA] border-b border-[#FAD2CE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#993C1D] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E8534A]"></span>
                      Q1 · Ridiculist (Tareas Manuales)
                    </h5>
                    <p className="text-[10px] text-[#993C1D]/80">
                      Bajo Valor / Baja Frecuencia (Eliminar/Delegar)
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#993C1D] border border-[#FAD2CE]">
                    {
                      filteredWorkspaceActivities.filter(
                        (a) => a.quadrant === "q1",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceActivities.filter(
                    (a) => a.quadrant === "q1",
                  ).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay actividades en Q1
                    </p>
                  ) : (
                    filteredWorkspaceActivities
                      .filter((a) => a.quadrant === "q1")
                      .map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-lg bg-white border border-rose-100/80 shadow-2xs space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {act.name}
                            </h6>
                            {act.mins && (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                                {act.mins} min/sem
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {act.authorName}
                            </span>
                            <span>•</span>
                            <span>{act.authorArea}</span>
                          </div>
                          {act.rationale && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-0.5">
                              {act.rationale}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Q3: AUTOMATIZACION */}
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#E6F5F0] border-b border-[#B3E5D5] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#085041] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3A8E6E]"></span>
                      Q3 · Automatización de Flujos
                    </h5>
                    <p className="text-[10px] text-[#085041]/80">
                      Bajo Valor / Alta Frecuencia (Sustituir por Flujo)
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#085041] border border-[#B3E5D5]">
                    {
                      filteredWorkspaceActivities.filter(
                        (a) => a.quadrant === "q3",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceActivities.filter(
                    (a) => a.quadrant === "q3",
                  ).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay actividades en Q3
                    </p>
                  ) : (
                    filteredWorkspaceActivities
                      .filter((a) => a.quadrant === "q3")
                      .map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-lg bg-white border border-emerald-100/80 shadow-2xs space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {act.name}
                            </h6>
                            {act.mins && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                                {act.mins} min/sem
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {act.authorName}
                            </span>
                            <span>•</span>
                            <span>{act.authorArea}</span>
                          </div>
                          {act.rationale && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed pt-0.5">
                              {act.rationale}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 2: MATRIZ DE PROYECTOS EN ESPACIOS DE TRABAJO */}
      <div className="border border-blue-200/90 rounded-2xl bg-blue-50/20 shadow-2xs overflow-hidden transition-all">
        <div
          onClick={() => setIsProjectsMatrixOpen(!isProjectsMatrixOpen)}
          className="p-5 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 hover:bg-blue-100/40 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 transition-colors"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200/80">
                OBSERVABILIDAD • ALIGN
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                MATRIZ DE PROYECTOS IA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-blue-700 bg-blue-50">
                {isProjectsMatrixOpen
                  ? "Clic para contraer"
                  : "Clic para desplegar"}
              </span>
            </div>

            <h4 className="font-display font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              2. Matriz de Proyectos Creados en Espacios de Trabajo
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              Clasificación matricial por cuadrantes de impacto de todos los
              proyectos de Inteligencia Artificial creados y gestionados por los
              colaboradores dentro de sus workspaces.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100/90 text-blue-900 border border-blue-200">
                Totales: {filteredWorkspaceProjects.length}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-900 border border-emerald-200">
                Completados:{" "}
                {
                  filteredWorkspaceProjects.filter(
                    (p) => p.status === "completado",
                  ).length
                }
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-100/90 text-sky-900 border border-sky-200">
                En Proceso:{" "}
                {
                  filteredWorkspaceProjects.filter(
                    (p) => p.status === "en_proceso",
                  ).length
                }
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white border border-blue-200 text-blue-700">
              {isProjectsMatrixOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {isProjectsMatrixOpen && (
          <div className="p-5 bg-white border-t border-blue-100 space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar proyecto o creador..."
                  value={projectsSearch}
                  onChange={(e) => setProjectsSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={projectsStatusFilter}
                  onChange={(e) => setProjectsStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="completado">Completados</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="idea">Ideas</option>
                </select>

                <select
                  value={projectsAreaFilter}
                  onChange={(e) => setProjectsAreaFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="all">Todas las Áreas</option>
                  {Array.from(
                    new Set(allWorkspaceProjects.map((p) => p.authorArea)),
                  ).map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2x2 QUADRANTS GRID FOR PROJECTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Q2: COPILOTOS & ASISTENTES */}
              <div className="rounded-xl border border-amber-200/90 bg-amber-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#FEF6E6] border-b border-[#F2E5D3] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#854F0B] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E8A83A]"></span>
                      Q2 · Copilotos & Asistentes IA
                    </h5>
                    <p className="text-[10px] text-[#854F0B]/80">
                      Impacto Medio / Productividad Diario
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#854F0B] border border-[#F2E5D3]">
                    {
                      filteredWorkspaceProjects.filter(
                        (p) => p.quadrant === "q2",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceProjects.filter((p) => p.quadrant === "q2")
                    .length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay proyectos en Q2
                    </p>
                  ) : (
                    filteredWorkspaceProjects
                      .filter((p) => p.quadrant === "q2")
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="p-2.5 rounded-lg bg-white border border-amber-100/80 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {proj.title}
                            </h6>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                proj.status === "completado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : proj.status === "en_proceso"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {proj.status === "en_proceso"
                                ? "En Proceso"
                                : proj.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {proj.authorName}
                            </span>
                            <span>•</span>
                            <span>{proj.authorArea}</span>
                            {proj.dimension && (
                              <>
                                <span>•</span>
                                <span className="text-amber-800 bg-amber-50 px-1 py-0.2 rounded">
                                  {proj.dimension}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Q4: AGENTES IA & ALTO IMPACTO */}
              <div className="rounded-xl border border-sky-200/90 bg-sky-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#E6F2FB] border-b border-[#BDE0FE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#0C447C] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1A6E9E]"></span>
                      Q4 · Agentes IA & Alto Impacto
                    </h5>
                    <p className="text-[10px] text-[#0C447C]/80">
                      Alto Impacto Estratégico & Integraciones
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#0C447C] border border-[#BDE0FE]">
                    {
                      filteredWorkspaceProjects.filter(
                        (p) => p.quadrant === "q4",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceProjects.filter((p) => p.quadrant === "q4")
                    .length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay proyectos en Q4
                    </p>
                  ) : (
                    filteredWorkspaceProjects
                      .filter((p) => p.quadrant === "q4")
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="p-2.5 rounded-lg bg-white border border-sky-100/80 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {proj.title}
                            </h6>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                proj.status === "completado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : proj.status === "en_proceso"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {proj.status === "en_proceso"
                                ? "En Proceso"
                                : proj.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {proj.authorName}
                            </span>
                            <span>•</span>
                            <span>{proj.authorArea}</span>
                            {proj.dimension && (
                              <>
                                <span>•</span>
                                <span className="text-sky-800 bg-sky-50 px-1 py-0.2 rounded">
                                  {proj.dimension}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Q1: REORGANIZACION / RIDICULIST */}
              <div className="rounded-xl border border-rose-200/90 bg-rose-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#FDECEA] border-b border-[#FAD2CE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#993C1D] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E8534A]"></span>
                      Q1 · Reorganización & Ridiculist
                    </h5>
                    <p className="text-[10px] text-[#993C1D]/80">
                      Impacto Bajo / Tareas Repetitivas
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#993C1D] border border-[#FAD2CE]">
                    {
                      filteredWorkspaceProjects.filter(
                        (p) => p.quadrant === "q1",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceProjects.filter((p) => p.quadrant === "q1")
                    .length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay proyectos en Q1
                    </p>
                  ) : (
                    filteredWorkspaceProjects
                      .filter((p) => p.quadrant === "q1")
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="p-2.5 rounded-lg bg-white border border-rose-100/80 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {proj.title}
                            </h6>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                proj.status === "completado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : proj.status === "en_proceso"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {proj.status === "en_proceso"
                                ? "En Proceso"
                                : proj.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {proj.authorName}
                            </span>
                            <span>•</span>
                            <span>{proj.authorArea}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Q3: AUTOMATIZACION */}
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/30 overflow-hidden flex flex-col justify-between">
                <div className="p-3 bg-[#E6F5F0] border-b border-[#B3E5D5] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#085041] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3A8E6E]"></span>
                      Q3 · Automatización & Flujos
                    </h5>
                    <p className="text-[10px] text-[#085041]/80">
                      Automatización de Procesos Operativos
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#085041] border border-[#B3E5D5]">
                    {
                      filteredWorkspaceProjects.filter(
                        (p) => p.quadrant === "q3",
                      ).length
                    }
                  </span>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-2 custom-scrollbar">
                  {filteredWorkspaceProjects.filter((p) => p.quadrant === "q3")
                    .length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No hay proyectos en Q3
                    </p>
                  ) : (
                    filteredWorkspaceProjects
                      .filter((p) => p.quadrant === "q3")
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="p-2.5 rounded-lg bg-white border border-emerald-100/80 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h6 className="font-bold text-xs text-slate-900 leading-snug">
                              {proj.title}
                            </h6>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                proj.status === "completado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : proj.status === "en_proceso"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {proj.status === "en_proceso"
                                ? "En Proceso"
                                : proj.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {proj.authorName}
                            </span>
                            <span>•</span>
                            <span>{proj.authorArea}</span>
                            {proj.dimension && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded">
                                  {proj.dimension}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. FILTERABLE REGISTERED PROJECTS & TASKS BOARD */}
      {!hideRegisteredProjects && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-slate-600" />
                Proyectos y Tareas Registradas por Colaboradores
              </h4>
              <p className="text-xs text-slate-500">
                Explora las iniciativas declaradas y su grado de alineación
                estratégica
              </p>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Todos ({allProjectsList.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("high")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedFilter === "high"
                      ? "bg-[#EBF6F1] text-[#0D7A5F] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Alto Impacto
                </button>
                <button
                  onClick={() => setSelectedFilter("medium")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedFilter === "medium"
                      ? "bg-[#FEF6E6] text-[#854F0B] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Medio
                </button>
                <button
                  onClick={() => setSelectedFilter("low")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedFilter === "low"
                      ? "bg-[#FDECEA] text-[#993C1D] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Por Reorganizar
                </button>
              </div>

              {/* AREA FILTER SELECT */}
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

          {/* PROJECTS CARDS GRID */}
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No se encontraron iniciativas para los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredProjects.map((item, idx) => {
                const isHigh = item.alignmentScore >= 85;
                const isMed =
                  item.alignmentScore >= 65 && item.alignmentScore < 85;

                const qBg =
                  item.quadrant === "q4"
                    ? "#E6F2FB"
                    : item.quadrant === "q3"
                      ? "#E6F5F0"
                      : item.quadrant === "q2"
                        ? "#FEF6E6"
                        : "#FDECEA";

                const qColor =
                  item.quadrant === "q4"
                    ? "#0C447C"
                    : item.quadrant === "q3"
                      ? "#085041"
                      : item.quadrant === "q2"
                        ? "#854F0B"
                        : "#993C1D";

                const qLabel =
                  item.quadrant === "q4"
                    ? "Q4 · Agente IA"
                    : item.quadrant === "q3"
                      ? "Q3 · Automatización"
                      : item.quadrant === "q2"
                        ? "Q2 · Copiloto"
                        : "Q1 · Ridiculist";

                return (
                  <div
                    key={`proj-${item.id}-${idx}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider"
                          style={{ backgroundColor: qBg, color: qColor }}
                        >
                          {qLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.area}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-sm leading-snug">
                        {item.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Líder:{" "}
                        <strong className="text-slate-700">
                          {item.authorName || "Colaborador"}
                        </strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Alineación
                        </span>
                        <span
                          className="font-black text-xs px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: isHigh
                              ? "#EBF6F1"
                              : isMed
                                ? "#FEF6E6"
                                : "#FDECEA",
                            color: isHigh
                              ? "#0D7A5F"
                              : isMed
                                ? "#854F0B"
                                : "#993C1D",
                          }}
                        >
                          {item.alignmentScore}%
                        </span>
                      </div>
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
