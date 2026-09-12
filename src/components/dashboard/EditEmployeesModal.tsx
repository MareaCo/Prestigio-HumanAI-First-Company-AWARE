import { useState, useEffect } from "react";
import { X, Save, Building2, Check, Sparkles, AlertCircle } from "lucide-react";
import type { Employee } from "@/types";
import { batchUpdateEmployeesFn } from "@/lib/bigquery.functions";

interface EditEmployeesModalProps {
  open: boolean;
  onClose: () => void;
  employeesToEdit: Employee[];
  onSaved: () => void;
}

interface EditableEmployee {
  id: string;
  name: string;
  email: string | null;
  area: string;
  cedula: string;
  empresa_principal: string;
  empresa: string;
}

export function EditEmployeesModal({
  open,
  onClose,
  employeesToEdit,
  onSaved,
}: EditEmployeesModalProps) {
  const [items, setItems] = useState<EditableEmployee[]>([]);
  const [globalEmpresa, setGlobalEmpresa] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setItems(
        employeesToEdit.map((e) => ({
          id: e.id,
          name: e.name || "",
          email: e.email || "",
          area: e.area || "General",
          cedula: e.cedula || "",
          empresa_principal:
            e.empresa_principal || e.empresaPrincipal || "Comfama",
          empresa: e.empresa || "",
        })),
      );
      setGlobalEmpresa("");
      setError(null);
      setSuccessMsg(null);
    }
  }, [open, employeesToEdit]);

  if (!open) return null;

  const handleFieldChange = (
    id: string,
    field: "cedula" | "empresa" | "empresa_principal" | "area" | "name",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleApplyGlobalEmpresa = () => {
    if (!globalEmpresa.trim()) return;
    setItems((prev) =>
      prev.map((item) => ({ ...item, empresa: globalEmpresa.trim() })),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = items.map((item) => ({
        id: item.id,
        name: item.name.trim(),
        email: item.email ? item.email.trim() : null,
        area: item.area.trim(),
        cedula: item.cedula.trim() || null,
        empresa_principal: item.empresa_principal.trim() || "Comfama",
        empresa: item.empresa.trim() || null,
      }));

      await batchUpdateEmployeesFn({ data: payload });
      setSuccessMsg(
        `¡Información guardada exitosamente para ${items.length} colaborador(es)!`,
      );

      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      console.error("Error saving employee updates:", err);
      setError(
        "Ocurrió un error al guardar los datos. Por favor intenta de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const missingEmpresaCount = items.filter((i) => !i.empresa.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-ink/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-ink/10 bg-cream/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-ink flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-ink leading-tight">
                Diligenciar Empresa y Datos de Colaboradores
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                {items.length} colaboradores seleccionados ·{" "}
                {missingEmpresaCount > 0 ? (
                  <span className="text-amber-700 font-medium">
                    {missingEmpresaCount} sin empresa registrada
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">
                    Todos con empresa registrada
                  </span>
                )}
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

        {/* Quick Fill Toolbar */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-semibold text-ink">
              Asignación rápida de Empresa para todos:
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Ej. Marea Co, Prestigio SAS..."
              value={globalEmpresa}
              onChange={(e) => setGlobalEmpresa(e.target.value)}
              className="bg-white border border-ink/15 rounded-lg px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink/20 flex-1 sm:w-64"
            />
            <button
              type="button"
              onClick={handleApplyGlobalEmpresa}
              disabled={!globalEmpresa.trim()}
              className="px-3 py-1.5 rounded-lg bg-ink text-white font-medium text-xs hover:bg-ink-soft disabled:opacity-40 transition-all shrink-0 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar a todos ({items.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table of Items */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink-muted font-bold pb-2">
                <th className="py-2 px-2">Colaborador</th>
                <th className="py-2 px-2">Empresa Madre</th>
                <th className="py-2 px-2">Empresa</th>
                <th className="py-2 px-2">Cédula</th>
                <th className="py-2 px-2">Área</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {items.map((item, index) => {
                const isMissingEmpresa = !item.empresa.trim();
                return (
                  <tr
                    key={`${item.id}-${index}`}
                    className={`hover:bg-cream/40 transition-colors ${
                      isMissingEmpresa ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="py-2.5 px-2 font-medium text-ink max-w-[180px]">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleFieldChange(item.id, "name", e.target.value)
                        }
                        className="w-full bg-transparent border-b border-transparent hover:border-ink/20 focus:border-ink focus:bg-white px-1.5 py-1 rounded text-xs font-semibold text-ink focus:outline-none"
                      />
                      {item.email && (
                        <span className="block text-[10px] text-ink-muted truncate px-1.5">
                          {item.email}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        placeholder="Ej. Comfama..."
                        value={item.empresa_principal}
                        onChange={(e) =>
                          handleFieldChange(
                            item.id,
                            "empresa_principal",
                            e.target.value,
                          )
                        }
                        className="w-full bg-white border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Escriba el nombre de la empresa..."
                          value={item.empresa}
                          onChange={(e) =>
                            handleFieldChange(
                              item.id,
                              "empresa",
                              e.target.value,
                            )
                          }
                          className={`w-full border rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 transition-all ${
                            isMissingEmpresa
                              ? "bg-amber-100/50 border-amber-300 focus:ring-amber-400 placeholder:text-amber-800/50"
                              : "bg-white border-ink/15 focus:ring-ink/20"
                          }`}
                        />
                        {isMissingEmpresa && (
                          <span className="absolute right-2 top-2 text-[9px] font-bold text-amber-700 uppercase tracking-tight pointer-events-none">
                            Requerido
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        placeholder="N° Cédula"
                        value={item.cedula}
                        onChange={(e) =>
                          handleFieldChange(item.id, "cedula", e.target.value)
                        }
                        className="w-full bg-white border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        placeholder="Área"
                        value={item.area}
                        onChange={(e) =>
                          handleFieldChange(item.id, "area", e.target.value)
                        }
                        className="w-full bg-white border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Status */}
        <div className="p-4 border-t border-ink/10 bg-cream/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink hover:bg-black/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-ink text-white font-semibold text-xs hover:bg-ink-soft disabled:opacity-50 transition-all flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
