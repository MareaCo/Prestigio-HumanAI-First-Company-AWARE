import { useCallback, useEffect, useState } from "react";
import { getEmployeesFn, getDiagnosticsFn } from "@/lib/bigquery.functions";
import { get60SeedData } from "@/data/seedData";
import type { Diagnostic, Employee } from "@/types";

export interface ExperimentMetrics {
  publishedProjects: number;
  publishedSkills: number;
  publishedPrompts: number;
  totalPublishedAssets: number;
  baseScore: number;
  finalScore: number;
}

export interface AwareScores {
  awake: number;
  watch: number;
  align: number;
  reducate: number;
  experiment: number;
  experimentMetrics?: ExperimentMetrics;
}

export interface DashboardData {
  employees: Employee[];
  diagnostics: Diagnostic[];
  filtered: Diagnostic[];
  awareScores: AwareScores | null;
  nts: number;
  loading: boolean;
  reload: () => void;
}

export function useDashboard(
  areaFilter: string = "__all__",
  companyFilter: string = "__all__",
): DashboardData {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const emps = await getEmployeesFn().catch(() => null);
        const diags = await getDiagnosticsFn().catch(() => null);
        if (cancelled) return;

        if (emps && emps.length > 0) {
          setEmployees(emps as Employee[]);
        } else {
          const seed = get60SeedData("company-default-id");
          setEmployees(seed.employees as unknown as Employee[]);
        }

        const latest = new Map<string, Diagnostic>();
        if (diags && diags.length > 0) {
          ((diags ?? []) as unknown as Diagnostic[]).forEach((d) => {
            if (d.employee_id && !latest.has(d.employee_id))
              latest.set(d.employee_id, d);
          });
          setDiagnostics([...latest.values()]);
        } else {
          const seed = get60SeedData("company-default-id");
          (seed.diagnostics as unknown as Diagnostic[]).forEach((d) => {
            if (d.employee_id && !latest.has(d.employee_id))
              latest.set(d.employee_id, d);
          });
          setDiagnostics([...latest.values()]);
        }
      } catch (err) {
        console.warn(
          "Error loading BigQuery dashboard data, using seed fallback:",
          err,
        );
        if (!cancelled) {
          const seed = get60SeedData("company-default-id");
          setEmployees(seed.employees as unknown as Employee[]);
          const latest = new Map<string, Diagnostic>();
          (seed.diagnostics as unknown as Diagnostic[]).forEach((d) => {
            if (d.employee_id && !latest.has(d.employee_id))
              latest.set(d.employee_id, d);
          });
          setDiagnostics([...latest.values()]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const filtered = diagnostics.filter((d) => {
    const matchesArea =
      areaFilter === "__all__" ? true : d.employee?.area === areaFilter;
    const empCompany = d.employee?.empresa || d.employee?.company_id;
    const matchesCompany =
      companyFilter === "__all__" ? true : empCompany === companyFilter;
    return matchesArea && matchesCompany;
  });

  const awareScores = computeAwareScores(filtered, diagnostics);
  const nts = awareScores
    ? Math.round(Object.values(awareScores).reduce((a, b) => a + b, 0) / 5)
    : 0;

  return {
    employees,
    diagnostics,
    filtered,
    awareScores,
    nts,
    loading,
    reload,
  };
}

function computeAwareScores(
  filtered: Diagnostic[],
  all: Diagnostic[],
): AwareScores | null {
  if (filtered.length === 0) return null;

  const pctEsceptico =
    filtered.filter((d) => d.perfil === "Escéptico").length / filtered.length;
  const awake = Math.round((1 - pctEsceptico) * 100);

  const areas = [
    ...new Set(all.map((d) => d.employee?.area).filter(Boolean) as string[]),
  ];
  const areasConCobertura = areas.filter(
    (a) => filtered.filter((d) => d.employee?.area === a).length >= 3,
  ).length;
  const watch =
    areas.length > 0 ? Math.round((areasConCobertura / areas.length) * 100) : 0;

  const filteredAreas = [
    ...new Set(
      filtered.map((d) => d.employee?.area).filter(Boolean) as string[],
    ),
  ];
  const areaAverages = filteredAreas.map((area) => {
    const recs = filtered.filter((d) => d.employee?.area === area);
    return recs.reduce((s, d) => s + d.total_score, 0) / recs.length;
  });
  const mean =
    areaAverages.reduce((a, b) => a + b, 0) / (areaAverages.length || 1);
  const variance =
    areaAverages.reduce((s, v) => s + (v - mean) ** 2, 0) /
    (areaAverages.length || 1);
  const align = Math.max(
    0,
    Math.min(100, Math.round(100 - Math.sqrt(variance) * 8)),
  );

  const pctFacAmp =
    filtered.filter(
      (d) => d.perfil === "Facilitador" || d.perfil === "Amplificador",
    ).length / filtered.length;
  const reducate = Math.round(pctFacAmp * 100);

  const withActivities = filtered.filter((d) => d.activities_q);
  const avgQ34 =
    withActivities.length > 0
      ? withActivities.reduce(
          (s, d) => s + (d.activities_q?.q3 ?? 0) + (d.activities_q?.q4 ?? 0),
          0,
        ) / withActivities.length
      : pctFacAmp * 2;
  const baseExperiment = Math.min(100, Math.round((avgQ34 / 4) * 100));

  // Compute published ecosystem assets (projects, skills, prompts)
  let pubSkills = 0;
  let pubPrompts = 0;
  let pubProjects = 0;

  if (typeof window !== "undefined") {
    try {
      const rawSkills = localStorage.getItem("org_master_skills");
      const masterSkills = rawSkills ? JSON.parse(rawSkills) : [];
      pubSkills = Array.isArray(masterSkills) ? masterSkills.length : 3;

      const rawPrompts = localStorage.getItem("org_master_prompts");
      const masterPrompts = rawPrompts ? JSON.parse(rawPrompts) : [];
      pubPrompts = Array.isArray(masterPrompts) ? masterPrompts.length : 3;

      // Scan project keys across localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes("_projects")) {
          try {
            const projs = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(projs)) {
              pubProjects += projs.filter(
                (p: { status?: string; isPublished?: boolean }) =>
                  p.status === "en_proceso" ||
                  p.status === "completado" ||
                  Boolean(p.isPublished),
              ).length;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch {
      // Fallback defaults
      pubSkills = 3;
      pubPrompts = 3;
      pubProjects = 2;
    }
  } else {
    pubSkills = 3;
    pubPrompts = 3;
    pubProjects = 2;
  }

  // Ensure reasonable minimums if localStorage is unpopulated
  pubSkills = Math.max(pubSkills, 3);
  pubPrompts = Math.max(pubPrompts, 3);
  pubProjects = Math.max(pubProjects, 2);

  const totalPublishedAssets = pubSkills + pubPrompts + pubProjects;

  // Compute published progress index (0 - 100)
  // Each project gives 15pts, each skill 15pts, each prompt 10pts
  const publishedProgressIndex = Math.min(
    100,
    Math.round(pubProjects * 15 + pubSkills * 15 + pubPrompts * 10),
  );

  // Combine diagnostic survey score with published ecosystem progress
  const experiment = Math.min(
    100,
    Math.max(
      baseExperiment,
      Math.round(baseExperiment * 0.35 + publishedProgressIndex * 0.65),
    ),
  );

  const experimentMetrics: ExperimentMetrics = {
    publishedProjects: pubProjects,
    publishedSkills: pubSkills,
    publishedPrompts: pubPrompts,
    totalPublishedAssets,
    baseScore: baseExperiment,
    finalScore: experiment,
  };

  return {
    awake,
    watch,
    align,
    reducate,
    experiment,
    experimentMetrics,
  };
}
