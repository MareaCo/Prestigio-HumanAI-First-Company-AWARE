import { useState, useEffect } from "react";
import { X, RotateCcw, Check, AlertTriangle, User } from "lucide-react";
import type { Employee } from "@/types";
import { resetIntrospectionFn } from "@/lib/bigquery.functions";

interface ResetIntrospectionModalProps {
  open: boolean;
  onClose: () => void;
  employeesToReset: Employee[];
  onSaved: () => void;
}

export function ResetIntrospectionModal({
  open,
  onClose,
  employeesToReset,
  onSaved,
}: ResetIntrospectionModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccessMsg(null);
    }
  }, [open, employeesToReset]);

  if (!open) return null;

  const handleReset = async () => {
    if (!employeesToReset || employeesToReset.length === 0) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const employeeIds = employeesToReset.map((e) => e.id);
      await resetIntrospectionFn({ data: { employeeIds } });

      setSuccessMsg(
        `¡Introspección reseteada exitosamente para ${employeesToReset.length} colaborador(es)! Quedan listos para iniciar de cero.`,
      );

      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      console.error("Error resetting employee introspection:", err);
      setError(
        "Ocurrió un error al resetear la introspección. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-ink/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-ink/10 bg-cream/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-800 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h2 className="font-poppins text-base font-bold text-ink">
                Resetear Introspección
              </h2>
              <p className="text-xs text-ink-muted">
                Reiniciar diagnóstico de {employeesToReset.length}{" "}
                colaborador(es) para iniciar de cero
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Warning Banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3 text-rose-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950">
                ¿Estás seguro de esta acción?
              </p>
              <p className="mt-0.5 text-rose-800">
                Se eliminarán los resultados actuales del diagnóstico de los
                colaboradores seleccionados. Volverán al estado{" "}
                <span className="font-semibold">"Sin diagnóstico"</span> para
                que puedan ingresar e iniciar la introspección nuevamente desde
                cero.
              </p>
            </div>
          </div>

          {/* Employee list summary */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Colaboradores a reiniciar ({employeesToReset.length}):
            </label>
            <div className="max-h-40 overflow-y-auto border border-ink/10 rounded-xl p-2 divide-y divide-ink/5 bg-cream/30">
              {employeesToReset.map((emp, idx) => (
                <div
                  key={`${emp.id}-${idx}`}
                  className="py-1.5 px-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <User className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span className="font-medium text-ink truncate">
                      {emp.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted shrink-0 ml-2">
                    {emp.empresa || emp.area || "Sin empresa"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink/10 bg-cream/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-medium text-ink-soft hover:text-ink hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || Boolean(successMsg)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span>Reseteando...</span>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirmar y resetear a 0</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
