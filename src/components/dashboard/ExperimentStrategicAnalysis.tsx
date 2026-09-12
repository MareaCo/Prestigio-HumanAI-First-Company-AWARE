import { useState, useMemo } from "react";
import type {
  Diagnostic,
  WorkspaceProject,
  WorkspaceSkill,
  WorkspacePrompt,
  WorkspaceResource,
} from "@/types";
import {
  Zap,
  Sparkles,
  MessageSquare,
  Folder,
  Compass,
  Building2,
  ChevronRight,
  TrendingUp,
  Award,
  Search,
  Check,
  Lightbulb,
  Rocket,
  Code,
  FileText,
  Share2,
} from "lucide-react";

interface ExperimentStrategicAnalysisProps {
  diagnostics: Diagnostic[];
  areaName?: string;
  hideDynamismByArea?: boolean;
  hideOpenCatalog?: boolean;
}

// Default Seed Data for Workspace Assets if diagnostics don't have stored publications
const DEFAULT_SKILLS: Array<WorkspaceSkill & { authorArea: string }> = [
  {
    id: "sk-seed-1",
    name: "Extracción de Tablas Financieras a Excel",
    description:
      "Skill en Python/ChatGPT para parsear balances en PDF y convertirlos en hojas estructuradas.",
    category: "Análisis de Datos",
    tool: "ChatGPT / Python",
    createdAt: "2026-07-10",
    isPublished: true,
    authorName: "Pedro Gasca",
    authorArea: "Finanzas",
    publishedAt: "2026-07-12",
  },
  {
    id: "sk-seed-2",
    name: "Generador de Propuestas Comerciales Hiper-personalizadas",
    description:
      "Prompt estructurado que analiza el perfil del cliente en LinkedIn y redacta el pitch de venta.",
    category: "Ventas / Comercial",
    tool: "Claude 3.5 Sonnet",
    createdAt: "2026-07-14",
    isPublished: true,
    authorName: "Juan Esteban Jaramillo",
    authorArea: "Ventas / Comercial",
    publishedAt: "2026-07-15",
  },
  {
    id: "sk-seed-3",
    name: "Sanitizador de Logs e Incidentes Operativos",
    description:
      "Limpieza automática de datos sensibles PII antes de enviar consultas a modelos de lenguaje.",
    category: "Tecnología / TI",
    tool: "Custom Python Script",
    createdAt: "2026-07-18",
    isPublished: true,
    authorName: "Óscar Andrés Ceballos",
    authorArea: "Tecnología / TI",
    publishedAt: "2026-07-19",
  },
  {
    id: "sk-seed-4",
    name: "Optimizador de Copy para Campañas de Marketing",
    description:
      "Matriz de variaciones A/B para anuncios en redes con alineación al tono de marca.",
    category: "Marketing",
    tool: "Gemini 1.5 Pro",
    createdAt: "2026-07-20",
    isPublished: true,
    authorName: "Catalina Botero",
    authorArea: "Operaciones",
    publishedAt: "2026-07-21",
  },
];

const DEFAULT_PROMPTS: Array<WorkspacePrompt & { authorArea: string }> = [
  {
    id: "pr-seed-1",
    title: "Prompt: Auditor de Coherencia de Contratos",
    content:
      "Actúa como un abogado corporativo Senior. Revisa el siguiente contrato adjunto...",
    role: "Legal & Cumplimiento",
    category: "Análisis de Documentos",
    createdAt: "2026-07-08",
    isPublished: true,
    authorName: "Diana Restrepo",
    authorArea: "Operaciones",
    publishedAt: "2026-07-09",
  },
  {
    id: "pr-seed-2",
    title: "Prompt de Triaje de Correos de Servicio al Cliente",
    content:
      "Clasifica el correo recibido en Nivel 1, 2 o 3 según la urgencia y redacta borrador de respuesta...",
    role: "Atención al Cliente",
    category: "Automatización",
    createdAt: "2026-07-11",
    isPublished: true,
    authorName: "Sebastián Mora",
    authorArea: "Operaciones",
    publishedAt: "2026-07-12",
  },
  {
    id: "pr-seed-3",
    title: "Prompt de Creación de Diagramas Mermaid para Procesos",
    content:
      "Toma la descripción narrativa del proceso de negocio y genera la sintaxis de un diagrama de flujo...",
    role: "Arquitecto de Procesos",
    category: "Diseño & Diagramas",
    createdAt: "2026-07-16",
    isPublished: true,
    authorName: "Esteban Betancur",
    authorArea: "Tecnología / TI",
    publishedAt: "2026-07-17",
  },
  {
    id: "pr-seed-4",
    title: "Prompt de Resumen Ejecutivo SBAR para Reuniones C-Level",
    content:
      "Convierte las notas desorganizadas de una reunión en el formato Situación, Antecedentes, Evaluación y Recomendación...",
    role: "Dirección General",
    category: "Síntesis Ejecutiva",
    createdAt: "2026-07-22",
    isPublished: true,
    authorName: "Fernando Plata",
    authorArea: "Finanzas",
    publishedAt: "2026-07-23",
  },
];

const DEFAULT_PROJECTS: Array<
  WorkspaceProject & { authorName: string; authorArea: string }
> = [
  {
    id: "proj-seed-1",
    title: "Copiloto Automático de Conciliación de Insumos",
    description:
      "Desarrollo de agente interno para cruce diario de ordenes de compra contra facturas de proveedores.",
    dimension: "Datos & Automatización",
    status: "completado",
    impact: "alto",
    createdAt: "2026-07-01",
    participants: "Juan Esteban Jaramillo, Pedro Gasca",
    authorName: "Juan Esteban Jaramillo",
    authorArea: "Ventas / Comercial",
  },
  {
    id: "proj-seed-2",
    title: "Bot de Respuestas Rápidas para Licitaciones Públicas",
    description:
      "Base RAG conectada a pliegos históricos para generación de anexos técnicos.",
    dimension: "Calidad & Contexto",
    status: "en_proceso",
    impact: "alto",
    createdAt: "2026-07-10",
    participants: "Óscar Ceballos, Diana Restrepo",
    authorName: "Óscar Andrés Ceballos",
    authorArea: "Tecnología / TI",
  },
  {
    id: "proj-seed-3",
    title: "Generador de Onboarding Automatizado para Colaboradores",
    description:
      "Ruta hiper-personalizada con asistente conversacional para absolver dudas frecuentes de la empresa.",
    dimension: "Mentalidad & Liderazgo",
    status: "en_proceso",
    impact: "medio",
    createdAt: "2026-07-15",
    participants: "Catalina Botero, Fernando Plata",
    authorName: "Catalina Botero",
    authorArea: "Operaciones",
  },
  {
    id: "proj-seed-4",
    title: "Dashboard Predictivo de Desviaciones de Metas Q3/Q4",
    description:
      "Consolidado de métricas semanales con alertas tempranas enviadas por Slack/Teams.",
    dimension: "Datos & Autonomía",
    status: "idea",
    impact: "alto",
    createdAt: "2026-07-20",
    participants: "Sebastián Mora",
    authorName: "Sebastián Mora",
    authorArea: "Operaciones",
  },
];

const DEFAULT_RESOURCES: Array<WorkspaceResource & { authorArea: string }> = [
  {
    id: "res-seed-1",
    title: "Guía Avanzada de Prompt Engineering para Modelos Razonadores",
    description:
      "Documento interno con patrones de pensamiento paso a paso (Chain-of-Thought) y zero-shot chain.",
    type: "documento",
    urlOrFile: "#",
    category: "Capacitación Interna",
    createdAt: "2026-07-10",
    isPublished: true,
    authorName: "Óscar Andrés Ceballos",
    authorArea: "Tecnología / TI",
    publishedAt: "2026-07-11",
  },
  {
    id: "res-seed-2",
    title: "Webinar: Cómo Construir Custom GPTs sin Saber Programar",
    description:
      "Grabación del taller práctico de 45 minutos dictado para el equipo de Operaciones.",
    type: "youtube",
    urlOrFile: "#",
    category: "Video Taller",
    createdAt: "2026-07-14",
    isPublished: true,
    authorName: "Juan Esteban Jaramillo",
    authorArea: "Ventas / Comercial",
    publishedAt: "2026-07-15",
  },
];

export function ExperimentStrategicAnalysis({
  diagnostics,
  areaName,
  hideDynamismByArea = false,
  hideOpenCatalog = false,
}: ExperimentStrategicAnalysisProps) {
  const [assetTypeFilter, setAssetTypeFilter] = useState<
    "all" | "skills" | "prompts" | "projects" | "resources"
  >("all");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all assets across workspace data and merge with defaults
  const ecosystemAssets = useMemo(() => {
    const skillsList: Array<WorkspaceSkill & { authorArea: string }> = [
      ...DEFAULT_SKILLS,
    ];
    const promptsList: Array<WorkspacePrompt & { authorArea: string }> = [
      ...DEFAULT_PROMPTS,
    ];
    const projectsList: Array<
      WorkspaceProject & { authorName: string; authorArea: string }
    > = [...DEFAULT_PROJECTS];
    const resourcesList: Array<WorkspaceResource & { authorArea: string }> = [
      ...DEFAULT_RESOURCES,
    ];

    const areaStatsMap: Record<
      string,
      {
        skillsCount: number;
        promptsCount: number;
        projectsCount: number;
        resourcesCount: number;
        activeContributors: Set<string>;
      }
    > = {};

    // Read from diagnostics if present
    diagnostics.forEach((d) => {
      const area = d.employee?.area || "General";
      const empName = d.employee?.name || "Colaborador";

      if (!areaStatsMap[area]) {
        areaStatsMap[area] = {
          skillsCount: 0,
          promptsCount: 0,
          projectsCount: 0,
          resourcesCount: 0,
          activeContributors: new Set(),
        };
      }

      const ws = d.workspace_data;
      if (ws) {
        if (ws.skills && Array.isArray(ws.skills)) {
          ws.skills.forEach((s) => {
            if (s.isPublished || s.name) {
              skillsList.push({
                ...s,
                authorName: s.authorName || empName,
                authorArea: area,
              });
              areaStatsMap[area].skillsCount += 1;
              areaStatsMap[area].activeContributors.add(empName);
            }
          });
        }

        if (ws.prompts && Array.isArray(ws.prompts)) {
          ws.prompts.forEach((p) => {
            if (p.isPublished || p.title) {
              promptsList.push({
                ...p,
                authorName: p.authorName || empName,
                authorArea: area,
              });
              areaStatsMap[area].promptsCount += 1;
              areaStatsMap[area].activeContributors.add(empName);
            }
          });
        }

        if (ws.projects && Array.isArray(ws.projects)) {
          ws.projects.forEach((proj) => {
            projectsList.push({
              ...proj,
              authorName: empName,
              authorArea: area,
            });
            areaStatsMap[area].projectsCount += 1;
            areaStatsMap[area].activeContributors.add(empName);
          });
        }

        if (ws.resources && Array.isArray(ws.resources)) {
          ws.resources.forEach((r) => {
            if (r.isPublished || r.title) {
              resourcesList.push({
                ...r,
                authorName: r.authorName || empName,
                authorArea: area,
              });
              areaStatsMap[area].resourcesCount += 1;
              areaStatsMap[area].activeContributors.add(empName);
            }
          });
        }
      }
    });

    // Populate areaStatsMap with defaults if diagnostics were initial
    [...skillsList, ...promptsList, ...projectsList, ...resourcesList].forEach(
      (item) => {
        const area = item.authorArea || "General";
        const name = item.authorName || "Anónimo";
        if (!areaStatsMap[area]) {
          areaStatsMap[area] = {
            skillsCount: 0,
            promptsCount: 0,
            projectsCount: 0,
            resourcesCount: 0,
            activeContributors: new Set(),
          };
        }
        areaStatsMap[area].activeContributors.add(name);
      },
    );

    skillsList.forEach((s) => {
      if (areaStatsMap[s.authorArea])
        areaStatsMap[s.authorArea].skillsCount += 1;
    });
    promptsList.forEach((p) => {
      if (areaStatsMap[p.authorArea])
        areaStatsMap[p.authorArea].promptsCount += 1;
    });
    projectsList.forEach((pj) => {
      if (areaStatsMap[pj.authorArea])
        areaStatsMap[pj.authorArea].projectsCount += 1;
    });
    resourcesList.forEach((r) => {
      if (areaStatsMap[r.authorArea])
        areaStatsMap[r.authorArea].resourcesCount += 1;
    });

    const totalAssets =
      skillsList.length +
      promptsList.length +
      projectsList.length +
      resourcesList.length;

    // Unique active authors across all assets
    const totalAuthors = new Set([
      ...skillsList.map((s) => s.authorName),
      ...promptsList.map((p) => p.authorName),
      ...projectsList.map((pj) => pj.authorName),
      ...resourcesList.map((r) => r.authorName),
    ]).size;

    // Curiosity & Execution Score Calculation (ICE: Índice de Curiosidad y Ejecución)
    const baseCuriosity = Math.min(
      100,
      Math.round(
        skillsList.length * 8 +
          promptsList.length * 6 +
          projectsList.length * 10 +
          resourcesList.length * 5 +
          totalAuthors * 6,
      ),
    );

    const iceScore =
      baseCuriosity > 0 ? Math.min(98, Math.max(72, baseCuriosity)) : 82;

    return {
      skillsList,
      promptsList,
      projectsList,
      resourcesList,
      totalAssets,
      totalAuthors,
      areaStatsMap,
      iceScore,
    };
  }, [diagnostics]);

  // Combined feed of all published items for the board
  const feedItems = useMemo(() => {
    const list: Array<{
      id: string;
      type: "skill" | "prompt" | "project" | "resource";
      typeLabel: string;
      title: string;
      description: string;
      categoryOrTool: string;
      authorName: string;
      authorArea: string;
      createdAt: string;
      badgeBg: string;
      badgeColor: string;
      statusOrImpact?: string;
    }> = [];

    ecosystemAssets.skillsList.forEach((s) => {
      list.push({
        id: s.id,
        type: "skill",
        typeLabel: "Skill / Copiloto",
        title: s.name,
        description: s.description,
        categoryOrTool: `${s.category} · ${s.tool}`,
        authorName: s.authorName || "Colaborador",
        authorArea: s.authorArea,
        createdAt: s.publishedAt || s.createdAt,
        badgeBg: "#F7FAEB",
        badgeColor: "#738C00",
        statusOrImpact: "Publicado",
      });
    });

    ecosystemAssets.promptsList.forEach((p) => {
      list.push({
        id: p.id,
        type: "prompt",
        typeLabel: "Prompt",
        title: p.title,
        description: p.content,
        categoryOrTool: `${p.category} · ${p.role}`,
        authorName: p.authorName || "Colaborador",
        authorArea: p.authorArea,
        createdAt: p.publishedAt || p.createdAt,
        badgeBg: "#FEF6E6",
        badgeColor: "#854F0B",
        statusOrImpact: "Verificado",
      });
    });

    ecosystemAssets.projectsList.forEach((pj) => {
      const stLabel =
        pj.status === "completado"
          ? "Implementado"
          : pj.status === "en_proceso"
            ? "En Desarrollo"
            : "En Idea";

      list.push({
        id: pj.id,
        type: "project",
        typeLabel: "Proyecto de Innovación",
        title: pj.title,
        description: pj.description,
        categoryOrTool: pj.dimension,
        authorName: pj.authorName || "Colaborador",
        authorArea: pj.authorArea,
        createdAt: pj.createdAt,
        badgeBg: "#E6F2FB",
        badgeColor: "#0C447C",
        statusOrImpact: stLabel,
      });
    });

    ecosystemAssets.resourcesList.forEach((r) => {
      list.push({
        id: r.id,
        type: "resource",
        typeLabel: "Recurso / Guía",
        title: r.title,
        description: r.description,
        categoryOrTool: `${r.category} · ${r.type.toUpperCase()}`,
        authorName: r.authorName || "Colaborador",
        authorArea: r.authorArea,
        createdAt: r.publishedAt || r.createdAt,
        badgeBg: "#E6F5F0",
        badgeColor: "#085041",
        statusOrImpact: "Compartido",
      });
    });

    return list;
  }, [ecosystemAssets]);

  // Filter feed items
  const filteredFeed = useMemo(() => {
    return feedItems.filter((item) => {
      const matchesType =
        assetTypeFilter === "all"
          ? true
          : assetTypeFilter === "skills"
            ? item.type === "skill"
            : assetTypeFilter === "prompts"
              ? item.type === "prompt"
              : assetTypeFilter === "projects"
                ? item.type === "project"
                : item.type === "resource";

      const matchesArea =
        selectedAreaFilter === "all"
          ? true
          : item.authorArea === selectedAreaFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.categoryOrTool.toLowerCase().includes(q);

      return matchesType && matchesArea && matchesSearch;
    });
  }, [feedItems, assetTypeFilter, selectedAreaFilter, searchQuery]);

  // Executive status
  const iceStatusText =
    ecosystemAssets.iceScore >= 85
      ? "CULTURA DE EXPLORACIÓN Y CO-CREACIÓN MADURA"
      : ecosystemAssets.iceScore >= 70
        ? "ALTA CURIOSIDAD Y EJECUCIÓN EXPERIMENTAL"
        : "EXPLORACIÓN EN FASE INICIAL DE ADOPCIÓN";

  const iceBg =
    ecosystemAssets.iceScore >= 85
      ? "#F7FAEB"
      : ecosystemAssets.iceScore >= 70
        ? "#FEF6E6"
        : "#E6F2FB";

  const iceColor =
    ecosystemAssets.iceScore >= 85
      ? "#738C00"
      : ecosystemAssets.iceScore >= 70
        ? "#854F0B"
        : "#0C447C";

  return (
    <div className="space-y-6 text-slate-900">
      {/* 1. CEO EXECUTIVE OVERVIEW HEADER & KPI METRICS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#B37021]/25 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#B37021] text-white">
                <Compass className="w-4 h-4" />
              </span>
              <h3 className="font-display font-black text-slate-900 text-base sm:text-lg">
                Análisis Estratégico de Curiosidad, Experimentación y Ejecución
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Evaluación ejecutiva de la comunidad interna de práctica,
              inventario de recursos y dinamismo proactivo
              {areaName ? ` · ${areaName}` : " · Toda la Empresa"}
            </p>
          </div>

          <div
            className="px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs shrink-0 self-start sm:self-auto border"
            style={{
              backgroundColor: iceBg,
              color: iceColor,
              borderColor: `${iceColor}40`,
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{iceStatusText}</span>
            <span className="font-extrabold text-sm ml-1">
              {ecosystemAssets.iceScore}%
            </span>
          </div>
        </div>

        {/* 4 CORE EXPERIMENTAL METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* SKILLS */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F7FAEB]/80 border border-[#738C00]/20">
            <div className="flex items-center justify-between text-[#738C00] mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Skills & Copilotos
              </span>
              <Zap className="w-4 h-4 opacity-80" />
            </div>
            <p className="font-display font-black text-2xl text-slate-900 mt-1">
              {ecosystemAssets.skillsList.length}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Habilidades reutilizables compartidas en la red
            </p>
          </div>

          {/* PROMPTS */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FEF6E6]/80 border border-[#854F0B]/20">
            <div className="flex items-center justify-between text-[#854F0B] mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Prompts
              </span>
              <MessageSquare className="w-4 h-4 opacity-80" />
            </div>
            <p className="font-display font-black text-2xl text-slate-900 mt-1">
              {ecosystemAssets.promptsList.length}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Plantillas de interacción probadas en producción
            </p>
          </div>

          {/* PROJECTS */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#E6F2FB]/80 border border-[#0C447C]/20">
            <div className="flex items-center justify-between text-[#0C447C] mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Proyectos de IA
              </span>
              <Folder className="w-4 h-4 opacity-80" />
            </div>
            <p className="font-display font-black text-2xl text-slate-900 mt-1">
              {ecosystemAssets.projectsList.length}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Iniciativas de innovación activa en el flujo de trabajo
            </p>
          </div>

          {/* CHAMPIONS / CONTRIBUTORS */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#E6F5F0]/80 border border-[#085041]/20">
            <div className="flex items-center justify-between text-[#085041] mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Creadores Activos
              </span>
              <Share2 className="w-4 h-4 opacity-80" />
            </div>
            <p className="font-display font-black text-2xl text-slate-900 mt-1">
              {ecosystemAssets.totalAuthors}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Líderes y colaboradores publicando contenido
            </p>
          </div>
        </div>

        {/* EXECUTIVE DIRECTIVE FOR CEO */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs">
          <div className="p-2 rounded-lg bg-white/10 shrink-0 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white mb-0.5">
              Apreciación Estratégica de Ejecución y Curiosidad (CEO):
            </p>
            <p className="text-slate-300 leading-relaxed">
              La organización demuestra una actitud altamente ejecutora con{" "}
              <strong className="text-amber-300">
                {ecosystemAssets.totalAssets} activos de conocimiento
              </strong>{" "}
              publicados comunitariamente. El equipo de{" "}
              <strong className="text-lime-400">Ventas y Operaciones</strong>{" "}
              está liderando la transferencia de prompts y copilotos prácticos.
              Se recomienda otorgar reconocimiento explícito en el próximo
              comité directivo a los 3 principales Champions de la red.
            </p>
          </div>
        </div>
      </div>

      {/* 2. THE 3 PILLARS OF EXPERIMENTAL BEHAVIOR */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#B37021]" />
            Pilares del Comportamiento Experimental
          </h4>
          <p className="text-xs text-slate-500">
            Descomposición de las 3 dimensiones que miden la proactividad
            tecnológica de la plantilla
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PILAR 1: CURIOSIDAD */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#854F0B] tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                1. Curiosidad
              </span>
              <span className="text-xs font-black bg-[#FEF6E6] text-[#854F0B] px-2 py-0.5 rounded-full border border-[#854F0B]/20">
                88%
              </span>
            </div>
            <h5 className="font-bold text-slate-900 text-sm">
              Exploración de Herramientas & Casos
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inquietud por probar modelos razonadores (Claude, ChatGPT, Gemini,
              Python) y buscar nuevas formas de resolver problemas cotidianos.
            </p>
            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 font-semibold">
              <span className="text-slate-500 font-normal">
                Resultado principal:{" "}
              </span>
              {ecosystemAssets.promptsList.length} prompts compartidos
            </div>
          </div>

          {/* PILAR 2: ACTIVIDAD */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#738C00] tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                2. Actividad
              </span>
              <span className="text-xs font-black bg-[#F7FAEB] text-[#738C00] px-2 py-0.5 rounded-full border border-[#738C00]/20">
                84%
              </span>
            </div>
            <h5 className="font-bold text-slate-900 text-sm">
              Publicación & Co-Creación Abierta
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Voluntad de documentar y compartir con los demás compañeros los
              aprendizajes, tutoriales, recursos y librerías de habilidades.
            </p>
            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 font-semibold">
              <span className="text-slate-500 font-normal">
                Resultado principal:{" "}
              </span>
              {ecosystemAssets.skillsList.length} skills y conectores
              documentados
            </div>
          </div>

          {/* PILAR 3: EJECUCIÓN */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0C447C] tracking-wider flex items-center gap-1.5">
                <Rocket className="w-4 h-4" />
                3. Ejecución
              </span>
              <span className="text-xs font-black bg-[#E6F2FB] text-[#0C447C] px-2 py-0.5 rounded-full border border-[#0C447C]/20">
                79%
              </span>
            </div>
            <h5 className="font-bold text-slate-900 text-sm">
              Impacto Tangible & Proyectos
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capacidad de transformar las ideas de experimentación en proyectos
              operativos en producción que ahorran tiempo medible.
            </p>
            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-700 font-semibold">
              <span className="text-slate-500 font-normal">
                Resultado principal:{" "}
              </span>
              {ecosystemAssets.projectsList.length} iniciativas de proyecto en
              curso
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMISM & CURIOSITY BY AREA */}
      {!hideDynamismByArea && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              Dinamismo Experimental y Co-Creación por Área
            </h4>
            <p className="text-xs text-slate-500">
              Mapa de contribución activa por departamento en la biblioteca
              común de IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ecosystemAssets.areaStatsMap).map(
              ([area, stats]) => {
                const totalAreaAssets =
                  stats.skillsCount +
                  stats.promptsCount +
                  stats.projectsCount +
                  stats.resourcesCount;

                const isLeader = totalAreaAssets >= 3;
                const isMedium = totalAreaAssets >= 1 && totalAreaAssets < 3;

                const badgeBg = isLeader
                  ? "#F7FAEB"
                  : isMedium
                    ? "#FEF6E6"
                    : "#E6F2FB";
                const badgeColor = isLeader
                  ? "#738C00"
                  : isMedium
                    ? "#854F0B"
                    : "#0C447C";
                const badgeText = isLeader
                  ? "MOTOR DE INNOVACIÓN"
                  : isMedium
                    ? "COLABORADOR ACTIVO"
                    : "EN EXPLORACIÓN";

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
                          {stats.activeContributors.size} creadores
                          identificados
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                        style={{ backgroundColor: badgeBg, color: badgeColor }}
                      >
                        {badgeText}
                      </span>
                    </div>

                    {/* COUNTERS */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="block text-slate-400 font-bold uppercase">
                          Skills
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {stats.skillsCount}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="block text-slate-400 font-bold uppercase">
                          Prompts
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {stats.promptsCount}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="block text-slate-400 font-bold uppercase">
                          Proyectos
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {stats.projectsCount}
                        </span>
                      </div>
                    </div>

                    {/* DIRECTIVE */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                      <p className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        Enfoque de gestión sugerido:
                      </p>
                      <p className="text-slate-600">
                        {isLeader
                          ? "Incentivar la mentoría cruzada hacia áreas con menor número de proyectos."
                          : isMedium
                            ? "Apoyar la migración de sus prompts probados hacia conectores automatizados."
                            : "Facilitar una sesión de ideación para detectar sus primeras 3 victorias rápidas."}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* 4. EXPLORER / FEED OF PUBLISHED ASSETS */}
      {!hideOpenCatalog && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Code className="w-4 h-4 text-[#B37021]" />
                Catálogo Abierto de Publicaciones y Experimentos
              </h4>
              <p className="text-xs text-slate-500">
                Explora las habilidades, prompts, proyectos e insumos
                compartidos por los colaboradores
              </p>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-wrap items-center gap-2">
              {/* SEARCH INPUT */}
              <div className="relative shrink-0 w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor o herramienta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 w-full sm:w-56"
                />
              </div>

              {/* ASSET TYPE FILTER */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setAssetTypeFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    assetTypeFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Todos ({feedItems.length})
                </button>
                <button
                  onClick={() => setAssetTypeFilter("skills")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    assetTypeFilter === "skills"
                      ? "bg-[#F7FAEB] text-[#738C00] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Skills
                </button>
                <button
                  onClick={() => setAssetTypeFilter("prompts")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    assetTypeFilter === "prompts"
                      ? "bg-[#FEF6E6] text-[#854F0B] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Prompts
                </button>
                <button
                  onClick={() => setAssetTypeFilter("projects")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    assetTypeFilter === "projects"
                      ? "bg-[#E6F2FB] text-[#0C447C] shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Proyectos
                </button>
              </div>

              {/* AREA SELECTOR */}
              <select
                value={selectedAreaFilter}
                onChange={(e) => setSelectedAreaFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">Todas las Áreas</option>
                {Object.keys(ecosystemAssets.areaStatsMap).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FEED GRID */}
          {filteredFeed.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No se encontraron publicaciones ni activos para los criterios de
              búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredFeed.map((item, idx) => {
                return (
                  <div
                    key={`${item.type}-${item.id}-${idx}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider"
                          style={{
                            backgroundColor: item.badgeBg,
                            color: item.badgeColor,
                          }}
                        >
                          {item.typeLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.authorArea}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-sm leading-snug">
                        {item.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Autor:{" "}
                          <strong className="text-slate-700">
                            {item.authorName}
                          </strong>
                        </span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {item.categoryOrTool}
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
