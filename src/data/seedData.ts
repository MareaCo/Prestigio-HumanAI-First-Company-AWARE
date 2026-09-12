/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EmployeeSeed {
  id: string;
  name: string;
  email: string | null;
  area: string;
  company_id: string;
  empresa?: string | null;
  created_at: string;
  password?: string | null;
}

export interface DimScoresSeed {
  Mentalidad: number;
  Contexto: number;
  Datos: number;
  Automatización: number;
  Calidad: number;
  Autonomía: number;
  Liderazgo: number;
}

export interface ActivitiesQSeed {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface DiagnosticSeed {
  id: string;
  employee_id: string;
  tier: number;
  total_score: number;
  dim_scores: DimScoresSeed;
  perfil: "Escéptico" | "Táctico" | "Facilitador" | "Amplificador";
  activities_q: any;
  created_at: string;
  workspace_data?: any;
}

// --- TEST USER DATA: ANDRÉS PIEDRAHITA (Strategic Brands) ---
export const ANDRES_PIEDRAHITA_EMPLOYEE: EmployeeSeed = {
  id: "emp-andres-piedrahita",
  name: "Andrés Piedrahita",
  email: "andres.piedrahita@strategicbrands.com",
  area: "Director de mercadeo",
  company_id: "strategic-brands",
  empresa: "Strategic Brands",
  created_at: "2026-07-26T08:00:00.000Z",
  password: "123456",
};

export const ANDRES_MATRIZ_ACTIVITIES = [
  // Cuadrante 1: Bajo valor, Baja frecuencia (2 actividades)
  {
    id: "act-andres-1",
    name: "Filtrado y clasificación de correos masivos de proveedores",
    mins: 30,
    quadrant: "q1",
    analysis: null,
    unclear: false,
    locked: false,
  },
  {
    id: "act-andres-2",
    name: "Aprobación rutinaria de artes gráficos menores",
    mins: 25,
    quadrant: "q1",
    analysis: null,
    unclear: false,
    locked: false,
  },
  // Cuadrante 2: Alto valor, Baja frecuencia (3 actividades)
  {
    id: "act-andres-3",
    name: "Diseño de estrategia trimestral de posicionamiento de marca",
    mins: 120,
    quadrant: "q2",
    analysis: null,
    unclear: false,
    locked: false,
  },
  {
    id: "act-andres-4",
    name: "Evaluación y selección de agencias de medios externas",
    mins: 90,
    quadrant: "q2",
    analysis: null,
    unclear: false,
    locked: false,
  },
  {
    id: "act-andres-5",
    name: "Planificación de presupuesto anual de Marketing Digital",
    mins: 150,
    quadrant: "q2",
    analysis: null,
    unclear: false,
    locked: false,
  },
  // Cuadrante 3: Bajo valor, Alta frecuencia (3 actividades)
  {
    id: "act-andres-6",
    name: "Generación de reportes semanales de métricas de pauta",
    mins: 60,
    quadrant: "q3",
    analysis: null,
    unclear: false,
    locked: false,
  },
  {
    id: "act-andres-7",
    name: "Redacción y adaptación de copys diarios para redes sociales",
    mins: 45,
    quadrant: "q3",
    analysis: null,
    unclear: false,
    locked: false,
  },
  {
    id: "act-andres-8",
    name: "Monitoreo manual de comentarios y menciones de marca",
    mins: 40,
    quadrant: "q3",
    analysis: null,
    unclear: false,
    locked: false,
  },
  // Cuadrante 4: Alto valor, Alta frecuencia (2 actividades)
  {
    id: "act-andres-9",
    name: "Análisis predictivo de comportamiento de consumidor y ROI de pauta",
    mins: 90,
    quadrant: "q4",
    analysis: null,
    unclear: false,
    locked: false,
  },
  {
    id: "act-andres-10",
    name: "Supervisión de campañas omnicanal y lanzamientos de producto",
    mins: 60,
    quadrant: "q4",
    analysis: null,
    unclear: false,
    locked: false,
  },
];

export const ANDRES_ROADMAP_TASKS = [
  {
    id: "r-andres-30-1",
    horizon: "30",
    title: "Auditar 10 actividades clave de Mercadeo en la Matriz",
    description:
      "Clasificar la frecuencia y valor estratégico de las tareas del departamento de mercadeo.",
    completed: true,
    completedAt: "2026-07-20",
  },
  {
    id: "r-andres-30-2",
    horizon: "30",
    title: "Implementar Prompts de Estrategia y Breves Creativos",
    description:
      "Estructurar asistentes con IA para la ideación rápida de campañas y adaptación de copys.",
    completed: true,
    completedAt: "2026-07-22",
  },
  {
    id: "r-andres-60-1",
    horizon: "60",
    title: "Desplegar Proyecto de ROI Predictivo y Automatización de Pauta",
    description:
      "Automatizar el consolidado de métricas de Meta Ads y Google Ads para Strategic Brands.",
    completed: false,
  },
  {
    id: "r-andres-60-2",
    horizon: "60",
    title: "Publicar Skills de Segmentación y Copys Multicanal",
    description:
      "Compartir herramientas comprobadas con el equipo corporativo.",
    completed: false,
  },
  {
    id: "r-andres-90-1",
    horizon: "90",
    title: "Escalar Agente de Escucha Social e Inteligencia Competitiva",
    description:
      "Monitorear tendencias de mercado y precios de la competencia en tiempo real.",
    completed: false,
  },
];

// 4 proyectos y 1 postulado de alto impacto
export const ANDRES_PROJECTS = [
  {
    id: "proj-andres-1",
    title: "Plataforma de ROI Predictivo y Optimización de Pauta con IA",
    description:
      "Sistema basado en Gemini 3.5 para predecir el retorno de inversión publicitaria y adaptar copys multicanal por segmento.",
    dimension: "Automatización",
    status: "en_proceso" as const,
    impact: "alto" as const,
    highImpactStatus: "postulado" as const,
    createdAt: "2026-07-15",
    participants: "Andrés Piedrahita, Equipo de Pauta Digital",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    keyOutcome:
      "Aumento estimado del 28% en conversión de campañas y optimización del presupuesto de pauta.",
    usedPrompt:
      "Actúa como Director de Performance. Analiza el histórico de conversiones y ajusta pujas por audiencia.",
  },
  {
    id: "proj-andres-2",
    title: "Consolidación y Limpieza Automática de Leads de Mercadeo",
    description:
      "Procesamiento de bases de datos de clientes potenciales clasificando intención de compra y canal preferido.",
    dimension: "Datos",
    status: "en_proceso" as const,
    impact: "medio" as const,
    createdAt: "2026-07-18",
    participants: "Andrés Piedrahita, Analista de Datos",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  {
    id: "proj-andres-3",
    title: "Estandarización de Manual de Tono y Voz de Marca con IA",
    description:
      "Asistente de revisión de contenidos para asegurar que toda publicación cumpla el manual de marca de Strategic Brands.",
    dimension: "Calidad",
    status: "completado" as const,
    impact: "medio" as const,
    createdAt: "2026-07-20",
    participants: "Andrés Piedrahita, Copywriter",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  {
    id: "proj-andres-4",
    title: "Agente de Escucha Social e Inteligencia Competitiva",
    description:
      "Monitoreo continuo de lanzamientos, precios y promociones de marcas competidoras en el sector.",
    dimension: "Autonomía",
    status: "idea" as const,
    impact: "bajo" as const,
    createdAt: "2026-07-22",
    participants: "Andrés Piedrahita",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
];

// 3 skills (2 publicadas)
export const ANDRES_SKILLS = [
  {
    id: "skill-andres-1",
    name: "Segmentación de Audiencias Digitales y Buyer Personas",
    description:
      "Extrae patrones de comportamiento de clientes para estructurar perfiles psicográficos automatizados.",
    category: "Datos & Contexto",
    tool: "Gemini 3.5 Flash",
    createdAt: "2026-07-12",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-14",
  },
  {
    id: "skill-andres-2",
    name: "Generador de Copys Multicanal y Test A/B",
    description:
      "Crea variaciones de textos publicitarios para Meta Ads y Google Search según embudo de ventas.",
    category: "Creatividad & Contenido",
    tool: "Prompts Estructurados",
    createdAt: "2026-07-15",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-16",
  },
  {
    id: "skill-andres-3",
    name: "Analizador de Sentimiento en Comentarios de Lanzamiento",
    description:
      "Clasifica feedback de clientes en tiempo real identificando detracciones e insights de producto.",
    category: "Analítica",
    tool: "Python & LLM",
    createdAt: "2026-07-20",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
];

// 5 prompts (2 publicados)
export const ANDRES_PROMPTS = [
  {
    id: "prompt-andres-1",
    title: "Prompt de Brief Creativo y Estrategia de Campaña",
    role: "Director de Estrategia de Marca",
    category: "Estrategia de Mercadeo",
    content: `[Rol]: Director de Estrategia de Marca para Strategic Brands.\n[Contexto]: Lanzamiento de nueva línea de producto.\n[Instrucciones]: Genera un brief creativo con propuesta de valor, pilares de contenido y KPIs sugeridos.\n[Formato]: Tabla Markdown.`,
    createdAt: "2026-07-10",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-12",
  },
  {
    id: "prompt-andres-2",
    title: "Prompt de Optimización de ROI en Pauta Digital",
    role: "Analista Senior de Performance",
    category: "Pauta Digital",
    content: `[Rol]: Analista de Performance.\n[Instrucciones]: Analiza las métricas de CPA, CTR y ROAS proporcionadas y recomienda 3 redistribuciones de presupuesto.\n[Formato]: Resumen ejecutivo.`,
    createdAt: "2026-07-14",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-15",
  },
  {
    id: "prompt-andres-3",
    title: "Prompt de Adaptación de Tono para Influencer Marketing",
    role: "Especialista en Relaciones Públicas",
    category: "Social Media",
    content: `[Rol]: Especialista PR.\n[Instrucciones]: Adapta el mensaje institucional a un tono fresco e informal para voceros en Instagram.`,
    createdAt: "2026-07-18",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  {
    id: "prompt-andres-4",
    title: "Prompt de Auditoría SEO y Palabras Clave de Campaña",
    role: "Especialista SEO",
    category: "Posicionamiento Web",
    content: `[Rol]: Especialista en Posicionamiento SEO.\n[Instrucciones]: Revisa el contenido adjunto y sugiere 5 palabras clave de cola larga y etiquetas de títulos.`,
    createdAt: "2026-07-21",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  {
    id: "prompt-andres-5",
    title: "Prompt de Respuestas a Objeciones Frecuentes de Clientes",
    role: "Líder de Soporte y Experiencia",
    category: "Atención al Cliente",
    content: `[Rol]: Especialista en Customer Experience.\n[Instrucciones]: Redacta respuestas empáticas y orientadas a soluciones para las 3 objeciones más frecuentes.`,
    createdAt: "2026-07-23",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
];

// 2 enlaces de youtube (1 publicado), 3 documentos en pdf (1 publicado), 3 enlaces WEB (1 publicado)
export const ANDRES_RESOURCES = [
  // 2 enlaces de YouTube (1 publicado)
  {
    id: "res-andres-yt-1",
    title: "Estrategias de IA Generativa en Marketing y Publicidad 2026",
    description:
      "Conferencia magistral sobre el uso de modelos multimodales para la creación de campañas hiperpersonalizadas.",
    type: "youtube" as const,
    urlOrFile: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Estrategia & IA",
    tags: ["Marketing", "IA", "YouTube", "Estrategia"],
    createdAt: "2026-07-12",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-12",
  },
  {
    id: "res-andres-yt-2",
    title: "Tutorial Interno: Configuración de Agentes de Medios Digitales",
    description:
      "Guía en video para el equipo de Strategic Brands sobre automatización de reportes de rendimiento.",
    type: "youtube" as const,
    urlOrFile: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    category: "Capacitación",
    tags: ["Tutorial", "Medios", "YouTube"],
    createdAt: "2026-07-19",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  // 3 documentos en PDF (1 publicado)
  {
    id: "res-andres-pdf-1",
    title: "Playbook_Marketing_Digital_e_IA_Strategic_Brands_2026.pdf",
    description:
      "Manual operativo con estándares de implementación de Inteligencia Artificial en el área de mercadeo.",
    type: "documento" as const,
    urlOrFile:
      "https://strategicbrands.com/docs/Playbook_Marketing_Digital_e_IA_Strategic_Brands_2026.pdf",
    category: "Estrategia",
    tags: ["PDF", "Playbook", "Manual", "Strategic Brands"],
    createdAt: "2026-07-14",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-14",
  },
  {
    id: "res-andres-pdf-2",
    title: "Informe_Tendencias_de_Consumo_y_Benchmark_Q3.pdf",
    description:
      "Análisis estadístico interno de comportamiento de competidores y hábitos del consumidor.",
    type: "documento" as const,
    urlOrFile:
      "https://strategicbrands.com/docs/Informe_Tendencias_de_Consumo_y_Benchmark_Q3.pdf",
    category: "Investigación",
    tags: ["PDF", "Estudio", "Tendencias"],
    createdAt: "2026-07-20",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  {
    id: "res-andres-pdf-3",
    title: "Propuesta_Inversion_y_Presupuesto_Medios_2027.pdf",
    description:
      "Borrador del plan financiero de pauta y herramientas de IA para la junta directiva.",
    type: "documento" as const,
    urlOrFile:
      "https://strategicbrands.com/docs/Propuesta_Inversion_y_Presupuesto_Medios_2027.pdf",
    category: "Finanzas",
    tags: ["PDF", "Presupuesto", "Confidencial"],
    createdAt: "2026-07-22",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  // 3 enlaces WEB (1 publicado)
  {
    id: "res-andres-web-1",
    title: "Portal de Herramientas de Marketing e Inteligencia Artificial",
    description:
      "Directorio de recursos web recomendados para la optimización de pauta y SEO.",
    type: "enlace" as const,
    urlOrFile: "https://strategicbrands.com/recursos-ia",
    category: "Herramientas",
    tags: ["Web", "Herramientas", "Portal"],
    createdAt: "2026-07-16",
    isPublished: true,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
    publishedAt: "2026-07-16",
  },
  {
    id: "res-andres-web-2",
    title: "Dashboard de Benchmark Competitivo en Tiempo Real",
    description:
      "Plataforma web interna para monitorear precios y promociones de la competencia.",
    type: "enlace" as const,
    urlOrFile: "https://analytics.strategicbrands.com/benchmark",
    category: "Analítica",
    tags: ["Web", "Dashboard", "Interno"],
    createdAt: "2026-07-21",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
  {
    id: "res-andres-web-3",
    title: "Biblioteca de Referencias Visuales y Diseños de Campaña",
    description:
      "Inspiración y tableros de moodboards para las próximas campañas de producto.",
    type: "enlace" as const,
    urlOrFile: "https://figma.com/file/strategicbrands-campaigns",
    category: "Diseño",
    tags: ["Web", "Figma", "Diseño"],
    createdAt: "2026-07-24",
    isPublished: false,
    authorName: "Andrés Piedrahita",
    authorArea: "Director de mercadeo",
  },
];

export const ANDRES_WORKSPACE_DATA = {
  projects: ANDRES_PROJECTS,
  skills: ANDRES_SKILLS,
  prompts: ANDRES_PROMPTS,
  resources: ANDRES_RESOURCES,
  tasks: ANDRES_ROADMAP_TASKS,
};

export const ANDRES_DIAGNOSTIC: DiagnosticSeed = {
  id: "diag-andres-piedrahita",
  employee_id: "emp-andres-piedrahita",
  tier: 4,
  total_score: 45,
  dim_scores: {
    Mentalidad: 7,
    Contexto: 7,
    Datos: 6,
    Automatización: 7,
    Calidad: 6,
    Autonomía: 6,
    Liderazgo: 6,
  },
  perfil: "Facilitador",
  activities_q: {
    q1: 2,
    q2: 3,
    q3: 3,
    q4: 2,
    items: ANDRES_MATRIZ_ACTIVITIES,
    v2_data: {
      answers: [2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 2],
      respuestas: { q13: "C", q14: "C" },
      version: "2.0",
      version_scoring: "2.1",
      workspace_data: ANDRES_WORKSPACE_DATA,
    },
    workspace_data: ANDRES_WORKSPACE_DATA,
  },
  created_at: "2026-07-26T08:00:00.000Z",
  workspace_data: ANDRES_WORKSPACE_DATA,
};

const FIRST_NAMES = [
  "Ana",
  "Luis",
  "María",
  "Carlos",
  "Sofía",
  "Jorge",
  "Elena",
  "Diego",
  "Paula",
  "Iván",
  "Rosa",
  "Pedro",
  "Gabriela",
  "Fernando",
  "Camila",
  "Andrés",
  "Valentina",
  "Ricardo",
  "Isabella",
  "Mateo",
  "Lucía",
  "Santiago",
  "Daniela",
  "Alejandro",
  "Mariana",
  "Sebastián",
  "Natalia",
  "Javier",
  "Victoria",
  "Gabriel",
  "Andrea",
  "Manuel",
  "Florencia",
  "Felipe",
  "Constanza",
  "Matías",
  "Ignacia",
  "Gonzalo",
  "Francisca",
  "Tomás",
  "Beatriz",
  "Joaquín",
  "Catalina",
  "Eduardo",
  "Clara",
  "Nicolás",
  "Juliana",
  "Patricia",
  "Roberto",
  "Diana",
  "Hugo",
  "Verónica",
  "Oscar",
  "Silvia",
  "Adrián",
  "Claudio",
  "Mónica",
  "Martín",
  "Laura",
  "Federico",
];

const LAST_NAMES = [
  "Torres",
  "Pérez",
  "Gómez",
  "Ruiz",
  "Díaz",
  "Silva",
  "Vega",
  "Mora",
  "Ríos",
  "Castro",
  "León",
  "Ortiz",
  "Mendoza",
  "Guerrero",
  "Reyes",
  "Salazar",
  "Herrera",
  "Medina",
  "Delgado",
  "Cortés",
  "Muñoz",
  "Rojas",
  "Soto",
  "Contreras",
  "Morales",
  "Figueroa",
  "Miranda",
  "Guzmán",
  "Álvarez",
  "Gutiérrez",
  "Fuentes",
  "Vargas",
  "Valenzuela",
  "Carrasco",
  "Jara",
  "Pinto",
  "Vergara",
  "Tapia",
  "San Martín",
  "Cárcamo",
  "Sanhueza",
  "Bustos",
  "Molina",
  "Araya",
  "Barrios",
  "Cabrera",
  "Fuenzalida",
  "Henríquez",
  "Orellana",
  "Salinas",
  "Sandoval",
  "Velasco",
  "Villalobos",
  "Zambrano",
  "Zúñiga",
  "Aguilera",
  "Cáceres",
  "Donoso",
  "Espinosa",
  "Lara",
];

const AREAS = [
  "Ventas",
  "Operaciones",
  "Tecnología",
  "Recursos Humanos",
  "Marketing",
  "Finanzas",
  "Soporte",
  "Legal",
  "Producto",
];

export function generateDimScores(totalScore: number): DimScoresSeed {
  const DIM_MAX = {
    Mentalidad: 8,
    Contexto: 8,
    Datos: 8,
    Automatización: 8,
    Calidad: 8,
    Autonomía: 8,
    Liderazgo: 12,
  };
  const dimensions = Object.keys(DIM_MAX) as Array<keyof typeof DIM_MAX>;

  const scores: Record<string, number> = {};
  let sum = 0;
  dimensions.forEach((dim) => {
    const max = DIM_MAX[dim];
    let val = Math.round((totalScore / 60) * max);
    val = Math.max(1, Math.min(max, val));
    scores[dim] = val;
    sum += val;
  });

  let attempts = 0;
  while (sum !== totalScore && attempts < 100) {
    attempts++;
    const diff = totalScore - sum;
    const step = diff > 0 ? 1 : -1;
    for (const dim of dimensions) {
      if (sum === totalScore) break;
      const max = DIM_MAX[dim];
      const newVal = scores[dim] + step;
      if (newVal >= 1 && newVal <= max) {
        scores[dim] = newVal;
        sum += step;
      }
    }
  }

  return scores as unknown as DimScoresSeed;
}

export function generateActivitiesQ(tier: number, i: number): ActivitiesQSeed {
  // Ensure every single user has incorporated positive activities in all 4 quadrants of their matrix
  const q1 = 1 + (i % 3);
  const q2 = 1 + ((i + 1) % 3);
  const q3 = 1 + ((i + 2) % 3);
  const q4 = 1 + ((i + 3) % 3);
  return { q1, q2, q3, q4 };
}

export function get60SeedData(companyId: string): {
  employees: EmployeeSeed[];
  diagnostics: DiagnosticSeed[];
} {
  const employees: EmployeeSeed[] = [ANDRES_PIEDRAHITA_EMPLOYEE];
  const diagnostics: DiagnosticSeed[] = [ANDRES_DIAGNOSTIC];

  // Generate exactly 35 generic users
  for (let i = 0; i < 35; i++) {
    const empId = `emp-${i + 1}`;
    const diagId = `diag-${i + 1}`;

    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, "")}@empresa.com`;
    const area = AREAS[i % AREAS.length];

    // Set up a structured distribution of Tiers for 35 employees:
    // i <= 3 (4 emps): Tier 1
    // i <= 10 (7 emps): Tier 2
    // i <= 22 (12 emps): Tier 3
    // i <= 28 (6 emps): Tier 4
    // i <= 31 (3 emps): Tier 5
    // i <= 34 (3 emps): Tier 6
    let tier = 3;
    let totalScore = 35;
    let perfil: "Escéptico" | "Táctico" | "Facilitador" | "Amplificador" =
      "Táctico";

    if (i <= 3) {
      tier = 1;
      totalScore = 15 + (i % 9); // 15 to 18
      perfil = "Escéptico";
    } else if (i <= 10) {
      tier = 2;
      totalScore = 24 + (i % 8); // 24 to 30
      perfil = "Táctico";
    } else if (i <= 22) {
      tier = 3;
      totalScore = 32 + (i % 8); // 32 to 39
      perfil = "Táctico";
    } else if (i <= 28) {
      tier = 4;
      totalScore = 40 + (i % 8); // 40 to 45
      perfil = "Facilitador";
    } else if (i <= 31) {
      tier = 5;
      totalScore = 48 + (i % 7); // 48 to 50
      perfil = "Amplificador";
    } else {
      tier = 6;
      totalScore = 55 + (i % 6); // 55 to 59
      perfil = "Amplificador";
    }

    const dimScores = generateDimScores(totalScore);
    const activitiesQ = generateActivitiesQ(tier, i);

    // Generate 15 answers matching employee tier and profile
    const baseOpt = tier <= 2 ? 0 : tier <= 4 ? 1 : tier <= 5 ? 2 : 3;
    const answers: number[] = [];
    for (let q = 0; q < 15; q++) {
      answers.push(Math.min(3, Math.max(0, baseOpt + ((i + q) % 2) - (q % 2))));
    }

    // Specific Q13 (idx 12) & Q14 (idx 13) answers
    if (i === 23) {
      answers[12] = 2;
      answers[13] = 2;
    } else if (i === 29) {
      answers[12] = 2;
      answers[13] = 2;
    } else if (i === 30) {
      answers[12] = 3;
      answers[13] = 1;
    } else if (i === 31) {
      answers[12] = 1;
      answers[13] = 3;
    } else if (i === 32) {
      answers[12] = 2;
      answers[13] = 2;
    } else if (i === 33) {
      answers[12] = 3;
      answers[13] = 3;
    } else if (i === 34) {
      answers[12] = 3;
      answers[13] = 0;
    } else {
      answers[12] = i % 3; // 0=A, 1=B, 2=C (no D)
      answers[13] = (i + 1) % 3;
    }

    const letters = ["A", "B", "C", "D"];
    const respuestas = {
      q13: letters[answers[12]],
      q14: letters[answers[13]],
    };

    const activitiesQWithV2 = {
      ...activitiesQ,
      v2_data: {
        answers,
        respuestas,
        version: "2.0",
        version_scoring: "2.1",
      },
    };

    const EMPRESAS = ["Prestigio", "Prestigio Tech", "Prestigio Global"];
    const empresa = EMPRESAS[i % EMPRESAS.length];

    // Launch date: 2026-07-27 08:00 AM
    // For 105 of the 120 seed employees, created_at is July 27 2026 between 8:00 AM and 5:00 PM
    let empCreatedAt: string;
    if (i < 105) {
      const ms =
        new Date("2026-07-27T08:00:00.000Z").getTime() + i * 280 * 1000;
      empCreatedAt = new Date(ms).toISOString();
    } else if (i < 111) {
      const ms =
        new Date("2026-07-28T09:00:00.000Z").getTime() +
        (i - 105) * 3600 * 1000;
      empCreatedAt = new Date(ms).toISOString();
    } else if (i < 115) {
      const ms =
        new Date("2026-07-29T10:00:00.000Z").getTime() +
        (i - 111) * 3600 * 1000;
      empCreatedAt = new Date(ms).toISOString();
    } else if (i < 118) {
      const ms =
        new Date("2026-07-30T11:00:00.000Z").getTime() +
        (i - 115) * 3600 * 1000;
      empCreatedAt = new Date(ms).toISOString();
    } else {
      const ms =
        new Date("2026-07-31T14:00:00.000Z").getTime() +
        (i - 118) * 3600 * 1000;
      empCreatedAt = new Date(ms).toISOString();
    }

    employees.push({
      id: empId,
      name,
      email,
      area,
      company_id: companyId,
      empresa,
      created_at: empCreatedAt,
    });

    diagnostics.push({
      id: diagId,
      employee_id: empId,
      tier,
      total_score: totalScore,
      dim_scores: dimScores,
      perfil,
      activities_q: activitiesQWithV2,
      created_at: empCreatedAt,
    });
  }

  // Ensure Andrés Piedrahita is always present in seed
  if (!employees.some((e) => e.id === ANDRES_PIEDRAHITA_EMPLOYEE.id)) {
    employees.unshift(ANDRES_PIEDRAHITA_EMPLOYEE);
  }
  if (!diagnostics.some((d) => d.id === ANDRES_DIAGNOSTIC.id)) {
    diagnostics.unshift(ANDRES_DIAGNOSTIC);
  }

  EXTRA_LOGIN_EMPLOYEES.forEach((extraEmp) => {
    if (
      !employees.some((e) => e.id === extraEmp.id || e.email === extraEmp.email)
    ) {
      employees.push({ ...extraEmp, company_id: companyId });
    }
  });

  EXTRA_LOGIN_DIAGNOSTICS.forEach((extraDiag) => {
    if (
      !diagnostics.some(
        (d) => d.id === extraDiag.id || d.employee_id === extraDiag.employee_id,
      )
    ) {
      diagnostics.push(extraDiag);
    }
  });

  return { employees, diagnostics };
}

export const EXTRA_LOGIN_EMPLOYEES: EmployeeSeed[] = [
  {
    id: "emp-carlos-rodriguez",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@strategicbrands.com",
    area: "Operaciones & Logística",
    company_id: "strategic-brands",
    empresa: "Prestigio Tech",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
  {
    id: "emp-maria-gonzalez",
    name: "María González",
    email: "maria.gonzalez@strategicbrands.com",
    area: "Tecnología & BI",
    company_id: "strategic-brands",
    empresa: "Prestigio",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
  {
    id: "emp-sofia-martinez",
    name: "Sofía Martínez",
    email: "sofia.martinez@strategicbrands.com",
    area: "Comercial & Ventas",
    company_id: "strategic-brands",
    empresa: "Prestigio Global",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
  {
    id: "emp-juan-perez",
    name: "Juan Pérez",
    email: "juan.perez@strategicbrands.com",
    area: "Gestión Humana",
    company_id: "strategic-brands",
    empresa: "Prestigio",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
  {
    id: "emp-alejandro-restrepo",
    name: "Alejandro Restrepo",
    email: "alejandro.restrepo@strategicbrands.com",
    area: "Finanzas & Contabilidad",
    company_id: "strategic-brands",
    empresa: "Prestigio Tech",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
  {
    id: "emp-laura-gomez",
    name: "Laura Gómez",
    email: "laura.gomez@strategicbrands.com",
    area: "Marketing & Comunicaciones",
    company_id: "strategic-brands",
    empresa: "Prestigio Global",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
  {
    id: "emp-diego-valencia",
    name: "Diego Valencia",
    email: "diego.valencia@strategicbrands.com",
    area: "Operaciones & Logística",
    company_id: "strategic-brands",
    empresa: "Prestigio",
    created_at: "2026-07-27T08:15:00.000Z",
    password: "123",
  },
];

export const EXTRA_LOGIN_DIAGNOSTICS: DiagnosticSeed[] =
  EXTRA_LOGIN_EMPLOYEES.map((e, idx) => ({
    id: `diag-${e.id}`,
    employee_id: e.id,
    tier: 3 + (idx % 3),
    total_score: 32 + idx * 4,
    dim_scores: {
      Mentalidad: 4,
      Contexto: 4,
      Datos: 4,
      Automatización: 4,
      Calidad: 5,
      Autonomía: 4,
      Liderazgo: 4,
    },
    perfil: idx % 2 === 0 ? "Facilitador" : "Amplificador",
    activities_q: {
      q1: 2,
      q2: 3,
      q3: 2,
      q4: 3,
      v2_data: {
        answers: [2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
        respuestas: { q13: "D", q14: "D" },
        version: "2.0",
        version_scoring: "2.1",
      },
    },
    created_at: "2026-07-26T08:00:00.000Z",
  }));
