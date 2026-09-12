import { Zap, Target, TrendingUp, Lightbulb, ShieldCheck } from "lucide-react";

export interface StrategicObjective {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  targetArea: string;
  weight: number;
  iconName: string;
  color: string;
  bg: string;
  badgeBg: string;
  border: string;
}

export const COMPANY_STRATEGIC_OBJECTIVES: StrategicObjective[] = [
  {
    id: "obj-1",
    title: "Automatización e Integración de IA",
    shortTitle: "Automatización & IA",
    description:
      "Despliegue de agentes autónomos y flujos integrados que reduzcan trabajo manual.",
    targetArea: "Tecnología y Operaciones",
    weight: 25,
    iconName: "Zap",
    color: "#0C447C",
    bg: "#E6F2FB",
    badgeBg: "bg-blue-100 text-blue-900 border-blue-200",
    border: "border-blue-300",
  },
  {
    id: "obj-2",
    title: "Eficiencia Operativa & Erradicación de Ridiculist",
    shortTitle: "Eficiencia Operativa",
    description:
      "Eliminación o delegación de micro-tareas repetitivas de bajo valor.",
    targetArea: "Todas las áreas",
    weight: 20,
    iconName: "Target",
    color: "#993C1D",
    bg: "#FDECEA",
    badgeBg: "bg-red-100 text-red-900 border-red-200",
    border: "border-red-300",
  },
  {
    id: "obj-3",
    title: "Aceleración Comercial & Expansión de Clientes",
    shortTitle: "Aceleración Comercial",
    description:
      "Uso de copilotos y asistentes IA para personalizar propuestas y acelerar ventas.",
    targetArea: "Comercial, Ventas y Marketing",
    weight: 20,
    iconName: "TrendingUp",
    color: "#854F0B",
    bg: "#FEF6E6",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
    border: "border-amber-300",
  },
  {
    id: "obj-5",
    title: "Nuevas Propuestas de Valor Cliente / Consumidor",
    shortTitle: "Propuestas de Valor Cliente",
    description:
      "Diseño y desarrollo de productos, servicios y experiencias transformadas por Inteligencia Artificial.",
    targetArea: "Producto, Innovación y Clientes",
    weight: 20,
    iconName: "Lightbulb",
    color: "#5B21B6",
    bg: "#F3E8FF",
    badgeBg: "bg-purple-100 text-purple-900 border-purple-200",
    border: "border-purple-300",
  },
  {
    id: "obj-4",
    title: "Gobernanza, Cultura & Adopción Responsable",
    shortTitle: "Gobernanza & Cultura",
    description:
      "Uso ético, prompts estructurados y desarrollo de habilidades en toda la plantilla.",
    targetArea: "Recursos Humanos y Liderazgo",
    weight: 15,
    iconName: "ShieldCheck",
    color: "#0F5237",
    bg: "#E6F4EA",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
    border: "border-emerald-300",
  },
];
