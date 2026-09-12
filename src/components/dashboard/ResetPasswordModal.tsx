import { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  User,
} from "lucide-react";
import type { Employee } from "@/types";
import { batchUpdateEmployeesFn } from "@/lib/bigquery.functions";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  employeesToReset: Employee[];
  onSaved: () => void;
}

export function ResetPasswordModal({
  open,
  onClose,
  employeesToReset,
  onSaved,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("Marea2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNewPassword("Marea2026!");
      setShowPassword(false);
      setError(null);
      setSuccessMsg(null);
    }
  }, [open, employeesToReset]);

  if (!open) return null;

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let pwd = "";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const handleSave = async () => {
    if (!newPassword.trim()) {
      setError("Por favor ingresa una contraseña válida.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = employeesToReset.map((emp) => ({
        id: emp.id,
        password: newPassword.trim(),
      }));

      await batchUpdateEmployeesFn({ data: payload });

      setSuccessMsg(
        `¡Contraseña restablecida exitosamente para ${employeesToReset.length} colaborador(es)!`,
      );

      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      console.error("Error resetting employee passwords:", err);
      setError(
        "Ocurrió un error al restablecer la contraseña. Inténtalo de nuevo.",
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
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-ink flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-ink leading-tight">
                Restablecer Contraseña
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                {employeesToReset.length === 1
                  ? `Para ${employeesToReset[0].name}`
                  : `Para ${employeesToReset.length} colaboradores seleccionados`}
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

        <div className="p-5 space-y-5">
          {/* Target Users Summary */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3.5 text-xs">
            <span className="font-semibold text-amber-900 block mb-1.5">
              Colaboradores a modificar ({employeesToReset.length}):
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {employeesToReset.map((emp, idx) => (
                <div
                  key={`${emp.id}-${idx}`}
                  className="flex items-center justify-between text-ink-soft bg-white/80 px-2.5 py-1 rounded border border-amber-200/30 text-[11.5px]"
                >
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <User className="w-3 h-3 text-ink-muted" />
                    {emp.name}
                  </span>
                  <span className="text-ink-muted text-[10.5px]">
                    {emp.empresa || "Sin empresa"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Password Input & Generator */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink flex items-center justify-between">
              <span>Nueva Contraseña</span>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                Generar aleatoria
              </button>
            </label>

            <div className="relative">
              <div className="absolute left-3 top-2.5 text-ink-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña..."
                className="w-full bg-cream/30 border border-ink/20 rounded-xl pl-9 pr-10 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10.5px] text-ink-muted">
              Esta contraseña se aplicará a los colaboradores seleccionados para
              que puedan ingresar al sistema.
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink/10 bg-cream/30 flex items-center justify-end gap-2">
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
            disabled={saving || !newPassword.trim()}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{saving ? "Guardando..." : "Restablecer Contraseña"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
