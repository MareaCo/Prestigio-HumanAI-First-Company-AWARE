import { useRef, useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  User,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  FileCode,
} from "lucide-react";
import { PERFIL_CONFIG, TIER_NAMES } from "@/data/constants";
import type { Diagnostic, Employee } from "@/types";
import { IndividualReport } from "@/components/report/IndividualReport";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRows: { employee: Employee; diagnostic: Diagnostic | null }[];
}

export function BatchReportModal({ open, onClose, selectedRows }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInIframe(window.self !== window.top);
    }
  }, []);

  if (!open) return null;

  const validRows = selectedRows.filter((r) => r.diagnostic !== null);

  const getFullPrintDoc = () => {
    const htmlContent = printRef.current?.innerHTML || "";
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Informes_Apropiacion_IA_${new Date().toISOString().split("T")[0]}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #FFFBF5; padding: 24px; color: #111; }
      .page-break { page-break-after: always; break-after: page; }
      @media print {
        .no-print { display: none !important; }
        body { background: white !important; padding: 0 !important; }
      }
    </style>
  </head>
  <body>
    <div class="no-print mb-6 p-4 bg-white rounded-xl shadow-xs border border-gray-200 flex items-center justify-between">
      <div>
        <h1 class="text-base font-bold text-gray-900">Informes Seleccionados (${validRows.length})</h1>
        <p class="text-xs text-gray-500">Selecciona 'Guardar como PDF' en el destino de la impresora para guardar en tu equipo.</p>
      </div>
      <button onclick="window.print()" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:13px;">
        🖨️ Abrir Impresión / Guardar PDF
      </button>
    </div>
    <div style="max-width: 900px; margin: 0 auto;">
      ${htmlContent}
    </div>
    <script>
      setTimeout(() => { window.print(); }, 600);
    </script>
  </body>
</html>`;
  };

  const handlePrint = () => {
    const docHtml = getFullPrintDoc();
    const printWin = window.open("", "_blank");

    if (printWin) {
      printWin.document.open();
      printWin.document.write(docHtml);
      printWin.document.close();
    } else {
      // Direct window.print fallback
      window.print();
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID Colaborador",
      "Nombre",
      "Cédula",
      "Empresa Madre",
      "Empresa",
      "Área",
      "Email",
      "Perfil",
      "Nivel de Madurez",
      "Subperfil",
      "Puntaje Total",
      "Estado",
      "Fecha Diagnóstico",
    ];

    const csvLines = [headers.join(",")];

    selectedRows.forEach(({ employee, diagnostic }) => {
      const empresaMadre =
        employee.empresa_principal || employee.empresaPrincipal || "Comfama";
      const row = [
        `"${employee.id}"`,
        `"${employee.name.replace(/"/g, '""')}"`,
        `"${(employee.cedula || "").replace(/"/g, '""')}"`,
        `"${empresaMadre.replace(/"/g, '""')}"`,
        `"${(employee.empresa || "").replace(/"/g, '""')}"`,
        `"${(employee.area || "").replace(/"/g, '""')}"`,
        `"${(employee.email || "").replace(/"/g, '""')}"`,
        diagnostic ? `"${diagnostic.perfil}"` : "Sin diagnóstico",
        diagnostic ? `${diagnostic.tier}` : "—",
        diagnostic ? `"${TIER_NAMES[diagnostic.tier - 1]}"` : "—",
        diagnostic ? `${diagnostic.total_score}/60` : "—",
        diagnostic ? "Completado" : "Pendiente",
        diagnostic
          ? `"${new Date(diagnostic.created_at).toLocaleDateString("es-CO")}"`
          : "—",
      ];
      csvLines.push(row.join(","));
    });

    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Informes_Apropiacion_IA_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHTML = () => {
    const docHtml = getFullPrintDoc();
    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Informes_Apropiacion_IA_${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* CSS for print layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #batch-print-container, #batch-print-container * {
            visibility: visible;
          }
          #batch-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-ink/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 bg-cream/60 border-b border-ink/10 flex items-center justify-between no-print shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">
                Descarga y Exportación de Informes
              </p>
            </div>
            <h2 className="text-lg font-bold text-ink mt-0.5">
              Informes Seleccionados ({validRows.length} de{" "}
              {selectedRows.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-ink/15 bg-white hover:bg-cream text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              CSV / Excel
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 rounded-lg border border-ink/15 bg-white hover:bg-cream text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              Guardar HTML
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={validRows.length === 0}
              className="px-4 py-1.5 rounded-lg bg-ink text-white hover:bg-ink-soft text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Imprimir / Guardar PDF ({validRows.length})
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable Preview & Print Container */}
        <div
          className="p-6 overflow-y-auto flex-1 bg-cream/20 space-y-6"
          id="batch-print-container"
          ref={printRef}
        >
          {isInIframe && (
            <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3 no-print shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Al hacer clic en <strong>Imprimir / Guardar PDF</strong>, se
                  abrirá una ventana limpia fuera del visor para activar el
                  diálogo de guardado PDF de tu navegador sin bloqueos.
                </span>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shrink-0 transition-colors"
              >
                Abrir ahora ↗
              </button>
            </div>
          )}
          {selectedRows.length === 0 ? (
            <div className="text-center py-12 text-ink-muted">
              No has seleccionado ningún colaborador.
            </div>
          ) : (
            selectedRows.map(({ employee, diagnostic }, index) => {
              if (!diagnostic) {
                return (
                  <div
                    key={employee.id}
                    className="p-5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-center justify-between page-break"
                  >
                    <div>
                      <p className="font-bold text-sm text-ink">
                        {employee.name}
                      </p>
                      <p className="text-ink-soft">
                        {employee.area || "Sin área"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                      Diagnóstico Pendiente
                    </span>
                  </div>
                );
              }

              const fullDiag: Diagnostic = {
                ...diagnostic,
                employee,
              };

              return (
                <div key={employee.id} className="page-break space-y-4">
                  <IndividualReport diagnostic={fullDiag} />
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-cream/40 border-t border-ink/10 flex items-center justify-between text-xs text-ink-muted no-print shrink-0">
          <span>
            {validRows.length} informe(s) listos para descargar o imprimir.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-ink/15 text-ink hover:bg-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
