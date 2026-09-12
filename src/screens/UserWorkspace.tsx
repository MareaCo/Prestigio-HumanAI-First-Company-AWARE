import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { PrestigioLogo } from "@/components/PrestigioLogo";
import { MatrizInteractiva } from "@/components/report/MatrizInteractiva";
import type { Activity } from "@/hooks/useMatriz";
import {
  getSingleDiagnosticFn,
  getDiagnosticsFn,
  updateWorkspaceDataFn,
} from "@/lib/bigquery.functions";
import {
  DIMENSIONS,
  DIM_MAX,
  PERFIL_CONFIG,
  TIER_COLORS,
  TIER_COLORS_LIGHT,
  TIER_NAMES,
} from "@/data/constants";
import {
  ANDRES_PROJECTS,
  ANDRES_SKILLS,
  ANDRES_PROMPTS,
  ANDRES_RESOURCES,
  ANDRES_ROADMAP_TASKS,
} from "@/data/seedData";
import type {
  Diagnostic,
  WorkspaceProject,
  WorkspaceSkill,
  WorkspacePrompt,
  WorkspaceResource,
  RoadmapTask,
  DimScores,
} from "@/types";
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  FolderKanban,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Circle,
  RefreshCw,
  Zap,
  Tag,
  Clock,
  Layers,
  ChevronRight,
  FileCode,
  Sliders,
  Globe,
  Share2,
  Download,
  BookOpen,
  UserCheck,
  Search,
  Building2,
  Video,
  FileText,
  Link,
  Wrench,
  ExternalLink,
  Users,
  Folder,
  TrendingUp,
  Target,
  Filter,
  RotateCcw,
} from "lucide-react";
import {
  ActivityTemporalFilter,
  type TemporalFilterState,
} from "@/components/dashboard/ActivityTemporalFilter";
import {
  isDateInRange,
  getTodayDateStr,
  formatDatePretty,
} from "@/lib/dateUtils";
import { hasPermission } from "@/lib/roles";
import { ProjectCardItem } from "@/components/ProjectCardItem";
import { COMPANY_STRATEGIC_OBJECTIVES } from "@/lib/constants";

// Default initial tasks for 30, 60, 90 days roadmap
const DEFAULT_ROADMAP_TASKS: RoadmapTask[] = [
  // 30 Días
  {
    id: "r-30-1",
    horizon: "30",
    title: "Mapear 3 actividades repetitivas de mi área en la Matriz",
    description:
      "Identificar tareas rutinarias de alto tiempo y clasificar su valor y frecuencia.",
    completed: true,
    completedAt: "2026-07-20",
  },
  {
    id: "r-30-2",
    horizon: "30",
    title: "Crear y probar 2 Prompts para tareas diarias",
    description:
      "Estructurar prompts con etiquetas [Rol], [Contexto] e [Instrucciones] para resúmenes o correos.",
    completed: false,
  },
  {
    id: "r-30-3",
    horizon: "30",
    title: "Configurar espacio de trabajo y biblioteca de contexto personal",
    description:
      "Guardar las primeras skills de IA y notas operativas en mi panel personal.",
    completed: false,
  },
  // 60 Días
  {
    id: "r-60-1",
    horizon: "60",
    title: "Estructurar primer Proyecto de Automatización de Q2/Q3",
    description:
      "Diseñar el flujo de un proyecto de copilotaje para reducir min de operación semanal.",
    completed: false,
  },
  {
    id: "r-60-2",
    horizon: "60",
    title: "Desarrollar 1 Skill de IA para el equipo de mi área",
    description:
      "Crear una herramienta orientada a la extracción o enriquecimiento de datos de área.",
    completed: false,
  },
  {
    id: "r-60-3",
    horizon: "60",
    title: "Realizar revisión de calidad y sesgo en salidas de la IA",
    description:
      "Validar precisión de respuestas y establecer protocolo de revisión humana.",
    completed: false,
  },
  // 90 Días
  {
    id: "r-90-1",
    horizon: "90",
    title: "Implementar Agente Autónomo o Flujo Integrado (Q4)",
    description:
      "Desplegar el primer proyecto en producción con medición de impacto.",
    completed: false,
  },
  {
    id: "r-90-2",
    horizon: "90",
    title: "Presentar resultados de tiempo ahorrado y métricas de adopción",
    description:
      "Documentar horas optimizadas al mes y compartir aprendizajes en la compañía.",
    completed: false,
  },
];

const DEFAULT_PROJECTS: WorkspaceProject[] = [
  {
    id: "proj-1",
    title: "Asistente de Resumen de Reportes Semanales",
    description:
      "Construcción de prompt y flujo con IA para sintetizar indicadores clave de gestión.",
    participants: "Carlos Mendoza, Ana María Restrepo, Equipo de TI",
    dimension: "Automatización",
    status: "en_proceso",
    impact: "alto",
    createdAt: "2026-07-28",
    publishedAt: "2026-07-28",
    strategicObjectives: ["obj-1", "obj-2"],
    keyOutcome:
      "Ahorro estimado de 3.5 horas semanales por directivo en consolidación de KPIs.",
    usedPrompt:
      "Actúa como un analista de operaciones sénior. Procesa la matriz de indicadores adjunta y genera un resumen ejecutivo con 3 alertas prioritarias.",
    isPublished: true,
    authorName: "Carlos Mendoza",
    authorArea: "Operaciones",
  },
  {
    id: "proj-2",
    title: "Estandarización de Base de Datos y Limpieza con Prompting",
    description:
      "Limpia y estructura inconsistencias en registros antes de cargarlos al CRM.",
    participants: "Laura Gómez (Líder CRM), Diego Silva",
    dimension: "Datos",
    status: "idea",
    impact: "medio",
    createdAt: "2026-08-12",
    publishedAt: "2026-08-12",
    strategicObjectives: ["obj-2", "obj-3"],
    keyOutcome:
      "Estandarización automática del 95% de campos de contacto con sintaxis uniforme.",
    usedPrompt:
      "Normaliza la siguiente lista de registros de clientes en JSON asegurando código de país E.164 y nombres capitalizados.",
    isPublished: true,
    authorName: "Laura Gómez",
    authorArea: "Tecnología",
  },
  {
    id: "proj-3",
    title: "Agente Automatizado de Validación Documental y Cumplimiento",
    description:
      "Auditoría automática de contratos y órdenes de compra comparando cláusulas con el repositorio corporativo.",
    participants: "Jorge Ramírez, Equipo Jurídico",
    dimension: "Calidad",
    status: "completado",
    impact: "alto",
    highImpactStatus: "postulado",
    createdAt: "2026-08-25",
    publishedAt: "2026-08-25",
    keyOutcome:
      "Reducción del 75% en tiempos de revisión legal y cero inconsistencias contractuales.",
    isPublished: true,
    authorName: "Jorge Ramírez",
    authorArea: "Auditoría",
  },
  {
    id: "proj-4",
    title: "Chatbot de Onboarding y Cultura de Inteligencia Artificial",
    description:
      "Asistente conversacional para acompañar a nuevos colaboradores en el uso de herramientas IA aprobadas.",
    participants: "María Fernanda Ríos, Gestión Humana",
    dimension: "Autonomía",
    status: "en_proceso",
    impact: "medio",
    createdAt: "2026-08-31",
    publishedAt: "2026-08-31",
    keyOutcome:
      "Aceleración del tiempo de inducción en un 40% con resolución inmediata de dudas frecuentes.",
    isPublished: true,
    authorName: "María Fernanda Ríos",
    authorArea: "Gestión Humana",
  },
];

const DEFAULT_SKILLS: WorkspaceSkill[] = [
  {
    id: "skill-1",
    name: "Extracción y Clasificación de Datos Unificados",
    description:
      "Analiza textos sin estructurar y los devuelve en JSON estructurado para el sistema.",
    category: "Datos & Contexto",
    tool: "Gemini 3.5 Flash",
    createdAt: "2026-07-28",
    isPublished: true,
    authorName: "Óscar Andrés Cuéllar",
    authorArea: "Tecnología",
    publishedAt: "2026-07-28",
  },
  {
    id: "skill-2",
    name: "Revisor de Estilo y Protocolo de Comunicación",
    description:
      "Corrige tono, ortografía y estructura según el manual de marca de la empresa.",
    category: "Calidad",
    tool: "Prompts Estructurados",
    createdAt: "2026-08-04",
    isPublished: false,
    authorName: "Óscar Andrés Cuéllar",
    authorArea: "Tecnología",
  },
];

const DEFAULT_PROMPTS: WorkspacePrompt[] = [
  {
    id: "prompt-1",
    title: "Prompt de Resumen Ejecutivo",
    role: "Consultor Senior de Estrategia",
    category: "Síntesis de Información",
    content: `[Rol]: Actúa como un Consultor Senior en Estrategia de Operaciones.
[Contexto]: Te comparto la siguiente minuta de reunión con notas operativas.
[Instrucciones]: 1. Extrae los 3 acuerdos principales. 2. Identifica los riesgos de ejecución. 3. Define la lista de accionables con responsables implícitos.
[Formato de Salida]: Markdown limpio con viñetas y tabla de accionables.`,
    createdAt: "2026-07-29",
    isPublished: true,
    authorName: "Óscar Andrés Cuéllar",
    authorArea: "Tecnología",
    publishedAt: "2026-07-29",
  },
];

// Seed shared resources for organizational Master Library
const DEFAULT_ORG_MASTER_SKILLS: WorkspaceSkill[] = [
  {
    id: "org-skill-1",
    name: "Extracción y Clasificación de Datos Unificados",
    description:
      "Analiza textos sin estructurar y los devuelve en JSON estructurado para el sistema.",
    category: "Datos & Contexto",
    tool: "Gemini 3.5 Flash",
    createdAt: "2026-07-28",
    isPublished: true,
    authorName: "Óscar Andrés Cuéllar",
    authorArea: "Tecnología",
    publishedAt: "2026-07-28",
  },
  {
    id: "org-skill-2",
    name: "Generador de Minutas y Acuerdos de Reunión",
    description:
      "Convierte transcripciones de audio o notas brutas en listas de compromisos con responsables y fechas.",
    category: "Productividad",
    tool: "Claude 3.5 Sonnet",
    createdAt: "2026-08-04",
    isPublished: true,
    authorName: "María Fernanda Ríos",
    authorArea: "Gestión Humana",
    publishedAt: "2026-08-04",
  },
  {
    id: "org-skill-3",
    name: "Optimizador de Flujos Q3 Automatización",
    description:
      "Genera código Make.com/n8n para automatizar el traspaso de correos recibidos a filas de Google Sheets.",
    category: "Automatización",
    tool: "Gemini Pro / Make",
    createdAt: "2026-08-12",
    isPublished: true,
    authorName: "Carlos Mendoza",
    authorArea: "Operaciones",
    publishedAt: "2026-08-12",
  },
  {
    id: "skill-andres-1",
    name: "Segmentación de Audiencias Digitales y Buyer Personas",
    description:
      "Extrae patrones de comportamiento de clientes para estructurar perfiles psicográficos automatizados.",
    category: "Datos & Contexto",
    tool: "Gemini 3.5 Flash",
    createdAt: "2026-08-19",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-19",
  },
  {
    id: "skill-andres-2",
    name: "Generador de Copys Multicanal y Test A/B",
    description:
      "Crea variaciones de textos publicitarios para Meta Ads y Google Search según embudo de ventas.",
    category: "Creatividad & Contenido",
    tool: "Prompts Estructurados",
    createdAt: "2026-08-27",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-27",
  },
  {
    id: "org-skill-4",
    name: "Generador de Dashboards y Consultas SQL Automatizadas",
    description:
      "Traduce preguntas de negocio en lenguaje natural a consultas SQL optimizadas con visualización gráfica.",
    category: "Analítica & Datos",
    tool: "Gemini 3.5 Pro",
    createdAt: "2026-08-31",
    isPublished: true,
    authorName: "Carolina Herrera",
    authorArea: "Tecnología",
    publishedAt: "2026-08-31",
  },
];

const DEFAULT_ORG_MASTER_PROMPTS: WorkspacePrompt[] = [
  {
    id: "org-prompt-1",
    title: "Prompt de Resumen Ejecutivo",
    role: "Consultor Senior de Estrategia",
    category: "Síntesis de Información",
    content: `[Rol]: Actúa como un Consultor Senior en Estrategia de Operaciones.
[Contexto]: Te comparto la siguiente minuta de reunión con notas operativas.
[Instrucciones]: 1. Extrae los 3 acuerdos principales. 2. Identifica los riesgos de ejecución. 3. Define la lista de accionables con responsables implícitos.
[Formato de Salida]: Markdown limpio con viñetas y tabla de accionables.`,
    createdAt: "2026-07-29",
    isPublished: true,
    authorName: "Óscar Andrés Cuéllar",
    authorArea: "Tecnología",
    publishedAt: "2026-07-29",
  },
  {
    id: "org-prompt-2",
    title: "Validador de Calidad y Detección de Sesgos",
    role: "Auditor de Calidad IA",
    category: "Calidad & Gobierno",
    content: `[Rol]: Eres un Auditor Especializado en Control de Calidad de IA.
[Contexto]: Revisa el siguiente texto generado automáticamente por una IA.
[Instrucciones]: 1. Verifica si hay alucinaciones o datos imprecisos. 2. Evalúa si el tono cumple con el estándar corporativo. 3. Asigna un puntaje de 1 a 10 e indica correcciones.`,
    createdAt: "2026-08-06",
    isPublished: true,
    authorName: "Ana Lucía Gómez",
    authorArea: "Dirección",
    publishedAt: "2026-08-06",
  },
  {
    id: "org-prompt-3",
    title: "Estructurador de OKRs y Proyectos Q2/Q3",
    role: "Líder de Transformación Digital",
    category: "Estrategia",
    content: `[Rol]: Experto en Metodologías Ágiles y OKRs.
[Instrucciones]: Convierte la meta descrita a continuación en 1 Objetivo Principal y 3 Resultados Clave medibles (KRs) con indicadores cuantitativos.`,
    createdAt: "2026-08-14",
    isPublished: true,
    authorName: "Jorge Ramírez",
    authorArea: "Auditoría",
    publishedAt: "2026-08-14",
  },
  {
    id: "prompt-andres-1",
    title: "Prompt de Brief Creativo y Estrategia de Campaña",
    role: "Director de Estrategia de Marca",
    category: "Estrategia de Mercadeo",
    content: `[Rol]: Director de Estrategia de Marca para Strategic Brands.
[Contexto]: Lanzamiento de nueva línea de producto.
[Instrucciones]: Genera un brief creativo con propuesta de valor, pilares de contenido y KPIs sugeridos.
[Formato]: Tabla Markdown.`,
    createdAt: "2026-08-21",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-21",
  },
  {
    id: "prompt-andres-2",
    title: "Prompt de Optimización de ROI en Pauta Digital",
    role: "Analista Senior de Performance",
    category: "Pauta Digital",
    content: `[Rol]: Analista de Performance.
[Instrucciones]: Analiza las métricas de CPA, CTR y ROAS proporcionadas y recomienda 3 redistribuciones de presupuesto.
[Formato]: Resumen ejecutivo.`,
    createdAt: "2026-08-28",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-28",
  },
  {
    id: "org-prompt-4",
    title: "Asistente de Revisión Legal y Políticas de Privacidad",
    role: "Especialista en Gobierno y Regulación",
    category: "Gobierno & Legal",
    content: `[Rol]: Abogado Corporativo especializado en Datos Personales y Compliance.
[Instrucciones]: Evalúa la siguiente cláusula contractual frente a la normativa de protección de datos y marca en rojo posibles contingencias.`,
    createdAt: "2026-08-31",
    isPublished: true,
    authorName: "Felipe Soto",
    authorArea: "Legal & Cumplimiento",
    publishedAt: "2026-08-31",
  },
];

const DEFAULT_RESOURCES: WorkspaceResource[] = [
  {
    id: "res-1",
    title: "Masterclass: Agentes Autónomos con LangChain y Gemini",
    description:
      "Tutorial práctico en video sobre la construcción de agentes multi-herramienta y flujos RAG corporativos.",
    type: "youtube",
    urlOrFile: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Agentes & Arquitectura",
    tags: ["Agentes", "Gemini", "RAG", "Python"],
    createdAt: "2026-07-29",
    isPublished: true,
    authorName: "Carlos Mendoza",
    authorArea: "Operaciones",
    publishedAt: "2026-07-29",
  },
  {
    id: "res-2",
    title: "Guía de Gobierno e Implementación Ética de IA Corporativa",
    description:
      "Documento marco con lineamientos regulatorios y políticas institucionales para el uso responsable de IA.",
    type: "documento",
    urlOrFile: "https://drive.google.com/file/d/ejemplo-guia-gobierno-ia/view",
    category: "Gobierno & Ética",
    tags: ["Gobierno", "Seguridad", "Políticas", "PDF"],
    createdAt: "2026-08-07",
    isPublished: true,
    authorName: "Ana Lucía Gómez",
    authorArea: "Dirección",
    publishedAt: "2026-08-07",
  },
  {
    id: "res-3",
    title: "Repositorio de Templates Prompt Engineering para Equipos Tácticos",
    description:
      "Biblioteca de referencias externas con ejemplos prácticos de prompts estructurados para automatización diaria.",
    type: "enlace",
    urlOrFile: "https://github.com/topics/prompt-engineering",
    category: "Productividad",
    tags: ["GitHub", "Prompts", "Plantillas"],
    createdAt: "2026-08-15",
    isPublished: false,
  },
  {
    id: "res-andres-yt-1",
    title: "Estrategias de IA Generativa en Marketing y Publicidad 2026",
    description:
      "Conferencia magistral sobre el uso de modelos multimodales para la creación de campañas hiperpersonalizadas.",
    type: "youtube",
    urlOrFile: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Estrategia & IA",
    tags: ["Marketing", "IA", "YouTube", "Estrategia"],
    createdAt: "2026-08-16",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-16",
  },
  {
    id: "res-andres-pdf-1",
    title: "Playbook_Marketing_Digital_e_IA_Strategic_Brands_2026.pdf",
    description:
      "Manual operativo con estándares de implementación de Inteligencia Artificial en el área de mercadeo.",
    type: "documento",
    urlOrFile:
      "https://strategicbrands.com/docs/Playbook_Marketing_Digital_e_IA_Strategic_Brands_2026.pdf",
    category: "Estrategia",
    tags: ["PDF", "Playbook", "Manual", "Strategic Brands"],
    createdAt: "2026-08-22",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-22",
  },
  {
    id: "res-andres-web-1",
    title: "Portal de Herramientas de Marketing e Inteligencia Artificial",
    description:
      "Directorio de recursos web recomendados para la optimización de pauta y SEO.",
    type: "enlace",
    urlOrFile: "https://strategicbrands.com/recursos-ia",
    category: "Herramientas",
    tags: ["Web", "Herramientas", "Portal"],
    createdAt: "2026-08-29",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-08-29",
  },
];

// Helper component for AWARE Stage Letter Box
function StageLetterBox({
  letter,
  size = "md",
}: {
  letter: "A" | "W" | "R" | "E";
  size?: "sm" | "md" | "lg";
}) {
  let sizeClasses = "w-5 h-5 text-xs rounded-md";
  if (size === "sm") sizeClasses = "w-4 h-4 text-[10px] rounded";
  if (size === "lg") sizeClasses = "w-7 h-7 text-sm rounded-lg";

  let colorClasses = "bg-white/90 text-[#70756B] border-[#E2E2D8]";
  if (letter === "E")
    colorClasses = "bg-white/90 text-[#B5731B] border-[#F2E5D3]";
  if (letter === "R")
    colorClasses = "bg-white/90 text-[#82A012] border-[#E2ECD2]";
  if (letter === "W")
    colorClasses = "bg-white/90 text-[#C84B31] border-[#F9DCD6]";

  return (
    <span
      className={`${sizeClasses} ${colorClasses} border flex items-center justify-center font-poppins font-bold shrink-0 shadow-2xs`}
    >
      {letter}
    </span>
  );
}

export function UserWorkspaceScreen() {
  const { currentEmployeeId, navigateTo, role, screen } = useApp();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(true);

  // Left side sub-tab state
  const [leftTab, setLeftTab] = useState<
    | "matriz"
    | "proyectos"
    | "recursos"
    | "otros_recursos"
    | "comunidad_humanai"
    | "plan"
  >("matriz");

  const [, setPermVersion] = useState(0);

  useEffect(() => {
    const handlePermUpdate = () => {
      setPermVersion((prev) => prev + 1);
    };
    window.addEventListener("roles_permissions_updated", handlePermUpdate);
    return () => {
      window.removeEventListener("roles_permissions_updated", handlePermUpdate);
    };
  }, []);

  useEffect(() => {
    if (leftTab === "plan" && !hasPermission(role, "view_workplan")) {
      setLeftTab("matriz");
    }
  }, [leftTab, role]);

  // User Workspace Data state (persisted locally)
  const storageKey = `user_workspace_data_${currentEmployeeId || "default"}`;

  const [projects, setProjects] = useState<WorkspaceProject[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PROJECTS;
    if (currentEmployeeId === "emp-andres-piedrahita") {
      const saved = localStorage.getItem(`${storageKey}_projects`);
      return saved ? JSON.parse(saved) : ANDRES_PROJECTS;
    }
    const saved = localStorage.getItem(`${storageKey}_projects`);
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [skills, setSkills] = useState<WorkspaceSkill[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SKILLS;
    if (currentEmployeeId === "emp-andres-piedrahita") {
      const saved = localStorage.getItem(`${storageKey}_skills`);
      return saved ? JSON.parse(saved) : ANDRES_SKILLS;
    }
    const saved = localStorage.getItem(`${storageKey}_skills`);
    return saved ? JSON.parse(saved) : DEFAULT_SKILLS;
  });

  const [prompts, setPrompts] = useState<WorkspacePrompt[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PROMPTS;
    if (currentEmployeeId === "emp-andres-piedrahita") {
      const saved = localStorage.getItem(`${storageKey}_prompts`);
      return saved ? JSON.parse(saved) : ANDRES_PROMPTS;
    }
    const saved = localStorage.getItem(`${storageKey}_prompts`);
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  const [resources, setResources] = useState<WorkspaceResource[]>(() => {
    if (typeof window === "undefined") return DEFAULT_RESOURCES;
    if (currentEmployeeId === "emp-andres-piedrahita") {
      const saved = localStorage.getItem(`${storageKey}_resources`);
      return saved ? JSON.parse(saved) : ANDRES_RESOURCES;
    }
    const saved = localStorage.getItem(`${storageKey}_resources`);
    return saved ? JSON.parse(saved) : DEFAULT_RESOURCES;
  });

  const [tasks, setTasks] = useState<RoadmapTask[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ROADMAP_TASKS;
    if (currentEmployeeId === "emp-andres-piedrahita") {
      const saved = localStorage.getItem(`${storageKey}_tasks`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return ANDRES_ROADMAP_TASKS;
        }
      }
      return ANDRES_ROADMAP_TASKS;
    }
    const saved = localStorage.getItem(`${storageKey}_tasks`);
    if (saved) {
      try {
        const parsed: RoadmapTask[] = JSON.parse(saved);
        return parsed.map((t) => ({
          ...t,
          title: t.title.replace(/Prompts?\s+Maestros?/gi, "Prompts"),
        }));
      } catch {
        return DEFAULT_ROADMAP_TASKS;
      }
    }
    return DEFAULT_ROADMAP_TASKS;
  });

  // Roadmap active horizon tab
  const [activeHorizon, setActiveHorizon] = useState<"30" | "60" | "90">("30");

  // Modals / Form toggles
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const [resourceTypeFilter, setResourceTypeFilter] = useState<
    "todos" | "youtube" | "documento" | "enlace" | "herramienta" | "otro"
  >("todos");

  const [resourceCommunityFilter, setResourceCommunityFilter] = useState<
    "todos" | "mis_recursos" | "comunidad"
  >("todos");

  const [resourceSearch, setResourceSearch] = useState("");

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "youtube" as
      "youtube" | "documento" | "enlace" | "herramienta" | "otro",
    urlOrFile: "",
    category: "General",
    tags: "",
    publishToCommunity: true,
  });

  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    participants: "",
    dimension: "Automatización",
    impact: "alto" as "alto" | "medio" | "bajo",
    strategicObjectives: [] as string[],
    keyOutcome: "",
    usedPrompt: "",
    resourceLink: "",
    isPublished: false,
  });

  const [masterSkills, setMasterSkills] = useState<WorkspaceSkill[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ORG_MASTER_SKILLS;
    const saved = localStorage.getItem("org_master_skills");
    return saved ? JSON.parse(saved) : DEFAULT_ORG_MASTER_SKILLS;
  });

  const [masterPrompts, setMasterPrompts] = useState<WorkspacePrompt[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ORG_MASTER_PROMPTS;
    const saved = localStorage.getItem("org_master_prompts");
    return saved ? JSON.parse(saved) : DEFAULT_ORG_MASTER_PROMPTS;
  });

  const [activeLibraryTab, setActiveLibraryTab] = useState<
    "mis_recursos" | "biblioteca_maestra"
  >("mis_recursos");

  const [masterSearch, setMasterSearch] = useState("");
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<
    "todos" | "skills" | "prompts" | "proyectos" | "alto_impacto" | "recursos"
  >("todos");

  // Temporal & Area filter states for Comunidad HumanAI
  const [communityTemporalFilter, setCommunityTemporalFilter] =
    useState<TemporalFilterState>({
      mode: "all",
      selectedWeek: null,
      selectedDay: null,
      startDate: null,
      endDate: null,
      activityCategory: "all",
    });

  const [communityAreaFilter, setCommunityAreaFilter] =
    useState<string>("todas");

  useEffect(() => {
    if (screen === "comunidad-humanai") {
      setLeftTab("comunidad_humanai");
      setActiveLibraryTab("biblioteca_maestra");
    }
  }, [screen]);

  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    category: "Automatización",
    tool: "Gemini / Prompts",
    publishToMaster: true,
  });

  const [newPrompt, setNewPrompt] = useState({
    title: "",
    role: "Experto en IA",
    category: "Productividad",
    content: "",
    publishToMaster: true,
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Dynamic list of areas present in community assets
  const availableCommunityAreas = useMemo(() => {
    const areas = new Set<string>();
    masterSkills.forEach((s) => {
      if (s.authorArea) areas.add(s.authorArea);
    });
    masterPrompts.forEach((p) => {
      if (p.authorArea) areas.add(p.authorArea);
    });
    projects.forEach((p) => {
      if (p.authorArea) areas.add(p.authorArea);
    });
    resources.forEach((r) => {
      if (r.authorArea) areas.add(r.authorArea);
    });
    return Array.from(areas).sort();
  }, [masterSkills, masterPrompts, projects, resources]);

  // Derived filtered lists for Master Library with date & area support
  const filteredMasterSkills = useMemo(() => {
    return masterSkills.filter((sk) => {
      // Activity category filter from temporal component
      if (
        communityTemporalFilter.activityCategory !== "all" &&
        communityTemporalFilter.activityCategory !== "skills"
      ) {
        return false;
      }

      // Date range filtering
      const itemDate = sk.publishedAt || sk.createdAt;
      if (
        !isDateInRange(
          itemDate,
          communityTemporalFilter.startDate,
          communityTemporalFilter.endDate,
        )
      ) {
        return false;
      }

      // Area filter
      if (
        communityAreaFilter !== "todas" &&
        sk.authorArea?.toLowerCase() !== communityAreaFilter.toLowerCase()
      ) {
        return false;
      }

      // Search query
      const q = masterSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        sk.name.toLowerCase().includes(q) ||
        sk.description.toLowerCase().includes(q) ||
        sk.tool.toLowerCase().includes(q) ||
        (sk.category && sk.category.toLowerCase().includes(q)) ||
        (sk.authorName && sk.authorName.toLowerCase().includes(q)) ||
        (sk.authorArea && sk.authorArea.toLowerCase().includes(q))
      );
    });
  }, [
    masterSkills,
    masterSearch,
    communityTemporalFilter,
    communityAreaFilter,
  ]);

  const filteredMasterPrompts = useMemo(() => {
    return masterPrompts.filter((p) => {
      // Activity category filter from temporal component
      if (
        communityTemporalFilter.activityCategory !== "all" &&
        communityTemporalFilter.activityCategory !== "prompts"
      ) {
        return false;
      }

      // Date range filtering
      const itemDate = p.publishedAt || p.createdAt;
      if (
        !isDateInRange(
          itemDate,
          communityTemporalFilter.startDate,
          communityTemporalFilter.endDate,
        )
      ) {
        return false;
      }

      // Area filter
      if (
        communityAreaFilter !== "todas" &&
        p.authorArea?.toLowerCase() !== communityAreaFilter.toLowerCase()
      ) {
        return false;
      }

      // Search query
      const q = masterSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.authorName && p.authorName.toLowerCase().includes(q)) ||
        (p.authorArea && p.authorArea.toLowerCase().includes(q))
      );
    });
  }, [
    masterPrompts,
    masterSearch,
    communityTemporalFilter,
    communityAreaFilter,
  ]);

  const filteredMasterResources = useMemo(() => {
    return resources.filter((r) => {
      if (!r.isPublished) return false;

      // Activity category filter from temporal component
      if (
        communityTemporalFilter.activityCategory !== "all" &&
        communityTemporalFilter.activityCategory !== "recursos"
      ) {
        return false;
      }

      // Date range filtering
      const itemDate = r.publishedAt || r.createdAt;
      if (
        !isDateInRange(
          itemDate,
          communityTemporalFilter.startDate,
          communityTemporalFilter.endDate,
        )
      ) {
        return false;
      }

      // Area filter
      if (
        communityAreaFilter !== "todas" &&
        r.authorArea?.toLowerCase() !== communityAreaFilter.toLowerCase()
      ) {
        return false;
      }

      // Search query
      const q = masterSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.authorName && r.authorName.toLowerCase().includes(q)) ||
        (r.authorArea && r.authorArea.toLowerCase().includes(q)) ||
        r.type.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    });
  }, [resources, masterSearch, communityTemporalFilter, communityAreaFilter]);

  const filteredMasterProjects = useMemo(() => {
    return projects.filter((p) => {
      const isCommunity =
        p.isPublished ||
        p.impact === "alto" ||
        p.highImpactStatus !== undefined;
      if (!isCommunity) return false;

      // Activity category filter from temporal component
      if (
        communityTemporalFilter.activityCategory !== "all" &&
        communityTemporalFilter.activityCategory !== "proyectos"
      ) {
        return false;
      }

      // Date range filtering
      const itemDate = p.publishedAt || p.createdAt;
      if (
        !isDateInRange(
          itemDate,
          communityTemporalFilter.startDate,
          communityTemporalFilter.endDate,
        )
      ) {
        return false;
      }

      // Area filter
      if (
        communityAreaFilter !== "todas" &&
        p.authorArea?.toLowerCase() !== communityAreaFilter.toLowerCase()
      ) {
        return false;
      }

      // Search query
      const q = masterSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.dimension.toLowerCase().includes(q) ||
        (p.participants && p.participants.toLowerCase().includes(q)) ||
        (p.keyOutcome && p.keyOutcome.toLowerCase().includes(q)) ||
        (p.authorName && p.authorName.toLowerCase().includes(q)) ||
        (p.authorArea && p.authorArea.toLowerCase().includes(q))
      );
    });
  }, [projects, masterSearch, communityTemporalFilter, communityAreaFilter]);

  const filteredHighImpactProjects = useMemo(() => {
    return filteredMasterProjects.filter(
      (p) => p.impact === "alto" || p.highImpactStatus !== undefined,
    );
  }, [filteredMasterProjects]);

  const totalAllUnfilteredCommunityAssets = useMemo(() => {
    const pubSkills = masterSkills.length;
    const pubPrompts = masterPrompts.length;
    const pubProjects = projects.filter(
      (p) =>
        p.isPublished ||
        p.impact === "alto" ||
        p.highImpactStatus !== undefined,
    ).length;
    const pubResources = resources.filter((r) => r.isPublished).length;
    return pubSkills + pubPrompts + pubProjects + pubResources;
  }, [masterSkills, masterPrompts, projects, resources]);

  const totalCommunityAssets =
    filteredMasterSkills.length +
    filteredMasterPrompts.length +
    filteredMasterProjects.length +
    filteredMasterResources.length;

  const isCommunityFilterActive =
    communityTemporalFilter.mode !== "all" ||
    communityTemporalFilter.activityCategory !== "all" ||
    communityAreaFilter !== "todas" ||
    masterSearch.trim() !== "";

  const handleResetCommunityFilter = () => {
    setCommunityTemporalFilter({
      mode: "all",
      selectedWeek: null,
      selectedDay: null,
      startDate: null,
      endDate: null,
      activityCategory: "all",
    });
    setCommunityAreaFilter("todas");
    setMasterSearch("");
    setMasterCategoryFilter("todos");
  };

  const isWorkspaceLoadedRef = useRef(false);

  // Load persisted state whenever storageKey changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const isAndres =
        currentEmployeeId === "emp-andres-piedrahita" ||
        storageKey.includes("emp-andres-piedrahita");

      const savedProjs = localStorage.getItem(`${storageKey}_projects`);
      if (savedProjs) {
        setProjects(JSON.parse(savedProjs));
      } else if (isAndres) {
        setProjects(ANDRES_PROJECTS);
      }

      const savedSkills = localStorage.getItem(`${storageKey}_skills`);
      if (savedSkills) {
        setSkills(JSON.parse(savedSkills));
      } else if (isAndres) {
        setSkills(ANDRES_SKILLS);
      }

      const savedPrompts = localStorage.getItem(`${storageKey}_prompts`);
      if (savedPrompts) {
        setPrompts(JSON.parse(savedPrompts));
      } else if (isAndres) {
        setPrompts(ANDRES_PROMPTS);
      }

      const savedRes = localStorage.getItem(`${storageKey}_resources`);
      if (savedRes) {
        setResources(JSON.parse(savedRes));
      } else if (isAndres) {
        setResources(ANDRES_RESOURCES);
      }

      const savedTasks = localStorage.getItem(`${storageKey}_tasks`);
      if (savedTasks) {
        const parsed: RoadmapTask[] = JSON.parse(savedTasks);
        setTasks(
          parsed.map((t) => ({
            ...t,
            title: t.title.replace(/Prompts?\s+Maestros?/gi, "Prompts"),
          })),
        );
      } else if (isAndres) {
        setTasks(ANDRES_ROADMAP_TASKS);
      }

      const savedMSkills = localStorage.getItem("org_master_skills");
      if (savedMSkills) setMasterSkills(JSON.parse(savedMSkills));

      const savedMPrompts = localStorage.getItem("org_master_prompts");
      if (savedMPrompts) setMasterPrompts(JSON.parse(savedMPrompts));
    } catch (err) {
      console.warn("Failed to load workspace state from localStorage:", err);
    }
    isWorkspaceLoadedRef.current = true;
  }, [storageKey, currentEmployeeId]);

  // Persist state changes only after initial load for current storageKey (localStorage + BigQuery)
  useEffect(() => {
    if (typeof window !== "undefined" && isWorkspaceLoadedRef.current) {
      localStorage.setItem(`${storageKey}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${storageKey}_skills`, JSON.stringify(skills));
      localStorage.setItem(`${storageKey}_prompts`, JSON.stringify(prompts));
      localStorage.setItem(
        `${storageKey}_resources`,
        JSON.stringify(resources),
      );
      localStorage.setItem(`${storageKey}_tasks`, JSON.stringify(tasks));
      localStorage.setItem("org_master_skills", JSON.stringify(masterSkills));
      localStorage.setItem("org_master_prompts", JSON.stringify(masterPrompts));

      if (diagnostic?.id) {
        updateWorkspaceDataFn({
          data: {
            id: diagnostic.id,
            workspace_data: {
              projects,
              skills,
              prompts,
              resources,
              tasks,
              masterSkills,
              masterPrompts,
            },
          },
        }).catch((err) => {
          console.warn("Failed to update workspace_data in BigQuery:", err);
        });
      }
    }
  }, [
    projects,
    skills,
    prompts,
    resources,
    tasks,
    masterSkills,
    masterPrompts,
    storageKey,
    diagnostic?.id,
  ]);

  // Load user diagnostic
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingDiag(true);
      let loadedDiag: Diagnostic | null = null;
      if (currentEmployeeId) {
        const diag = await getSingleDiagnosticFn({
          data: { employeeId: currentEmployeeId },
        });
        loadedDiag = (diag as unknown as Diagnostic) ?? null;
      } else {
        // Fallback to latest diagnostic from all
        const all = await getDiagnosticsFn();
        if (all && all.length > 0) {
          loadedDiag = all[0] as unknown as Diagnostic;
        }
      }

      if (!cancelled) {
        setDiagnostic(loadedDiag);
        if (loadedDiag && loadedDiag.workspace_data) {
          const ws = loadedDiag.workspace_data;
          if (ws.projects) setProjects(ws.projects);
          if (ws.skills) setSkills(ws.skills);
          if (ws.prompts) setPrompts(ws.prompts);
          if (ws.resources) setResources(ws.resources);
          if (ws.tasks) setTasks(ws.tasks);
          if (ws.masterSkills) setMasterSkills(ws.masterSkills);
          if (ws.masterPrompts) setMasterPrompts(ws.masterPrompts);
        }
        setLoadingDiag(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentEmployeeId]);

  // Project handlers
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const created: WorkspaceProject = {
      id: `proj-${Date.now()}`,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      participants: newProject.participants.trim() || undefined,
      dimension: newProject.dimension,
      status: "idea",
      impact: newProject.impact,
      highImpactStatus: newProject.impact === "alto" ? "postulado" : undefined,
      createdAt: new Date().toISOString().split("T")[0],
      strategicObjectives: newProject.strategicObjectives.length
        ? newProject.strategicObjectives
        : undefined,
      keyOutcome: newProject.keyOutcome.trim() || undefined,
      usedPrompt: newProject.usedPrompt.trim() || undefined,
      resourceLink: newProject.resourceLink.trim() || undefined,
      isPublished: newProject.isPublished,
      publishedAt: newProject.isPublished
        ? new Date().toISOString()
        : undefined,
      authorName: newProject.isPublished ? fullName : undefined,
      authorArea: newProject.isPublished ? area : undefined,
    };

    setProjects([created, ...projects]);
    setNewProject({
      title: "",
      description: "",
      participants: "",
      dimension: "Automatización",
      impact: "alto",
      strategicObjectives: [],
      keyOutcome: "",
      usedPrompt: "",
      resourceLink: "",
      isPublished: false,
    });
    setShowAddProject(false);

    if (created.isPublished) {
      setFeedbackToast({
        show: true,
        message: `¡Proyecto "${created.title}" creado y publicado en la comunidad!`,
        type: "success",
      });
    }
  };

  const handleUpdateProjectStatus = (
    id: string,
    status: "idea" | "en_proceso" | "completado",
  ) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleUpdateProjectParticipants = (
    id: string,
    participants: string,
  ) => {
    setProjects(
      projects.map((p) =>
        p.id === id
          ? { ...p, participants: participants ? participants : undefined }
          : p,
      ),
    );
  };

  const handleTogglePublishProject = (id: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === id) {
          const isPublished = !p.isPublished;
          if (isPublished) {
            setFeedbackToast({
              show: true,
              message: `¡Proyecto "${p.title}" publicado en la comunidad!`,
              type: "success",
            });
          } else {
            setFeedbackToast({
              show: true,
              message: `Proyecto "${p.title}" retirado de la comunidad.`,
              type: "info",
            });
          }
          return {
            ...p,
            isPublished,
            publishedAt: isPublished ? new Date().toISOString() : undefined,
            authorName: isPublished ? fullName : p.authorName,
            authorArea: isPublished ? area : p.authorArea,
          };
        }
        return p;
      }),
    );
  };

  const handleToggleProjectObjective = (id: string, objectiveId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === id) {
          const current = p.strategicObjectives || [];
          const next = current.includes(objectiveId)
            ? current.filter((o) => o !== objectiveId)
            : [...current, objectiveId];
          return { ...p, strategicObjectives: next };
        }
        return p;
      }),
    );
  };

  const handleUpdateProjectDocField = (
    id: string,
    field: "keyOutcome" | "usedPrompt" | "resourceLink",
    value: string,
  ) => {
    setProjects(
      projects.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: value ? value : undefined,
            }
          : p,
      ),
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  // Skill handlers
  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    const authorName = fullName;
    const authorArea = diagnostic?.employee?.area || "General";

    const created: WorkspaceSkill = {
      id: `skill-${Date.now()}`,
      name: newSkill.name.trim(),
      description: newSkill.description.trim(),
      category: newSkill.category,
      tool: newSkill.tool,
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: newSkill.publishToMaster,
      authorName,
      authorArea,
      publishedAt: newSkill.publishToMaster
        ? new Date().toISOString().split("T")[0]
        : undefined,
    };

    setSkills([created, ...skills]);

    if (newSkill.publishToMaster) {
      setMasterSkills([created, ...masterSkills]);
      setImportedNotice(
        `¡Skill "${created.name}" creado y publicado en la Comunidad HumanAI!`,
      );
      setTimeout(() => setImportedNotice(null), 3500);
    }

    setNewSkill({
      name: "",
      description: "",
      category: "Automatización",
      tool: "Gemini / Prompts",
      publishToMaster: true,
    });
    setShowAddSkill(false);
  };

  const handleTogglePublishSkill = (id: string) => {
    const authorName = fullName;
    const authorArea = diagnostic?.employee?.area || "General";
    let targetSkill: WorkspaceSkill | undefined;

    const updatedSkills = skills.map((sk) => {
      if (sk.id === id) {
        const isNowPublished = !sk.isPublished;
        targetSkill = {
          ...sk,
          isPublished: isNowPublished,
          authorName: isNowPublished
            ? sk.authorName || authorName
            : sk.authorName,
          authorArea: isNowPublished
            ? sk.authorArea || authorArea
            : sk.authorArea,
          publishedAt: isNowPublished
            ? new Date().toISOString().split("T")[0]
            : undefined,
        };
        return targetSkill;
      }
      return sk;
    });

    setSkills(updatedSkills);

    if (targetSkill) {
      if (targetSkill.isPublished) {
        setMasterSkills([
          targetSkill,
          ...masterSkills.filter((ms) => ms.id !== targetSkill!.id),
        ]);
        setImportedNotice(
          `Skill "${targetSkill.name}" publicado en Comunidad HumanAI.`,
        );
      } else {
        setMasterSkills(masterSkills.filter((ms) => ms.id !== targetSkill!.id));
        setImportedNotice(
          `Skill "${targetSkill.name}" retirado de Comunidad HumanAI.`,
        );
      }
      setTimeout(() => setImportedNotice(null), 3500);
    }
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
    setMasterSkills(masterSkills.filter((ms) => ms.id !== id));
  };

  // Prompt handlers
  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.title.trim() || !newPrompt.content.trim()) return;
    const authorName = fullName;
    const authorArea = diagnostic?.employee?.area || "General";

    const created: WorkspacePrompt = {
      id: `prompt-${Date.now()}`,
      title: newPrompt.title.trim(),
      role: newPrompt.role.trim(),
      category: newPrompt.category.trim(),
      content: newPrompt.content.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: newPrompt.publishToMaster,
      authorName,
      authorArea,
      publishedAt: newPrompt.publishToMaster
        ? new Date().toISOString().split("T")[0]
        : undefined,
    };

    setPrompts([created, ...prompts]);

    if (newPrompt.publishToMaster) {
      setMasterPrompts([created, ...masterPrompts]);
      setImportedNotice(
        `¡Prompt "${created.title}" creado y publicado en Comunidad HumanAI!`,
      );
      setTimeout(() => setImportedNotice(null), 3500);
    }

    setNewPrompt({
      title: "",
      role: "Experto en IA",
      category: "Productividad",
      content: "",
      publishToMaster: true,
    });
    setShowAddPrompt(false);
  };

  const handleTogglePublishPrompt = (id: string) => {
    const authorName = fullName;
    const authorArea = diagnostic?.employee?.area || "General";
    let targetPrompt: WorkspacePrompt | undefined;

    const updatedPrompts = prompts.map((p) => {
      if (p.id === id) {
        const isNowPublished = !p.isPublished;
        targetPrompt = {
          ...p,
          isPublished: isNowPublished,
          authorName: isNowPublished
            ? p.authorName || authorName
            : p.authorName,
          authorArea: isNowPublished
            ? p.authorArea || authorArea
            : p.authorArea,
          publishedAt: isNowPublished
            ? new Date().toISOString().split("T")[0]
            : undefined,
        };
        return targetPrompt;
      }
      return p;
    });

    setPrompts(updatedPrompts);

    if (targetPrompt) {
      if (targetPrompt.isPublished) {
        setMasterPrompts([
          targetPrompt,
          ...masterPrompts.filter((mp) => mp.id !== targetPrompt!.id),
        ]);
        setImportedNotice(
          `Prompt "${targetPrompt.title}" publicado en Comunidad HumanAI.`,
        );
      } else {
        setMasterPrompts(
          masterPrompts.filter((mp) => mp.id !== targetPrompt!.id),
        );
        setImportedNotice(
          `Prompt "${targetPrompt.title}" retirado de Comunidad HumanAI.`,
        );
      }
      setTimeout(() => setImportedNotice(null), 3500);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter((p) => p.id !== id));
    setMasterPrompts(masterPrompts.filter((mp) => mp.id !== id));
  };

  const handleImportSkillToPersonal = (skill: WorkspaceSkill) => {
    if (skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())) {
      setImportedNotice(`El skill "${skill.name}" ya existe en tus recursos.`);
      setTimeout(() => setImportedNotice(null), 3000);
      return;
    }
    const cloned: WorkspaceSkill = {
      ...skill,
      id: `skill-imported-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: false,
    };
    setSkills([cloned, ...skills]);
    setImportedNotice(
      `¡Skill "${skill.name}" guardado en tus recursos personales!`,
    );
    setTimeout(() => setImportedNotice(null), 3500);
  };

  const handleImportPromptToPersonal = (prompt: WorkspacePrompt) => {
    if (
      prompts.some((p) => p.title.toLowerCase() === prompt.title.toLowerCase())
    ) {
      setImportedNotice(
        `El prompt "${prompt.title}" ya existe en tus recursos.`,
      );
      setTimeout(() => setImportedNotice(null), 3000);
      return;
    }
    const cloned: WorkspacePrompt = {
      ...prompt,
      id: `prompt-imported-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: false,
    };
    setPrompts([cloned, ...prompts]);
    setImportedNotice(
      `¡Prompt "${prompt.title}" guardado en tus recursos personales!`,
    );
    setTimeout(() => setImportedNotice(null), 3500);
  };

  const handleImportProjectToPersonal = (project: WorkspaceProject) => {
    if (
      projects.some(
        (p) => p.title.toLowerCase() === project.title.toLowerCase(),
      )
    ) {
      setImportedNotice(
        `El proyecto "${project.title}" ya existe en tu Espacio Personal.`,
      );
      setTimeout(() => setImportedNotice(null), 3000);
      return;
    }
    const cloned: WorkspaceProject = {
      ...project,
      id: `proj-imported-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: false,
      authorName: project.authorName || fullName,
      authorArea: project.authorArea || diagnostic?.employee?.area || "General",
    };
    setProjects([cloned, ...projects]);
    setImportedNotice(
      `¡Proyecto "${project.title}" importado a tu Espacio Personal!`,
    );
    setTimeout(() => setImportedNotice(null), 3500);
  };

  // Resource handlers
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title.trim()) return;

    const tagArray = newResource.tags
      ? newResource.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const authorName = diagnostic?.employee?.name?.trim() || "Colaborador";
    const authorArea = diagnostic?.employee?.area || "General";

    const created: WorkspaceResource = {
      id: `res-${Date.now()}`,
      title: newResource.title.trim(),
      description: newResource.description.trim(),
      type: newResource.type,
      urlOrFile: newResource.urlOrFile.trim() || "#",
      category: newResource.category.trim() || "General",
      tags: tagArray,
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: newResource.publishToCommunity,
      authorName,
      authorArea,
      publishedAt: newResource.publishToCommunity
        ? new Date().toISOString().split("T")[0]
        : undefined,
    };

    setResources([created, ...resources]);

    if (newResource.publishToCommunity) {
      setImportedNotice(
        `¡Recurso "${created.title}" publicado en la comunidad!`,
      );
      setTimeout(() => setImportedNotice(null), 3500);
    }

    setNewResource({
      title: "",
      description: "",
      type: "youtube",
      urlOrFile: "",
      category: "General",
      tags: "",
      publishToCommunity: true,
    });
    setShowAddResource(false);
  };

  const handleTogglePublishResource = (id: string) => {
    const authorName = diagnostic?.employee?.name?.trim() || "Colaborador";
    const authorArea = diagnostic?.employee?.area || "General";

    setResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextPublished = !r.isPublished;
          return {
            ...r,
            isPublished: nextPublished,
            authorName: r.authorName || authorName,
            authorArea: r.authorArea || authorArea,
            publishedAt: nextPublished
              ? new Date().toISOString().split("T")[0]
              : undefined,
          };
        }
        return r;
      }),
    );
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const q = resourceSearch.toLowerCase().trim();
      if (q) {
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchCat = r.category.toLowerCase().includes(q);
        const matchTags = r.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
      }

      if (resourceTypeFilter !== "todos" && r.type !== resourceTypeFilter) {
        return false;
      }

      if (resourceCommunityFilter === "comunidad" && !r.isPublished) {
        return false;
      }
      if (resourceCommunityFilter === "mis_recursos" && r.isPublished) {
        return false;
      }

      return true;
    });
  }, [resources, resourceSearch, resourceTypeFilter, resourceCommunityFilter]);

  const handleCopyPrompt = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleConvertActivitiesToProjects = (
    selectedActivities: Activity[],
  ) => {
    const newProjs: WorkspaceProject[] = selectedActivities.map((act) => {
      let dim = "Automatización";
      if (act.quadrant === "q1") dim = "Calidad";
      if (act.quadrant === "q2") dim = "Automatización";
      if (act.quadrant === "q3") dim = "Datos";
      if (act.quadrant === "q4") dim = "Autonomía";

      const minsWithAI = act.analysis?.minutos_optimizados ?? act.mins;
      const minsSaved = Math.max(0, act.mins - minsWithAI);
      const pctSaved =
        act.mins > 0 ? Math.round((minsSaved / act.mins) * 100) : 0;

      const impact: "alto" | "medio" | "bajo" =
        minsSaved >= 60 || act.mins >= 120
          ? "alto"
          : minsSaved >= 30 || act.mins >= 45
            ? "medio"
            : "bajo";

      const desc = act.analysis
        ? `Original: ${act.mins} min. Con IA: ${minsWithAI} min (Ahorro: ${minsSaved} min, ${pctSaved}%). ${act.analysis.explicacion}`
        : `Tarea registrada desde la Matriz de actividades (${act.mins} min original).`;

      return {
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: act.name,
        description: desc,
        dimension: dim,
        status: "idea" as const,
        impact,
        createdAt: new Date().toISOString().split("T")[0],
      };
    });

    setProjects((prev) => [...newProjs, ...prev]);
    setLeftTab("proyectos");
  };

  // Roadmap task handlers
  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          return {
            ...t,
            completed,
            completedAt: completed
              ? new Date().toISOString().split("T")[0]
              : undefined,
          };
        }
        return t;
      }),
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const created: RoadmapTask = {
      id: `task-${Date.now()}`,
      horizon: activeHorizon,
      title: newTaskTitle.trim(),
      completed: false,
      custom: true,
    };
    setTasks([...tasks, created]);
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Calculations for roadmap progress
  const horizonTasks = useMemo(
    () => tasks.filter((t) => t.horizon === activeHorizon),
    [tasks, activeHorizon],
  );

  const completedTotal = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks],
  );

  const progressPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTotal / tasks.length) * 100);
  }, [completedTotal, tasks.length]);

  // Calculate collaborator names
  const rawName = diagnostic?.employee?.name?.trim() || "";
  const firstName = rawName ? rawName.split(" ")[0] : "Colaborador";
  const fullName = rawName || "Colaborador";
  const firstNameInitial = (fullName.trim().split(/\s+/)[0] || "C")
    .charAt(0)
    .toUpperCase();

  const perfil = diagnostic?.perfil || "Táctico";
  const cfg =
    PERFIL_CONFIG[perfil as keyof typeof PERFIL_CONFIG] ||
    PERFIL_CONFIG.Táctico;

  return (
    <div className="flex min-h-screen bg-cream text-ink font-sans">
      <AppSidebar
        activeScreen={
          screen === "comunidad-humanai"
            ? "comunidad-humanai"
            : "user-workspace"
        }
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 min-w-0">
          {/* Header con Logo de Prestigio & HumanAI First Company */}
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0 max-w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full">
              <PrestigioLogo
                size="sm"
                showTagline={true}
                className="shrink-0"
              />
              <div className="border-l border-ink/20 pl-2.5 sm:pl-3.5 py-0.5 min-w-0">
                <h1 className="font-poppins text-[11px] sm:text-[1.1rem] font-bold leading-tight text-[#545759] flex flex-wrap items-center gap-x-1">
                  <span className="whitespace-nowrap text-[#545759] flex items-center">
                    HumanAI First Company
                    <span className="text-[28px] sm:text-[30px] font-extrabold ml-0.5 text-[#545759] inline-block align-middle leading-none relative -top-[2px]">
                      ®
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-medium sm:font-bold text-[#545759]">
                    by Prestigio
                  </span>
                </h1>
                <p className="text-[8px] sm:text-[9.5px] uppercase tracking-wider sm:tracking-widest text-ink-muted mt-0.5 font-semibold truncate">
                  GOBERNANZA Y OBSERVABILIDAD
                </p>
              </div>
            </div>
          </header>

          {/* Header Card with Personalized Title or Comunidad HumanAI Banner */}
          {screen === "comunidad-humanai" ? (
            <div className="bg-[#FBF3E8] rounded-2xl p-6 border border-[#B5731B]/30 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-[#B5731B] text-white shadow-xs shrink-0">
                  <Globe className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-bold text-xl md:text-2xl text-ink">
                      Comunidad HumanAI
                    </h1>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    Repositorio centralizado de Prompts, Skills, Proyectos y
                    Recursos creados y compartidos por los colaboradores de la
                    empresa para acelerar la adopción de IA.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => navigateTo("user-workspace")}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FBF3E8]/60 border border-[#B5731B]/30 text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-[#B5731B]" />
                  Ir a Mi Espacio Personal
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-ink/10 shadow-xs mb-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-xl text-white shadow-xs shrink-0 flex items-center justify-center font-display font-bold text-xl uppercase"
                    style={{ backgroundColor: cfg.dark }}
                  >
                    {firstNameInitial}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display font-bold text-xl md:text-2xl text-ink">
                        {fullName}
                      </h1>
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors"
                        style={{
                          backgroundColor: cfg.light,
                          color: cfg.dark,
                          borderColor: cfg.dark + "40",
                        }}
                      >
                        Apropiación IA
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Gestión continua de tu matriz, estructuración de proyectos
                      y plan de trabajo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {diagnostic && (
                    <button
                      onClick={() =>
                        navigateTo("report", {
                          latestDiagnosticId: diagnostic.id,
                          returnScreen: "user-workspace",
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-ink text-cream hover:bg-ink-soft text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Sparkles
                        className="w-3.5 h-3.5"
                        style={{ color: cfg.color }}
                      />
                      Ver Perfil Completo
                    </button>
                  )}
                </div>
              </div>

              {/* Resumen Compacto del Perfil */}
              {loadingDiag ? (
                <div className="pt-4 border-t border-ink/10 text-xs text-ink-muted animate-pulse">
                  Cargando resumen de perfil de {firstName}…
                </div>
              ) : diagnostic ? (
                (() => {
                  const tierIdx = Math.max(0, diagnostic.tier - 1);
                  const tierColor = TIER_COLORS[tierIdx] || "#1A6E9E";
                  const perfil = diagnostic.perfil || "Táctico";
                  const cfg =
                    PERFIL_CONFIG[perfil as keyof typeof PERFIL_CONFIG] ||
                    PERFIL_CONFIG.Táctico;

                  const nextTierNum =
                    diagnostic.tier < TIER_NAMES.length
                      ? diagnostic.tier + 1
                      : null;
                  const nextTierName = nextTierNum
                    ? TIER_NAMES[nextTierNum - 1]
                    : "Nivel Máximo Alcanzado";

                  const topStrengths = Object.entries(
                    diagnostic.dim_scores || {},
                  )
                    .map(([dim, score]) => ({
                      dim,
                      pct:
                        (Number(score) /
                          (DIM_MAX[dim as keyof typeof DIM_MAX] || 8)) *
                        100,
                      score: Number(score),
                      max: DIM_MAX[dim as keyof typeof DIM_MAX] || 8,
                    }))
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 3);

                  const activeProjsCount = projects.filter(
                    (p) => p.status !== "idea",
                  ).length;
                  const highImpactProjectsCount = projects.filter(
                    (p) =>
                      p.impact === "alto" || p.highImpactStatus !== undefined,
                  ).length;
                  const publishedProjectsCount = projects.filter(
                    (p) => p.isPublished,
                  ).length;
                  const publishedSkillsCount = skills.filter(
                    (s) => s.isPublished,
                  ).length;
                  const publishedPromptsCount = prompts.filter(
                    (pr) => pr.isPublished,
                  ).length;
                  const publishedResourcesCount = resources.filter(
                    (r) => r.isPublished,
                  ).length;

                  const publicacionesCount =
                    publishedProjectsCount +
                    publishedSkillsCount +
                    publishedPromptsCount +
                    publishedResourcesCount;

                  const pubSkillsCount = masterSkills.length;
                  const pubPromptsCount = masterPrompts.length;
                  const totalPublishedAssets = Math.max(
                    publicacionesCount,
                    activeProjsCount + pubSkillsCount + pubPromptsCount,
                  );
                  const experimentProgressPct = Math.min(
                    100,
                    Math.round(
                      activeProjsCount * 15 +
                        highImpactProjectsCount * 20 +
                        publicacionesCount * 15 +
                        skills.length * 5,
                    ),
                  );

                  return (
                    <div className="pt-4 border-t border-ink/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Perfil & Nivel */}
                      <div
                        className="p-3 rounded-xl border flex items-center gap-3"
                        style={{
                          background: cfg.light,
                          borderColor: cfg.dark + "30",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs"
                          style={{ background: cfg.dark }}
                        >
                          {perfil.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider">
                            Perfil & Nivel
                          </span>
                          <span
                            className="font-display font-bold text-sm truncate block"
                            style={{ color: cfg.dark }}
                          >
                            {perfil}
                          </span>
                          <span className="text-[11px] text-ink-muted font-medium block">
                            {TIER_NAMES[tierIdx]}
                          </span>
                        </div>
                      </div>

                      {/* Siguiente Nivel */}
                      <div className="p-3 bg-cream/60 border border-ink/10 rounded-xl flex flex-col justify-center">
                        <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider flex items-center gap-1">
                          <ChevronRight
                            className="w-3 h-3"
                            style={{ color: cfg.dark }}
                          />{" "}
                          Siguiente Nivel
                        </span>
                        <span className="font-display font-bold text-sm text-ink mt-0.5">
                          {nextTierName}
                        </span>
                        <span className="text-[10px] text-ink-muted mt-0.5">
                          {nextTierNum
                            ? "Meta de desarrollo sugerida"
                            : "Líder de transformación"}
                        </span>
                      </div>

                      {/* Fortalezas Destacadas */}
                      <div className="p-3 bg-cream/60 border border-ink/10 rounded-xl flex flex-col justify-center">
                        <span className="text-[10px] uppercase font-bold text-ink-muted block tracking-wider mb-1 flex items-center gap-1">
                          <Zap
                            className="w-3 h-3"
                            style={{ color: cfg.dark, fill: cfg.light }}
                          />{" "}
                          Fortalezas Clave
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {topStrengths.length > 0 ? (
                            topStrengths.map((st) => (
                              <span
                                key={st.dim}
                                className="px-2 py-0.5 rounded-md bg-white border border-ink/10 text-[11px] font-semibold text-ink flex items-center gap-1 shadow-2xs"
                              >
                                <span>{st.dim}</span>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                  {st.score}/{st.max}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-ink-muted italic">
                              Mapeando fortalezas…
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ALIGN REDUCATE Experiment Container - AWAKE Theme */}
                      <div className="p-3 bg-[#EBF6F1]/90 border border-[#0D7A5F]/30 rounded-xl flex flex-col justify-between shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-[#085041] tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-[#0D7A5F]" />{" "}
                              ALIGN | REDUCATE | Experiment
                            </span>
                            <span className="text-xs font-extrabold text-[#085041] bg-[#0D7A5F]/20 px-1.5 py-0.5 rounded">
                              {experimentProgressPct}%
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#0D7A5F] font-medium">
                            <span
                              className="flex items-center gap-1"
                              title="Proyectos de Alto Impacto"
                            >
                              <Sparkles className="w-3 h-3 text-[#0D7A5F] shrink-0" />
                              <strong className="text-[#085041]">
                                {highImpactProjectsCount}
                              </strong>{" "}
                              Alto Impacto
                            </span>
                            <span
                              className="flex items-center gap-1"
                              title="Publicaciones en la Comunidad"
                            >
                              <Share2 className="w-3 h-3 text-sky-700 shrink-0" />
                              <strong className="text-[#085041]">
                                {publicacionesCount}
                              </strong>{" "}
                              Publicaciones
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-[#0D7A5F]">
                            <span>📁 {projects.length} Proyectos</span>
                            <span>⚡ {skills.length} Skills</span>
                            <span>💬 {prompts.length} Prompts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="pt-4 border-t border-ink/10 flex items-center justify-between text-xs text-ink-muted">
                  <span>Aún no se ha realizado el diagnóstico inicial.</span>
                  <button
                    onClick={() => navigateTo("quiz", { currentEmployeeId })}
                    className="font-bold text-ink underline"
                  >
                    Iniciar Diagnóstico ahora →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MAIN WORKSPACE: FULL WIDTH (100% ANCHO DISPONIBLE) */}
          <div className="w-full flex flex-col gap-5 mb-8">
            <div className="bg-white rounded-2xl border border-ink/10 p-5 shadow-xs flex flex-col">
              {/* Navigation Sub-Tabs */}
              {screen !== "comunidad-humanai" && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ink/10 pb-3 mb-5 gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    {/* ALIGN Stage - A */}
                    <button
                      onClick={() => setLeftTab("matriz")}
                      className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl text-xs flex items-center justify-start gap-2 transition-all border ${
                        leftTab === "matriz"
                          ? "bg-[#EFEFE9] border-[#70756B] text-[#2C3328] font-bold ring-2 ring-[#70756B]/40 shadow-xs"
                          : "bg-[#EFEFE9]/80 border-[#E2E2D8] text-[#40453B] font-semibold hover:bg-[#EFEFE9] hover:border-[#70756B]/40 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <StageLetterBox letter="A" />
                      <span>Matriz de Actividades</span>
                    </button>

                    {/* REDUCATE Stage - R */}
                    {hasPermission(role, "view_workplan") && (
                      <button
                        onClick={() => setLeftTab("plan")}
                        className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl text-xs flex items-center justify-start gap-2 transition-all border ${
                          leftTab === "plan"
                            ? "bg-[#F0F6E8] border-[#82A012] text-[#354406] font-bold ring-2 ring-[#82A012]/40 shadow-xs"
                            : "bg-[#F0F6E8]/80 border-[#E2ECD2] text-[#3B4810] font-semibold hover:bg-[#F0F6E8] hover:border-[#82A012]/40 opacity-90 hover:opacity-100"
                        }`}
                      >
                        <StageLetterBox letter="R" />
                        <span>Plan de Trabajo</span>
                      </button>
                    )}

                    {/* EXPERIMENT & EMPOWER Stage - E */}
                    <button
                      onClick={() => setLeftTab("proyectos")}
                      className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl text-xs flex items-center justify-start gap-2 transition-all border ${
                        leftTab === "proyectos"
                          ? "bg-[#FBF3E8] border-[#B5731B] text-[#4A2E09] font-bold ring-2 ring-[#B5731B]/40 shadow-xs"
                          : "bg-[#FBF3E8]/80 border-[#F2E5D3] text-[#523A1B] font-semibold hover:bg-[#FBF3E8] hover:border-[#B5731B]/40 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <StageLetterBox letter="E" />
                      <span>Proyectos IA ({projects.length})</span>
                    </button>

                    {/* EXPERIMENT & EMPOWER Stage - E */}
                    <button
                      onClick={() => {
                        setLeftTab("recursos");
                        setActiveLibraryTab("mis_recursos");
                      }}
                      className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl text-xs flex items-center justify-start gap-2 transition-all border ${
                        leftTab === "recursos"
                          ? "bg-[#FBF3E8] border-[#B5731B] text-[#4A2E09] font-bold ring-2 ring-[#B5731B]/40 shadow-xs"
                          : "bg-[#FBF3E8]/80 border-[#F2E5D3] text-[#523A1B] font-semibold hover:bg-[#FBF3E8] hover:border-[#B5731B]/40 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <StageLetterBox letter="E" />
                      <span>
                        Skills & Prompts ({skills.length + prompts.length})
                      </span>
                    </button>

                    {/* EXPERIMENT & EMPOWER Stage - E */}
                    <button
                      onClick={() => setLeftTab("otros_recursos")}
                      className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl text-xs flex items-center justify-start gap-2 transition-all border ${
                        leftTab === "otros_recursos"
                          ? "bg-[#FBF3E8] border-[#B5731B] text-[#4A2E09] font-bold ring-2 ring-[#B5731B]/40 shadow-xs"
                          : "bg-[#FBF3E8]/80 border-[#F2E5D3] text-[#523A1B] font-semibold hover:bg-[#FBF3E8] hover:border-[#B5731B]/40 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <StageLetterBox letter="E" />
                      <span>Otros Recursos ({resources.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: MATRIZ INTERACTIVA */}
              {leftTab === "matriz" && (
                <div>
                  <MatrizInteractiva
                    tierId={diagnostic?.tier ?? 2}
                    diagnosticId={diagnostic?.id ?? null}
                    onConvertToProjects={handleConvertActivitiesToProjects}
                  />
                </div>
              )}

              {/* TAB 2: PROYECTOS DE IA */}
              {leftTab === "proyectos" && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#FBF3E8] border border-[#B5731B]/30 rounded-xl flex items-center justify-between text-xs text-[#523A1B] font-medium shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B5731B] shrink-0" />
                      <span>
                        <strong className="text-[#4A2E09]">
                          Impulsa EXPERIMENT:
                        </strong>{" "}
                        Tus proyectos activos y completados alimentan en tiempo
                        real la puntuación de{" "}
                        <strong className="text-[#4A2E09]">
                          EXPERIMENT & EMPOWER
                        </strong>{" "}
                        de tu organización.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-sm text-ink">
                        Proyectos Estructurados
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Iniciativas de optimización derivadas de tu matriz de
                        actividades
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddProject(!showAddProject)}
                      className="px-3 py-1.5 rounded-lg bg-ink text-cream hover:bg-ink-soft text-xs font-medium flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      {showAddProject ? "Cancelar" : "Nuevo Proyecto"}
                    </button>
                  </div>

                  {/* Form for new project */}
                  {showAddProject && (
                    <form
                      onSubmit={handleCreateProject}
                      className="bg-cream/80 border border-ink/10 rounded-xl p-4 space-y-3.5 animate-in fade-in duration-150"
                    >
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">
                          Título del Proyecto
                        </label>
                        <input
                          type="text"
                          required
                          value={newProject.title}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              title: e.target.value,
                            })
                          }
                          placeholder="Ej. Automatización de respuesta a clientes con IA"
                          className="w-full h-9 px-3 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">
                          Descripción / Objetivo
                        </label>
                        <textarea
                          rows={2}
                          value={newProject.description}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              description: e.target.value,
                            })
                          }
                          placeholder="Detalla qué proceso resuelve o mejora este proyecto…"
                          className="w-full p-2 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-ink"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">
                          Participantes / Otras personas que participaron
                        </label>
                        <input
                          type="text"
                          value={newProject.participants}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              participants: e.target.value,
                            })
                          }
                          placeholder="Ej. Juan Pérez, María Rodríguez, Equipo de Analítica…"
                          className="w-full h-9 px-3 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-ink"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-ink mb-1">
                            Dimensión de IA
                          </label>
                          <select
                            value={newProject.dimension}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                dimension: e.target.value,
                              })
                            }
                            className="w-full h-9 px-2 text-xs bg-white border border-ink/10 rounded-lg"
                          >
                            <option value="Automatización">
                              Automatización
                            </option>
                            <option value="Datos">Datos & Contexto</option>
                            <option value="Calidad">Calidad & Revisión</option>
                            <option value="Autonomía">
                              Autonomía & Agentes
                            </option>
                            <option value="Liderazgo">
                              Liderazgo & Cultura
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-ink mb-1">
                            Impacto Esperado
                          </label>
                          <select
                            value={newProject.impact}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                impact: e.target.value as
                                  "alto" | "medio" | "bajo",
                              })
                            }
                            className="w-full h-9 px-2 text-xs bg-white border border-ink/10 rounded-lg"
                          >
                            <option value="alto">
                              Alto Impacto (Postulación)
                            </option>
                            <option value="medio">Medio Impacto</option>
                            <option value="bajo">Bajo Impacto</option>
                          </select>
                          {newProject.impact === "alto" && (
                            <p className="text-[10px] text-[#2C3328] font-medium mt-1 bg-[#EFEFE9] p-1.5 rounded border border-[#70756B]/30">
                              ⚡ Se enviará como{" "}
                              <strong>Postulación de Alto Impacto</strong> para
                              evaluación de la organización en Observabilidad
                              (ALIGN).
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Objetivos Estratégicos ALIGN Checkboxes */}
                      <div className="pt-2 border-t border-ink/10 space-y-2">
                        <label className="block text-xs font-bold text-ink">
                          Objetivos Estratégicos que Impulsa (ALIGN):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {COMPANY_STRATEGIC_OBJECTIVES.map((obj) => {
                            const checked =
                              newProject.strategicObjectives.includes(obj.id);
                            return (
                              <label
                                key={obj.id}
                                className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                  checked
                                    ? `${obj.bg} ${obj.border} font-medium`
                                    : "bg-white border-ink/10 hover:bg-slate-50 text-ink-muted"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const next = checked
                                      ? newProject.strategicObjectives.filter(
                                          (o) => o !== obj.id,
                                        )
                                      : [
                                          ...newProject.strategicObjectives,
                                          obj.id,
                                        ];
                                    setNewProject({
                                      ...newProject,
                                      strategicObjectives: next,
                                    });
                                  }}
                                  className="mt-0.5 rounded border-ink/20 accent-amber-600 shrink-0 cursor-pointer"
                                />
                                <span className="text-[11px]">
                                  {obj.shortTitle}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Documentación opcional inicial */}
                      <div className="pt-2 border-t border-ink/10 space-y-2">
                        <label className="block text-xs font-bold text-ink">
                          Documentación Rápida (Cero Fricción - Opcional)
                        </label>

                        <input
                          type="text"
                          value={newProject.keyOutcome}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              keyOutcome: e.target.value,
                            })
                          }
                          placeholder="Resultado o logro clave (Ej. Ahorro de 5h/semana)"
                          className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-lg"
                        />

                        <input
                          type="text"
                          value={newProject.usedPrompt}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              usedPrompt: e.target.value,
                            })
                          }
                          placeholder="Prompt principal o flujo utilizado"
                          className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-lg"
                        />

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="pubNewProj"
                            checked={newProject.isPublished}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                isPublished: e.target.checked,
                              })
                            }
                            className="rounded border-ink/20 accent-amber-600 cursor-pointer"
                          />
                          <label
                            htmlFor="pubNewProj"
                            className="text-xs font-semibold text-ink cursor-pointer flex items-center gap-1"
                          >
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            Publicar inmediatamente en la Comunidad HumanAI
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-ink text-white rounded-lg text-xs font-medium hover:bg-ink-soft transition-colors shadow-2xs"
                      >
                        Guardar Proyecto
                      </button>
                    </form>
                  )}

                  {/* Projects List */}
                  <div className="space-y-3 mt-3">
                    {projects.length === 0 ? (
                      <p className="text-xs text-ink-muted italic py-4 text-center bg-cream/40 rounded-xl">
                        Aún no has agregado proyectos estructurados.
                      </p>
                    ) : (
                      projects.map((proj, projIdx) => (
                        <ProjectCardItem
                          key={`${proj.id}-${projIdx}`}
                          project={proj}
                          onUpdateStatus={handleUpdateProjectStatus}
                          onUpdateParticipants={handleUpdateProjectParticipants}
                          onTogglePublish={handleTogglePublishProject}
                          onToggleObjective={handleToggleProjectObjective}
                          onUpdateDocField={handleUpdateProjectDocField}
                          onDelete={handleDeleteProject}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SKILLS Y PROMPTS & BIBLIOTECA MAESTRA */}
              {(leftTab === "recursos" || leftTab === "comunidad_humanai") && (
                <div className="space-y-5">
                  {/* Notice Banner */}
                  {importedNotice && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{importedNotice}</span>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 1: MIS RECURSOS PERSONALES */}
                  {leftTab === "recursos" &&
                    activeLibraryTab === "mis_recursos" && (
                      <div className="space-y-6">
                        {/* Skills Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Mis Skills de IA Creadas
                              </h3>
                              <p className="text-xs text-ink-muted">
                                Habilidades personalizadas y herramientas
                                configuradas en tu espacio
                              </p>
                            </div>
                            <button
                              onClick={() => setShowAddSkill(!showAddSkill)}
                              className="px-2.5 py-1 rounded-lg bg-cream hover:bg-ink/5 text-ink text-xs font-semibold border border-ink/10 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Agregar Skill
                            </button>
                          </div>

                          {showAddSkill && (
                            <form
                              onSubmit={handleCreateSkill}
                              className="bg-cream/80 border border-ink/10 rounded-xl p-3.5 mb-3 space-y-2.5 animate-in fade-in duration-150"
                            >
                              <input
                                type="text"
                                required
                                placeholder="Nombre de la Skill (ej. Grounding CRM)"
                                value={newSkill.name}
                                onChange={(e) =>
                                  setNewSkill({
                                    ...newSkill,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-md focus:outline-none focus:border-amber-400"
                              />
                              <input
                                type="text"
                                placeholder="Descripción corta del funcionamiento"
                                value={newSkill.description}
                                onChange={(e) =>
                                  setNewSkill({
                                    ...newSkill,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-md focus:outline-none focus:border-amber-400"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Herramienta (ej. Gemini 3.5 Flash)"
                                  value={newSkill.tool}
                                  onChange={(e) =>
                                    setNewSkill({
                                      ...newSkill,
                                      tool: e.target.value,
                                    })
                                  }
                                  className="flex-1 h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-md focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div className="pt-1 flex items-center justify-between gap-2 border-t border-ink/5">
                                <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={newSkill.publishToMaster}
                                    onChange={(e) =>
                                      setNewSkill({
                                        ...newSkill,
                                        publishToMaster: e.target.checked,
                                      })
                                    }
                                    className="rounded border-ink/20 text-amber-600 focus:ring-amber-400"
                                  />
                                  <Globe className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    Publicar en Comunidad HumanAI para el equipo
                                  </span>
                                </label>

                                <button
                                  type="submit"
                                  className="px-4 py-1.5 bg-ink text-white rounded-md text-xs font-medium hover:bg-ink-soft transition-colors"
                                >
                                  Guardar Skill
                                </button>
                              </div>
                            </form>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {skills.map((sk) => (
                              <div
                                key={sk.id}
                                className="p-3 bg-white border border-ink/10 rounded-xl relative group shadow-2xs hover:border-ink/20 transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-1">
                                    <h4 className="font-bold text-xs text-ink">
                                      {sk.name}
                                    </h4>
                                    <button
                                      onClick={() => handleDeleteSkill(sk.id)}
                                      className="text-ink-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                      title="Eliminar skill"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-ink-muted mt-1 line-clamp-2">
                                    {sk.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-ink/5">
                                  <span className="inline-block text-[9px] bg-amber-400/20 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                    {sk.tool}
                                  </span>

                                  <button
                                    onClick={() =>
                                      handleTogglePublishSkill(sk.id)
                                    }
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                                      sk.isPublished
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                                    }`}
                                    title={
                                      sk.isPublished
                                        ? "Publicado en Biblioteca Maestra. Haz clic para retirar."
                                        : "Publicar en Biblioteca Maestra para la organización."
                                    }
                                  >
                                    {sk.isPublished ? (
                                      <>
                                        <Globe className="w-3 h-3 text-emerald-600" />
                                        Publicado
                                      </>
                                    ) : (
                                      <>
                                        <Share2 className="w-3 h-3 text-slate-500" />
                                        Publicar
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prompts Section */}
                        <div className="pt-4 border-t border-ink/10">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                Mis Prompts
                              </h3>
                              <p className="text-xs text-ink-muted">
                                Prompts estructurados y listos para ejecutar
                              </p>
                            </div>
                            <button
                              onClick={() => setShowAddPrompt(!showAddPrompt)}
                              className="px-2.5 py-1 rounded-lg bg-cream hover:bg-ink/5 text-ink text-xs font-semibold border border-ink/10 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Nuevo Prompt
                            </button>
                          </div>

                          {showAddPrompt && (
                            <form
                              onSubmit={handleCreatePrompt}
                              className="bg-cream/80 border border-ink/10 rounded-xl p-3.5 mb-3 space-y-2.5 animate-in fade-in duration-150"
                            >
                              <input
                                type="text"
                                required
                                placeholder="Título del Prompt (ej. Resumen de Minuta Operativa)"
                                value={newPrompt.title}
                                onChange={(e) =>
                                  setNewPrompt({
                                    ...newPrompt,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-md focus:outline-none focus:border-amber-400"
                              />
                              <input
                                type="text"
                                placeholder="Rol asignado (ej. Consultor Senior de Estrategia)"
                                value={newPrompt.role}
                                onChange={(e) =>
                                  setNewPrompt({
                                    ...newPrompt,
                                    role: e.target.value,
                                  })
                                }
                                className="w-full h-8 px-2.5 text-xs bg-white border border-ink/10 rounded-md focus:outline-none focus:border-amber-400"
                              />
                              <textarea
                                required
                                rows={3}
                                placeholder="Escribe el prompt completo estructurado aquí..."
                                value={newPrompt.content}
                                onChange={(e) =>
                                  setNewPrompt({
                                    ...newPrompt,
                                    content: e.target.value,
                                  })
                                }
                                className="w-full p-2 text-xs bg-white border border-ink/10 rounded-md focus:outline-none focus:border-amber-400"
                              />

                              <div className="pt-1 flex items-center justify-between gap-2 border-t border-ink/5">
                                <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={newPrompt.publishToMaster}
                                    onChange={(e) =>
                                      setNewPrompt({
                                        ...newPrompt,
                                        publishToMaster: e.target.checked,
                                      })
                                    }
                                    className="rounded border-ink/20 text-amber-600 focus:ring-amber-400"
                                  />
                                  <Globe className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    Publicar en Comunidad HumanAI para el equipo
                                  </span>
                                </label>

                                <button
                                  type="submit"
                                  className="px-4 py-1.5 bg-ink text-white rounded-md text-xs font-medium hover:bg-ink-soft transition-colors"
                                >
                                  Guardar Prompt
                                </button>
                              </div>
                            </form>
                          )}

                          <div className="space-y-3">
                            {prompts.map((p) => (
                              <div
                                key={p.id}
                                className="p-3 bg-white border border-ink/10 rounded-xl shadow-2xs hover:border-ink/20 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-xs text-ink">
                                      {p.title}
                                    </h4>
                                    <span className="text-[10px] text-ink-muted">
                                      Rol: {p.role}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        handleTogglePublishPrompt(p.id)
                                      }
                                      className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 border transition-all ${
                                        p.isPublished
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                                      }`}
                                    >
                                      {p.isPublished ? (
                                        <>
                                          <Globe className="w-3 h-3 text-emerald-600" />
                                          Publicado
                                        </>
                                      ) : (
                                        <>
                                          <Share2 className="w-3 h-3" />
                                          Publicar
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleCopyPrompt(p.id, p.content)
                                      }
                                      className="px-2 py-1 bg-ink text-cream hover:bg-ink-soft rounded text-[10px] font-semibold flex items-center gap-1 transition-all"
                                    >
                                      {copiedPromptId === p.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />{" "}
                                          Copiado
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" /> Copiar
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleDeletePrompt(p.id)}
                                      className="text-ink-muted hover:text-red-500 p-1"
                                      title="Eliminar prompt"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <pre className="mt-2 text-[11px] font-mono bg-slate-50 border border-ink/5 rounded-lg p-2.5 whitespace-pre-wrap text-ink/80 max-h-32 overflow-y-auto">
                                  {p.content}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* SUB-VIEW 2: BIBLIOTECA MAESTRA ORGANIZACIONAL */}
                  {(leftTab === "comunidad_humanai" ||
                    activeLibraryTab === "biblioteca_maestra") && (
                    <div className="space-y-4">
                      {/* Banner Header */}
                      {screen !== "comunidad-humanai" && (
                        <div className="bg-[#FBF3E8] border border-[#B5731B]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-[#B5731B] text-white shadow-xs flex-shrink-0">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-sm text-ink flex items-center gap-2">
                                Comunidad HumanAI
                                <span className="text-[10px] bg-white/80 text-[#523A1B] border border-[#B5731B]/40 px-2 py-0.5 rounded-full font-bold">
                                  Red Colectiva
                                </span>
                              </h3>
                              <p className="text-xs text-ink-muted mt-0.5">
                                Recursos, Skills, Prompts, Proyectos y
                                Documentación compartidos por el equipo para
                                acelerar la adopción y replicabilidad de IA.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TEMPORAL & CATEGORY FILTER CONTROL PANEL */}
                      <div className="space-y-3">
                        <ActivityTemporalFilter
                          value={communityTemporalFilter}
                          onChange={setCommunityTemporalFilter}
                          showCategoryFilter={true}
                        />

                        {/* Search & Area Filter Bar */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-ink/10 shadow-2xs">
                          {/* Search Input */}
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="Buscar por título, autor, rol, área o tecnología..."
                              value={masterSearch}
                              onChange={(e) => setMasterSearch(e.target.value)}
                              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-ink/10 rounded-lg focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
                            />
                          </div>

                          {/* Area Filter Dropdown */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
                              <Building2 className="w-3.5 h-3.5 text-ink-muted" />
                              <span className="font-medium hidden sm:inline">
                                Área:
                              </span>
                            </div>
                            <select
                              value={communityAreaFilter}
                              onChange={(e) =>
                                setCommunityAreaFilter(e.target.value)
                              }
                              className="h-8 px-2.5 text-xs font-semibold bg-slate-50 border border-ink/10 rounded-lg text-ink focus:outline-none focus:border-amber-400 cursor-pointer"
                            >
                              <option value="todas">Todas las áreas</option>
                              {availableCommunityAreas.map((area) => (
                                <option key={area} value={area}>
                                  {area}
                                </option>
                              ))}
                            </select>

                            {/* Reset Button */}
                            {isCommunityFilterActive && (
                              <button
                                onClick={handleResetCommunityFilter}
                                className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-ink text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shrink-0"
                                title="Limpiar todos los filtros"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                  Limpiar
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Active Filter Indicators & Asset Count */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5 text-ink-muted">
                            <span className="font-medium text-ink">
                              Mostrando {totalCommunityAssets} de{" "}
                              {totalAllUnfilteredCommunityAssets} activos
                              compartidos
                            </span>
                            {communityTemporalFilter.mode !== "all" && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10.5px] font-bold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {communityTemporalFilter.mode === "week" &&
                                  `Semana ${communityTemporalFilter.selectedWeek}`}
                                {communityTemporalFilter.mode === "day" &&
                                  `Día: ${communityTemporalFilter.selectedDay}`}
                                {communityTemporalFilter.mode === "custom" &&
                                  `${communityTemporalFilter.startDate || ""} a ${communityTemporalFilter.endDate || ""}`}
                              </span>
                            )}
                            {communityAreaFilter !== "todas" && (
                              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full text-[10.5px] font-bold">
                                <Building2 className="w-3 h-3 text-indigo-600" />
                                {communityAreaFilter}
                              </span>
                            )}
                            {communityTemporalFilter.activityCategory !==
                              "all" && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10.5px] font-bold capitalize">
                                <Tag className="w-3 h-3 text-emerald-600" />
                                {communityTemporalFilter.activityCategory}
                              </span>
                            )}
                          </div>

                          {isCommunityFilterActive && (
                            <button
                              onClick={handleResetCommunityFilter}
                              className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                            >
                              Restablecer todos los filtros
                            </button>
                          )}
                        </div>
                      </div>

                      {/* KPI Cards Block: Totales e Indicaciones de avance frente al tiempo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* KPI 1: Activos en Comunidad */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.05,
                            ease: "easeOut",
                          }}
                          className="p-3.5 bg-white border border-ink/10 rounded-2xl shadow-2xs space-y-1.5 transition-all hover:border-sky-300/60 hover:shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-ink-muted uppercase tracking-wider">
                              Activos en Filtro
                            </span>
                            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/60">
                              <Globe className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-extrabold text-2xl text-ink">
                              {totalCommunityAssets}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                              {Math.round(
                                (totalCommunityAssets /
                                  Math.max(
                                    1,
                                    totalAllUnfilteredCommunityAssets,
                                  )) *
                                  100,
                              )}
                              % del total
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted truncate">
                            {filteredMasterSkills.length} Skills ·{" "}
                            {filteredMasterPrompts.length} Prompts ·{" "}
                            {filteredMasterProjects.length} Proyectos
                          </p>
                        </motion.div>

                        {/* KPI 2: Proyectos Colectivos */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.12,
                            ease: "easeOut",
                          }}
                          className="p-3.5 bg-white border border-ink/10 rounded-2xl shadow-2xs space-y-1.5 transition-all hover:border-amber-300/60 hover:shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-ink-muted uppercase tracking-wider">
                              Proyectos Colectivos
                            </span>
                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
                              <Folder className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-extrabold text-2xl text-ink">
                              {filteredMasterProjects.length}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              {
                                filteredMasterProjects.filter(
                                  (p) => p.status === "completado",
                                ).length
                              }{" "}
                              Listos
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted truncate">
                            {
                              filteredMasterProjects.filter(
                                (p) => p.status === "completado",
                              ).length
                            }{" "}
                            completados ·{" "}
                            {
                              filteredMasterProjects.filter(
                                (p) => p.status === "en_proceso",
                              ).length
                            }{" "}
                            en curso
                          </p>
                        </motion.div>

                        {/* KPI 3: Proyectos de Alto Impacto */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.19,
                            ease: "easeOut",
                          }}
                          className="p-3.5 bg-gradient-to-br from-[#EFEFE9] to-white border border-[#70756B]/30 rounded-2xl shadow-2xs space-y-1.5 transition-all hover:border-[#70756B]/60 hover:shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-[#2C3328] uppercase tracking-wider">
                              Proyectos Alto Impacto
                            </span>
                            <div className="p-1.5 rounded-lg bg-[#70756B] text-white shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-extrabold text-2xl text-[#2C3328]">
                              {filteredHighImpactProjects.length}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#2C3328] bg-[#70756B]/15 px-2 py-0.5 rounded-full border border-[#70756B]/30">
                              <Sparkles className="w-3 h-3 text-[#70756B]" />★
                              Prioritario
                            </span>
                          </div>
                          <p className="text-[10px] text-[#40453B] font-medium truncate">
                            Alineados con objetivos estratégicos de negocio
                          </p>
                        </motion.div>

                        {/* KPI 4: Avance Replicabilidad */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.26,
                            ease: "easeOut",
                          }}
                          className="p-3.5 bg-white border border-ink/10 rounded-2xl shadow-2xs space-y-1.5 transition-all hover:border-emerald-300/60 hover:shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-ink-muted uppercase tracking-wider">
                              Avance Replicabilidad
                            </span>
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <Target className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-extrabold text-2xl text-ink">
                              88%
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                              +12% vs Q2
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0D7A5F] rounded-full w-[88%] transition-all duration-500" />
                            </div>
                            <p className="text-[9.5px] text-ink-muted flex items-center justify-between">
                              <span>Apropiación colectiva</span>
                              <span className="font-bold text-[#0D7A5F]">
                                Meta Q3 Superada ✓
                              </span>
                            </p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Category Switcher Tabs with Real-Time Filtered Counts */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-ink/5 text-xs">
                        <button
                          onClick={() => setMasterCategoryFilter("todos")}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                            masterCategoryFilter === "todos"
                              ? "bg-white text-ink shadow-2xs font-bold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          Todos ({totalCommunityAssets})
                        </button>
                        <button
                          onClick={() => setMasterCategoryFilter("skills")}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            masterCategoryFilter === "skills"
                              ? "bg-white text-ink shadow-2xs font-bold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Skills ({filteredMasterSkills.length})
                        </button>
                        <button
                          onClick={() => setMasterCategoryFilter("prompts")}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            masterCategoryFilter === "prompts"
                              ? "bg-white text-ink shadow-2xs font-bold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Prompts ({filteredMasterPrompts.length})
                        </button>
                        <button
                          onClick={() => setMasterCategoryFilter("proyectos")}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            masterCategoryFilter === "proyectos"
                              ? "bg-white text-ink shadow-2xs font-bold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          <Folder className="w-3.5 h-3.5 text-amber-600" />
                          Proyectos ({filteredMasterProjects.length})
                        </button>
                        <button
                          onClick={() =>
                            setMasterCategoryFilter("alto_impacto")
                          }
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            masterCategoryFilter === "alto_impacto"
                              ? "bg-[#70756B] text-white shadow-2xs font-bold"
                              : "text-[#70756B] hover:bg-[#70756B]/10"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Alto Impacto ({filteredHighImpactProjects.length})
                        </button>
                        <button
                          onClick={() => setMasterCategoryFilter("recursos")}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            masterCategoryFilter === "recursos"
                              ? "bg-white text-ink shadow-2xs font-bold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          Otros Recursos ({filteredMasterResources.length})
                        </button>
                      </div>

                      {/* Global Empty State if 0 assets match the active filter */}
                      {totalCommunityAssets === 0 && (
                        <div className="p-8 text-center bg-slate-50 border border-dashed border-ink/15 rounded-2xl space-y-3">
                          <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <Filter className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-ink">
                              No se encontraron recursos con los filtros
                              aplicados
                            </h4>
                            <p className="text-xs text-ink-muted max-w-md mx-auto">
                              No hay publicaciones que coincidan con el rango
                              temporal, área o término de búsqueda seleccionado.
                            </p>
                          </div>
                          <button
                            onClick={handleResetCommunityFilter}
                            className="px-3.5 py-1.5 bg-ink text-cream hover:bg-ink-soft rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restablecer todos los filtros
                          </button>
                        </div>
                      )}

                      {/* Display Master Skills */}
                      {(masterCategoryFilter === "todos" ||
                        masterCategoryFilter === "skills") &&
                        filteredMasterSkills.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                Skills de IA Compartidas (
                                {filteredMasterSkills.length})
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {filteredMasterSkills.map((sk, skIdx) => (
                                <div
                                  key={`master-sk-${sk.id}-${skIdx}`}
                                  className="p-3.5 bg-white border border-ink/10 rounded-xl shadow-2xs hover:border-amber-400/50 transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <h5 className="font-bold text-xs text-ink">
                                        {sk.name}
                                      </h5>
                                      <span className="text-[9px] bg-amber-400/20 text-amber-800 font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                                        {sk.tool}
                                      </span>
                                    </div>

                                    <p className="text-[11px] text-ink-muted mt-1.5 line-clamp-2">
                                      {sk.description}
                                    </p>
                                  </div>

                                  <div className="mt-3 pt-2.5 border-t border-ink/5 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-ink-muted truncate">
                                      <UserCheck className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                                      <span className="font-semibold text-ink truncate">
                                        {sk.authorName || "Colaborador"}
                                      </span>
                                      {sk.authorArea && (
                                        <span className="text-ink-muted">
                                          · {sk.authorArea}
                                        </span>
                                      )}
                                      {(sk.publishedAt || sk.createdAt) && (
                                        <span className="text-ink-muted font-medium flex items-center gap-0.5 ml-1">
                                          <Calendar className="w-2.5 h-2.5" />
                                          {formatDatePretty(
                                            sk.publishedAt || sk.createdAt,
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleImportSkillToPersonal(sk)
                                      }
                                      className="px-2.5 py-1 bg-ink text-cream hover:bg-ink-soft rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all flex-shrink-0"
                                      title="Guardar este skill en tus recursos personales"
                                    >
                                      <Download className="w-3 h-3 text-amber-300" />
                                      Importar a mi espacio
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Display Master Prompts */}
                      {(masterCategoryFilter === "todos" ||
                        masterCategoryFilter === "prompts") &&
                        filteredMasterPrompts.length > 0 && (
                          <div className="space-y-2.5 pt-3 border-t border-ink/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                Prompts Compartidos (
                                {filteredMasterPrompts.length})
                              </h4>
                            </div>

                            <div className="space-y-3">
                              {filteredMasterPrompts.map((p, pIdx) => (
                                <div
                                  key={`master-p-${p.id}-${pIdx}`}
                                  className="p-3.5 bg-white border border-ink/10 rounded-xl shadow-2xs hover:border-indigo-300/50 transition-all"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                      <h5 className="font-bold text-xs text-ink">
                                        {p.title}
                                      </h5>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-ink-muted">
                                          Rol: {p.role}
                                        </span>
                                        {p.category && (
                                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium border border-indigo-200/50">
                                            {p.category}
                                          </span>
                                        )}
                                        {(p.publishedAt || p.createdAt) && (
                                          <span className="text-[9.5px] text-ink-muted font-medium flex items-center gap-0.5">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {formatDatePretty(
                                              p.publishedAt || p.createdAt,
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                      <div className="flex items-center gap-1 text-[10px] text-ink-muted mr-2 hidden sm:flex">
                                        <UserCheck className="w-3 h-3 text-indigo-600" />
                                        <span className="font-medium text-ink">
                                          {p.authorName || "Colaborador"}
                                        </span>
                                        {p.authorArea && (
                                          <span>· {p.authorArea}</span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() =>
                                          handleCopyPrompt(p.id, p.content)
                                        }
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-ink rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all"
                                      >
                                        {copiedPromptId === p.id ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-600" />{" "}
                                            Copiado
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" /> Copiar
                                          </>
                                        )}
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleImportPromptToPersonal(p)
                                        }
                                        className="px-2.5 py-1 bg-ink text-cream hover:bg-ink-soft rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all"
                                        title="Guardar este prompt en tus recursos personales"
                                      >
                                        <Download className="w-3 h-3 text-amber-300" />
                                        Importar a mi espacio
                                      </button>
                                    </div>
                                  </div>

                                  <pre className="mt-2.5 text-[11px] font-mono bg-slate-50 border border-ink/5 rounded-lg p-2.5 whitespace-pre-wrap text-ink/80 max-h-36 overflow-y-auto">
                                    {p.content}
                                  </pre>

                                  <div className="mt-2 flex items-center gap-1 text-[10px] text-ink-muted sm:hidden">
                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                    <span className="font-medium text-ink">
                                      Publicado por{" "}
                                      {p.authorName || "Colaborador"}
                                    </span>
                                    {p.authorArea && (
                                      <span>({p.authorArea})</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Display Master / Community Projects */}
                      {(masterCategoryFilter === "todos" ||
                        masterCategoryFilter === "proyectos") &&
                        filteredMasterProjects.length > 0 && (
                          <div className="space-y-2.5 pt-3 border-t border-ink/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5 text-amber-600" />
                                Proyectos Compartidos en la Comunidad (
                                {filteredMasterProjects.length})
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {filteredMasterProjects.map((p, pIdx) => (
                                <motion.div
                                  key={`master-${p.id}-${pIdx}`}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.28,
                                    delay: Math.min(pIdx * 0.04, 0.25),
                                    ease: "easeOut",
                                  }}
                                  className={`p-4 bg-white border rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                                    p.impact === "alto" || p.highImpactStatus
                                      ? "border-[#70756B]/40 bg-gradient-to-br from-[#EFEFE9]/40 to-white"
                                      : "border-ink/10 hover:border-slate-300/60"
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                        {p.dimension || "General"}
                                      </span>
                                      {(p.impact === "alto" ||
                                        p.highImpactStatus) && (
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#70756B] text-white flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-[#EFEFE9]" />
                                          ★ Alto Impacto
                                        </span>
                                      )}
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                          p.status === "completado"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : p.status === "en_proceso"
                                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                                              : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        {p.status === "completado"
                                          ? "Completado"
                                          : p.status === "en_proceso"
                                            ? "En proceso"
                                            : "Idea"}
                                      </span>
                                    </div>

                                    <h5 className="font-bold text-sm text-ink">
                                      {p.title}
                                    </h5>
                                    <p className="text-xs text-ink-muted leading-relaxed">
                                      {p.description}
                                    </p>

                                    {p.keyOutcome && (
                                      <div className="p-2 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-xs text-emerald-900 flex items-start gap-1.5">
                                        <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-bold text-[10px] text-emerald-950 uppercase block">
                                            Resultado Clave:
                                          </span>
                                          <span>{p.keyOutcome}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-ink/5 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-ink-muted truncate">
                                      <UserCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                                      <span className="font-semibold text-ink truncate">
                                        {p.authorName || "Colaborador"}
                                      </span>
                                      {p.authorArea && (
                                        <span className="truncate">
                                          · {p.authorArea}
                                        </span>
                                      )}
                                      {(p.publishedAt || p.createdAt) && (
                                        <span className="text-ink-muted font-medium flex items-center gap-0.5 ml-1 shrink-0">
                                          <Calendar className="w-2.5 h-2.5" />
                                          {formatDatePretty(
                                            p.publishedAt || p.createdAt,
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleImportProjectToPersonal(p)
                                      }
                                      className="px-2.5 py-1 bg-ink text-cream hover:bg-ink-soft rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0"
                                      title="Clonar este proyecto en tus proyectos personales"
                                    >
                                      <Download className="w-3 h-3 text-amber-300" />
                                      Importar a mi espacio
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Display High Impact Projects Specifically */}
                      {masterCategoryFilter === "alto_impacto" &&
                        filteredHighImpactProjects.length > 0 && (
                          <div className="space-y-2.5 pt-3 border-t border-ink/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-[#2C3328] uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#70756B]" />
                                Proyectos de Alto Impacto Estratégico (
                                {filteredHighImpactProjects.length})
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {filteredHighImpactProjects.map((p, hiIdx) => (
                                <motion.div
                                  key={`hi-${p.id}`}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.28,
                                    delay: Math.min(hiIdx * 0.05, 0.25),
                                    ease: "easeOut",
                                  }}
                                  className="p-4 bg-gradient-to-br from-[#EFEFE9]/80 to-white border-2 border-[#70756B]/40 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#70756B] text-white flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-[#EFEFE9]" />
                                          Alto Impacto
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFEFE9] text-[#2C3328] border border-[#70756B]/30">
                                          {p.dimension || "General"}
                                        </span>
                                      </div>

                                      <span className="font-semibold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Aprobado Estratégicamente
                                      </span>
                                    </div>

                                    <h5 className="font-bold text-sm text-[#2C3328] mt-1">
                                      {p.title}
                                    </h5>
                                    <p className="text-xs text-[#40453B] leading-relaxed">
                                      {p.description}
                                    </p>

                                    {p.keyOutcome && (
                                      <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                                        <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                          <strong className="text-[10.5px] uppercase font-bold text-emerald-800 block">
                                            Resultado / Impacto Estimado:
                                          </strong>
                                          <span>{p.keyOutcome}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-[#70756B]/20 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1 text-[10.5px] text-[#40453B] truncate">
                                      <span>Líder: </span>
                                      <strong className="text-[#2C3328] truncate">
                                        {p.authorName || "Equipo de IA"}
                                      </strong>
                                      {p.authorArea && (
                                        <span className="truncate">
                                          ({p.authorArea})
                                        </span>
                                      )}
                                      {(p.publishedAt || p.createdAt) && (
                                        <span className="text-ink-muted font-medium flex items-center gap-0.5 ml-1 shrink-0">
                                          <Calendar className="w-2.5 h-2.5" />
                                          {formatDatePretty(
                                            p.publishedAt || p.createdAt,
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleImportProjectToPersonal(p)
                                      }
                                      className="px-2.5 py-1 bg-[#70756B] text-white hover:bg-[#595E54] rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all shadow-2xs shrink-0"
                                    >
                                      <Download className="w-3 h-3 text-[#EFEFE9]" />
                                      Importar Proyecto
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Display Master Other Resources */}
                      {(masterCategoryFilter === "todos" ||
                        masterCategoryFilter === "recursos") &&
                        filteredMasterResources.length > 0 && (
                          <div className="space-y-2.5 pt-3 border-t border-ink/10">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-ink uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                Otros Recursos Compartidos (
                                {filteredMasterResources.length})
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {filteredMasterResources.map((res) => (
                                <div
                                  key={res.id}
                                  className="p-3.5 bg-white border border-ink/10 rounded-xl shadow-2xs hover:border-emerald-300/50 transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        {res.type === "youtube" && (
                                          <Video className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        )}
                                        {res.type === "documento" ||
                                          (res.type === "document" && (
                                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                          ))}
                                        {res.type === "enlace" ||
                                          (res.type === "link" && (
                                            <Link className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                          ))}
                                        {res.type === "herramienta" ||
                                          (res.type === "tool" && (
                                            <Wrench className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                          ))}
                                        <h5 className="font-bold text-xs text-ink">
                                          {res.title}
                                        </h5>
                                      </div>
                                      <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded capitalize flex-shrink-0">
                                        {res.category || res.type}
                                      </span>
                                    </div>

                                    {res.description && (
                                      <p className="text-[11px] text-ink-muted mt-1.5 line-clamp-2">
                                        {res.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="mt-3 pt-2.5 border-t border-ink/5 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-ink-muted truncate">
                                      <UserCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                      <span className="font-semibold text-ink truncate">
                                        {res.authorName || "Colaborador"}
                                      </span>
                                      {res.authorArea && (
                                        <span className="truncate">
                                          · {res.authorArea}
                                        </span>
                                      )}
                                      {(res.publishedAt || res.createdAt) && (
                                        <span className="text-ink-muted font-medium flex items-center gap-0.5 ml-1 shrink-0">
                                          <Calendar className="w-2.5 h-2.5" />
                                          {formatDatePretty(
                                            res.publishedAt || res.createdAt,
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    {(res.urlOrFile || res.url) && (
                                      <a
                                        href={res.urlOrFile || res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 bg-ink text-cream hover:bg-ink-soft rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all flex-shrink-0"
                                      >
                                        Abrir recurso
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: OTROS RECURSOS */}
              {leftTab === "otros_recursos" && (
                <div className="space-y-6 pt-2">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <StageLetterBox letter="E" size="lg" />
                        <h2 className="font-display font-bold text-lg text-ink">
                          E: Otros Recursos
                        </h2>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Sube y comparte videos de YouTube, documentos PDF,
                        guías, herramientas y enlaces web para fortalecer la
                        Comunidad de Práctica.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddResource(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Subir / Agregar Recurso
                    </button>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Total Recursos
                      </span>
                      <div className="text-xl font-bold text-ink mt-0.5">
                        {resources.length}
                      </div>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Publicados Comunidad
                      </span>
                      <div className="text-xl font-bold text-emerald-900 mt-0.5">
                        {resources.filter((r) => r.isPublished).length}
                      </div>
                    </div>
                    <div className="bg-sky-50/60 border border-sky-200/60 rounded-xl p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                        Videos & Youtube
                      </span>
                      <div className="text-xl font-bold text-sky-900 mt-0.5">
                        {resources.filter((r) => r.type === "youtube").length}
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Documentos & Enlaces
                      </span>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">
                        {
                          resources.filter(
                            (r) =>
                              r.type === "documento" || r.type === "enlace",
                          ).length
                        }
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="bg-white/80 backdrop-blur-xs border border-ink/10 rounded-xl p-3 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
                      {/* Search bar */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
                        <input
                          type="text"
                          placeholder="Buscar recurso por título, categoría, etiquetas..."
                          value={resourceSearch}
                          onChange={(e) => setResourceSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      {/* Community toggle */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto shrink-0">
                        <button
                          onClick={() => setResourceCommunityFilter("todos")}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                            resourceCommunityFilter === "todos"
                              ? "bg-white text-ink shadow-xs font-semibold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() =>
                            setResourceCommunityFilter("mis_recursos")
                          }
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                            resourceCommunityFilter === "mis_recursos"
                              ? "bg-white text-ink shadow-xs font-semibold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          Solo Privados
                        </button>
                        <button
                          onClick={() =>
                            setResourceCommunityFilter("comunidad")
                          }
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 ${
                            resourceCommunityFilter === "comunidad"
                              ? "bg-white text-emerald-800 shadow-xs font-semibold"
                              : "text-ink-muted hover:text-ink"
                          }`}
                        >
                          <Globe className="w-3 h-3 text-emerald-600" />
                          Comunidad
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills by Resource Type */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-medium text-ink-muted mr-1">
                        Filtrar por tipo:
                      </span>
                      {[
                        { id: "todos", label: "Todos", icon: Layers },
                        {
                          id: "youtube",
                          label: "Videos YouTube",
                          icon: Video,
                        },
                        {
                          id: "documento",
                          label: "Documentos / PDF",
                          icon: FileText,
                        },
                        { id: "enlace", label: "Enlaces Web", icon: Link },
                        {
                          id: "herramienta",
                          label: "Herramientas",
                          icon: Wrench,
                        },
                        { id: "otro", label: "Otros", icon: BookOpen },
                      ].map((item) => {
                        const IconComp = item.icon;
                        const isActive = resourceTypeFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() =>
                              setResourceTypeFilter(
                                item.id as
                                  | "todos"
                                  | "youtube"
                                  | "documento"
                                  | "enlace"
                                  | "herramienta",
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                              isActive
                                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-semibold"
                                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <IconComp className="w-3 h-3" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resource Cards Grid */}
                  {filteredResources.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-700 flex items-center justify-center mx-auto">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-ink">
                          No se encontraron recursos
                        </h3>
                        <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1">
                          No hay recursos guardados con los filtros
                          seleccionados. Haz clic en "Subir / Agregar Recurso"
                          para registrar tus materiales.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddResource(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Recurso
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResources.map((res) => {
                        return (
                          <div
                            key={res.id}
                            className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div className="space-y-3">
                              {/* Header: Type badge & Category */}
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                    res.type === "youtube"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : res.type === "documento"
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : res.type === "enlace"
                                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                                          : res.type === "herramienta"
                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                            : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {res.type === "youtube" && (
                                    <Video className="w-3 h-3" />
                                  )}
                                  {res.type === "documento" && (
                                    <FileText className="w-3 h-3" />
                                  )}
                                  {res.type === "enlace" && (
                                    <Link className="w-3 h-3" />
                                  )}
                                  {res.type === "herramienta" && (
                                    <Wrench className="w-3 h-3" />
                                  )}
                                  {res.type === "otro" && (
                                    <BookOpen className="w-3 h-3" />
                                  )}
                                  {res.type === "youtube"
                                    ? "YouTube Video"
                                    : res.type === "documento"
                                      ? "Documento / PDF"
                                      : res.type === "enlace"
                                        ? "Enlace Web"
                                        : res.type === "herramienta"
                                          ? "Herramienta"
                                          : "Recurso"}
                                </span>

                                <span className="text-[11px] font-medium text-ink-muted bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                  {res.category}
                                </span>
                              </div>

                              {/* Title & Description */}
                              <div>
                                <h3 className="font-bold text-sm text-ink group-hover:text-amber-800 transition-colors line-clamp-2">
                                  {res.title}
                                </h3>
                                <p className="text-xs text-ink-muted mt-1.5 line-clamp-3 leading-relaxed">
                                  {res.description}
                                </p>
                              </div>

                              {/* URL or File link */}
                              {res.urlOrFile && (
                                <a
                                  href={
                                    res.urlOrFile.startsWith("http")
                                      ? res.urlOrFile
                                      : `https://${res.urlOrFile}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-semibold hover:underline bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 px-2.5 py-1.5 rounded-lg transition-colors w-full justify-between"
                                >
                                  <span className="truncate max-w-[200px]">
                                    {res.urlOrFile}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                              )}

                              {/* Tags */}
                              {res.tags && res.tags.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-1">
                                  {res.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Author tag if published */}
                              {res.isPublished && (
                                <div className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                                  <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>
                                    Publicado por{" "}
                                    <strong className="font-semibold">
                                      {res.authorName || "Colaborador"}
                                    </strong>
                                    {res.authorArea && (
                                      <span> ({res.authorArea})</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Footer & Community Toggle */}
                            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() =>
                                  handleTogglePublishResource(res.id)
                                }
                                title={
                                  res.isPublished
                                    ? "Clic para retirar de la comunidad"
                                    : "Clic para publicar en la comunidad"
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  res.isPublished
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {res.isPublished ? (
                                  <>
                                    <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Publicado en Comunidad</span>
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span>Publicar en Comunidad</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteResource(res.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar recurso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Modal Add Resource */}
                  {showAddResource && (
                    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <StageLetterBox letter="E" size="lg" />
                            <h3 className="font-bold text-base text-ink">
                              E: Otros Recursos - Nuevo Recurso
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowAddResource(false)}
                            className="text-slate-400 hover:text-ink text-lg font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <form
                          onSubmit={handleCreateResource}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-bold text-ink mb-1">
                              Título del Recurso *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Masterclass Prompting Avanzado / Guía PDF / Repositorio Agentico"
                              value={newResource.title}
                              onChange={(e) =>
                                setNewResource({
                                  ...newResource,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-ink mb-1">
                                Tipo de Recurso
                              </label>
                              <select
                                value={newResource.type}
                                onChange={(e) =>
                                  setNewResource({
                                    ...newResource,
                                    type: e.target.value as
                                      | "youtube"
                                      | "documento"
                                      | "enlace"
                                      | "herramienta",
                                  })
                                }
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                              >
                                <option value="youtube">
                                  🎬 Video de YouTube
                                </option>
                                <option value="documento">
                                  📄 Documento / PDF
                                </option>
                                <option value="enlace">
                                  🔗 Enlace Web / Repositorio
                                </option>
                                <option value="herramienta">
                                  🛠️ Herramienta / Software
                                </option>
                                <option value="otro">📚 Otro Material</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-ink mb-1">
                                Categoría
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. Automatización, Agentes, Productividad"
                                value={newResource.category}
                                onChange={(e) =>
                                  setNewResource({
                                    ...newResource,
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-ink mb-1">
                              URL / Enlace del Recurso o Documento
                            </label>
                            <input
                              type="text"
                              placeholder="https://youtube.com/watch?v=... o enlace a Drive/PDF"
                              value={newResource.urlOrFile}
                              onChange={(e) =>
                                setNewResource({
                                  ...newResource,
                                  urlOrFile: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-ink mb-1">
                              Descripción y Utilidad
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Describe brevemente de qué trata este recurso y cómo puede aprovecharse..."
                              value={newResource.description}
                              onChange={(e) =>
                                setNewResource({
                                  ...newResource,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-ink mb-1">
                              Etiquetas (separadas por comas)
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. Prompts, ChatGPT, Finanzas, Agentes"
                              value={newResource.tags}
                              onChange={(e) =>
                                setNewResource({
                                  ...newResource,
                                  tags: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                          </div>

                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                            <input
                              type="checkbox"
                              id="publishToCommunityCheck"
                              checked={newResource.publishToCommunity}
                              onChange={(e) =>
                                setNewResource({
                                  ...newResource,
                                  publishToCommunity: e.target.checked,
                                })
                              }
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <label
                              htmlFor="publishToCommunityCheck"
                              className="text-xs text-emerald-900 cursor-pointer"
                            >
                              <span className="font-bold block">
                                Publicar en la Comunidad de Práctica
                              </span>
                              Al marcar esta opción, este recurso estará
                              disponible para que otros colaboradores de la
                              empresa lo descubran.
                            </label>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setShowAddResource(false)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              Guardar Recurso
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PLAN DE TRABAJO (30, 60 y 90 DÍAS) */}
              {leftTab === "plan" && (
                <div className="pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <StageLetterBox letter="R" size="lg" />
                        <h2 className="font-display font-bold text-lg text-ink">
                          Plan de Trabajo (30, 60 y 90 Días)
                        </h2>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Cronograma estructurado por horizontes de tiempo para
                        evacuar y validar actividades
                      </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4 bg-cream/70 p-3 rounded-xl border border-ink/10">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-ink-muted block">
                          Avance General
                        </span>
                        <span className="font-display font-bold text-sm text-ink">
                          {completedTotal} / {tasks.length} actividades (
                          {progressPercent}%)
                        </span>
                      </div>
                      <div className="w-24 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Horizon Selector Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 my-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveHorizon("30")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          activeHorizon === "30"
                            ? "bg-ink text-cream shadow-xs"
                            : "bg-slate-100 text-ink-muted hover:text-ink"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Horizonte 30 Días (Victorias Rápidas)
                      </button>

                      <button
                        onClick={() => setActiveHorizon("60")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          activeHorizon === "60"
                            ? "bg-ink text-cream shadow-xs"
                            : "bg-slate-100 text-ink-muted hover:text-ink"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        Horizonte 60 Días (Integración Táctica)
                      </button>

                      <button
                        onClick={() => setActiveHorizon("90")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          activeHorizon === "90"
                            ? "bg-ink text-cream shadow-xs"
                            : "bg-slate-100 text-ink-muted hover:text-ink"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        Horizonte 90 Días (Escala & Autonomía)
                      </button>
                    </div>

                    <button
                      onClick={() => setShowAddTask(!showAddTask)}
                      className="px-3 py-1.5 bg-cream border border-ink/10 hover:bg-ink hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Actividad
                    </button>
                  </div>

                  {/* Add Custom Task Form */}
                  {showAddTask && (
                    <form
                      onSubmit={handleCreateTask}
                      className="bg-cream/70 border border-ink/10 rounded-xl p-3 mb-4 flex items-center gap-2 animate-in fade-in duration-150"
                    >
                      <input
                        type="text"
                        required
                        placeholder={`Nueva actividad para el plan de ${activeHorizon} días…`}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 h-9 px-3 text-xs bg-white border border-ink/10 rounded-lg focus:outline-none focus:border-ink"
                      />
                      <button
                        type="submit"
                        className="px-4 h-9 bg-ink text-white rounded-lg text-xs font-medium shrink-0"
                      >
                        Agregar a {activeHorizon} Días
                      </button>
                    </form>
                  )}

                  {/* Tasks Checklist Grid */}
                  <div className="space-y-3">
                    {horizonTasks.length === 0 ? (
                      <p className="text-xs text-ink-muted italic py-6 text-center bg-slate-50 rounded-xl">
                        No hay actividades registradas en este periodo de{" "}
                        {activeHorizon} días.
                      </p>
                    ) : (
                      horizonTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                            task.completed
                              ? "bg-emerald-50/40 border-emerald-200/80"
                              : "bg-white border-ink/10 hover:border-ink/20 shadow-2xs"
                          }`}
                        >
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="mt-0.5 shrink-0 transition-transform active:scale-90"
                            title={
                              task.completed
                                ? "Desmarcar"
                                : "Marcar como evacuado"
                            }
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5 text-ink-muted hover:text-ink" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4
                                className={`text-xs font-semibold ${
                                  task.completed
                                    ? "line-through text-ink-muted"
                                    : "text-ink"
                                }`}
                              >
                                {task.title}
                              </h4>

                              {task.custom && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-ink-muted hover:text-red-500"
                                  title="Eliminar tarea"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {task.description && (
                              <p
                                className={`text-xs mt-1 ${
                                  task.completed
                                    ? "text-ink-muted/70"
                                    : "text-ink-muted"
                                }`}
                              >
                                {task.description}
                              </p>
                            )}

                            {task.completed && task.completedAt && (
                              <span className="inline-block mt-2 text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                                Evacuado el {task.completedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
