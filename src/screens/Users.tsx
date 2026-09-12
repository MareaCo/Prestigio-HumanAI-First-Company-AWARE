import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useDashboard } from "@/hooks/useDashboard";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { AppSidebar } from "@/components/AppSidebar";
import { NewEmployeeModal } from "@/components/NewEmployeeModal";
import { Footer } from "@/components/Footer";
import { regenerateSampleDataFn } from "@/lib/bigquery.functions";
import { PrestigioLogo } from "@/components/PrestigioLogo";

export function UsersScreen() {
  const { navigateTo, companyId } = useApp();
  const { employees, diagnostics, loading, reload } = useDashboard("__all__");
  const [openNew, setOpenNew] = useState(false);
  const [seeding, setSeeding] = useState(false);

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
        activeScreen="users"
        onRegenerate={regenerateSampleData}
        seeding={seeding}
      />
      <div className="flex-1 mx-auto max-w-[1100px] px-3 sm:px-6 py-4 sm:py-8 w-full min-w-0 flex flex-col justify-between overflow-x-hidden">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0 max-w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full">
            <PrestigioLogo size="sm" showTagline className="shrink-0" />
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
          <button
            onClick={() => setOpenNew(true)}
            className="shrink-0 rounded-[8px] bg-ink text-white font-medium px-3 py-2 hover:bg-ink-soft text-[12px] sm:text-[13px] self-start sm:self-auto"
          >
            + Nuevo colaborador
          </button>
        </header>

        {loading ? (
          <p className="text-ink-muted text-sm">Cargando colaboradores…</p>
        ) : (
          <div>
            <EmployeeTable
              employees={employees}
              diagnostics={diagnostics}
              onOpenDetail={(id) =>
                navigateTo("employee-detail", { currentEmployeeId: id })
              }
              onStartQuiz={(id) =>
                navigateTo("quiz", { currentEmployeeId: id })
              }
              onReload={() => reload()}
            />
          </div>
        )}
        <Footer />
      </div>

      <NewEmployeeModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={() => reload()}
      />
    </main>
  );
}
