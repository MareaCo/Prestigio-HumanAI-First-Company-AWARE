import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Footer } from "@/components/Footer";
import { ReportContent } from "@/screens/Report";
import {
  getSingleDiagnosticFn,
  getDiagnosticsFn,
} from "@/lib/bigquery.functions";
import {
  DIMENSIONS,
  DIM_MAX,
  PERFIL_CONFIG,
  TIER_COLORS,
  TIER_COLORS_LIGHT,
  TIER_NAMES,
} from "@/data/constants";
import type { Diagnostic, DimScores } from "@/types";

const QUADS = [
  {
    key: "q2",
    label: "Q2 · Asistentes & Asistentes Especializados",
    light: "#FEF6E6",
    dark: "#854F0B",
  },
  {
    key: "q4",
    label: "Q4 · Agentes & Generación de Código",
    light: "#E6F2FB",
    dark: "#0C447C",
  },
  { key: "q1", label: "Q1 · Ridiculist", light: "#FDECEA", dark: "#993C1D" },
  {
    key: "q3",
    label: "Q3 · Automatización",
    light: "#E6F5F0",
    dark: "#085041",
  },
] as const;

export function EmployeeDetailScreen() {
  const { currentEmployeeId, navigateTo, role, logout } = useApp();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [companyDiags, setCompanyDiags] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentEmployeeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [diag, all] = await Promise.all([
        getSingleDiagnosticFn({ data: { employeeId: currentEmployeeId! } }),
        getDiagnosticsFn(),
      ]);
      if (cancelled) return;
      setDiagnostic((diag as unknown as Diagnostic) ?? null);
      // Deduplicate latest per employee
      const latest = new Map<string, Diagnostic>();
      ((all ?? []) as unknown as Diagnostic[]).forEach((d) => {
        if (d.employee_id && !latest.has(d.employee_id))
          latest.set(d.employee_id, d);
      });
      setCompanyDiags([...latest.values()]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentEmployeeId]);

  const companyAvg = useMemo<DimScores>(() => {
    const base: DimScores = {
      Contexto: 0,
      Mentalidad: 0,
      Emocionalidad: 0,
      Datos: 0,
      Automatización: 0,
      Calidad: 0,
      Autonomía: 0,
      Liderazgo: 0,
    };
    if (companyDiags.length === 0) return base;
    companyDiags.forEach((d) => {
      DIMENSIONS.forEach((dim) => {
        base[dim] += Number(d.dim_scores?.[dim] ?? 0);
      });
    });
    DIMENSIONS.forEach((dim) => {
      base[dim] = Math.round((base[dim] / companyDiags.length) * 10) / 10;
    });
    return base;
  }, [companyDiags]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink flex flex-col justify-between">
        <div
          className="mx-auto w-full flex-1 flex flex-col justify-between"
          style={{ maxWidth: 680, padding: "1.5rem 1.5rem 3rem" }}
        >
          <div className="flex-1">
            <p className="text-ink-muted text-sm mt-6">Cargando…</p>
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  if (!diagnostic) {
    return (
      <main className="min-h-screen bg-cream text-ink flex flex-col justify-between">
        <div
          className="mx-auto w-full flex-1 flex flex-col justify-between"
          style={{ maxWidth: 680, padding: "1.5rem 1.5rem 3rem" }}
        >
          <div className="flex-1">
            {role === "admin" ? (
              <button
                onClick={() => navigateTo("dashboard")}
                className="text-[12px] text-ink-muted hover:text-ink mb-4 block"
              >
                ← Volver al tablero
              </button>
            ) : (
              <button
                onClick={() => navigateTo("user-workspace")}
                className="text-[12px] text-ink-muted hover:text-ink mb-4 block font-medium flex items-center gap-1"
              >
                ← Volver a Mi Espacio
              </button>
            )}
            <EmptyDetail
              onQuiz={() =>
                navigateTo("quiz", {
                  currentEmployeeId: currentEmployeeId ?? null,
                })
              }
            />
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  return <ReportContent diagnostic={diagnostic} />;
}

function HeaderCard({
  diagnostic,
  onUpdate,
}: {
  diagnostic: Diagnostic;
  onUpdate: () => void;
}) {
  const { navigateTo } = useApp();
  const tierIdx = diagnostic.tier - 1;
  const tierColor = TIER_COLORS[tierIdx];
  const tierLight = TIER_COLORS_LIGHT[tierIdx];
  const cfg = PERFIL_CONFIG[diagnostic.perfil];
  const date = new Date(diagnostic.created_at).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="bg-white"
      style={{ borderRadius: 16, padding: "1.5rem", marginBottom: 14 }}
    >
      <div className="flex items-center" style={{ gap: 14 }}>
        <div
          className="flex items-center justify-center text-white font-bold font-display uppercase"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: cfg.dark,
            fontSize: 20,
          }}
        >
          {((diagnostic.employee?.name || "").trim().split(/\s+/)[0] || "E")
            .charAt(0)
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="font-display truncate"
            style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.15 }}
          >
            {diagnostic.employee?.name ?? "Empleado"}
          </h2>
          <p className="text-ink-muted" style={{ fontSize: 12, marginTop: 2 }}>
            {diagnostic.employee?.area ?? "—"} · {date}
          </p>
        </div>
        <span
          className="rounded-full font-medium"
          style={{
            background: cfg.light,
            color: cfg.dark,
            padding: "4px 10px",
            fontSize: 11,
          }}
        >
          {diagnostic.perfil}
        </span>
      </div>

      <div
        style={{
          background: tierLight,
          borderRadius: 10,
          padding: "0.9rem 1rem",
          marginTop: 16,
        }}
        className="flex items-center justify-between"
      >
        <div>
          <span
            className="font-display font-bold"
            style={{ fontSize: "1.6rem", color: tierColor, lineHeight: 1 }}
          >
            {diagnostic.total_score}
          </span>
          <span className="text-ink-muted" style={{ fontSize: "1rem" }}>
            /60
          </span>
          <p style={{ fontSize: 11, color: cfg.dark, marginTop: 4 }}>
            Subperfil: {TIER_NAMES[tierIdx]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              navigateTo("report", {
                latestDiagnosticId: diagnostic.id,
                returnScreen: "employee-detail",
              })
            }
            className="rounded-[8px] bg-ink text-white hover:bg-ink-soft transition-all text-[12px] font-medium"
            style={{ padding: "8px 14px" }}
          >
            Ver reporte completo →
          </button>
          <button
            onClick={onUpdate}
            className="rounded-[8px] border border-ink text-ink hover:bg-ink hover:text-white transition-colors text-[12px] font-medium"
            style={{ padding: "8px 14px" }}
          >
            ↻ Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}

function DimensionsCard({
  diagnostic,
  companyAvg,
}: {
  diagnostic: Diagnostic;
  companyAvg: DimScores;
}) {
  const tierColor = TIER_COLORS[diagnostic.tier - 1];
  const name = diagnostic.employee?.name ?? "Empleado";

  return (
    <div
      className="bg-white"
      style={{ borderRadius: 16, padding: "1.5rem", marginBottom: 14 }}
    >
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Dimensiones
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Esta persona vs. promedio de la compañía
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {DIMENSIONS.map((d) => {
          const my = Number(diagnostic.dim_scores?.[d] ?? 0);
          const avg = companyAvg[d];
          const max = DIM_MAX[d];
          return (
            <div key={d} className="flex items-center gap-3">
              <div style={{ width: 90 }} className="text-[12px] text-ink-soft">
                {d}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(my / max) * 100}%`,
                      background: tierColor,
                    }}
                  />
                </div>
                <div className="h-2 rounded-full bg-ink/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(avg / max) * 100}%`,
                      background: "#B8B4AD",
                    }}
                  />
                </div>
              </div>
              <div
                className="text-[11px] text-ink-muted text-right"
                style={{ width: 56 }}
              >
                <div className="text-ink">
                  {my}/{max}
                </div>
                <div>
                  {avg}/{max}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: tierColor }}
          />
          {name}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: "#B8B4AD" }}
          />
          Promedio compañía
        </span>
      </div>
    </div>
  );
}

function ActivitiesCard({ diagnostic }: { diagnostic: Diagnostic }) {
  const q = diagnostic.activities_q ?? { q1: 0, q2: 0, q3: 0, q4: 0 };
  return (
    <div className="bg-white" style={{ borderRadius: 16, padding: "1.5rem" }}>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Matriz de actividades
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Actividades mapeadas por cuadrante
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {QUADS.map((quad) => {
          const value = Number(
            (q as unknown as Record<string, number>)[quad.key] ?? 0,
          );
          return (
            <div
              key={quad.key}
              style={{
                background: quad.light,
                borderRadius: 12,
                padding: "1rem",
              }}
            >
              <div
                className="font-display font-bold leading-none"
                style={{ fontSize: "2rem", color: quad.dark }}
              >
                {value}
              </div>
              <div
                className="mt-2 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: quad.dark }}
              >
                {quad.label}
              </div>
              <div
                className="text-[11px]"
                style={{ color: quad.dark, opacity: 0.7 }}
              >
                {value === 1 ? "actividad" : "actividades"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyDetail({ onQuiz }: { onQuiz: () => void }) {
  return (
    <div
      className="bg-white text-center"
      style={{ borderRadius: 16, padding: "3rem 1.5rem" }}
    >
      <h2 className="font-display text-[1.4rem] font-bold">
        Este empleado aún no tiene diagnóstico
      </h2>
      <p className="mt-2 text-[13px] text-ink-soft">
        Inicia el cuestionario para generarlo.
      </p>
      <button
        onClick={onQuiz}
        className="mt-6 rounded-[8px] bg-ink text-white font-medium hover:bg-ink-soft"
        style={{ padding: "10px 18px", fontSize: 13 }}
      >
        Iniciar diagnóstico →
      </button>
    </div>
  );
}
