export interface CuratedCourse {
  id: string;
  title: string;
  channel: string;
  duration: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  subprofiles: Array<
    | "Aficionado"
    | "Explorador"
    | "Integrador"
    | "Director"
    | "Constructor"
    | "Orquestador"
  >;
  gapTypes: Array<
    "convencido_sin_herramientas" | "poder_sin_proposito" | "alineado"
  >;
  dimensions: string[];
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  description: string;
  tags: string[];
  miaPromptSuggestion: string;
}

export const CURATED_COURSES: CuratedCourse[] = [
  {
    id: "course-1",
    title: "Curso Completo de Prompt Engineering y Contexto Estructurado",
    channel: "DotCSV & Midulive",
    duration: "1h 15m",
    level: "Básico",
    subprofiles: ["Aficionado", "Explorador"],
    gapTypes: ["convencido_sin_herramientas", "alineado"],
    dimensions: ["Contexto", "Mentalidad", "Calidad"],
    youtubeUrl: "https://www.youtube.com/watch?v=_Z9bOUb0BiU",
    youtubeId: "_Z9bOUb0BiU",
    thumbnailUrl: "https://img.youtube.com/vi/_Z9bOUb0BiU/hqdefault.jpg",
    description:
      "Aprende las técnicas esenciales para redactar prompts efectivos, asignar roles, proveer contexto de negocio y formatear salidas para tu día a día.",
    tags: ["Prompt Engineering", "Contexto", "Productividad"],
    miaPromptSuggestion:
      "MIA, según mi subperfil Explorador y mi brecha en Contexto, ayúdame a estructurar mi primer Prompt con contexto de mi área.",
  },
  {
    id: "course-2",
    title: "Creación de Agentes y Flujos de Trabajo con Gemini y Claude",
    channel: "Nate Gentile / AI Academy",
    duration: "2h 05m",
    level: "Intermedio",
    subprofiles: ["Explorador", "Integrador", "Director"],
    gapTypes: ["convencido_sin_herramientas", "alineado"],
    dimensions: ["Automatización", "Contexto", "Datos"],
    youtubeUrl: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    youtubeId: "kCc8FmEb1nY",
    thumbnailUrl: "https://img.youtube.com/vi/kCc8FmEb1nY/hqdefault.jpg",
    description:
      "Cómo integrar proyectos con contexto persistente (Gems/Projects) para automatizar análisis de documentos, informes y consultas frecuentes.",
    tags: ["Agentes de IA", "Gems & Projects", "Flujos de Trabajo"],
    miaPromptSuggestion:
      "MIA, quiero diseñar un proyecto con contexto guardado para mi departamento. ¿Qué archivos e instrucciones del sistema debo preparar?",
  },
  {
    id: "course-3",
    title: "Estrategia de Inteligencia Artificial para Liderazgo y Ejecutivos",
    channel: "Platzi & Harvard Business Review",
    duration: "1h 40m",
    level: "Avanzado",
    subprofiles: ["Director", "Constructor", "Orquestador"],
    gapTypes: ["poder_sin_proposito", "alineado"],
    dimensions: ["Liderazgo", "Autonomía", "Mentalidad"],
    youtubeUrl: "https://www.youtube.com/watch?v=2Tz8S3dK_1k",
    youtubeId: "2Tz8S3dK_1k",
    thumbnailUrl: "https://img.youtube.com/vi/2Tz8S3dK_1k/hqdefault.jpg",
    description:
      "Alineación estratégica de iniciativas de IA con objetivos de negocio, priorización de casos de uso de alto impacto e indicadores de éxito.",
    tags: ["Liderazgo", "Estrategia", "ROI en IA"],
    miaPromptSuggestion:
      "MIA, ayúdame a priorizar proyectos de IA en mi área usando la matriz de Valor vs Esfuerzo según la visión estratégica del negocio.",
  },
  {
    id: "course-4",
    title:
      "Automatizaciones Prácticas sin Código con Make & N8N asistidos por IA",
    channel: "Automatiza Con IA",
    duration: "1h 50m",
    level: "Intermedio",
    subprofiles: ["Integrador", "Constructor"],
    gapTypes: ["convencido_sin_herramientas", "alineado"],
    dimensions: ["Automatización", "Datos", "Autonomía"],
    youtubeUrl: "https://www.youtube.com/watch?v=d_3V5kX1YqA",
    youtubeId: "d_3V5kX1YqA",
    thumbnailUrl: "https://img.youtube.com/vi/d_3V5kX1YqA/hqdefault.jpg",
    description:
      "Conecta correos, hojas de cálculo y bases de datos con APIs de IA para eliminar tareas repetitivas y acelerar procesos del equipo.",
    tags: ["No-Code", "Automatización", "APIs"],
    miaPromptSuggestion:
      "MIA, identifica 3 procesos repetitivos en mi rol y sugieren un flujo de automatización asistido por IA.",
  },
  {
    id: "course-5",
    title: "Análisis Inteligente de Datos y Reporte Estratégico con IA",
    channel: "Código Facilito & Data School",
    duration: "1h 10m",
    level: "Intermedio",
    subprofiles: ["Explorador", "Integrador", "Director"],
    gapTypes: ["convencido_sin_herramientas", "poder_sin_proposito"],
    dimensions: ["Datos", "Calidad", "Contexto"],
    youtubeUrl: "https://www.youtube.com/watch?v=0kI74pS_8fQ",
    youtubeId: "0kI74pS_8fQ",
    thumbnailUrl: "https://img.youtube.com/vi/0kI74pS_8fQ/hqdefault.jpg",
    description:
      "Análisis cualitativo y cuantitativo con modelos de lenguaje, limpieza de datos, extracción de insights y generación de resúmenes gerenciales.",
    tags: ["Análisis de Datos", "Data Insights", "Reportes"],
    miaPromptSuggestion:
      "MIA, como analizador de datos, dame una guía para pedirle a Gemini/ChatGPT que procese mis reportes semanales sin sesgos.",
  },
  {
    id: "course-6",
    title: "Gobernanza, Seguridad y Ética en la Adopción Organizacional de IA",
    channel: "MIT OpenCourseWare / Marea",
    duration: "55m",
    level: "Avanzado",
    subprofiles: ["Director", "Constructor", "Orquestador"],
    gapTypes: ["poder_sin_proposito", "alineado"],
    dimensions: ["Emocionalidad", "Liderazgo", "Calidad"],
    youtubeUrl: "https://www.youtube.com/watch?v=S237E4SgB2w",
    youtubeId: "S237E4SgB2w",
    thumbnailUrl: "https://img.youtube.com/vi/S237E4SgB2w/hqdefault.jpg",
    description:
      "Lineamientos de protección de datos confidenciales, prevención de alucinaciones y gestión cultural del cambio frente a la IA.",
    tags: ["Gobernanza", "Seguridad", "Ética"],
    miaPromptSuggestion:
      "MIA, ¿cuáles son las 5 reglas de oro para compartir información empresarial con herramientas de IA de forma segura?",
  },
];
