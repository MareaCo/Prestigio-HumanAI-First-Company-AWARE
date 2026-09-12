import { useCallback, useEffect, useState } from "react";
import { insertDiagnosticFn } from "@/lib/bigquery.functions";
import { QUESTIONS } from "@/data/questions";
import { computeScores, getTier } from "@/data/scoring";

type NavigateFn = (
  screen: "dashboard" | "quiz" | "report" | "employee-detail" | "login",
  params?: Record<string, unknown>,
) => void;

export function useQuiz(employeeId: string | null, started: boolean = true) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(QUESTIONS.length).fill(null),
  );
  const [tensions, setTensions] = useState<Record<string, number>>({
    "01": 3,
    "02": 3,
    "03": 3,
    "04": 3,
    "05": 3,
    "06": 3,
    "07": 3,
    "08": 3,
    "09": 3,
    "10": 3,
    "00": 3,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectOption = useCallback(
    (idx: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQ] = idx;
        return next;
      });
    },
    [currentQ],
  );

  const selectTension = useCallback((id: string, val: number) => {
    setTensions((prev) => ({
      ...prev,
      [id]: val,
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQ((q) => (q < QUESTIONS.length ? q + 1 : q));
  }, []);
  const prevQuestion = useCallback(() => {
    setCurrentQ((q) => (q > 0 ? q - 1 : q));
  }, []);

  const isComplete =
    currentQ === QUESTIONS.length || answers[currentQ] !== null;
  const isLast = currentQ === QUESTIONS.length;
  // Progress goes from 0 to 100
  const progress = Math.round(((currentQ + 1) / (QUESTIONS.length + 1)) * 100);

  const finishQuiz = useCallback(
    async (navigateTo: NavigateFn) => {
      if (!employeeId) {
        setError("No hay empleado asociado al diagnóstico.");
        return;
      }
      setSaving(true);
      setError(null);
      const {
        total,
        dimScores,
        scoresSER,
        scoresHACER,
        arquetipo,
        subperfil,
        gap,
        a_una_evidencia,
        candado_no_aplicable,
        respuestas,
      } = computeScores(answers);
      const tier = getTier(total);

      let data = null;
      let errMessage = null;
      try {
        data = await insertDiagnosticFn({
          data: {
            employee_id: employeeId,
            tier: tier.id,
            total_score: total,
            dim_scores: dimScores,
            perfil: arquetipo,
            activities_q: { q1: 0, q2: 0, q3: 0, q4: 0 },
            scoresSER,
            scoresHACER,
            arquetipo,
            subperfil,
            gap,
            tensiones: tensions,
            version: "2.0",
            version_scoring: "2.1",
            a_una_evidencia,
            candado_no_aplicable,
            respuestas,
            answers,
          },
        });
      } catch (e) {
        const err = e as Error;
        errMessage = err?.message ?? "No se pudo guardar el diagnóstico.";
      }

      setSaving(false);
      if (errMessage || !data) {
        setError(errMessage ?? "No se pudo guardar el diagnóstico.");
        return;
      }
      navigateTo("report", {
        latestDiagnosticId: data.id,
        currentEmployeeId: employeeId,
        returnScreen: "user-workspace",
      });
    },
    [answers, employeeId, tensions],
  );

  useEffect(() => {
    if (!started) return;
    const handler = (e: KeyboardEvent) => {
      // Keyboard handler only applies to active questions
      if (currentQ >= QUESTIONS.length) return;

      const map: Record<string, number> = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
      };
      const k = e.key.toLowerCase();
      if (k in map) {
        e.preventDefault();
        selectOption(map[k]);
      }
      if (e.key === "Enter" && isComplete && !isLast) nextQuestion();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    currentQ,
    answers,
    isComplete,
    isLast,
    selectOption,
    nextQuestion,
    started,
  ]);

  return {
    currentQ,
    answers,
    tensions,
    selectOption,
    selectTension,
    nextQuestion,
    prevQuestion,
    isComplete,
    isLast,
    progress,
    saving,
    error,
    finishQuiz,
    questions: QUESTIONS,
  };
}
