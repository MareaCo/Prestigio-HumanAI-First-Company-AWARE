import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useDashboard } from "@/hooks/useDashboard";
import { NewEmployeeModal } from "@/components/NewEmployeeModal";
import { AppSidebar } from "@/components/AppSidebar";
import { AwareAccordions } from "@/components/dashboard/AwareAccordions";
import { AwareGrid } from "@/components/dashboard/AwareGrid";
import { DiagnosticBoard } from "@/components/dashboard/DiagnosticBoard";
import { CompanyBanner } from "@/components/dashboard/TeamSection";
import { CollaboratorActivityTrackingCard } from "@/components/dashboard/CollaboratorActivityTrackingCard";
import { Footer } from "@/components/Footer";
import { Users, Sparkles } from "lucide-react";
import { PrestigioLogo } from "@/components/PrestigioLogo";

import { regenerateSampleDataFn } from "@/lib/bigquery.functions";

const NTS_COLOR = (v: number) =>
  v >= 70 ? "text-tier4" : v >= 40 ? "text-tier3" : "text-tier1";

export function DashboardScreen() {
  const {
    screen,
    areaFilter,
    setAreaFilter,
    companyFilter,
    setCompanyFilter,
    companyId,
    navigateTo,
  } = useApp();
  const {
    employees,
    diagnostics,
    filtered,
    awareScores,
    nts,
    loading,
    reload,
  } = useDashboard(areaFilter, companyFilter);
  const [modalOpen, setModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const companiesWithData = useMemo(
    () =>
      [
        ...new Set(
          diagnostics
            .map((d) => d.employee?.empresa || d.employee?.company_id)
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [diagnostics],
  );

  const areasWithData = useMemo(
    () =>
      [
        ...new Set(
          diagnostics.map((d) => d.employee?.area).filter(Boolean) as string[],
        ),
      ].sort(),
    [diagnostics],
  );

  const displayName =
    companyFilter === "__all__" && areaFilter === "__all__"
      ? "Toda la compañía"
      : companyFilter !== "__all__" && areaFilter !== "__all__"
        ? `${companyFilter} — ${areaFilter}`
        : companyFilter !== "__all__"
          ? companyFilter
          : areaFilter;

  async function regenerateSampleData() {
    if (!companyId) return;
    setSeeding(true);
    try {
      await regenerateSampleDataFn({ data: { companyId } });
      reload();
    } catch (err) {
      console.error("Error regenerating sample data in BigQuery:", err);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink flex">
      <AppSidebar
        activeScreen="dashboard"
        onRegenerate={regenerateSampleData}
        seeding={seeding}
      />

      <div className="flex-1 mx-auto max-w-[1100px] px-3 sm:px-6 py-4 sm:py-8 w-full min-w-0 flex flex-col justify-between overflow-x-hidden">
        {/* Topbar */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0 max-w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full">
            <PrestigioLogo size="sm" showTagline={true} className="shrink-0" />
            <div className="border-l border-ink/20 pl-2.5 sm:pl-3.5 py-0.5 min-w-0">
              <h1 className="font-poppins text-[11px] sm:text-[1.1rem] font-bold leading-tight text-[#545759] flex flex-wrap items-center gap-x-1">
                <span className="whitespace-nowrap text-[#545759] flex items-center">
                  HumanAI First Company
                  <span className="text-[28px] sm:text-[30px] font-extrabold ml-0.5 text-[#545759] inline-block align-middle leading-none relative -top-[2px]">
                    ®
                  </span>
                </span>
                <span className="whitespace-nowrap font-medium sm:font-bold text-[#545759]">
                  by Prestigio
                </span>
              </h1>
              <p className="text-[8px] sm:text-[9.5px] uppercase tracking-wider sm:tracking-widest text-ink-muted mt-0.5 font-semibold truncate">
                GOBERNANZA Y OBSERVABILIDAD
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="text-ink-muted text-sm">Cargando tablero…</p>
        ) : diagnostics.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : (
          <>
            {/* Tarjetas de Metodología AWARE */}
            <div className="mb-6">
              <AwareGrid scores={awareScores} diagnostics={filtered} />
            </div>

            {/* Tablero Diagnóstico (Imagen 2) */}
            <div className="mb-6">
              <DiagnosticBoard scores={awareScores} />
            </div>

            {/* Filter bar (Imagen 1) */}
            <div className="mb-6 flex flex-wrap justify-end items-center gap-3 sm:gap-5 min-w-0">
              {/* Company Filter */}
              <label className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                <span className="text-[11px] uppercase tracking-widest text-ink-muted shrink-0">
                  Filtrar por empresa
                </span>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="h-9 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink w-full sm:w-auto min-w-0 truncate"
                >
                  <option value="__all__">Todas las empresas</option>
                  {companiesWithData.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              {/* Area Filter */}
              <label className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                <span className="text-[11px] uppercase tracking-widest text-ink-muted shrink-0">
                  Filtrar por área
                </span>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="h-9 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink w-full sm:w-auto min-w-0 truncate"
                >
                  <option value="__all__">Todas · Vista Admin/RRHH</option>
                  {areasWithData.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Banner Vista General (Imagen 3) */}
            <div className="mb-6">
              <CompanyBanner
                areaName={displayName}
                isCompanyWide={
                  companyFilter === "__all__" && areaFilter === "__all__"
                }
              />
            </div>

            {/* Seguimiento de Apropiación y Actividad Temporal */}
            <div className="mb-6">
              <CollaboratorActivityTrackingCard
                employees={employees}
                diagnostics={diagnostics}
                onOpenEmployeeDetail={(id) =>
                  navigateTo("employee-detail", { currentEmployeeId: id })
                }
              />
            </div>

            {/* Acordeones AWARE con KPIs gráficos (AWAKE: Perfiles, WATCH: Tensiones, ALIGN: Actividades) */}
            <div className="mb-6">
              <AwareAccordions
                scores={awareScores}
                diagnostics={filtered}
                allDiagnostics={diagnostics}
                areaName={displayName}
                hideAreaAlignmentBreakdown={true}
                hideRegisteredProjects={true}
                hidePlanesSummaryCard={true}
                hideAreaLearningBreakdown={true}
                hideIndividualLearningPlans={true}
                hideExperimentSummaryCard={true}
                hideDynamismByArea={true}
                hideOpenCatalog={true}
              />
            </div>
          </>
        )}
        <Footer />
      </div>

      <NewEmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueClass,
  small,
}: {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded-[14px] p-5 border border-ink/5 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p
        className={`mt-2 font-display font-bold leading-none ${
          small ? "text-[1.4rem]" : "text-[1.9rem]"
        } ${valueClass ?? "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-2 text-[12px] text-ink-soft">{sub}</p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-[16px] px-8 py-12 text-center max-w-[560px] mx-auto border border-ink/5">
      <h2 className="font-display text-[1.5rem] font-bold text-ink">
        Aún no hay diagnósticos registrados
      </h2>
      <p className="mt-3 text-[14px] text-ink-soft max-w-[440px] mx-auto">
        Agrega el primer empleado y ejecuta su diagnóstico para ver el tablero.
      </p>
      <button
        onClick={onAdd}
        className="mt-8 rounded-full bg-ink text-white font-medium px-6 py-3 hover:bg-ink-soft"
      >
        → Agregar primer empleado
      </button>
    </div>
  );
}
