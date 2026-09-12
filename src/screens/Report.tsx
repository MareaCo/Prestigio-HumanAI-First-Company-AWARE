import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/AppSidebar";
import { getSingleDiagnosticFn } from "@/lib/bigquery.functions";
import { registerCharts } from "@/lib/charts";
import type { Diagnostic } from "@/types";
import { IndividualReport } from "@/components/report/IndividualReport";
import { Footer } from "@/components/Footer";
import {
  Printer,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  X,
  LogOut,
} from "lucide-react";

registerCharts();

export function ReportScreen() {
  const { latestDiagnosticId, navigateTo, role, returnScreen } = useApp();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latestDiagnosticId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const data = await getSingleDiagnosticFn({
        data: { id: latestDiagnosticId },
      });
      if (!cancelled) {
        setDiagnostic((data as unknown as Diagnostic) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latestDiagnosticId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink p-10 flex items-center justify-center">
        <p className="text-ink-muted text-sm font-medium">
          Cargando reporte de diagnóstico…
        </p>
      </main>
    );
  }
  if (!diagnostic) {
    const backScreen =
      returnScreen || (role === "employee" ? "user-workspace" : "dashboard");
    const backLabel =
      backScreen === "user-workspace"
        ? "← Volver a Mi Espacio"
        : backScreen === "employee-detail"
          ? "← Volver al detalle"
          : "← Volver al tablero";
    return (
      <main className="min-h-screen bg-cream text-ink p-10">
        <button
          onClick={() => navigateTo(backScreen)}
          className="text-[12px] text-ink-muted hover:text-ink font-medium"
        >
          {backLabel}
        </button>
        <p className="mt-6 text-ink">
          No se encontró el diagnóstico solicitante.
        </p>
      </main>
    );
  }

  return <ReportContent diagnostic={diagnostic} />;
}

export function ReportContent({ diagnostic }: { diagnostic: Diagnostic }) {
  const { navigateTo, role, logout, returnScreen } = useApp();

  const [showIframeWarning, setShowIframeWarning] = useState(false);

  const empName = diagnostic.employee?.name || "Colaborador";

  useEffect(() => {
    if (typeof window !== "undefined" && empName) {
      document.title = `Informe de Apropiación IA - ${empName}`;
    }
  }, [empName]);

  useEffect(() => {
    const triggerPrint = localStorage.getItem("trigger_print");
    const isInIframe =
      typeof window !== "undefined" && window.self !== window.top;
    if (triggerPrint === "true" && !isInIframe) {
      localStorage.removeItem("trigger_print");
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const defaultBackScreen =
    role === "employee" ? "user-workspace" : "dashboard";
  const backScreen = returnScreen || defaultBackScreen;

  const backLabelText =
    backScreen === "user-workspace"
      ? "Volver a Mi Espacio"
      : backScreen === "employee-detail"
        ? "Volver al tablero"
        : "Volver al tablero";

  const backOnClick = () => navigateTo(backScreen);

  function handlePrint() {
    const isInIframe =
      typeof window !== "undefined" && window.self !== window.top;
    if (isInIframe) {
      setShowIframeWarning(true);
    } else {
      window.print();
    }
  }

  return (
    <div className="flex min-h-screen bg-cream text-ink font-sans">
      {role && <AppSidebar activeScreen="report" />}

      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden print:bg-white print:p-0">
        <div className="mx-auto w-full max-w-[860px] px-3 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col justify-between min-w-0">
          <div className="flex-1 space-y-6">
            {/* Action Header bar (hidden in print) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
              <button
                onClick={backOnClick}
                className="flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {backLabelText}
              </button>

              <div className="flex items-center gap-2">
                {role === "admin" && (
                  <button
                    onClick={() =>
                      navigateTo("quiz", {
                        currentEmployeeId: diagnostic.employee_id,
                      })
                    }
                    className="flex items-center gap-1.5 text-xs bg-white border border-ink/10 hover:border-ink/30 px-3 py-1.5 rounded-lg font-medium transition-all shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-ink-muted" />
                    Actualizar diagnóstico
                  </button>
                )}
                {role !== "employee" && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 text-xs bg-white border border-ink/10 hover:border-ink/30 px-3 py-1.5 rounded-lg font-medium transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-ink-muted" />
                    Exportar PDF / Imprimir
                  </button>
                )}
                <button
                  onClick={logout}
                  title="Cerrar sesión e ir al inicio"
                  className="flex items-center gap-1.5 text-xs bg-cream hover:bg-ink/5 border border-ink/10 px-3 py-1.5 rounded-lg font-medium text-ink transition-all shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-ink-muted" />
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Active View Rendering */}
            <IndividualReport diagnostic={diagnostic} />
          </div>

          <Footer />
        </div>

        {/* Iframe Print Dialog Warning Modal */}
        {showIframeWarning && (
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden animate-fade-in">
            <div className="bg-white border border-ink/10 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-scale-up">
              <button
                onClick={() => setShowIframeWarning(false)}
                className="absolute top-4 right-4 text-ink-muted hover:text-ink p-1 rounded-full hover:bg-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0 border border-amber-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-poppins text-lg font-bold text-ink leading-snug">
                    ¿Cómo exportar a PDF o Imprimir?
                  </h3>
                  <p className="mt-3 text-[13px] text-ink-muted leading-relaxed">
                    Dado que te encuentras en la{" "}
                    <strong>vista previa integrada (iframe)</strong>, el
                    navegador bloquea la impresión directa.
                  </p>
                  <p className="mt-2.5 text-[13px] text-ink-muted leading-relaxed">
                    Haz clic en el botón de abajo para{" "}
                    <strong>abrir el reporte en una pestaña nueva</strong>. El
                    diálogo de impresión se abrirá automáticamente para guardar
                    tu PDF.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/5 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowIframeWarning(false);
                    window.print();
                  }}
                  className="text-[12px] font-medium text-ink-muted hover:text-ink py-2 px-3 rounded-lg hover:bg-cream transition-colors text-center"
                >
                  Intentar imprimir de todos modos
                </button>
                <button
                  onClick={() => {
                    const url = new URL(
                      window.location.origin + window.location.pathname,
                    );
                    if (role) url.searchParams.set("auth_role", role);
                    if (screen) url.searchParams.set("auth_screen", screen);
                    if (currentEmployeeId) {
                      url.searchParams.set(
                        "auth_employee_id",
                        currentEmployeeId,
                      );
                    }
                    if (latestDiagnosticId) {
                      url.searchParams.set(
                        "auth_latest_diagnostic_id",
                        latestDiagnosticId,
                      );
                    }
                    url.searchParams.set("trigger_print", "true");

                    window.open(url.toString(), "_blank");
                    setShowIframeWarning(false);
                  }}
                  className="bg-ink hover:bg-ink/90 text-white font-semibold text-[12px] py-2 px-4 rounded-lg shadow-xs transition-all text-center"
                >
                  Abrir en pestaña nueva e imprimir
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
