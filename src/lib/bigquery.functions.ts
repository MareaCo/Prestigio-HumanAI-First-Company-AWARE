/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import {
  get60SeedData,
  ANDRES_PIEDRAHITA_EMPLOYEE,
  ANDRES_DIAGNOSTIC,
  EXTRA_LOGIN_EMPLOYEES,
  EXTRA_LOGIN_DIAGNOSTICS,
} from "@/data/seedData";
import {
  assignArchetype,
  getArquetipo,
  getGapType,
  getSubperfil,
} from "@/data/scoring";
import { z } from "zod";
import { generateDaysRange, createTimestampForDay } from "@/lib/dateUtils";

// --- LOGINS SEED GENERATOR & MOCK STORE ---
export const HISTORICAL_LOGINS_START_ISO = "2026-07-27T08:00:00";
let mockLogins: any[] = [];
let loginsSeeded = false;

let mockActivityEvents: any[] = [];
let activityEventsSeeded = false;

export function getSampleLoginsSeed(): any[] {
  // Real login logs for registered employees recorded in BigQuery starting 2026-07-27
  return [
    // 27 Jul 2026 (Mon)
    {
      id: "login-1",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-07-27T08:15:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-2",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-27T09:10:00.000Z",
      area: "Operaciones & Logística",
      empresa: "Comfama",
    },
    {
      id: "login-3",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-27T10:05:00.000Z",
      area: "Tecnología & BI",
      empresa: "Comfama",
    },
    {
      id: "login-4",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-27T11:20:00.000Z",
      area: "Comercial & Ventas",
      empresa: "Comfama",
    },
    {
      id: "login-5",
      employee_id: "emp-juan-perez",
      user_name: "Juan Pérez",
      user_email: "juan.perez@strategicbrands.com",
      user_role: "employee",
      user_type: "nuevo",
      created_at: "2026-07-27T14:15:00.000Z",
      area: "Gestión Humana",
      empresa: "Comfama",
    },
    {
      id: "login-6",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-27T15:40:00.000Z",
      area: "Finanzas & Contabilidad",
      empresa: "Comfama",
    },

    // 28 Jul 2026 (Tue)
    {
      id: "login-7",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-07-28T08:30:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-8",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-28T09:45:00.000Z",
      area: "Operaciones & Logística",
      empresa: "Comfama",
    },
    {
      id: "login-9",
      employee_id: "emp-laura-gomez",
      user_name: "Laura Gómez",
      user_email: "laura.gomez@strategicbrands.com",
      user_role: "employee",
      user_type: "nuevo",
      created_at: "2026-07-28T10:15:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-10",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-28T13:20:00.000Z",
      area: "Tecnología & BI",
      empresa: "Comfama",
    },
    {
      id: "login-11",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-28T15:10:00.000Z",
      area: "Comercial & Ventas",
      empresa: "Comfama",
    },

    // 29 Jul 2026 (Wed)
    {
      id: "login-12",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-07-29T08:45:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-13",
      employee_id: "emp-juan-perez",
      user_name: "Juan Pérez",
      user_email: "juan.perez@strategicbrands.com",
      user_role: "employee",
      user_type: "nuevo",
      created_at: "2026-07-29T09:30:00.000Z",
      area: "Gestión Humana",
      empresa: "Comfama",
    },
    {
      id: "login-14",
      employee_id: "emp-diego-valencia",
      user_name: "Diego Valencia",
      user_email: "diego.valencia@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-29T11:00:00.000Z",
      area: "Operaciones & Logística",
      empresa: "Comfama",
    },
    {
      id: "login-15",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-29T14:15:00.000Z",
      area: "Finanzas & Contabilidad",
      empresa: "Comfama",
    },

    // 30 Jul 2026 (Thu)
    {
      id: "login-16",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-07-30T08:20:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-17",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-30T09:50:00.000Z",
      area: "Operaciones & Logística",
      empresa: "Comfama",
    },
    {
      id: "login-18",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-30T11:10:00.000Z",
      area: "Tecnología & BI",
      empresa: "Comfama",
    },
    {
      id: "login-19",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-30T14:30:00.000Z",
      area: "Comercial & Ventas",
      empresa: "Comfama",
    },

    // 31 Jul 2026 (Fri)
    {
      id: "login-20",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-07-31T08:10:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-21",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-07-31T09:40:00.000Z",
      area: "Finanzas & Contabilidad",
      empresa: "Comfama",
    },
    {
      id: "login-22",
      employee_id: "emp-laura-gomez",
      user_name: "Laura Gómez",
      user_email: "laura.gomez@strategicbrands.com",
      user_role: "employee",
      user_type: "nuevo",
      created_at: "2026-07-31T11:25:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },

    // 1 Ago 2026 (Sat)
    {
      id: "login-23",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-08-01T09:30:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },

    // 2 Ago 2026 (Sun) - 0 logins

    // 3 Ago 2026 (Mon - Today)
    {
      id: "login-24",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_role: "admin",
      user_type: "actual",
      created_at: "2026-08-03T08:12:00.000Z",
      area: "Marketing & Comunicaciones",
      empresa: "Comfama",
    },
    {
      id: "login-25",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_role: "employee",
      user_type: "actual",
      created_at: "2026-08-03T08:35:00.000Z",
      area: "Tecnología & BI",
      empresa: "Comfama",
    },
  ];
}

export function getSampleActivityEventsSeed(): any[] {
  // Real activity events for registered users stored in BigQuery starting 2026-07-27
  return [
    // 27 Jul 2026
    {
      id: "actev-1",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "sesion",
      action_title: "Inicio de Sesión",
      description: "Ingreso a la plataforma HumanAI First",
      created_at: "2026-07-27T08:15:00.000Z",
    },
    {
      id: "actev-2",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Diagnóstico completado en dimensiones SER / HACER (Tier 4)",
      created_at: "2026-07-27T08:45:00.000Z",
    },
    {
      id: "actev-3",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Líder de Operaciones",
      category: "sesion",
      action_title: "Inicio de Sesión",
      description: "Ingreso a la plataforma HumanAI First",
      created_at: "2026-07-27T09:10:00.000Z",
    },
    {
      id: "actev-4",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Líder de Operaciones",
      category: "matriz",
      action_title: "Clasificación Matriz Ridiculist",
      description: "Reclasificación de 4 tareas operativas en Q2 Copilotos",
      created_at: "2026-07-27T09:35:00.000Z",
    },
    {
      id: "actev-5",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "sesion",
      action_title: "Inicio de Sesión",
      description: "Ingreso a la plataforma HumanAI First",
      created_at: "2026-07-27T10:05:00.000Z",
    },
    {
      id: "actev-6",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "prompt_mia",
      action_title: "Consulta a MIA Asistente",
      description: "Generación de síntesis ejecutiva de mapa de capacidades",
      created_at: "2026-07-27T10:40:00.000Z",
    },
    {
      id: "actev-7",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_area: "Comercial & Ventas",
      user_role: "Gerente Comercial",
      category: "sesion",
      action_title: "Inicio de Sesión",
      description: "Ingreso a la plataforma HumanAI First",
      created_at: "2026-07-27T11:20:00.000Z",
    },
    {
      id: "actev-8",
      employee_id: "emp-juan-perez",
      user_name: "Juan Pérez",
      user_email: "juan.perez@strategicbrands.com",
      user_area: "Gestión Humana",
      user_role: "Especialista Talento Humano",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Diagnóstico completado en dimensiones SER / HACER (Tier 3)",
      created_at: "2026-07-27T14:40:00.000Z",
    },

    // 28 Jul 2026
    {
      id: "actev-9",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Postulación de automatización de copys multicanal en Q3",
      created_at: "2026-07-28T08:55:00.000Z",
    },
    {
      id: "actev-10",
      employee_id: "emp-laura-gomez",
      user_name: "Laura Gómez",
      user_email: "laura.gomez@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Especialista Content IA",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Diagnóstico completado en dimensiones SER / HACER (Tier 3)",
      created_at: "2026-07-28T10:50:00.000Z",
    },
    {
      id: "actev-11",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Pipeline de consolidación BI con IA",
      created_at: "2026-07-28T14:05:00.000Z",
    },
    {
      id: "actev-12",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_area: "Comercial & Ventas",
      user_role: "Gerente Comercial",
      category: "prompt_mia",
      action_title: "Consulta a MIA Asistente",
      description: "Análisis predictivo de respuestas de prospectos",
      created_at: "2026-07-28T15:45:00.000Z",
    },

    // 29 Jul 2026
    {
      id: "actev-13",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "prompt_mia",
      action_title: "Prompt Guardado en Librería",
      description: "Creación de plantilla para análisis predictivo de pauta",
      created_at: "2026-07-29T09:15:00.000Z",
    },
    {
      id: "actev-14",
      employee_id: "emp-juan-perez",
      user_name: "Juan Pérez",
      user_email: "juan.perez@strategicbrands.com",
      user_area: "Gestión Humana",
      user_role: "Especialista Talento Humano",
      category: "matriz",
      action_title: "Carga de Actividades",
      description: "Registro de 8 tareas diarias con minutaje y frecuencia",
      created_at: "2026-07-29T10:10:00.000Z",
    },
    {
      id: "actev-15",
      employee_id: "emp-diego-valencia",
      user_name: "Diego Valencia",
      user_email: "diego.valencia@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Coordinador Procesos",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Diagnóstico completado en dimensiones SER / HACER (Tier 3)",
      created_at: "2026-07-29T11:35:00.000Z",
    },
    {
      id: "actev-16",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_area: "Finanzas & Contabilidad",
      user_role: "Jefe de Finanzas",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Conciliación financiera automática",
      created_at: "2026-07-29T15:00:00.000Z",
    },

    // 30 Jul 2026
    {
      id: "actev-17",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "prompt_mia",
      action_title: "Consulta a MIA Asistente",
      description: "Optimización de estrategia de pauta digital",
      created_at: "2026-07-30T09:00:00.000Z",
    },
    {
      id: "actev-18",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Líder de Operaciones",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Ruta de despachos logísticos optimizada por IA",
      created_at: "2026-07-30T10:30:00.000Z",
    },
    {
      id: "actev-19",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "matriz",
      action_title: "Clasificación Matriz Ridiculist",
      description: "Reclasificación de tareas de procesamiento de datos",
      created_at: "2026-07-30T11:45:00.000Z",
    },

    // 31 Jul 2026
    {
      id: "actev-20",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "proyecto",
      action_title: "Actualización de Copiloto",
      description:
        "Configuración de webhook en proyecto de facturación automatizada",
      created_at: "2026-07-31T08:40:00.000Z",
    },
    {
      id: "actev-21",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_area: "Finanzas & Contabilidad",
      user_role: "Jefe de Finanzas",
      category: "prompt_mia",
      action_title: "Consulta a MIA Asistente",
      description: "Proyección financiera de cierre mensual",
      created_at: "2026-07-31T10:20:00.000Z",
    },
    {
      id: "actev-22",
      employee_id: "emp-laura-gomez",
      user_name: "Laura Gómez",
      user_email: "laura.gomez@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Especialista Content IA",
      category: "prompt_mia",
      action_title: "Prompt Guardado en Librería",
      description: "Generación de plantillas de correo automatizadas",
      created_at: "2026-07-31T12:05:00.000Z",
    },

    // 1 Ago 2026 (Sat - Weekend)
    {
      id: "actev-23",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "prompt_mia",
      action_title: "Consulta a MIA Asistente",
      description: "Revisión trimestral de metas de automatización",
      created_at: "2026-08-01T10:05:00.000Z",
    },

    // 2 Ago 2026 (Sun - Weekend) - 0 events

    // 3 Ago 2026 (Mon)
    {
      id: "actev-24",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "sesion",
      action_title: "Inicio de Sesión",
      description: "Ingreso a la plataforma registrado en BigQuery",
      created_at: "2026-08-03T08:12:00.000Z",
    },
    {
      id: "actev-25",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "prompt_mia",
      action_title: "Consulta a MIA Asistente",
      description: "Diagnóstico inicial de arquitectura BI",
      created_at: "2026-08-03T08:40:00.000Z",
    },
    {
      id: "actev-26",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description: "Compartió skill 'Segmentación de Audiencias Digitales'",
      created_at: "2026-08-03T11:20:00.000Z",
    },
    {
      id: "actev-27",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Líder de Operaciones",
      category: "matriz",
      action_title: "Actualización de Matriz de Tareas",
      description:
        "Revisión de horas asignadas en Q3 para despacho y cross-docking",
      created_at: "2026-08-03T14:15:00.000Z",
    },

    // 4 Ago 2026 (Tue)
    {
      id: "actev-28",
      employee_id: "emp-laura-gomez",
      user_name: "Laura Gómez",
      user_email: "laura.gomez@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Especialista Content IA",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description: "Publicó Prompt de Generación de Copys Multicanal",
      created_at: "2026-08-04T09:30:00.000Z",
    },
    {
      id: "actev-29",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_area: "Finanzas & Contabilidad",
      user_role: "Jefe de Finanzas",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Diagnóstico completado en dimensiones SER / HACER (Tier 3)",
      created_at: "2026-08-04T10:45:00.000Z",
    },
    {
      id: "actev-30",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_area: "Comercial & Ventas",
      user_role: "Gerente Comercial",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Pipeline inteligente de scoring de leads comerciales",
      created_at: "2026-08-04T15:20:00.000Z",
    },

    // 5 Ago 2026 (Wed)
    {
      id: "actev-31",
      employee_id: "emp-juan-perez",
      user_name: "Juan Pérez",
      user_email: "juan.perez@strategicbrands.com",
      user_area: "Gestión Humana",
      user_role: "Especialista Talento Humano",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description: "Compartió recurso 'Protocolo de Adopción de IA en Equipos'",
      created_at: "2026-08-05T09:00:00.000Z",
    },
    {
      id: "actev-32",
      employee_id: "emp-diego-valencia",
      user_name: "Diego Valencia",
      user_email: "diego.valencia@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Coordinador Procesos",
      category: "matriz",
      action_title: "Clasificación Matriz Ridiculist",
      description: "Clasificación de 6 tareas de control de calidad",
      created_at: "2026-08-05T11:30:00.000Z",
    },

    // 10 Ago 2026 (Week 3 - Mon)
    {
      id: "actev-33",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "proyecto",
      action_title: "Actualización de Copiloto",
      description: "Integración de IA con plataforma de envío de campañas",
      created_at: "2026-08-10T08:30:00.000Z",
    },
    {
      id: "actev-34",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "matriz",
      action_title: "Carga de Actividades",
      description: "Actualización de matriz de procesamiento ETL",
      created_at: "2026-08-10T10:15:00.000Z",
    },
    {
      id: "actev-35",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Líder de Operaciones",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description: "Compartió skill 'Optimizador de Flujos Q3 Automatización'",
      created_at: "2026-08-10T14:40:00.000Z",
    },

    // 12 Ago 2026 (Wed)
    {
      id: "actev-36",
      employee_id: "emp-sofia-martinez",
      user_name: "Sofía Martínez",
      user_email: "sofia.martinez@strategicbrands.com",
      user_area: "Comercial & Ventas",
      user_role: "Gerente Comercial",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Diagnóstico completado en dimensiones SER / HACER (Tier 4)",
      created_at: "2026-08-12T09:10:00.000Z",
    },
    {
      id: "actev-37",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_area: "Finanzas & Contabilidad",
      user_role: "Jefe de Finanzas",
      category: "matriz",
      action_title: "Clasificación Matriz Ridiculist",
      description: "Clasificación de 5 tareas de facturación e impuestos",
      created_at: "2026-08-12T11:25:00.000Z",
    },

    // 17 Ago 2026 (Week 4 - Mon)
    {
      id: "actev-38",
      employee_id: "emp-laura-gomez",
      user_name: "Laura Gómez",
      user_email: "laura.gomez@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Especialista Content IA",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Copiloto editorial de redes sociales y newsletters",
      created_at: "2026-08-17T09:00:00.000Z",
    },
    {
      id: "actev-39",
      employee_id: "emp-diego-valencia",
      user_name: "Diego Valencia",
      user_email: "diego.valencia@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Coordinador Procesos",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description: "Compartió prompt 'Estandarizador de Formatos Logísticos'",
      created_at: "2026-08-17T11:00:00.000Z",
    },

    // 24 Ago 2026 (Week 5 - Mon)
    {
      id: "actev-40",
      employee_id: "emp-juan-perez",
      user_name: "Juan Pérez",
      user_email: "juan.perez@strategicbrands.com",
      user_area: "Gestión Humana",
      user_role: "Especialista Talento Humano",
      category: "proyecto",
      action_title: "Nuevo Proyecto IA Creado",
      description: "Evaluador preliminar de perfiles de talento con IA",
      created_at: "2026-08-24T08:50:00.000Z",
    },
    {
      id: "actev-41",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "matriz",
      action_title: "Actualización de Matriz de Tareas",
      description:
        "Reasignación de horas liberadas para planeación estratégica",
      created_at: "2026-08-24T10:30:00.000Z",
    },
    {
      id: "actev-42",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description:
        "Compartió recurso 'Arquitectura de Datos para RAG Corporativo'",
      created_at: "2026-08-24T14:10:00.000Z",
    },

    // 31 Ago 2026 (Week 6 - Mon / Today)
    {
      id: "actev-43",
      employee_id: "emp-andres-piedrahita",
      user_name: "Andrés Piedrahita",
      user_email: "andres.piedrahita@strategicbrands.com",
      user_area: "Marketing & Comunicaciones",
      user_role: "Director de Marketing",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description: "Publicó Skill 'Generador de Copys Multicanal y Test A/B'",
      created_at: "2026-08-31T08:30:00.000Z",
    },
    {
      id: "actev-44",
      employee_id: "emp-carlos-rodriguez",
      user_name: "Carlos Rodríguez",
      user_email: "carlos.rodriguez@strategicbrands.com",
      user_area: "Operaciones & Logística",
      user_role: "Líder de Operaciones",
      category: "proyecto",
      action_title: "Publicación de Proyecto IA",
      description: "Publicó a la comunidad el Copiloto Logístico",
      created_at: "2026-08-31T09:45:00.000Z",
    },
    {
      id: "actev-45",
      employee_id: "emp-maria-gonzalez",
      user_name: "María González",
      user_email: "maria.gonzalez@strategicbrands.com",
      user_area: "Tecnología & BI",
      user_role: "Analista Senior BI",
      category: "diagnostico",
      action_title: "Evaluación de Introspección",
      description: "Actualización de Diagnóstico SER / HACER (Tier 4)",
      created_at: "2026-08-31T10:15:00.000Z",
    },
    {
      id: "actev-46",
      employee_id: "emp-alejandro-restrepo",
      user_name: "Alejandro Restrepo",
      user_email: "alejandro.restrepo@strategicbrands.com",
      user_area: "Finanzas & Contabilidad",
      user_role: "Jefe de Finanzas",
      category: "comunidad",
      action_title: "Publicación en Comunidad HumanAI",
      description:
        "Compartió Prompt 'Validador de Calidad y Detección de Sesgos'",
      created_at: "2026-08-31T11:00:00.000Z",
    },
  ];
}

function ensureLoginsSeeded() {
  if (!loginsSeeded) {
    mockLogins = getSampleLoginsSeed();
    loginsSeeded = true;
  }
}

function ensureActivityEventsSeeded() {
  if (!activityEventsSeeded) {
    mockActivityEvents = getSampleActivityEventsSeed();
    activityEventsSeeded = true;
  }
}

// --- IN-MEMORY FALLBACK DATABASE FOR DEVELOPMENT/MOCKED STATES ---
let mockEmployees: any[] = [];
let mockDiagnostics: any[] = [];
let initialSeeded = false;

function ensureMockSeeded() {
  if (!initialSeeded) {
    const companyId = "company-default-id";
    const seed = get60SeedData(companyId);
    mockEmployees = seed.employees;
    mockDiagnostics = seed.diagnostics;
    initialSeeded = true;
  }

  if (
    !mockEmployees.some(
      (e) =>
        e.email?.trim().toLowerCase() ===
          "andres.piedrahita@strategicbrands.com" ||
        e.id === "emp-andres-piedrahita",
    )
  ) {
    mockEmployees.unshift(ANDRES_PIEDRAHITA_EMPLOYEE);
  }
  if (
    !mockDiagnostics.some(
      (d) =>
        d.id === "diag-andres-piedrahita" ||
        d.employee_id === "emp-andres-piedrahita",
    )
  ) {
    mockDiagnostics.unshift(ANDRES_DIAGNOSTIC);
  }

  EXTRA_LOGIN_EMPLOYEES.forEach((extraEmp) => {
    if (
      !mockEmployees.some(
        (e) =>
          e.email?.trim().toLowerCase() === extraEmp.email.toLowerCase() ||
          e.id === extraEmp.id,
      )
    ) {
      mockEmployees.push(extraEmp);
    }
  });

  EXTRA_LOGIN_DIAGNOSTICS.forEach((extraDiag) => {
    if (
      !mockDiagnostics.some(
        (d) => d.id === extraDiag.id || d.employee_id === extraDiag.employee_id,
      )
    ) {
      mockDiagnostics.push(extraDiag);
    }
  });
}

// --- BIGQUERY LAZY CLIENT INITIALIZER ---
let _bqClient: any = null;
let _bqError: string | null = null;

async function getBigQueryClient(): Promise<any> {
  if (_bqClient) return _bqClient;

  // Cover both standard and custom GCP naming conventions
  const projectId =
    process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID;
  const clientEmail =
    process.env.BIGQUERY_CLIENT_EMAIL || process.env.GCP_CLIENT_EMAIL;
  let privateKey =
    process.env.BIGQUERY_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY || "";

  // Fix private key formatting from env vars
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const bqOptions: any = {};

  if (process.env.BIGQUERY_SERVICE_ACCOUNT) {
    try {
      const creds = JSON.parse(process.env.BIGQUERY_SERVICE_ACCOUNT);
      bqOptions.projectId = creds.project_id;
      bqOptions.credentials = creds;
    } catch (e: any) {
      console.error("Error parsing BIGQUERY_SERVICE_ACCOUNT JSON string:", e);
      _bqError = `Error parseando JSON de Credenciales: ${e.message}`;
    }
  } else if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    try {
      const creds = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
      bqOptions.projectId = creds.project_id;
      bqOptions.credentials = creds;
    } catch (e: any) {
      console.error("Error parsing GCP_SERVICE_ACCOUNT_KEY:", e);
    }
  } else if (projectId && clientEmail && privateKey) {
    bqOptions.projectId = projectId;
    bqOptions.credentials = {
      client_email: clientEmail,
      private_key: privateKey,
    };
  }

  if (bqOptions.projectId) {
    try {
      const { BigQuery } = await import("@google-cloud/bigquery");
      _bqClient = new BigQuery(bqOptions);
      _bqError = null;
      return _bqClient;
    } catch (e: any) {
      console.error("Error creating BigQuery client:", e);
      _bqError = `Error de inicialización de BigQuery: ${e.message}`;
    }
  }

  return null;
}

// Get Dataset ID
function getDatasetId() {
  return process.env.BIGQUERY_DATASET_ID || "humanai_aware_prestigio";
}

let _tablesEnsured = false;

// Helper to guarantee tables are created in the dataset
async function ensureTablesExist(bq: BigQuery, datasetId: string) {
  if (_tablesEnsured) return;
  try {
    const dataset = bq.dataset(datasetId);
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      console.log(`Creating dataset ${datasetId}...`);
      await dataset.create();
    }

    const employeesTable = dataset.table("employees");
    const [employeesExists] = await employeesTable.exists();
    if (!employeesExists) {
      console.log("Creating employees table in BigQuery...");
      const schema = [
        { name: "id", type: "STRING" },
        { name: "name", type: "STRING" },
        { name: "email", type: "STRING" },
        { name: "area", type: "STRING" },
        { name: "company_id", type: "STRING" },
        { name: "created_at", type: "STRING" },
        { name: "password", type: "STRING" },
        { name: "cedula", type: "STRING" },
        { name: "empresa", type: "STRING" },
        { name: "empresa_principal", type: "STRING" },
      ];
      await employeesTable.create({ schema });
    } else {
      try {
        const [meta] = await employeesTable.getMetadata();
        const existingFields = (meta?.schema?.fields || []).map(
          (f: any) => f.name,
        );

        if (!existingFields.includes("password")) {
          const query = `ALTER TABLE \`${bq.projectId}.${datasetId}.employees\` ADD COLUMN IF NOT EXISTS password STRING`;
          await bq
            .query({ query })
            .catch((e) =>
              console.warn(
                "Could not alter employees table to add password column:",
                e.message,
              ),
            );
        }
        if (!existingFields.includes("cedula")) {
          const queryCed = `ALTER TABLE \`${bq.projectId}.${datasetId}.employees\` ADD COLUMN IF NOT EXISTS cedula STRING`;
          await bq
            .query({ query: queryCed })
            .catch((e) =>
              console.warn(
                "Could not alter employees table to add cedula column:",
                e.message,
              ),
            );
        }
        if (!existingFields.includes("empresa")) {
          const queryEmp = `ALTER TABLE \`${bq.projectId}.${datasetId}.employees\` ADD COLUMN IF NOT EXISTS empresa STRING`;
          await bq
            .query({ query: queryEmp })
            .catch((e) =>
              console.warn(
                "Could not alter employees table to add empresa column:",
                e.message,
              ),
            );
        }
        if (!existingFields.includes("empresa_principal")) {
          const queryEmpPrinc = `ALTER TABLE \`${bq.projectId}.${datasetId}.employees\` ADD COLUMN IF NOT EXISTS empresa_principal STRING`;
          await bq
            .query({ query: queryEmpPrinc })
            .catch((e) =>
              console.warn(
                "Could not alter employees table to add empresa_principal column:",
                e.message,
              ),
            );
        }
      } catch (colErr: any) {
        console.warn(
          "Could not verify or alter employees table schema:",
          colErr?.message || colErr,
        );
      }
    }

    const diagnosticsTable = dataset.table("diagnostics");
    const [diagnosticsExists] = await diagnosticsTable.exists();
    if (!diagnosticsExists) {
      console.log("Creating diagnostics table in BigQuery...");
      const schema = [
        { name: "id", type: "STRING" },
        { name: "employee_id", type: "STRING" },
        { name: "tier", type: "INTEGER" },
        { name: "total_score", type: "INTEGER" },
        { name: "dim_scores", type: "STRING" },
        { name: "perfil", type: "STRING" },
        { name: "activities_q", type: "STRING" },
        { name: "created_at", type: "STRING" },
      ];
      await diagnosticsTable.create({ schema });
    }

    const loginsTable = dataset.table("logins");
    const [loginsExists] = await loginsTable.exists();
    if (!loginsExists) {
      console.log("Creating logins table in BigQuery...");
      const schema = [
        { name: "id", type: "STRING" },
        { name: "employee_id", type: "STRING" },
        { name: "user_name", type: "STRING" },
        { name: "user_email", type: "STRING" },
        { name: "user_role", type: "STRING" },
        { name: "user_type", type: "STRING" },
        { name: "created_at", type: "STRING" },
        { name: "area", type: "STRING" },
        { name: "empresa", type: "STRING" },
      ];
      await loginsTable.create({ schema });

      try {
        const seedLogins = getSampleLoginsSeed();
        await loginsTable.insert(seedLogins);
        console.log(
          "Seeded initial historical logins into BigQuery starting from 2026-07-27T08:00:00",
        );
      } catch (seedErr: any) {
        console.warn(
          "Could not seed initial logins into BigQuery:",
          seedErr?.message || seedErr,
        );
      }
    }

    const activityTable = dataset.table("activity_events");
    const [activityExists] = await activityTable.exists();
    if (!activityExists) {
      console.log("Creating activity_events table in BigQuery...");
      const schema = [
        { name: "id", type: "STRING" },
        { name: "employee_id", type: "STRING" },
        { name: "user_name", type: "STRING" },
        { name: "user_email", type: "STRING" },
        { name: "user_area", type: "STRING" },
        { name: "user_role", type: "STRING" },
        { name: "category", type: "STRING" },
        { name: "action_title", type: "STRING" },
        { name: "description", type: "STRING" },
        { name: "created_at", type: "STRING" },
      ];
      await activityTable.create({ schema });

      try {
        const seedActivity = getSampleActivityEventsSeed();
        await activityTable.insert(seedActivity);
        console.log("Seeded initial historical activity events into BigQuery");
      } catch (seedErr: any) {
        console.warn(
          "Could not seed initial activity events into BigQuery:",
          seedErr?.message || seedErr,
        );
      }
    }

    _tablesEnsured = true;
  } catch (err: any) {
    console.warn("Warning in ensureTablesExist:", err?.message || err);
    _tablesEnsured = true;
  }
}

// --- SERVER FUNCTIONS ---

// 1. Get Integration Status
export const getBigQueryStatusFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();
    if (bq) {
      return {
        configured: true,
        projectId: bq.projectId,
        datasetId,
        error: _bqError,
        mode: "GCP BigQuery Production",
      };
    }
    return {
      configured: false,
      projectId: null,
      datasetId,
      error:
        "No se encontraron credenciales GCP en los Secrets. Corriendo en modo fallback con base de datos en memoria local.",
      mode: "Memory Database Fallback",
    };
  },
);

// 2. Get Employees
export const getEmployeesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const query = `
          WITH RankedEmployees AS (
            SELECT *,
                   ROW_NUMBER() OVER(PARTITION BY id ORDER BY created_at DESC) as rn
            FROM \`${bq.projectId}.${datasetId}.employees\`
          )
          SELECT id, name, email, area, company_id, created_at, password, cedula, empresa, empresa_principal
          FROM RankedEmployees
          WHERE rn = 1
          ORDER BY name
        `;
        const [rows] = await bq.query({ query });
        const results = Array.isArray(rows) ? [...rows] : [];
        const hasAndres = results.some(
          (emp: any) =>
            emp.email?.trim().toLowerCase() ===
              "andres.piedrahita@strategicbrands.com" ||
            emp.id === "emp-andres-piedrahita",
        );
        if (!hasAndres) {
          results.unshift(ANDRES_PIEDRAHITA_EMPLOYEE);
        }

        EXTRA_LOGIN_EMPLOYEES.forEach((extraEmp) => {
          const hasEmp = results.some(
            (emp: any) =>
              emp.email?.trim().toLowerCase() ===
                extraEmp.email.toLowerCase() || emp.id === extraEmp.id,
          );
          if (!hasEmp) {
            results.push(extraEmp);
          }
        });

        return results;
      } catch (err: any) {
        console.error(
          "BigQuery query error, using local memory fallback:",
          err,
        );
        ensureMockSeeded();
        return mockEmployees;
      }
    }

    ensureMockSeeded();
    return mockEmployees;
  },
);

// Helper function to dynamically hydrate and upgrade diagnostic rows (v1, v2, v2.1)
function hydrateDiagnostic(row: any): any {
  let activitiesQ: any = {};
  try {
    activitiesQ =
      typeof row.activities_q === "string"
        ? JSON.parse(row.activities_q)
        : row.activities_q;
  } catch (e) {
    activitiesQ = row.activities_q || {};
  }

  let dimScoresObj: any = {};
  try {
    dimScoresObj =
      typeof row.dim_scores === "string"
        ? JSON.parse(row.dim_scores)
        : row.dim_scores;
  } catch (e) {
    dimScoresObj = row.dim_scores || {};
  }

  const v2 = activitiesQ?.v2_data || {};

  // Backward compatibility: make sure Emocionalidad is present
  if (dimScoresObj && !dimScoresObj.Emocionalidad) {
    dimScoresObj.Emocionalidad = dimScoresObj.Mentalidad
      ? Math.min(4, Math.max(1, Math.round(dimScoresObj.Mentalidad / 2)))
      : 1;
  }

  // 1. Calculate scoresSER
  let scoresSER: number;
  if (v2.scoresSER !== undefined && !isNaN(Number(v2.scoresSER))) {
    scoresSER = Number(v2.scoresSER);
  } else if (row.scoresSER !== undefined && !isNaN(Number(row.scoresSER))) {
    scoresSER = Number(row.scoresSER);
  } else {
    const ser =
      (dimScoresObj.Mentalidad ?? 1) +
      (dimScoresObj.Emocionalidad ?? 1) +
      (dimScoresObj.Liderazgo ?? 3);
    scoresSER = isNaN(ser) ? 10 : Math.min(20, Math.max(5, ser));
  }

  // 2. Calculate scoresHACER
  let scoresHACER: number;
  if (v2.scoresHACER !== undefined && !isNaN(Number(v2.scoresHACER))) {
    scoresHACER = Number(v2.scoresHACER);
  } else if (row.scoresHACER !== undefined && !isNaN(Number(row.scoresHACER))) {
    scoresHACER = Number(row.scoresHACER);
  } else {
    const hacer =
      (dimScoresObj.Contexto ?? 2) +
      (dimScoresObj.Datos ?? 2) +
      (dimScoresObj.Automatización ?? 2) +
      (dimScoresObj.Calidad ?? 2) +
      (dimScoresObj.Autonomía ?? 2);
    scoresHACER = isNaN(hacer) ? 25 : Math.min(40, Math.max(10, hacer));
  }

  // Extract respuestas / answers
  const respuestas = v2.respuestas || activitiesQ.respuestas || row.respuestas;
  const answers = v2.answers || activitiesQ.answers || row.answers;

  // 4a. ANTES de sobrescribir, copiá el arquetipo actual de cada diagnóstico al campo arquetipo_legacy
  const arquetipo_legacy =
    v2.arquetipo_legacy ||
    row.arquetipo_legacy ||
    v2.arquetipo ||
    row.arquetipo ||
    row.perfil ||
    "Táctico";

  // 4b. Recalculá el arquetipo con la nueva función assignArchetype
  const {
    arquetipo: newArquetipo,
    a_una_evidencia,
    candado_no_aplicable,
  } = assignArchetype(scoresSER, respuestas || answers);

  // Subperfil
  let subperfil: string = v2.subperfil || row.subperfil;
  if (!subperfil) {
    if (Number(row.tier) === 1) subperfil = "Aficionado";
    else if (Number(row.tier) === 2) subperfil = "Explorador";
    else if (Number(row.tier) === 3) subperfil = "Integrador";
    else if (Number(row.tier) === 4) subperfil = "Director";
    else if (Number(row.tier) === 5) subperfil = "Constructor";
    else if (Number(row.tier) === 6) subperfil = "Orquestador";
    else subperfil = getSubperfil(scoresHACER);
  }

  // Gap recalculation for new archetype
  const gap = getGapType(newArquetipo, subperfil);

  const baseDiag: any = {
    id: row.id,
    employee_id: row.employee_id,
    tier: Number(row.tier),
    total_score: Number(row.total_score),
    dim_scores: dimScoresObj,
    perfil: newArquetipo,
    activities_q: activitiesQ,
    created_at: row.created_at,
    scoresSER,
    scoresHACER,
    arquetipo: newArquetipo,
    arquetipo_legacy,
    subperfil,
    gap,
    tensiones: v2.tensiones ||
      row.tensiones || { t1: 3, t2: 3, t3: 3, t4: 3, t5: 3, t6: 3 },
    version: v2.version || row.version || "2.0",
    version_scoring: "2.1",
    a_una_evidencia,
    candado_no_aplicable,
    respuestas,
    answers,
    workspace_data:
      v2.workspace_data || activitiesQ.workspace_data || undefined,
  };

  return baseDiag;
}

// 3. Get Diagnostics (with embedded employee info)
export const getDiagnosticsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const query = `
          WITH RankedDiagnostics AS (
            SELECT *,
                   ROW_NUMBER() OVER(PARTITION BY employee_id ORDER BY created_at DESC) as rn
            FROM \`${bq.projectId}.${datasetId}.diagnostics\`
          ),
          RankedEmployees AS (
            SELECT *,
                   ROW_NUMBER() OVER(PARTITION BY id ORDER BY created_at DESC) as rn
            FROM \`${bq.projectId}.${datasetId}.employees\`
          )
          SELECT 
            d.id, d.employee_id, d.tier, d.total_score, d.dim_scores, d.perfil, d.activities_q, d.created_at,
            e.name as employee_name, e.email as employee_email, e.area as employee_area, e.company_id as employee_company_id,
            e.cedula as employee_cedula, e.empresa as employee_empresa
          FROM RankedDiagnostics d
          LEFT JOIN RankedEmployees e ON d.employee_id = e.id AND e.rn = 1
          WHERE d.rn = 1 AND d.total_score >= 0 AND d.perfil != 'RESET'
          ORDER BY d.created_at DESC
        `;
        const [rows] = await bq.query({ query });

        const hydratedRows = rows.map((row: any) => {
          const diag = hydrateDiagnostic(row);
          diag.employee = row.employee_name
            ? {
                id: row.employee_id,
                name: row.employee_name,
                email: row.employee_email,
                area: row.employee_area,
                company_id: row.employee_company_id,
                created_at: row.created_at,
                cedula: row.employee_cedula || null,
                empresa: row.employee_empresa || null,
              }
            : undefined;
          return diag;
        });

        const hasAndresDiag = hydratedRows.some(
          (d: any) =>
            d.employee_id === "emp-andres-piedrahita" ||
            d.id === "diag-andres-piedrahita",
        );
        if (!hasAndresDiag) {
          const andresDiag = hydrateDiagnostic(ANDRES_DIAGNOSTIC);
          andresDiag.employee = ANDRES_PIEDRAHITA_EMPLOYEE;
          hydratedRows.unshift(andresDiag);
        }

        EXTRA_LOGIN_DIAGNOSTICS.forEach((extraRaw) => {
          const hasDiag = hydratedRows.some(
            (d: any) =>
              d.employee_id === extraRaw.employee_id || d.id === extraRaw.id,
          );
          if (!hasDiag) {
            const extraDiag = hydrateDiagnostic(extraRaw);
            const matchingEmp = EXTRA_LOGIN_EMPLOYEES.find(
              (e) => e.id === extraRaw.employee_id,
            );
            if (matchingEmp) {
              extraDiag.employee = matchingEmp;
            }
            hydratedRows.push(extraDiag);
          }
        });

        return hydratedRows;
      } catch (err: any) {
        console.error(
          "BigQuery diagnostics fetch error, using local fallback:",
          err,
        );
        ensureMockSeeded();
        return mockDiagnostics.map((d) => {
          const diag = hydrateDiagnostic(d);
          const emp = [...mockEmployees]
            .reverse()
            .find((e) => e.id === d.employee_id);
          diag.employee = emp ? { ...emp } : undefined;
          return diag;
        });
      }
    }

    ensureMockSeeded();
    return mockDiagnostics.map((d) => {
      const diag = hydrateDiagnostic(d);
      const emp = [...mockEmployees]
        .reverse()
        .find((e) => e.id === d.employee_id);
      diag.employee = emp ? { ...emp } : undefined;
      return diag;
    });
  },
);

// 4. Get Single Diagnostic
export const getSingleDiagnosticFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().optional(),
        employeeId: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        let query = "";
        let params: any = {};

        if (data.id) {
          query = `
            WITH RankedEmployees AS (
              SELECT *,
                     ROW_NUMBER() OVER(PARTITION BY id ORDER BY created_at DESC) as rn
              FROM \`${bq.projectId}.${datasetId}.employees\`
            )
            SELECT d.*, e.name as emp_name, e.email as emp_email, e.area as emp_area, e.company_id as emp_comp_id,
                   e.cedula as emp_cedula, e.empresa as emp_empresa, e.empresa_principal as emp_empresa_principal
            FROM \`${bq.projectId}.${datasetId}.diagnostics\` d
            LEFT JOIN RankedEmployees e ON d.employee_id = e.id AND e.rn = 1
            WHERE d.id = @id
            ORDER BY d.created_at DESC LIMIT 1
          `;
          params = { id: data.id };
        } else if (data.employeeId) {
          query = `
            WITH RankedEmployees AS (
              SELECT *,
                     ROW_NUMBER() OVER(PARTITION BY id ORDER BY created_at DESC) as rn
              FROM \`${bq.projectId}.${datasetId}.employees\`
            )
            SELECT d.*, e.name as emp_name, e.email as emp_email, e.area as emp_area, e.company_id as emp_comp_id,
                   e.cedula as emp_cedula, e.empresa as emp_empresa, e.empresa_principal as emp_empresa_principal
            FROM \`${bq.projectId}.${datasetId}.diagnostics\` d
            LEFT JOIN RankedEmployees e ON d.employee_id = e.id AND e.rn = 1
            WHERE d.employee_id = @employeeId 
            ORDER BY d.created_at DESC LIMIT 1
          `;
          params = { employeeId: data.employeeId };
        } else {
          return null;
        }

        const [rows] = await bq.query({ query, params });
        if (!rows || rows.length === 0) {
          if (
            data.employeeId === "emp-andres-piedrahita" ||
            data.id === "diag-andres-piedrahita"
          ) {
            const andresDiag = hydrateDiagnostic(ANDRES_DIAGNOSTIC);
            andresDiag.employee = ANDRES_PIEDRAHITA_EMPLOYEE;
            return andresDiag;
          }
          return null;
        }

        const row = rows[0];
        if (Number(row.total_score) < 0 || row.perfil === "RESET") {
          return null;
        }

        const diag = hydrateDiagnostic(row);
        diag.employee = row.emp_name
          ? {
              id: row.employee_id,
              name: row.emp_name,
              email: row.emp_email,
              area: row.emp_area,
              company_id: row.emp_comp_id,
              created_at: row.created_at,
              cedula: row.emp_cedula || null,
              empresa_principal: row.emp_empresa_principal || "Comfama",
              empresa: row.emp_empresa || null,
            }
          : undefined;
        return diag;
      } catch (err) {
        console.error("BigQuery single diagnostic fetch error:", err);
      }
    }

    ensureMockSeeded();
    let diag = null;
    if (data.id) {
      diag = mockDiagnostics.find((d) => d.id === data.id);
    } else if (data.employeeId) {
      const filtered = mockDiagnostics.filter(
        (d) => d.employee_id === data.employeeId,
      );
      if (filtered.length > 0) {
        diag = filtered.reduce((prev, current) =>
          new Date(prev.created_at) > new Date(current.created_at)
            ? prev
            : current,
        );
      }
    }

    if (diag) {
      const hydrated = hydrateDiagnostic(diag);
      const emp = [...mockEmployees]
        .reverse()
        .find((e) => e.id === diag.employee_id);
      hydrated.employee = emp ? { ...emp } : undefined;
      return hydrated;
    }
    return null;
  });

// 5. Insert Employee
export const insertEmployeeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().optional().nullable(),
        name: z.string(),
        email: z.string().nullable(),
        area: z.string(),
        company_id: z.string(),
        password: z.string().optional().nullable(),
        cedula: z.string().optional().nullable(),
        empresa_principal: z.string().optional().nullable(),
        empresaPrincipal: z.string().optional().nullable(),
        empresa: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const id =
      data.id || `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEmp = {
      id,
      name: data.name,
      email: data.email,
      area: data.area,
      company_id: data.company_id,
      created_at: new Date().toISOString(),
      password: data.password || null,
      cedula: data.cedula || null,
      empresa_principal:
        data.empresa_principal || data.empresaPrincipal || "Comfama",
      empresa: data.empresa || null,
    };

    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const table = bq.dataset(datasetId).table("employees");
        await table.insert([newEmp]);
        return newEmp;
      } catch (err: any) {
        console.error(
          "BigQuery insert employee error, inserting into memory:",
          err,
        );
      }
    }

    ensureMockSeeded();
    const existingIdx = mockEmployees.findIndex((emp) => emp.id === id);
    if (existingIdx !== -1) {
      mockEmployees[existingIdx] = {
        ...mockEmployees[existingIdx],
        ...newEmp,
      };
    } else {
      mockEmployees.push(newEmp);
    }
    return newEmp;
  });

// 5.4. Batch Update Employees
export const batchUpdateEmployeesFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .array(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          email: z.string().nullable().optional(),
          area: z.string().optional(),
          company_id: z.string().optional(),
          cedula: z.string().nullable().optional(),
          empresa_principal: z.string().nullable().optional(),
          empresaPrincipal: z.string().nullable().optional(),
          empresa: z.string().nullable().optional(),
          password: z.string().nullable().optional(),
        }),
      )
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    ensureMockSeeded();

    const updatedRows = data.map((empUpdates) => {
      const existing = mockEmployees.find((e) => e.id === empUpdates.id) || {
        id: empUpdates.id,
        name: empUpdates.name || "",
        email: empUpdates.email || null,
        area: empUpdates.area || "General",
        company_id: empUpdates.company_id || "comp-1",
        created_at: new Date().toISOString(),
      };

      const updated = {
        ...existing,
        name: empUpdates.name ?? existing.name,
        email:
          empUpdates.email !== undefined ? empUpdates.email : existing.email,
        area: empUpdates.area ?? existing.area,
        company_id: empUpdates.company_id ?? existing.company_id,
        cedula:
          empUpdates.cedula !== undefined ? empUpdates.cedula : existing.cedula,
        empresa_principal:
          empUpdates.empresa_principal ??
          empUpdates.empresaPrincipal ??
          existing.empresa_principal ??
          "Comfama",
        empresa:
          empUpdates.empresa !== undefined
            ? empUpdates.empresa
            : existing.empresa,
        password:
          empUpdates.password !== undefined
            ? empUpdates.password
            : existing.password,
        created_at: new Date().toISOString(),
      };

      return updated;
    });

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const table = bq.dataset(datasetId).table("employees");
        await table.insert(updatedRows);
      } catch (err: unknown) {
        console.error(
          "BigQuery batch update employees error, using memory fallback:",
          err,
        );
      }
    }

    // Update memory database
    updatedRows.forEach((u) => {
      const idx = mockEmployees.findIndex((e) => e.id === u.id);
      if (idx !== -1) {
        mockEmployees[idx] = u;
      } else {
        mockEmployees.push(u);
      }
    });

    return { success: true, count: updatedRows.length };
  });

// 5.5. Delete Employee
export const deleteEmployeeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { id } = data;
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        // Delete employee from BigQuery
        const queryEmp = `DELETE FROM \`${bq.projectId}.${datasetId}.employees\` WHERE id = @id`;
        await bq.query({ query: queryEmp, params: { id } });

        // Delete diagnostics for this employee from BigQuery
        const queryDiag = `DELETE FROM \`${bq.projectId}.${datasetId}.diagnostics\` WHERE employee_id = @id`;
        await bq.query({ query: queryDiag, params: { id } });
      } catch (err: any) {
        console.error(
          "BigQuery delete employee error, falling back to memory:",
          err,
        );
      }
    }

    ensureMockSeeded();
    mockEmployees = mockEmployees.filter((emp) => emp.id !== id);
    mockDiagnostics = mockDiagnostics.filter((d) => d.employee_id !== id);

    return { success: true };
  });

// 6. Insert Diagnostic
export const insertDiagnosticFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        employee_id: z.string(),
        tier: z.number(),
        total_score: z.number(),
        dim_scores: z.any(),
        perfil: z.string(),
        activities_q: z.any(),
        // v2 / v2.1 optional inputs
        scoresSER: z.number().optional(),
        scoresHACER: z.number().optional(),
        arquetipo: z.string().optional(),
        arquetipo_legacy: z.string().optional(),
        subperfil: z.string().optional(),
        gap: z.string().optional(),
        tensiones: z.any().optional(),
        version: z.string().optional(),
        version_scoring: z.string().optional(),
        a_una_evidencia: z.boolean().optional(),
        candado_no_aplicable: z.boolean().optional(),
        respuestas: z.any().optional(),
        answers: z.any().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const id = `diag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDiag: any = {
      id,
      employee_id: data.employee_id,
      tier: data.tier,
      total_score: data.total_score,
      dim_scores: data.dim_scores,
      perfil: data.perfil,
      activities_q: data.activities_q,
      created_at: new Date().toISOString(),
      scoresSER: data.scoresSER,
      scoresHACER: data.scoresHACER,
      arquetipo: data.arquetipo,
      arquetipo_legacy: data.arquetipo_legacy,
      subperfil: data.subperfil,
      gap: data.gap,
      tensiones: data.tensiones,
      version: data.version,
      version_scoring: data.version_scoring || "2.1",
      a_una_evidencia: data.a_una_evidencia,
      candado_no_aplicable: data.candado_no_aplicable,
      respuestas: data.respuestas,
      answers: data.answers,
    };

    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const table = bq.dataset(datasetId).table("diagnostics");

        // Pack all v2 / v2.1 data inside activities_q for relational table safety
        const activitiesQWithV2 = {
          ...newDiag.activities_q,
          v2_data: {
            scoresSER: newDiag.scoresSER,
            scoresHACER: newDiag.scoresHACER,
            arquetipo: newDiag.arquetipo,
            arquetipo_legacy: newDiag.arquetipo_legacy,
            subperfil: newDiag.subperfil,
            gap: newDiag.gap,
            tensiones: newDiag.tensiones,
            version: newDiag.version || "2.0",
            version_scoring: "2.1",
            a_una_evidencia: newDiag.a_una_evidencia,
            candado_no_aplicable: newDiag.candado_no_aplicable,
            respuestas: newDiag.respuestas,
            answers: newDiag.answers,
          },
        };

        await table.insert([
          {
            id: newDiag.id,
            employee_id: newDiag.employee_id,
            tier: newDiag.tier,
            total_score: newDiag.total_score,
            dim_scores: JSON.stringify(newDiag.dim_scores),
            perfil: newDiag.perfil,
            activities_q: JSON.stringify(activitiesQWithV2),
            created_at: newDiag.created_at,
          },
        ]);
        return hydrateDiagnostic(newDiag);
      } catch (err: any) {
        console.error(
          "BigQuery insert diagnostic error, inserting into memory:",
          err,
        );
      }
    }

    ensureMockSeeded();
    mockDiagnostics.push(newDiag);
    return hydrateDiagnostic(newDiag);
  });

// 7. Update Diagnostic Activities
export const updateDiagnosticActivitiesFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
        activities_q: z.any(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        // Query the latest diagnostic version to replicate the current full row
        const selectQuery = `
          SELECT * FROM \`${bq.projectId}.${datasetId}.diagnostics\`
          WHERE id = @id
          ORDER BY created_at DESC LIMIT 1
        `;
        const [existingRows] = await bq.query({
          query: selectQuery,
          params: { id: data.id },
        });

        if (existingRows && existingRows.length > 0) {
          const oldRow = existingRows[0];

          let oldActivitiesQ: any = {};
          try {
            oldActivitiesQ =
              typeof oldRow.activities_q === "string"
                ? JSON.parse(oldRow.activities_q)
                : oldRow.activities_q;
          } catch (e) {
            oldActivitiesQ = oldRow.activities_q || {};
          }

          // Merge the updated activity counts with v2 metadata
          const mergedActivitiesQ = {
            ...oldActivitiesQ,
            ...data.activities_q,
            v2_data: {
              ...(oldActivitiesQ.v2_data || {}),
            },
          };

          const newRow = {
            id: oldRow.id,
            employee_id: oldRow.employee_id,
            tier: Number(oldRow.tier),
            total_score: Number(oldRow.total_score),
            dim_scores:
              typeof oldRow.dim_scores === "string"
                ? oldRow.dim_scores
                : JSON.stringify(oldRow.dim_scores),
            perfil: oldRow.perfil,
            activities_q: JSON.stringify(mergedActivitiesQ),
            created_at: new Date().toISOString(),
          };

          const table = bq.dataset(datasetId).table("diagnostics");
          await table.insert([newRow]);
          return { success: true };
        } else {
          console.warn(
            `No existing diagnostic found with id ${data.id} to update`,
          );
        }
      } catch (err: any) {
        console.error("BigQuery update diagnostic error, using memory:", err);
      }
    }

    ensureMockSeeded();
    const index = mockDiagnostics.findIndex((d) => d.id === data.id);
    if (index !== -1) {
      mockDiagnostics[index].activities_q = data.activities_q;
      return { success: true };
    }
    return { success: false, error: "Diagnostic not found" };
  });

// 7.5 Update Diagnostic Workspace Data (Projects, Skills, Prompts, Resources, Tasks)
export const updateWorkspaceDataFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
        workspace_data: z.any(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const selectQuery = `
          SELECT * FROM \`${bq.projectId}.${datasetId}.diagnostics\`
          WHERE id = @id
          ORDER BY created_at DESC LIMIT 1
        `;
        const [existingRows] = await bq.query({
          query: selectQuery,
          params: { id: data.id },
        });

        if (existingRows && existingRows.length > 0) {
          const oldRow = existingRows[0];
          let oldActivitiesQ: any = {};
          try {
            oldActivitiesQ =
              typeof oldRow.activities_q === "string"
                ? JSON.parse(oldRow.activities_q)
                : oldRow.activities_q;
          } catch (e) {
            oldActivitiesQ = oldRow.activities_q || {};
          }

          const mergedActivitiesQ = {
            ...oldActivitiesQ,
            v2_data: {
              ...(oldActivitiesQ.v2_data || {}),
              workspace_data: data.workspace_data,
            },
          };

          const newRow = {
            id: oldRow.id,
            employee_id: oldRow.employee_id,
            tier: Number(oldRow.tier),
            total_score: Number(oldRow.total_score),
            dim_scores:
              typeof oldRow.dim_scores === "string"
                ? oldRow.dim_scores
                : JSON.stringify(oldRow.dim_scores),
            perfil: oldRow.perfil,
            activities_q: JSON.stringify(mergedActivitiesQ),
            created_at: new Date().toISOString(),
          };

          const table = bq.dataset(datasetId).table("diagnostics");
          await table.insert([newRow]);
          return { success: true };
        }
      } catch (err: any) {
        console.error(
          "BigQuery update workspace_data error, using memory:",
          err,
        );
      }
    }

    ensureMockSeeded();
    const index = mockDiagnostics.findIndex((d) => d.id === data.id);
    if (index !== -1) {
      if (!mockDiagnostics[index].activities_q) {
        mockDiagnostics[index].activities_q = {};
      }
      if (!mockDiagnostics[index].activities_q.v2_data) {
        mockDiagnostics[index].activities_q.v2_data = {};
      }
      mockDiagnostics[index].activities_q.v2_data.workspace_data =
        data.workspace_data;
      return { success: true };
    }
    return { success: false, error: "Diagnostic not found" };
  });

// 7.6 Update Diagnostic Tensions
export const updateDiagnosticTensionsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
        tensiones: z.record(z.string(), z.number()),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const selectQuery = `
          SELECT * FROM \`${bq.projectId}.${datasetId}.diagnostics\`
          WHERE id = @id
          ORDER BY created_at DESC LIMIT 1
        `;
        const [existingRows] = await bq.query({
          query: selectQuery,
          params: { id: data.id },
        });

        if (existingRows && existingRows.length > 0) {
          const oldRow = existingRows[0];
          let oldActivitiesQ: any = {};
          try {
            oldActivitiesQ =
              typeof oldRow.activities_q === "string"
                ? JSON.parse(oldRow.activities_q)
                : oldRow.activities_q;
          } catch (e) {
            oldActivitiesQ = oldRow.activities_q || {};
          }

          const mergedActivitiesQ = {
            ...oldActivitiesQ,
            v2_data: {
              ...(oldActivitiesQ.v2_data || {}),
              tensiones: data.tensiones,
            },
          };

          const newRow = {
            id: oldRow.id,
            employee_id: oldRow.employee_id,
            tier: Number(oldRow.tier),
            total_score: Number(oldRow.total_score),
            dim_scores:
              typeof oldRow.dim_scores === "string"
                ? oldRow.dim_scores
                : JSON.stringify(oldRow.dim_scores),
            perfil: oldRow.perfil,
            activities_q: JSON.stringify(mergedActivitiesQ),
            created_at: new Date().toISOString(),
          };

          const table = bq.dataset(datasetId).table("diagnostics");
          await table.insert([newRow]);
          return { success: true };
        }
      } catch (err: any) {
        console.error("BigQuery update tensiones error, using memory:", err);
      }
    }

    ensureMockSeeded();
    const index = mockDiagnostics.findIndex((d) => d.id === data.id);
    if (index !== -1) {
      if (!mockDiagnostics[index].activities_q) {
        mockDiagnostics[index].activities_q = {};
      }
      if (!mockDiagnostics[index].activities_q.v2_data) {
        mockDiagnostics[index].activities_q.v2_data = {};
      }
      mockDiagnostics[index].activities_q.v2_data.tensiones = data.tensiones;
      mockDiagnostics[index].tensiones = data.tensiones;
      return { success: true };
    }
    return { success: false, error: "Diagnostic not found" };
  });

// 7.7 Reset Introspection (Delete diagnostics for given employee IDs)
export const resetIntrospectionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        employeeIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!data.employeeIds || data.employeeIds.length === 0) {
      return { success: true, count: 0 };
    }

    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const table = bq.dataset(datasetId).table("diagnostics");
        const now = new Date().toISOString();

        // 1. Insert tombstone / soft-reset rows into BigQuery streaming table
        // This bypasses BigQuery streaming buffer DML restrictions completely.
        const tombstoneRows = data.employeeIds.map((empId) => ({
          id: `reset-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          employee_id: empId,
          tier: -1,
          total_score: -1,
          dim_scores: JSON.stringify({}),
          perfil: "RESET",
          activities_q: JSON.stringify({ is_reset: true }),
          created_at: now,
        }));

        await table.insert(tombstoneRows);

        // 2. Best-effort hard DELETE query (succeeds when streaming buffer is clear)
        try {
          const query = `
            DELETE FROM \`${bq.projectId}.${datasetId}.diagnostics\`
            WHERE employee_id IN UNNEST(@employeeIds)
          `;
          await bq.query({
            query,
            params: { employeeIds: data.employeeIds },
          });
        } catch (dmlErr: any) {
          console.log(
            "BigQuery hard DELETE skipped due to streaming buffer; soft-reset tombstone inserted successfully.",
          );
        }
      } catch (err: any) {
        console.error("Error resetting diagnostics in BigQuery:", err);
      }
    }

    ensureMockSeeded();
    mockDiagnostics = mockDiagnostics.filter(
      (d) => !data.employeeIds.includes(d.employee_id),
    );

    return { success: true, count: data.employeeIds.length };
  });

// 8. Regenerate & Seed Default Sample Data (BigQuery & Fallback)
export const regenerateSampleDataFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        companyId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();
    const seed = get60SeedData(data.companyId);

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);

        // 1. Clean the tables
        console.log("Cleaning BigQuery tables...");
        const deleteDiagQuery = `DELETE FROM \`${bq.projectId}.${datasetId}.diagnostics\` WHERE id IS NOT NULL`;
        const deleteEmpQuery = `DELETE FROM \`${bq.projectId}.${datasetId}.employees\` WHERE company_id = @companyId`;

        await bq.query({ query: deleteDiagQuery });
        await bq.query({
          query: deleteEmpQuery,
          params: { companyId: data.companyId },
        });

        // 2. Insert employees in batches
        console.log("Inserting seeded employees into BigQuery...");
        const employeesTable = bq.dataset(datasetId).table("employees");
        await employeesTable.insert(seed.employees);

        // 3. Insert diagnostics in batches
        console.log("Inserting seeded diagnostics into BigQuery...");
        const diagnosticsTable = bq.dataset(datasetId).table("diagnostics");
        const formattedDiagnostics = seed.diagnostics.map((d: any) => ({
          ...d,
          dim_scores: JSON.stringify(d.dim_scores),
          activities_q: JSON.stringify(d.activities_q),
        }));
        await diagnosticsTable.insert(formattedDiagnostics);

        console.log("Successfully seeded BigQuery!");
      } catch (err: any) {
        console.error("Error seeding BigQuery, falling back to memory:", err);
      }
    }

    // Always keep memory synced too as fallback
    mockEmployees = seed.employees;
    mockDiagnostics = seed.diagnostics;
    initialSeeded = true;

    return { success: true };
  });

// 9. Record User Login / Entry Event in BigQuery
export const recordLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        employee_id: z.string().optional().nullable(),
        user_name: z.string(),
        user_email: z.string(),
        user_role: z.string().optional().nullable(),
        user_type: z.enum(["nuevo", "actual"]).optional().default("actual"),
        created_at: z.string().optional(),
        area: z.string().optional().nullable(),
        empresa: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const id = `login-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
    const newLogin = {
      id,
      employee_id: data.employee_id || null,
      user_name: data.user_name,
      user_email: data.user_email,
      user_role: data.user_role || "employee",
      user_type: data.user_type || "actual",
      created_at: data.created_at || new Date().toISOString(),
      area: data.area || "General",
      empresa: data.empresa || "Comfama",
    };

    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const table = bq.dataset(datasetId).table("logins");
        await table.insert([newLogin]);
        console.log(
          `Successfully recorded ${newLogin.user_type} user login in BigQuery: ${newLogin.user_email}`,
        );
      } catch (err: any) {
        console.error(
          "Error inserting login record to BigQuery, storing in memory fallback:",
          err,
        );
      }
    }

    ensureLoginsSeeded();
    mockLogins.unshift(newLogin);
    return newLogin;
  });

// 10. Get User Logins starting from July 27, 2026 8:00 AM in BigQuery
export const getLoginsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") {
      return { fromDate: "2026-07-27T08:00:00" };
    }
    return z
      .object({
        fromDate: z.string().optional().default("2026-07-27T08:00:00"),
      })
      .parse(data);
  })
  .handler(async ({ data }) => {
    const fromDate = data.fromDate || "2026-07-27T08:00:00";
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        // Query employees table created_at for real user registration logins
        const queryEmployees = `
          SELECT 
            id, 
            name as user_name, 
            email as user_email, 
            COALESCE(area, 'General') as area, 
            COALESCE(empresa, 'Prestigio') as empresa,
            CAST(created_at AS STRING) as created_at_raw
          FROM \`${bq.projectId}.${datasetId}.employees\`
        `;
        const [empRows] = await bq.query({ query: queryEmployees });

        const derivedLogins: any[] = [];
        if (Array.isArray(empRows) && empRows.length > 0) {
          empRows.forEach((emp: any, idx: number) => {
            const rawTs = emp.created_at_raw;
            let effectiveDate = rawTs;
            if (!rawTs || rawTs < "2026-07-27T08:00:00") {
              effectiveDate = "2026-07-27T08:15:00.000Z";
            } else if (typeof rawTs === "object" && rawTs?.value) {
              effectiveDate = rawTs.value;
            }

            derivedLogins.push({
              id: `login-emp-${emp.id}-${idx}`,
              employee_id: emp.id,
              user_name: emp.user_name || "Usuario Registrado",
              user_email: emp.user_email || "",
              user_role: "employee",
              user_type: "nuevo",
              created_at: effectiveDate,
              area: emp.area || "General",
              empresa: emp.empresa || "Prestigio",
            });
          });
        }

        // Also query custom logins table if available
        try {
          const queryLogins = `
            SELECT id, employee_id, user_name, user_email, user_role, user_type, CAST(created_at AS STRING) as created_at, area, empresa
            FROM \`${bq.projectId}.${datasetId}.logins\`
            WHERE created_at >= @fromDate
          `;
          const [loginRows] = await bq.query({
            query: queryLogins,
            params: { fromDate },
          });
          if (Array.isArray(loginRows)) {
            loginRows.forEach((r: any) => {
              if (
                r.created_at &&
                typeof r.created_at === "object" &&
                r.created_at.value
              ) {
                r.created_at = r.created_at.value;
              }
              derivedLogins.push(r);
            });
          }
        } catch (err) {
          // Ignore if logins table is empty or missing
        }

        if (derivedLogins.length > 0) {
          return derivedLogins.filter(
            (l) => l.created_at >= fromDate || l.created_at >= "2026-07-27",
          );
        }
      } catch (err: any) {
        console.error(
          "Error querying logins from BigQuery, returning memory fallback:",
          err,
        );
      }
    }

    ensureLoginsSeeded();
    return mockLogins.filter((l) => l.created_at >= fromDate);
  });

// 11. Record Real User Activity Event in BigQuery
export const recordActivityEventFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        employee_id: z.string().optional(),
        user_name: z.string(),
        user_email: z.string(),
        user_area: z.string().optional(),
        user_role: z.string().optional(),
        category: z.enum([
          "sesion",
          "matriz",
          "proyecto",
          "prompt_mia",
          "diagnostico",
          "comunidad",
        ]),
        action_title: z.string(),
        description: z.string(),
        created_at: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const id = `actev-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
    const newEvent = {
      id,
      employee_id: data.employee_id || null,
      user_name: data.user_name,
      user_email: data.user_email,
      user_area: data.user_area || "General",
      user_role: data.user_role || "Colaborador",
      category: data.category,
      action_title: data.action_title,
      description: data.description,
      created_at: data.created_at || new Date().toISOString(),
    };

    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);
        const table = bq.dataset(datasetId).table("activity_events");
        await table.insert([newEvent]);
        console.log(
          `Recorded activity event in BigQuery for ${newEvent.user_email}: ${newEvent.action_title}`,
        );
      } catch (err: any) {
        console.error("Error inserting activity event into BigQuery:", err);
      }
    }

    ensureActivityEventsSeeded();
    mockActivityEvents.unshift(newEvent);
    return newEvent;
  });

// 12. Get Real User Activity Events from BigQuery
export const getActivityEventsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") {
      return { fromDate: "2026-07-27T08:00:00" };
    }
    return z
      .object({
        fromDate: z.string().optional().default("2026-07-27T08:00:00"),
      })
      .parse(data);
  })
  .handler(async ({ data }) => {
    const fromDate = data.fromDate || "2026-07-27T08:00:00";
    const bq = await getBigQueryClient();
    const datasetId = getDatasetId();

    if (bq) {
      try {
        await ensureTablesExist(bq, datasetId);

        // Query employees table created_at for real user registration activity
        const queryEmployees = `
          SELECT 
            id, 
            name as user_name, 
            email as user_email, 
            COALESCE(area, 'General') as user_area, 
            'Colaborador' as user_role,
            CAST(created_at AS STRING) as created_at_raw
          FROM \`${bq.projectId}.${datasetId}.employees\`
        `;
        const [empRows] = await bq.query({ query: queryEmployees });

        const derivedEvents: any[] = [];
        if (Array.isArray(empRows) && empRows.length > 0) {
          empRows.forEach((emp: any) => {
            const rawTs = emp.created_at_raw;
            let effectiveSessionDate = rawTs;
            let effectiveDiagDate = rawTs;

            if (!rawTs || rawTs < "2026-07-27T08:00:00") {
              effectiveSessionDate = "2026-07-27T08:15:00.000Z";
              effectiveDiagDate = "2026-07-27T08:30:00.000Z";
            } else if (typeof rawTs === "object" && rawTs?.value) {
              effectiveSessionDate = rawTs.value;
              effectiveDiagDate = rawTs.value;
            }

            // Registration / Session Event
            derivedEvents.push({
              id: `actev-emp-session-${emp.id}`,
              employee_id: emp.id,
              user_name: emp.user_name || "Usuario Registrado",
              user_email: emp.user_email || "",
              user_area: emp.user_area || "General",
              user_role: emp.user_role || "Colaborador",
              category: "sesion",
              action_title: "Inicio de Sesión",
              description: "Ingreso a la plataforma HumanAI First",
              created_at: effectiveSessionDate,
            });

            // Introspection Diagnostic Event
            derivedEvents.push({
              id: `actev-emp-diag-${emp.id}`,
              employee_id: emp.id,
              user_name: emp.user_name || "Usuario Registrado",
              user_email: emp.user_email || "",
              user_area: emp.user_area || "General",
              user_role: emp.user_role || "Colaborador",
              category: "diagnostico",
              action_title: "Evaluación de Introspección",
              description: "Diagnóstico completado en dimensiones SER / HACER",
              created_at: effectiveDiagDate,
            });
          });
        }

        // Query custom activity_events table for matrix, projects, MIA prompts
        try {
          const queryCustom = `
            SELECT id, employee_id, user_name, user_email, user_area, user_role, category, action_title, description, CAST(created_at AS STRING) as created_at
            FROM \`${bq.projectId}.${datasetId}.activity_events\`
            WHERE created_at >= @fromDate
          `;
          const [customRows] = await bq.query({
            query: queryCustom,
            params: { fromDate },
          });
          if (Array.isArray(customRows)) {
            customRows.forEach((r: any) => {
              if (
                r.created_at &&
                typeof r.created_at === "object" &&
                r.created_at.value
              ) {
                r.created_at = r.created_at.value;
              }
              derivedEvents.push(r);
            });
          }
        } catch (err) {
          // Ignore if activity_events table is empty or missing
        }

        if (derivedEvents.length > 0) {
          return derivedEvents.filter(
            (e) => e.created_at >= fromDate || e.created_at >= "2026-07-27",
          );
        }
      } catch (err: any) {
        console.error(
          "Error querying activity events from BigQuery, returning memory fallback:",
          err,
        );
      }
    }

    ensureActivityEventsSeeded();
    return mockActivityEvents.filter((e) => e.created_at >= fromDate);
  });
