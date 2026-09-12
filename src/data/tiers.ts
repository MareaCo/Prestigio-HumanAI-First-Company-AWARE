import type { Dimension } from "./questions";

export interface TierData {
  id: number;
  name: string;
  capa: string;
  capaNum: string;
  color: string;
  colorLight: string;
  colorDark: string;
  multiplier: string;
  multiplierLabel: string;
  tech: string;
  potencial: string;
  percentile: string;
  scoreLabel: string;
  quote: string;
  range: [number, number];
  oppByDim: Partial<Record<Dimension, string[]>>;
  roadmap: string[];
  roadmapDays: string;
  nextTierActions: string[];
  cta: { headline: string; body: string; button: string };
}

// Dimensiones: Mentalidad, Contexto, Datos, Automatización, Calidad, Autonomía → 2 preguntas × 4 pts = 8 max
// Liderazgo → 3 preguntas × 4 pts = 12 max
// Total: 6 × 8 + 12 = 60
export const DIM_MAX: Record<Dimension, number> = {
  Mentalidad: 4,
  Emocionalidad: 4,
  Contexto: 8,
  Datos: 8,
  Automatización: 8,
  Calidad: 8,
  Autonomía: 8,
  Liderazgo: 12,
};

export const MAX_SCORE = 60;

// N1 15–23, N2 24–31, N3 32–39, N4 40–47, N5 48–54, N6 55–60
export const TIER_RANGES: [number, number][] = [
  [15, 23],
  [24, 31],
  [32, 39],
  [40, 47],
  [48, 54],
  [55, 60],
];

export const TIERS: TierData[] = [
  {
    id: 1,
    name: "Aficionado",
    capa: "El Aficionado",
    capaNum: "01",
    color: "#E8534A",
    colorLight: "#FDECEA",
    colorDark: "#993C1D",
    multiplier: "20%",
    multiplierLabel: "del potencial usado",
    tech: "Chat abierto · sin configuración persistente",
    potencial: "Estás usando ~20%",
    percentile: "Top 100% (base)",
    scoreLabel: "Tu puntaje total",
    quote:
      '"Toda transformación empieza cuando alguien decide dejar de hacer lo mismo."',
    range: [15, 23],
    oppByDim: {
      Contexto: [
        "Crea un espacio dedicado en tu IA (Claude Project / Gemini Gem / Copilot Agent).",
        "Escribe un prompt con tu rol, voz y 3 procesos que repites cada semana.",
        "Prueba una tarea real con y sin ese contexto — mide la diferencia en tiempo.",
      ],
      Datos: [
        "Sube 3 documentos base (una propuesta, un reporte, un correo típico) al espacio.",
        "Pide a la IA que resuma tu forma de escribir a partir de esos documentos.",
        "Guarda ese resumen como parte del prompt.",
      ],
      Automatización: [
        "Identifica la tarea que más veces repites en la semana.",
        "Escribe el prompt perfecto para esa tarea una sola vez.",
        "Ejecútalo 3 veces seguidas — ajústalo hasta que funcione en el primer intento.",
      ],
      Calidad: [
        "Compara dos salidas: una con contexto y una sin él.",
        "Anota qué correcciones repites siempre.",
        "Añade esas correcciones a tu prompt como reglas.",
      ],
      Autonomía: [
        "Programa 20 minutos diarios para experimentar con una nueva capacidad.",
        "Sigue a un creador que use IA en tu misma industria.",
        "Comparte tu experimento con un colega — obligarte a explicarlo acelera el aprendizaje.",
      ],
    },
    roadmap: [
      "Semana 1 · Configura tu espacio de trabajo y tu prompt.",
      "Semana 2 · Documenta 3 procesos que repites y conviértelos en plantillas.",
      "Semana 3 · Reemplaza 1 tarea manual por una habilidad activada por comando.",
      "Semana 4 · Reserva 30 min/día para practicar sin miedo — la práctica es el atajo.",
    ],
    roadmapDays: "30 días",
    nextTierActions: [
      "Cambia de chat abierto a un espacio con contexto guardado.",
      "Documenta tu primer prompt con rol + estilo + objetivos.",
      "Establece un ritual diario de 20 minutos de práctica con IA.",
    ],
    cta: {
      headline: "Estás en el punto de partida.",
      body: "El siguiente paso no es aprender más herramientas — es configurar bien la primera.",
      button: "Ver tablero de compañía →",
    },
  },
  {
    id: 2,
    name: "Explorador",
    capa: "El Explorador",
    capaNum: "02",
    color: "#E87A3A",
    colorLight: "#FEF0E6",
    colorDark: "#7A3A0F",
    multiplier: "Ejecuta",
    multiplierLabel: "tareas con estructura",
    tech: "Prompts guardados · espacios con contexto básico",
    potencial: "Estás usando ~35%",
    percentile: "Top 55%",
    scoreLabel: "Tu puntaje total",
    quote: '"El hábito de usar bien la IA vale más que la herramienta misma."',
    range: [24, 31],
    oppByDim: {
      Contexto: [
        "Convierte tu prompt en una plantilla con secciones (rol / objetivo / formato / restricciones).",
        "Añade 2 ejemplos de salidas que consideras excelentes.",
        "Revisa y actualiza tu prompt una vez al mes.",
      ],
      Datos: [
        "Conecta la IA a una de tus herramientas reales (Gmail, Drive, Docs).",
        "Prueba una tarea que antes hacías copiando y pegando.",
        "Mide cuánto tiempo te ahorra por semana.",
      ],
      Automatización: [
        "Identifica 3 tareas que ejecutas más de 3 veces por semana.",
        "Conviértelas en habilidades activables con comando (Skills / Gems / Copilot Studio).",
        "Enseña a un colega a activarlas.",
      ],
      Calidad: [
        "Documenta el estándar de 'listo' para tus entregas típicas.",
        "Añade ese estándar a tu prompt de sistema.",
        "Rechaza salidas que no lo cumplan sin editarlas — devuélvelas a la IA.",
      ],
      Autonomía: [
        "Ejecuta una tarea larga y déjala terminar sin intervenir.",
        "Compara el resultado con tu propia versión — anota diferencias.",
        "Repite el ejercicio semanalmente para construir confianza.",
      ],
    },
    roadmap: [
      "Semana 1 · Estandariza tu prompt con formato y ejemplos.",
      "Semana 2 · Conecta tu IA a una herramienta real y elimina el copia/pega.",
      "Semana 3 · Convierte 3 tareas repetitivas en habilidades con comando.",
      "Semana 4 · Deja una tarea completa en manos de la IA — mide el resultado.",
    ],
    roadmapDays: "30 días",
    nextTierActions: [
      "Integra la IA con al menos 2 sistemas de tu trabajo diario.",
      "Documenta un flujo de varios pasos encadenados.",
      "Crea tu primera habilidad reutilizable con un comando.",
    ],
    cta: {
      headline: "Ya sabes usarla — falta hacer que trabaje contigo.",
      body: "El siguiente salto es integrarla con tus herramientas reales.",
      button: "Ver tablero de compañía →",
    },
  },
  {
    id: 3,
    name: "Integrador",
    capa: "El Integrador",
    capaNum: "03",
    color: "#E8A83A",
    colorLight: "#FEF6E6",
    colorDark: "#854F0B",
    multiplier: "50–80%",
    multiplierLabel: "del potencial usado",
    tech: "IA dentro de tus herramientas · flujos encadenados",
    potencial: "Estás usando ~65%",
    percentile: "Top 30%",
    scoreLabel: "Tu puntaje total",
    quote:
      '"Integrar la IA en tu flujo cambia la forma en la que decides — no solo la velocidad."',
    range: [32, 39],
    oppByDim: {
      Contexto: [
        "Crea prompts de sistema por tipo de tarea, no uno solo.",
        "Añade criterios de calidad medibles (tono, longitud, estructura).",
        "Versiona tus prompts como versiona código un desarrollador.",
      ],
      Datos: [
        "Cruza datos de al menos 2 fuentes en un mismo flujo.",
        "Deja que la IA consulte tu CRM o hoja de datos en vivo.",
        "Documenta qué preguntas responde mejor con acceso vs. sin acceso.",
      ],
      Automatización: [
        "Encadena redacción + revisión + envío en un solo comando.",
        "Añade un paso de validación antes del envío.",
        "Reduce el flujo a un solo botón — no varios copiar/pegar.",
      ],
      Calidad: [
        "Define métricas de 'aceptable' para cada tipo de salida.",
        "Añade un paso de auto-crítica dentro del pipeline.",
        "Revisa aleatoriamente 1 de cada 10 salidas — no todas.",
      ],
      Autonomía: [
        "Programa tu primera ejecución agendada (Cowork / Flow / Power Automate).",
        "Sale de la sala mientras se ejecuta — vuelve solo a aprobar.",
        "Amplía el alcance cada semana: más tareas, más autonomía.",
      ],
    },
    roadmap: [
      "Semana 1 · Encadena tu primer pipeline de 3 pasos.",
      "Semana 2 · Añade validación automática al pipeline.",
      "Semana 3 · Agenda tu primera ejecución sin ti presente.",
      "Semana 4 · Enseña el pipeline a tu equipo para que puedan reproducirlo.",
    ],
    roadmapDays: "30 días",
    nextTierActions: [
      "Construye tu primer pipeline con validación automática.",
      "Diseña un flujo que se ejecute sin ti presente.",
      "Empieza a pensar en la IA como sistema, no como herramienta.",
    ],
    cta: {
      headline: "Ya integraste la IA — ahora dale autonomía.",
      body: "El siguiente nivel deja de necesitarte para arrancar cada tarea.",
      button: "Ver tablero de compañía →",
    },
  },
  {
    id: 4,
    name: "Director",
    capa: "El Director",
    capaNum: "04",
    color: "#6BAE5E",
    colorLight: "#EDF7EB",
    colorDark: "#27500A",
    multiplier: "Acumula",
    multiplierLabel: "trabajo mientras duermes",
    tech: "Tareas programadas · pipelines con validación",
    potencial: "Estás usando ~80%",
    percentile: "Top 10%",
    scoreLabel: "Tu puntaje total",
    quote:
      '"El Director configura, presiona Enter, sale a cenar y vuelve con el trabajo hecho."',
    range: [40, 47],
    oppByDim: {
      Contexto: [
        "Documenta un system prompt por cada rol crítico de tu equipo.",
        "Crea guías de calidad accionables por la IA.",
        "Convierte tu prompt en un activo compartido de la organización.",
      ],
      Datos: [
        "Consolida datos de múltiples fuentes en un solo dashboard automático.",
        "Añade alertas basadas en umbrales que tú definas.",
        "Deja que la IA proponga hipótesis, no solo resúmenes.",
      ],
      Automatización: [
        "Diseña un pipeline con 2 o más agentes trabajando en paralelo.",
        "Añade un agente crítico que revise antes de enviar.",
        "Mide el tiempo total del pipeline vs. tu proceso manual anterior.",
      ],
      Calidad: [
        "Introduce revisión por muestreo automatizada.",
        "Añade métricas de calidad como parte del propio pipeline.",
        "Deja que la IA sugiera mejoras al prompt basadas en las salidas rechazadas.",
      ],
      Autonomía: [
        "Construye tu primer agente que opere sin supervisión durante un día completo.",
        "Define reglas claras de escalamiento — cuándo interrumpirte.",
        "Amplía el alcance del agente en incrementos semanales.",
      ],
    },
    roadmap: [
      "Semana 1 · Construye tu primer pipeline multi-agente.",
      "Semana 2 · Añade un agente crítico dentro del pipeline.",
      "Semana 3 · Configura escalamiento inteligente hacia ti.",
      "Semana 4 · Comparte el pipeline con otro director para que lo replique.",
    ],
    roadmapDays: "30 días",
    nextTierActions: [
      "Construye tu primer sistema de agentes cooperando.",
      "Diseña criterios de calidad medibles que la IA aplique sola.",
      "Empieza a operar desde la cima del circuito, no desde la ejecución.",
    ],
    cta: {
      headline: "Diriges tu propia orquesta de agentes.",
      body: "El siguiente nivel no ejecuta tareas — construye sistemas que las ejecutan.",
      button: "Ver tablero de compañía →",
    },
  },
  {
    id: 5,
    name: "Constructor",
    capa: "El Constructor",
    capaNum: "05",
    color: "#3A8E6E",
    colorLight: "#E6F5F0",
    colorDark: "#0E4B37",
    multiplier: "300–3.700%",
    multiplierLabel: "de amplificación real",
    tech: "Apps propias · agentes · lenguaje natural como código",
    potencial: "Estás usando ~90%",
    percentile: "Top 5%",
    scoreLabel: "Tu puntaje total",
    quote: '"El lenguaje natural es el nuevo lenguaje de programación."',
    range: [48, 54],
    oppByDim: {
      Contexto: [
        "Crea un sistema de contexto compartido entre agentes.",
        "Añade memoria de largo plazo por dominio.",
        "Documenta patrones que otros puedan reutilizar.",
      ],
      Datos: [
        "Construye tu propio conector para una fuente que aún no está integrada.",
        "Añade sincronización bidireccional entre agentes y sistemas.",
        "Convierte cada fuente en una API que tus agentes consuman.",
      ],
      Automatización: [
        "Construye una aplicación interna que reemplace un proceso manual completo.",
        "Añade métricas de uso para saber qué agentes valen la pena.",
        "Publica tu app internamente para que otros la usen.",
      ],
      Calidad: [
        "Añade un agente de crítica que califique salidas de otros agentes.",
        "Define un umbral mínimo — bajo ese umbral, se reintenta automáticamente.",
        "Publica un reporte semanal de calidad por agente.",
      ],
      Autonomía: [
        "Configura un agente que opere flujos completos con supervisión mínima.",
        "Define reglas de escalamiento en lenguaje natural.",
        "Mide horas humanas ahorradas — es tu métrica de éxito.",
      ],
    },
    roadmap: [
      "Semana 1 · Diseña la arquitectura de tu primer sistema multi-agente serio.",
      "Semana 2 · Construye el agente de crítica primero — antes que los demás.",
      "Semana 3 · Añade métricas y observabilidad.",
      "Semana 4 · Comparte el sistema con al menos otra área de la compañía.",
    ],
    roadmapDays: "30 días",
    nextTierActions: [
      "Añade un agente orquestador por encima de tus agentes actuales.",
      "Construye un sistema de calidad automatizado con umbrales.",
      "Publica tus mejores agentes como plantillas reutilizables.",
    ],
    cta: {
      headline: "Ya no usas IA — construyes con ella.",
      body: "El último nivel deja de operar agentes: los orquesta.",
      button: "Ver tablero de compañía →",
    },
  },
  {
    id: 6,
    name: "Orquestador",
    capa: "El Orquestador",
    capaNum: "06",
    color: "#1A6E9E",
    colorLight: "#E6F2FB",
    colorDark: "#0C447C",
    multiplier: "24/7",
    multiplierLabel: "sistemas que operan solos",
    tech: "Multi-agente · IA que dirige a IA · observabilidad",
    potencial: "Estás usando ~95%",
    percentile: "Top 1%",
    scoreLabel: "Tu puntaje total",
    quote:
      '"La verdadera maestría es que la IA critique y dirija a otra IA — y tú solo decidas lo importante."',
    range: [55, 60],
    oppByDim: {
      Contexto: [
        "Mantén una biblioteca viva de prompts curados por dominio.",
        "Convierte a tu equipo en curadores de esa biblioteca.",
        "Publica tus mejores prácticas como estándar interno.",
      ],
      Datos: [
        "Añade governance de datos automatizada dentro del pipeline.",
        "Mide costo y calidad por fuente — retira las que no valen.",
        "Crea contratos de datos entre agentes.",
      ],
      Automatización: [
        "Añade un agente meta que optimice a los demás agentes.",
        "Mide costo por tarea y ajusta modelos automáticamente.",
        "Automatiza incluso el proceso de mejora continua.",
      ],
      Calidad: [
        "Añade auditoría continua por muestreo aleatorio.",
        "Publica métricas de calidad como parte del reporte del equipo.",
        "Establece umbrales de calidad como contrato de servicio interno.",
      ],
      Autonomía: [
        "Diseña sistemas donde la IA orqueste completamente el flujo.",
        "Interviene solo en excepciones — no en el día a día.",
        "Enseña a otros directivos a operar en esta capa.",
      ],
    },
    roadmap: [
      "Semana 1 · Añade un agente meta-optimizador a tu sistema.",
      "Semana 2 · Formaliza métricas de calidad y costo.",
      "Semana 3 · Documenta y comparte tu arquitectura con el resto de la compañía.",
      "Semana 4 · Mentoriza al menos a un Arquitecto en ascenso.",
    ],
    roadmapDays: "30 días",
    nextTierActions: [],
    cta: {
      headline: "Eres referencia — ahora tu rol es enseñar.",
      body: "Documenta tu sistema y ayuda a otros directivos a alcanzar esta capa.",
      button: "Ver tablero de compañía →",
    },
  },
];

export function tierById(id: number): TierData {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}
