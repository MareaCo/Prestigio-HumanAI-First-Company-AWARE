export type Dimension =
  | "Mentalidad"
  | "Emocionalidad"
  | "Contexto"
  | "Datos"
  | "Automatización"
  | "Calidad"
  | "Autonomía"
  | "Liderazgo";

export interface QuestionOption {
  letter: "A" | "B" | "C" | "D";
  text: string;
  score: 1 | 2 | 3 | 4;
}

export interface Question {
  id: number;
  number: string;
  title: string;
  desc: string;
  note: string;
  dimension: Dimension;
  options: QuestionOption[];
}

const opts = (a: string, b: string, c: string, d: string): QuestionOption[] => [
  { letter: "A", text: a, score: 1 },
  { letter: "B", text: b, score: 2 },
  { letter: "C", text: c, score: 3 },
  { letter: "D", text: d, score: 4 },
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    number: "01",
    title:
      "¿Cuál consideras que es tu emocionalidad o actitud principal frente a la inteligencia artificial hoy en día?",
    desc: "La emoción es el predictor más fuerte de adopción real y determina el nivel de apertura al cambio.",
    note: "La emoción con la que te acercas a la IA determina cuánto vas a exprimirla.",
    dimension: "Emocionalidad",
    options: opts(
      "Me genera desconfianza o prefiero esperar a que esté más probada antes de adoptarla",
      "Curiosidad mezclada con resistencia — la uso cuando me toca, pero no es mi herramienta principal",
      "Confianza y apertura activa — la incorporo como parte habitual de cómo trabajo y aprendo",
      "Entusiasmo responsable — la integro estratégicamente, reviso siempre sus resultados y movilizo a otros",
    ),
  },
  {
    id: 2,
    number: "02",
    title: "¿Qué representa la IA en el contexto de tu trabajo y tu industria?",
    desc: "El paradigma con el que la miras determina si la ves como amenaza, moda, herramienta o ventaja estratégica.",
    note: "Lo que representa la IA para ti define cuánta energía inviertes en dominarla.",
    dimension: "Mentalidad",
    options: opts(
      "Una amenaza que podría sustituir roles o desestabilizar procesos que funcionan",
      "Una tendencia cuyo valor real a largo plazo todavía está por probarse",
      "Una herramienta funcional para mejorar la eficiencia y los procesos del equipo",
      "Una ventaja estratégica para crear valor diferencial para clientes y diferenciarnos en el mercado",
    ),
  },
  {
    id: 3,
    number: "03",
    title:
      "Cuando abres tu IA, ¿cuánto sabe sobre ti y tu trabajo sin que le expliques nada?",
    desc: "El nivel de personalización inicial determina la rapidez y efectividad con la que opera la IA.",
    note: "La configuración inicial del contexto es el primer multiplicador de productividad.",
    dimension: "Contexto",
    options: opts(
      "Nada — tengo que explicarle todo desde cero cada vez que la abro",
      "Algo — tengo un espacio o perfil básico configurado (Proyecto · Gem · Agente · Custom GPT)",
      "Bastante — tengo un prompt con mi rol, mi forma de trabajar y mis preferencias documentadas",
      "Todo — la IA aprende y se actualiza sola con cada conversación",
    ),
  },
  {
    id: 4,
    number: "04",
    title: "Cuando le pides algo a tu IA, ¿cómo describes lo que necesitas?",
    desc: "La estructuración de la instrucción define si obtienes respuestas genéricas o resultados precisos.",
    note: "Una instrucción efectiva combina contexto, objetivo, formato y restricciones.",
    dimension: "Contexto",
    options: opts(
      "Le escribo lo que necesito directo, como si fuera un mensaje de WhatsApp",
      "Explico el contexto, qué quiero lograr y cómo me gustaría que me lo entregara",
      "Tengo frases o plantillas guardadas por tipo de tarea que me dan mejores resultados",
      "Tengo instrucciones fijas + plantillas por proceso que definen exactamente cómo trabaja conmigo",
    ),
  },
  {
    id: 5,
    number: "05",
    title:
      "¿Cómo le entregas a la IA la información que necesita para ayudarte?",
    desc: "El modo de proveer información marca el paso de asistencia manual a integración directa.",
    note: "Conectar la IA a tus herramientas reales la convierte en un colaborador dinámico.",
    dimension: "Datos",
    options: opts(
      "Se la escribo o explico directamente en el chat cada vez",
      "Le comparto archivos, documentos o links para que los lea",
      "Está conectada a mis herramientas y la busca sola (Claude: MCP · Gemini: Workspace · Copilot: M365 · ChatGPT: GPTs con Actions)",
      "Junta automáticamente datos de varios lugares sin que yo busque nada",
    ),
  },
  {
    id: 6,
    number: "06",
    title:
      "Cuando necesitas información de tu trabajo para pedirle algo a la IA, ¿qué haces?",
    desc: "Evalúa el grado de automatización en el acceso y recolección de información relevante.",
    note: "Menos búsqueda manual se traduce en más tiempo para la toma de decisiones.",
    dimension: "Datos",
    options: opts(
      "La busco yo — en mi correo, mis archivos o mis apuntes — y la copio al chat",
      "Le pido a la IA que busque en internet lo que no tengo a mano",
      "La IA entra directamente a mi correo, calendario, Drive o herramientas sin que yo busque nada",
      "La IA reúne sola la información de varios lugares y me entrega todo consolidado",
    ),
  },
  {
    id: 7,
    number: "07",
    title:
      "Piensa en una tarea que le pides regularmente a la IA. ¿Cómo la tienes organizada?",
    desc: "Refleja la transición desde el trabajo manual repetitivo hacia atajos y flujos automatizados.",
    note: "Cada tarea recurrente organizada como habilidad recupera tiempo valioso.",
    dimension: "Automatización",
    options: opts(
      "Escribo la instrucción de cero cada vez — no tengo nada guardado",
      "Tengo el texto en un documento o nota y lo copio cuando lo necesito",
      "La tengo guardada como un atajo o habilidad que activo rápido (Claude: Skills · Gemini: Gems · Copilot: Studio · ChatGPT: Custom GPT)",
      "Se ejecuta sola en el momento que definí, sin que yo haga nada (Claude: Cowork · Gemini: Flow · Copilot: Power Automate · ChatGPT: Tasks)",
    ),
  },
  {
    id: 8,
    number: "08",
    title:
      "¿Cuántas tareas seguidas puede hacer tu IA sin que tengas que escribirle de nuevo?",
    desc: "Mide la capacidad de encadenar actividades secuenciales en un solo proceso continuo.",
    note: "Encadenar tareas convierte solicitudes individuales en un sistema de ejecución.",
    dimension: "Automatización",
    options: opts(
      "Una sola tarea — le pido algo y reviso la respuesta antes de pedirle lo siguiente",
      "Dos o tres tareas — por ejemplo, que redacte y luego que corrija lo que escribió",
      "Varios pasos seguidos que terminan en un resultado completo sin que yo intervenga en el medio",
      "Un proceso completo donde varias herramientas o IAs trabajan juntas de principio a fin",
    ),
  },
  {
    id: 9,
    number: "09",
    title:
      "Cuando la IA te entrega una respuesta, ¿qué tantos ajustes debes hacer para quedar cómodo con la respuesta?",
    desc: "El nivel de edición necesario indica la alineación del modelo con tus criterios y estilo.",
    note: "A mayor alineación, menor tiempo de retoque post-generación.",
    dimension: "Calidad",
    options: opts(
      "La reescribo casi toda — me sirve como borrador pero el texto no funciona",
      "Le hago cambios importantes de fondo, tono o datos",
      "Solo le hago pequeños ajustes de detalle",
      "La uso casi directa — ya aprendió exactamente cómo me gusta que entregue las cosas",
    ),
  },
  {
    id: 10,
    number: "10",
    title:
      "Si un compañero tuviera que usar tu IA para hacer tu trabajo, ¿qué tan fácil sería?",
    desc: "Evalúa la estandarización y documentación de los procesos asistidos por IA.",
    note: "Los procesos documentados garantizan consistencia y escalabilidad en el equipo.",
    dimension: "Calidad",
    options: opts(
      "Imposible — todo está en mi cabeza y cada vez improviso de forma diferente",
      "Difícil — tengo algunas cosas guardadas pero no es fácil de seguir para otra persona",
      "Podría hacerlo — tengo instrucciones claras por tipo de tarea que cualquiera podría seguir",
      "Sin problema — tengo un sistema completo documentado con criterios de calidad definidos",
    ),
  },
  {
    id: 11,
    number: "11",
    title: "¿Puedes alejarte del computador y que la IA siga trabajando sola?",
    desc: "Determina si la IA actúa como asistente en tiempo real o como agente autónomo en segundo plano.",
    note: "La autonomía real permite delegar la ejecución mientras supervisas resultados.",
    dimension: "Autonomía",
    options: opts(
      "No — en el momento que me voy, se detiene todo",
      "Puede continuar una tarea larga, pero yo la inicio y reviso cada parte",
      "Tengo tareas que se ejecutan solas en el horario que definí y yo solo apruebo el resultado (Claude: Cowork · Gemini: Flow · Copilot: Power Automate · ChatGPT: Tasks)",
      "Tengo asistentes configurados que trabajan solos y solo me avisan cuando algo necesita mi decisión",
    ),
  },
  {
    id: 12,
    number: "12",
    title: "¿Hasta dónde has llegado con la IA más allá de hacerle preguntas?",
    desc: "Identifica la evolución desde consumidor de respuestas hasta creador de soluciones de IA.",
    note: "Construir herramientas propias transforma tu rol de usuario a arquitecto tecnológico.",
    dimension: "Autonomía",
    options: opts(
      "Hasta ahí llego — la uso para preguntas, búsquedas y tareas del momento",
      "He creado plantillas, resúmenes o pequeñas herramientas dentro del chat que reutilizo",
      "He construido mis propias herramientas, automatizaciones o aplicaciones con IA (Claude: Claude Code · Gemini: AI Studio · Copilot: Power Apps · ChatGPT: GPT Builder)",
      "Tengo un sistema donde varias IAs trabajan juntas, se revisan entre ellas y me entregan el resultado final",
    ),
  },
  {
    id: 13,
    number: "13",
    title: "¿Cómo movilizas a otros en tu equipo frente al uso de la IA?",
    desc: "El liderazgo frente a la IA va de Reactivo → Pasivo → Proactivo → Transformador.",
    note: "El nivel de movilización define el impacto organizacional real.",
    dimension: "Liderazgo",
    options: opts(
      "Mi relación con la IA es personal — no tengo un rol activo de enseñanza ni movilización",
      "Comparto lo que aprendo cuando me preguntan, pero no lidero activamente la adopción",
      "Promuevo activamente el uso en el equipo, co-creo con otros y comparto buenas prácticas",
      "Soy agente de cambio organizacional — diseño, enseño y escalo la adopción con criterio y estrategia",
    ),
  },
  {
    id: 14,
    number: "14",
    title: "¿Cómo mides el impacto de tu uso de la IA en el negocio?",
    desc: 'La medición del impacto es el salto del Táctico al Amplificador: de "ahorré tiempo" a "generé valor medible".',
    note: "Sin métricas, el impacto se percibe pero no se prueba.",
    dimension: "Liderazgo",
    options: opts(
      "No lo mido — no tengo indicadores definidos ni visibilidad del impacto",
      "Percibo ahorro de tiempo pero no tengo métricas formales ni seguimiento sistemático",
      "Mido KPIs de proceso: velocidad de entrega, reducción de errores, productividad del equipo",
      "Mido impacto de negocio: ingresos, EBITDA, satisfacción del cliente, cuota de mercado",
    ),
  },
  {
    id: 15,
    number: "15",
    title: "¿Cuál es tu principal objetivo al usar IA en tu trabajo hoy?",
    desc: "La pregunta de cierre captura la orientación estratégica real.",
    note: "No lo que crees que deberías responder, sino hacia dónde apunta tu energía.",
    dimension: "Liderazgo",
    options: opts(
      "Resolver preguntas puntuales y reducir incertidumbre cuando no sé algo",
      "Optimizar mi productividad personal y ahorrar tiempo en tareas repetitivas",
      "Mejorar los procesos del equipo, co-crear valor y facilitar la adopción colectiva",
      "Innovar, construir soluciones y generar ventaja competitiva real para el negocio y mis clientes",
    ),
  },
];

// Sub-score groupings
export const ACTITUD_QUESTIONS = [1, 2, 13, 14, 15]; // question ids
export const TECNICO_QUESTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
