import type { Role } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: "view_dashboard",
    name: "Ver Observabilidad",
    description: "Permite ver el panel de control y estadísticas generales.",
  },
  {
    id: "view_community",
    name: "Comunidad HumanAI",
    description:
      "Permite acceder a la red de conocimientos, librería de agentes y publicaciones comunitarias.",
  },
  {
    id: "view_methodology",
    name: "Metodología",
    description:
      "Permite visualizar el marco metodológico, dimensiones AWARE y guías instructivas.",
  },
  {
    id: "view_workplan",
    name: "Plan de Trabajo",
    description: "Permite acceder a la sección del Plan de Trabajo.",
  },
  {
    id: "manage_collaborators",
    name: "Gestionar Colaboradores",
    description:
      "Permite agregar nuevos empleados, iniciar cuestionarios y ver sus perfiles.",
  },
  {
    id: "view_reports",
    name: "Ver Reportes",
    description:
      "Permite acceder y descargar los reportes detallados de diagnóstico.",
  },
  {
    id: "regenerate_data",
    name: "Regenerar Datos",
    description: "Permite regenerar los datos de simulación en BigQuery.",
  },
  {
    id: "manage_users",
    name: "Gestión de Usuarios y Roles",
    description:
      "Permite cambiar roles, accesos y permisos globales en la plataforma.",
  },
];

export interface RoleConfig {
  id: Role;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

export const DEFAULT_ROLES: Record<Role, RoleConfig> = {
  admin: {
    id: "admin",
    name: "Administrador",
    description:
      "Control total del sistema, configuración de seguridad, accesos y datos.",
    permissions: {
      view_dashboard: true,
      view_community: true,
      view_methodology: true,
      view_workplan: true,
      manage_collaborators: true,
      view_reports: true,
      regenerate_data: true,
      manage_users: true,
    },
  },
  leader: {
    id: "leader",
    name: "Líder de Área",
    description:
      "Supervisión de equipos, visualización de métricas de área y reportes.",
    permissions: {
      view_dashboard: true,
      view_community: true,
      view_methodology: false,
      view_workplan: false,
      manage_collaborators: false,
      view_reports: false,
      regenerate_data: false,
      manage_users: false,
    },
  },
  consultant: {
    id: "consultant",
    name: "Consultor Externo",
    description:
      "Acceso de lectura a reportes y analíticas avanzadas sin edición.",
    permissions: {
      view_dashboard: true,
      view_community: true,
      view_methodology: false,
      view_workplan: false,
      manage_collaborators: false,
      view_reports: false,
      regenerate_data: false,
      manage_users: false,
    },
  },
  clevel: {
    id: "clevel",
    name: "C-Level / Ejecutivo",
    description:
      "Acceso ejecutivo a tableros estratégicos, mapas C-Level de equipo y diagnóstico consolidado.",
    permissions: {
      view_dashboard: true,
      view_community: true,
      view_methodology: false,
      view_workplan: false,
      manage_collaborators: false,
      view_reports: false,
      regenerate_data: false,
      manage_users: false,
    },
  },
  employee: {
    id: "employee",
    name: "Colaborador",
    description:
      "Acceso a realizar su propio diagnóstico, ver su reporte personal y consultar comunidad/metodología.",
    permissions: {
      view_dashboard: false,
      view_community: true,
      view_methodology: false,
      view_workplan: false,
      manage_collaborators: false,
      view_reports: false,
      regenerate_data: false,
      manage_users: false,
    },
  },
};

// Async DB fetching and seeding for Roles Configuration
export async function loadRolesConfigFromDB(): Promise<
  Record<Role, RoleConfig>
> {
  try {
    const { data, error } = await supabase.from("roles_config").select("*");
    if (!error && data && data.length > 0) {
      const dbConfig: Record<Role, RoleConfig> = { ...DEFAULT_ROLES };
      data.forEach(
        (row: {
          id: string;
          name?: string;
          description?: string;
          permissions?: unknown;
        }) => {
          const roleId = row.id as Role;
          if (DEFAULT_ROLES[roleId]) {
            dbConfig[roleId] = {
              id: roleId,
              name: row.name || DEFAULT_ROLES[roleId].name,
              description: row.description || DEFAULT_ROLES[roleId].description,
              permissions: {
                ...DEFAULT_ROLES[roleId].permissions,
                ...(typeof row.permissions === "object" && row.permissions
                  ? (row.permissions as Record<string, boolean>)
                  : {}),
              },
            };
          }
        },
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "roles_permissions_config",
          JSON.stringify(dbConfig),
        );
        window.dispatchEvent(new CustomEvent("roles_permissions_updated"));
      }
      return dbConfig;
    } else {
      // Seed DB with DEFAULT_ROLES
      const seedRows = (Object.keys(DEFAULT_ROLES) as Role[]).map((r) => ({
        id: DEFAULT_ROLES[r].id,
        name: DEFAULT_ROLES[r].name,
        description: DEFAULT_ROLES[r].description,
        permissions: DEFAULT_ROLES[r].permissions,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("roles_config").upsert(seedRows);
      return DEFAULT_ROLES;
    }
  } catch (e) {
    console.warn("Could not load roles config from database:", e);
    return getRolesConfig();
  }
}

// Async DB fetching for User Role Assignments
export async function loadUserAssignmentsFromDB(): Promise<
  Record<string, Role>
> {
  try {
    const { data, error } = await supabase
      .from("user_role_assignments")
      .select("*");
    const assignments: Record<string, Role> = {
      "gerencia@mareaco.com": "admin",
    };
    if (!error && data && data.length > 0) {
      data.forEach((row: { email?: string; role?: string }) => {
        if (row.email && row.role) {
          assignments[row.email.trim().toLowerCase()] = row.role as Role;
        }
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "user_role_assignments",
          JSON.stringify(assignments),
        );
        window.dispatchEvent(new CustomEvent("roles_permissions_updated"));
      }
      return assignments;
    } else {
      // Seed default admin assignment
      await supabase.from("user_role_assignments").upsert({
        email: "gerencia@mareaco.com",
        role: "admin",
        updated_at: new Date().toISOString(),
      });
      return assignments;
    }
  } catch (e) {
    console.warn("Could not load user role assignments from database:", e);
    return getUserRoleAssignments();
  }
}

// Cargar la configuración de roles y sus permisos (Sincrónico con fallback a cache local)
export function getRolesConfig(): Record<Role, RoleConfig> {
  if (typeof window === "undefined") return DEFAULT_ROLES;

  const version = localStorage.getItem("roles_permissions_v5");
  if (!version) {
    localStorage.setItem(
      "roles_permissions_config",
      JSON.stringify(DEFAULT_ROLES),
    );
    localStorage.setItem("roles_permissions_v5", "true");
    loadRolesConfigFromDB();
    return DEFAULT_ROLES;
  }

  const saved = localStorage.getItem("roles_permissions_config");
  if (!saved) {
    localStorage.setItem(
      "roles_permissions_config",
      JSON.stringify(DEFAULT_ROLES),
    );
    loadRolesConfigFromDB();
    return DEFAULT_ROLES;
  }
  try {
    const parsed = JSON.parse(saved);
    const merged: Record<Role, RoleConfig> = { ...DEFAULT_ROLES };
    (Object.keys(DEFAULT_ROLES) as Role[]).forEach((role) => {
      if (parsed[role]) {
        merged[role] = {
          ...DEFAULT_ROLES[role],
          ...parsed[role],
          permissions: {
            ...DEFAULT_ROLES[role].permissions,
            ...(parsed[role].permissions || {}),
          },
        };
      }
    });
    return merged;
  } catch (e) {
    return DEFAULT_ROLES;
  }
}

// Guardar la configuración de roles y permisos en DB y Local Storage
export function saveRolesConfig(config: Record<Role, RoleConfig>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("roles_permissions_config", JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("roles_permissions_updated"));
  }
  // Sync to database
  const rows = (Object.keys(config) as Role[]).map((r) => ({
    id: config[r].id,
    name: config[r].name,
    description: config[r].description,
    permissions: config[r].permissions,
    updated_at: new Date().toISOString(),
  }));
  supabase
    .from("roles_config")
    .upsert(rows)
    .then(({ error }) => {
      if (error) {
        console.error("Error saving roles config to database:", error);
      }
    });
}

// Obtener asignaciones de roles personalizadas para cada empleado (email -> role)
export function getUserRoleAssignments(): Record<string, Role> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem("user_role_assignments");
  const defaultAssignments: Record<string, Role> = {
    "gerencia@mareaco.com": "admin",
  };
  if (!saved) return defaultAssignments;
  try {
    return { ...defaultAssignments, ...JSON.parse(saved) };
  } catch (e) {
    return defaultAssignments;
  }
}

// Guardar asignación de rol personalizada en DB y Local Storage
export function saveUserRoleAssignment(email: string, role: Role) {
  const cleanEmail = email.trim().toLowerCase();
  if (typeof window !== "undefined") {
    const assignments = getUserRoleAssignments();
    assignments[cleanEmail] = role;
    localStorage.setItem("user_role_assignments", JSON.stringify(assignments));
    window.dispatchEvent(new CustomEvent("roles_permissions_updated"));
  }
  // Sync to database
  supabase
    .from("user_role_assignments")
    .upsert({
      email: cleanEmail,
      role: role,
      updated_at: new Date().toISOString(),
    })
    .then(({ error }) => {
      if (error) {
        console.error("Error saving user role assignment to database:", error);
      }
    });
}

// Eliminar asignación de rol personalizada en DB y Local Storage
export function removeUserRoleAssignment(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (typeof window !== "undefined") {
    const assignments = getUserRoleAssignments();
    delete assignments[cleanEmail];
    localStorage.setItem("user_role_assignments", JSON.stringify(assignments));
    window.dispatchEvent(new CustomEvent("roles_permissions_updated"));
  }
  // Sync to database
  supabase
    .from("user_role_assignments")
    .delete()
    .eq("email", cleanEmail)
    .then(({ error }) => {
      if (error) {
        console.error(
          "Error removing user role assignment from database:",
          error,
        );
      }
    });
}

// Trigger initial async DB load
if (typeof window !== "undefined") {
  loadRolesConfigFromDB();
  loadUserAssignmentsFromDB();
}

// Verificar si un rol tiene un permiso determinado
export function hasPermission(
  role: Role | null,
  permissionId: string,
): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  const configs = getRolesConfig();
  const config = configs[role];
  if (!config) return false;
  return !!config.permissions[permissionId];
}
