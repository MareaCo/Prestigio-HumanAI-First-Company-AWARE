export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  area: string;
  company_id: string;
  cedula?: string | null;
  empresa_principal?: string | null;
  empresaPrincipal?: string | null;
  empresa?: string | null;
  created_at: string;
  password?: string | null;
}

export type DimScores = Record<
  | "Mentalidad"
  | "Emocionalidad"
  | "Contexto"
  | "Datos"
  | "Automatización"
  | "Calidad"
  | "Autonomía"
  | "Liderazgo",
  number
>;

export interface ActivitiesQ {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface Diagnostic {
  id: string;
  employee_id: string;
  tier: number;
  total_score: number;
  dim_scores: DimScores;
  perfil: "Escéptico" | "Táctico" | "Facilitador" | "Amplificador";
  activities_q: ActivitiesQ;
  created_at: string;
  employee?: Employee;
  // v2 fields
  scoresSER?: number;
  scoresHACER?: number;
  arquetipo?: "Escéptico" | "Táctico" | "Facilitador" | "Amplificador";
  arquetipo_legacy?: string;
  subperfil?:
    | "Aficionado"
    | "Explorador"
    | "Integrador"
    | "Director"
    | "Constructor"
    | "Orquestador";
  gap?: "convencido_sin_herramientas" | "poder_sin_proposito" | "alineado";
  tensiones?: Record<string, number>;
  version?: string;
  version_scoring?: string;
  a_una_evidencia?: boolean;
  candado_no_aplicable?: boolean;
  respuestas?: Record<string, string>;
  answers?: (number | null)[];
  workspace_data?: {
    projects?: WorkspaceProject[];
    skills?: WorkspaceSkill[];
    prompts?: WorkspacePrompt[];
    resources?: WorkspaceResource[];
    tasks?: RoadmapTask[];
    masterSkills?: WorkspaceSkill[];
    masterPrompts?: WorkspacePrompt[];
  };
}

export type AreaFilter = "__all__" | string;

export type Role = "admin" | "leader" | "employee" | "consultant" | "clevel";
export type Screen =
  | "login"
  | "dashboard"
  | "methodology"
  | "plan-de-trabajo"
  | "quiz"
  | "report"
  | "employee-detail"
  | "users"
  | "user-management"
  | "user-workspace"
  | "comunidad-humanai";

export interface WorkspaceProject {
  id: string;
  title: string;
  description: string;
  dimension: string;
  status: "idea" | "en_proceso" | "completado";
  impact: "alto" | "medio" | "bajo";
  createdAt: string;
  participants?: string;
  isPublished?: boolean;
  publishedAt?: string;
  authorName?: string;
  authorArea?: string;
  strategicObjectives?: string[];
  keyOutcome?: string;
  usedPrompt?: string;
  resourceLink?: string;
  highImpactStatus?: "postulado" | "aprobado" | "rechazado";
  highImpactDecisionNotes?: string;
  highImpactEvaluatedAt?: string;
}

export interface WorkspaceSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  tool: string;
  createdAt: string;
  isPublished?: boolean;
  authorName?: string;
  authorArea?: string;
  publishedAt?: string;
}

export interface WorkspacePrompt {
  id: string;
  title: string;
  content: string;
  role: string;
  category: string;
  createdAt: string;
  isPublished?: boolean;
  authorName?: string;
  authorArea?: string;
  publishedAt?: string;
}

export interface RoadmapTask {
  id: string;
  horizon: "30" | "60" | "90";
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  custom?: boolean;
}

export interface WorkspaceResource {
  id: string;
  title: string;
  description: string;
  type: "youtube" | "documento" | "enlace" | "herramienta" | "otro";
  urlOrFile: string;
  category: string;
  tags?: string[];
  createdAt: string;
  isPublished?: boolean;
  authorName?: string;
  authorArea?: string;
  publishedAt?: string;
}
