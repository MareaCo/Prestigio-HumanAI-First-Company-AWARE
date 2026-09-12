export interface Tension {
  id: string; // "01" to "10", or "00" for meta
  name: string;
  cluster: string;
  leftPole: string;
  leftDesc: string;
  rightPole: string;
  rightDesc: string;
  cita: string;
  senoidalDesbalance: string;
  preguntaResuelve: string;
  esMeta?: boolean;
}

export const TENSIONS: Tension[] = [
  {
    id: "01",
    name: "Complacencia ↔ Urgencia",
    cluster: "APRENDIZAJE, IA Y FUTURO",
    leftPole: "Complacencia",
    leftDesc: "Vamos bien, no hay afán",
    rightPole: "Urgencia",
    rightDesc: "El tiempo ya empezó a correr",
    cita: "Estar bien sin querer ser mejores es la forma más silenciosa de quedarse atrás.",
    senoidalDesbalance: "Siempre lo hemos hecho así, y vamos bien.",
    preguntaResuelve: "¿Sentimos que el tiempo corre?",
  },
  {
    id: "02",
    name: "Reflexión ↔ Acción",
    cluster: "PODER Y DECISIÓN (CAPACIDAD DIAGNÓSTICA)",
    leftPole: "Reflexión",
    leftDesc: "Claridad del reto y tiempo para comprender sistémicamente",
    rightPole: "Acción",
    rightDesc: "Alguien decide con su criterio y todos ejecutan",
    cita: "Intervenir sin comprender es la forma más costosa de no cambiar nada.",
    senoidalDesbalance:
      "Sentir que reflexionar y conversar con escucha activa es perder el tiempo.",
    preguntaResuelve: "¿Comprendemos antes de intervenir?",
  },
  {
    id: "03",
    name: "Control ↔ Confianza",
    cluster: "PODER Y DECISIÓN",
    leftPole: "Control",
    leftDesc: "Todo se revisa, se valida y se autoriza",
    rightPole: "Confianza",
    rightDesc: "Se delega con marco claro y se responde por el resultado",
    cita: "Supervisar cada paso es la forma más eficaz de enseñarle a la gente a dejar de decidir.",
    senoidalDesbalance:
      "Dependencia de los jefes para decidir. Lentitud y bajo empoderamiento.",
    preguntaResuelve: "¿Delegamos o supervisamos todo?",
  },
  {
    id: "04",
    name: "Cero Error ↔ Aprendizaje",
    cluster: "ERROR, RIESGO Y CONFLICTO (INNOVACIÓN)",
    leftPole: "Cero Error",
    leftDesc: "Salimos cuando esté impecable. Priorizamos seguridad",
    rightPole: "Aprendizaje",
    rightDesc: "Salimos, medimos y ajustamos. Priorizamos innovación",
    cita: "Evitar el riesgo sin buscar lo nuevo es la forma más segura de volverse irrelevante.",
    senoidalDesbalance:
      "Proyectos que se perfeccionan durante meses y llegan cuando el mercado ya cambió. Confundimos perfección con excelencia coherente.",
    preguntaResuelve: "¿Salimos y ajustamos, o esperamos lo impecable?",
  },
  {
    id: "05",
    name: "Armonía ↔ Franqueza",
    cluster: "ERROR, RIESGO Y CONFLICTO (CONVERSACIONES)",
    leftPole: "Armonía",
    leftDesc: "Cuidamos la relación y el buen ambiente",
    rightPole: "Franqueza",
    rightDesc: "Nos decimos las cosas de frente y a tiempo",
    cita: "La conversación que no se da en la reunión se da en el pasillo, y ahí no se resuelve nada.",
    senoidalDesbalance:
      "Todos asienten en la sala y nadie se compromete al salir. Los elefantes que todos saben que existen no se conversan, pero siguen debajo de la mesa.",
    preguntaResuelve: "¿Nos decimos las cosas de frente?",
  },
  {
    id: "06",
    name: "Antigüedad ↔ Contribución",
    cluster: "PERSONAS Y VÍNCULOS",
    leftPole: "Antigüedad",
    leftDesc:
      "El criterio lo da la trayectoria y el rol (empresas jerárquicas)",
    rightPole: "Contribución",
    rightDesc:
      "El criterio lo da el aporte y la participación (empresas participativas)",
    cita: "Cuando la experiencia es el único argumento, la organización deja de aprender de quien acaba de llegar.",
    senoidalDesbalance:
      "En las reuniones que deciden hablan siempre los mismos; los demás toman nota.",
    preguntaResuelve: "¿El criterio lo da el rol o el aporte?",
  },
  {
    id: "07",
    name: "Corto Plazo ↔ Largo Plazo",
    cluster: "EJECUCIÓN Y ACCOUNTABILITY (PENSAMIENTO ESTRATÉGICO)",
    leftPole: "Corto Plazo",
    leftDesc:
      "Cada área responde por su resultado y solo miramos resultados inmediatos",
    rightPole: "Largo Plazo",
    rightDesc:
      "El resultado es construcción del sistema completo; medimos creación de capacidades, no solo resultados",
    cita: "Ganar hoy sin pensar en mañana es la forma más cara de perder el futuro.",
    senoidalDesbalance:
      "Tableros de área en verde y resultado futuro de compañía en amarillo, sin ser visible.",
    preguntaResuelve: "¿Medimos capacidades o solo resultados inmediatos?",
  },
  {
    id: "08",
    name: "Todo Importa ↔ Foco",
    cluster: "EJECUCIÓN Y ACCOUNTABILITY (PENSAMIENTO ESTRATÉGICO)",
    leftPole: "Todo Importa",
    leftDesc: "Todo es importante y todo es para ya",
    rightPole: "Foco",
    rightDesc: "Pocas batallas, bien peleadas",
    cita: "Cuando todo es prioridad, nada lo es: el equipo termina decidiendo por agotamiento, no por estrategia.",
    senoidalDesbalance:
      "Veinte iniciativas estratégicas que nadie del equipo puede nombrar de memoria.",
    preguntaResuelve: "¿Priorizamos o todo es urgente?",
  },
  {
    id: "09",
    name: "Proceso ↔ Cliente",
    cluster: "CULTURA VISIBLE (MINDSET CLIENTE)",
    leftPole: "Proceso",
    leftDesc: "Seguimos el procedimiento establecido",
    rightPole: "Cliente",
    rightDesc: "Resolvemos lo que el cliente necesita",
    cita: "Cumplir el proceso sin resolverle al cliente es un fracaso perfectamente documentado.",
    senoidalDesbalance:
      '"Así es la política" como respuesta final a un cliente que ya decidió irse.',
    preguntaResuelve: "¿Cumplimos el proceso o resolvemos al cliente?",
  },
  {
    id: "10",
    name: "Resultado ↔ Proceso(Fundamentales)",
    cluster: "APRENDIZAJE, IA Y FUTURO (CLARIDAD)",
    leftPole: "Resultado",
    leftDesc: "Ponemos más foco en el resultado que en el proceso",
    rightPole: "Proceso(Fundamentales)",
    rightDesc: "Se prioriza el proceso/fundamentales para lograr el resultado",
    cita: "El reto no está solo en poner presión por el QUÉ, está en habilitar los fundamentales para lograrlo.",
    senoidalDesbalance:
      'La conversación se enfoca en "por qué no llegó", en lugar de cuáles son los fundamentales para lograrlo y cómo están los KPIs de esos fundamentales para ajustar.',
    preguntaResuelve: "¿Habilitamos los fundamentales del resultado?",
  },
  {
    id: "00",
    name: "Discurso ↔ Ejemplo",
    cluster: "COHERENCIA (META-TENSIÓN)",
    leftPole: "Discurso",
    leftDesc: "Lo que se declara",
    rightPole: "Ejemplo",
    rightDesc: "Lo que se hace",
    cita: "Una cultura no cambia cuando se declara. Cambia cuando quienes la lideran se vuelven incómodamente coherentes.",
    senoidalDesbalance:
      "¿El discurso es coherente con la acción? Sin coherencia no hay nada — esta meta-tensión modula la credibilidad de todas las demás.",
    preguntaResuelve: "¿El liderazgo es coherente entre lo que dice y hace?",
    esMeta: true,
  },
];

/**
 * Normalizes tension answers mapping legacy keys (t1..t7) to Culture Map v2.1 keys ("01".."10", "00").
 */
export function normalizeTensions(
  raw?: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {
    "01": 3,
    "02": 3,
    "03": 3,
    "04": 3,
    "05": 3,
    "06": 3,
    "07": 3,
    "08": 3,
    "09": 3,
    "10": 3,
    "00": 3,
  };

  if (!raw) return result;

  // Check if legacy keys exist (t1..t7)
  if (
    "t1" in raw ||
    "t2" in raw ||
    "t3" in raw ||
    "t4" in raw ||
    "t5" in raw ||
    "t6" in raw
  ) {
    if (raw.t1 !== undefined) result["01"] = Number(raw.t1);
    if (raw.t2 !== undefined) result["03"] = Number(raw.t2);
    if (raw.t3 !== undefined) result["04"] = Number(raw.t3);
    if (raw.t4 !== undefined) result["06"] = Number(raw.t4);
    if (raw.t5 !== undefined) result["09"] = Number(raw.t5);
    if (raw.t6 !== undefined) result["07"] = Number(raw.t6);
  }

  // Overlay v2.1 keys if present
  TENSIONS.forEach((t) => {
    if (raw[t.id] !== undefined) {
      result[t.id] = Number(raw[t.id]);
    }
  });

  return result;
}
