import { useCallback, useEffect, useRef, useState } from "react";
import { updateDiagnosticActivitiesFn } from "@/lib/bigquery.functions";
import {
  analyzeActivity,
  type ActivityAnalysis,
} from "@/services/analyzeActivity";
import { useApp } from "@/context/AppContext";
import { ANDRES_MATRIZ_ACTIVITIES } from "@/data/seedData";

export type Quadrant = "q1" | "q2" | "q3" | "q4";

export interface Activity {
  id: string;
  name: string;
  mins: number;
  quadrant: Quadrant;
  analysis: ActivityAnalysis | null;
  unclear: boolean;
  locked: boolean;
}

export type AlertMsg = { msg: string; type: "error" | "warn" } | null;

const MIN_TIER_BY_Q: Record<Quadrant, number> = { q1: 1, q2: 2, q3: 3, q4: 4 };

export function getQuadrantId(valor: string, freq: string): Quadrant {
  if (valor === "alto" && freq === "baja") return "q2";
  if (valor === "alto" && freq === "alta") return "q4";
  if (valor === "bajo" && freq === "baja") return "q1";
  return "q3";
}

export function useMatriz(tierId: number, diagnosticId: string | null) {
  const { currentEmployeeId } = useApp();
  const activeKey = diagnosticId || currentEmployeeId || "default";
  const storageKey = `matriz_activities_${activeKey}`;

  const [activities, setActivities] = useState<Activity[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`matriz_activities_${activeKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      if (
        activeKey === "emp-andres-piedrahita" ||
        diagnosticId === "diag-andres-piedrahita"
      ) {
        return ANDRES_MATRIZ_ACTIVITIES as Activity[];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMsg>(null);
  const isLoadedRef = useRef<string | null>(activeKey);
  const firstSync = useRef(true);

  // Sync state if activeKey changes or custom event is received
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setActivities((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
              return parsed;
            });
            return;
          }
        }
        if (
          activeKey === "emp-andres-piedrahita" ||
          diagnosticId === "diag-andres-piedrahita"
        ) {
          setActivities((prev) => {
            if (
              JSON.stringify(prev) === JSON.stringify(ANDRES_MATRIZ_ACTIVITIES)
            )
              return prev;
            return ANDRES_MATRIZ_ACTIVITIES as Activity[];
          });
        } else {
          setActivities((prev) => (prev.length === 0 ? prev : []));
        }
      } catch {
        setActivities((prev) => (prev.length === 0 ? prev : []));
      }
    };

    loadFromStorage();
    isLoadedRef.current = storageKey;

    const handleUpdate = (e: Event) => {
      const customEv = e as CustomEvent;
      if (
        !customEv.detail?.storageKey ||
        customEv.detail.storageKey === storageKey
      ) {
        loadFromStorage();
      }
    };

    window.addEventListener("matriz_updated", handleUpdate);
    return () => window.removeEventListener("matriz_updated", handleUpdate);
  }, [storageKey, activeKey, diagnosticId]);

  // Helper to persist and broadcast changes to other hook instances
  const persistActivities = useCallback(
    (newActivities: Activity[]) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(newActivities));
        window.dispatchEvent(
          new CustomEvent("matriz_updated", { detail: { storageKey } }),
        );
      } catch (err) {
        console.error("Error persisting activities to localStorage", err);
      }
    },
    [storageKey],
  );

  const countByQ = useCallback(
    (q: Quadrant) => activities.filter((a) => a.quadrant === q).length,
    [activities],
  );

  // Sync counts and items to BigQuery whenever activities change
  useEffect(() => {
    if (!diagnosticId) return;
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    const counts = { q1: 0, q2: 0, q3: 0, q4: 0 };
    activities.forEach((a) => {
      if (counts[a.quadrant] !== undefined) {
        counts[a.quadrant] += 1;
      }
    });
    updateDiagnosticActivitiesFn({
      data: {
        id: diagnosticId,
        activities_q: {
          ...counts,
          items: activities,
        },
      },
    }).catch((err) => {
      console.warn("Error updating diagnostic activities in BigQuery", err);
    });
  }, [activities, diagnosticId]);

  const addActivity = useCallback(
    async (name: string, valor: string, freq: string, mins: number) => {
      setAlert(null);
      const trimmed = name.trim();
      const minsNum = Number(mins);
      if (
        !trimmed ||
        !valor ||
        !freq ||
        !mins ||
        isNaN(minsNum) ||
        minsNum <= 0
      ) {
        setAlert({
          msg: "Completa todos los campos (Nombre, Valor, Frecuencia y Minutos) con datos válidos antes de agregar.",
          type: "error",
        });
        return;
      }
      const q = getQuadrantId(valor, freq);
      if (activities.filter((a) => a.quadrant === q).length >= 5) {
        setAlert({
          msg: "Este cuadrante ya tiene 5 actividades (máximo).",
          type: "error",
        });
        return;
      }
      const locked = tierId < MIN_TIER_BY_Q[q];

      setLoading(true);
      let analysis: ActivityAnalysis | null = null;
      let unclear = false;

      try {
        const raw = await analyzeActivity(trimmed, minsNum);
        if (!raw.clara) {
          unclear = true;
          setAlert({
            msg: `Descripción poco clara: ${raw.razon_alerta} La actividad se registró sin estimación.`,
            type: "warn",
          });
        } else {
          analysis = raw;
        }
      } catch (err) {
        setAlert({
          msg:
            err instanceof Error && err.message
              ? `${err.message} Actividad registrada sin estimación.`
              : "No se pudo conectar con la IA. Actividad registrada sin estimación.",
          type: "warn",
        });
      }

      setActivities((prev) => {
        const updated = [
          ...prev,
          {
            id: Date.now().toString(),
            name: trimmed,
            mins: minsNum,
            quadrant: q,
            analysis,
            unclear,
            locked,
          },
        ];
        persistActivities(updated);
        return updated;
      });
      setLoading(false);
    },
    [activities, tierId, persistActivities],
  );

  const removeActivity = useCallback(
    (id: string) => {
      setActivities((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        persistActivities(updated);
        return updated;
      });
    },
    [persistActivities],
  );

  return { activities, loading, alert, addActivity, removeActivity, countByQ };
}
