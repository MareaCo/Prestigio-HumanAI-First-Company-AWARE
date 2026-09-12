export const TIER_NAMES = [
  "Aficionado",
  "Explorador",
  "Integrador",
  "Director",
  "Constructor",
  "Orquestador",
];
export const TIER_COLORS = [
  "#E8534A",
  "#E87A3A",
  "#E8A83A",
  "#6BAE5E",
  "#3A8E6E",
  "#1A6E9E",
];
export const TIER_COLORS_LIGHT = [
  "#FDECEA",
  "#FEF0E6",
  "#FEF6E6",
  "#EDF7EB",
  "#E6F5F0",
  "#E6F2FB",
];
export const TIER_RANGES: [number, number][] = [
  [15, 23],
  [24, 31],
  [32, 39],
  [40, 47],
  [48, 54],
  [55, 60],
];

export const DIMENSIONS = [
  "Contexto",
  "Mentalidad",
  "Emocionalidad",
  "Datos",
  "Automatización",
  "Calidad",
  "Autonomía",
  "Liderazgo",
] as const;

export const DIM_MAX: Record<(typeof DIMENSIONS)[number], number> = {
  Contexto: 8,
  Mentalidad: 4,
  Emocionalidad: 4,
  Datos: 8,
  Automatización: 8,
  Calidad: 8,
  Autonomía: 8,
  Liderazgo: 12,
};

export const MAX_SCORE = 60;

export const PERFIL_CONFIG = {
  Escéptico: { color: "#C84B31", light: "#FDECEA", dark: "#993C1D" },
  Táctico: { color: "#A87028", light: "#FEF6E6", dark: "#854F0B" },
  Facilitador: { color: "#0D7A5F", light: "#EBF6F1", dark: "#138A6B" },
  Amplificador: { color: "#2B5B84", light: "#E8F1F8", dark: "#2B5B84" },
} as const;

export const AREAS = [
  "Ventas",
  "Operaciones",
  "Tecnología",
  "RRHH",
  "Finanzas",
  "Legal",
  "Marketing",
  "Compras",
  "Tesorería",
  "Administración",
  "Contabilidad",
  "Logística",
  "Producción",
  "Innovación",
  "Otra",
];

export const AWARE_STAGES = [
  {
    key: "awake",
    letter: "A",
    name: "AWAKE",
    esName: "DESPERTAR",
    desc: "Perfil de Apropiación Liderazgo",
    subdesc: "",
    focus: "Perfiles de Apropiación (Escéptico → Transformador)",
    badge: "PERFIL DE APROPIACIÓN",
    failure: "Falta visión — RESISTENCIA",
  },
  {
    key: "watch",
    letter: "W",
    name: "WATCH",
    esName: "OBSERVAR",
    desc: "Lectura de Tensiones",
    subdesc: "",
    focus: "Tensiones Culturales",
    badge: "TENSIONES",
    failure: "Falta diagnóstico — CONFUSIÓN",
  },
  {
    key: "align",
    letter: "A",
    name: "ALIGN",
    esName: "ALINEAR",
    desc: "Planes Duales de Trabajo",
    subdesc: "",
    focus: "Matriz de Valor",
    badge: "MATRIZ DE VALOR",
    failure: "Falta coherencia — ANSIEDAD",
  },
  {
    key: "reducate",
    letter: "R",
    name: "REDUCATE",
    esName: "RE-EDUCAR",
    desc: "Ruta Personalizada de Prestigio",
    subdesc: "",
    focus: "Plan Personalizado",
    badge: "PLAN PERSONALIZADO",
    failure: "Falta de capacidades — FRUSTRACIÓN",
  },
  {
    key: "experiment",
    letter: "E",
    name: "EXPERIMENT & EMPOWER",
    esName: "EXPERIMENTAR & EMPODERAR",
    desc: "Avance & Comunidad de Práctica",
    subdesc: "",
    focus: "Proyectos y Comunidad",
    badge: "PROYECTOS Y COMUNIDAD",
    failure: "Falta de aprendizaje — DESMOTIVACIÓN",
  },
] as const;
