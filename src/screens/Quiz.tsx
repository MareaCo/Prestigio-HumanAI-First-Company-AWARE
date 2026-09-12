import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useQuiz } from "@/hooks/useQuiz";
import { TENSIONS } from "@/data/tensions";
import { PrestigioLogo } from "@/components/PrestigioLogo";

export function QuizScreen() {
  const { currentEmployeeId, navigateTo, role } = useApp();
  const [started, setStarted] = useState(false);

  const homeScreen = role === "employee" ? "user-workspace" : "dashboard";
  const {
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
    questions,
  } = useQuiz(currentEmployeeId, started);

  const isTensionsStep = currentQ === questions.length;
  const q = !isTensionsStep ? questions[currentQ] : null;
  const selectedIdx = !isTensionsStep ? answers[currentQ] : null;

  async function handleAdvance() {
    if (!isComplete) return;
    if (isLast) {
      await finishQuiz(navigateTo);
    } else {
      nextQuestion();
    }
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-cream border-b border-ink/10">
          <div className="mx-auto max-w-[900px] px-6 py-4 flex items-center justify-between">
            <PrestigioLogo size="sm" />
            <button
              onClick={() => navigateTo(homeScreen)}
              className="text-[13px] text-ink-soft hover:text-ink font-medium"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-[650px] bg-white border border-ink/10 rounded-[24px] p-8 md:p-12 text-center shadow-sm animate-fade-in">
            <div className="flex justify-center mb-6">
              <PrestigioLogo iconOnly size="lg" />
            </div>
            <p className="text-accent-brand uppercase tracking-[0.14em] text-[11px] font-bold">
              Diagnóstico de Apropiación IA
            </p>
            <h2 className="font-display font-bold text-[28px] sm:text-[34px] leading-tight text-ink mt-3 mb-6">
              Perfil de Apropiación de AI
            </h2>
            <p className="text-[15px] sm:text-[16px] text-ink-soft leading-relaxed max-w-[540px] mx-auto mb-8">
              Bienvenido a tu introspección del Perfil de Apropiación de AI.
              Responde con honestidad: no hay respuestas buenas ni malas. Este
              ejercicio te mostrará dónde estás hoy y nos permitirá acompañarte,
              si así lo decides, con un plan personalizado hacia un liderazgo
              amplificado por la inteligencia artificial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setStarted(true)}
                className="w-full sm:w-auto rounded-[12px] bg-ink text-white text-[15px] font-medium px-8 py-3.5 hover:bg-ink-soft transition-all duration-200 active:scale-95 shadow-sm"
              >
                Iniciar
              </button>
              <button
                onClick={() => navigateTo(homeScreen)}
                className="w-full sm:w-auto rounded-[12px] bg-cream text-ink text-[15px] font-medium px-6 py-3.5 hover:bg-ink/5 transition-all duration-200"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 bg-cream border-b border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-[8px] bg-ink flex items-center justify-center text-white font-display font-bold">
            {isTensionsStep ? "T" : "Q"}
          </div>
          <div className="flex-1 h-[3px] bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-ink transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[13px] font-medium text-accent-brand">
            {progress}%
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-[780px] px-6 sm:px-8 py-10 text-center">
          {!isTensionsStep && q ? (
            <div>
              <p className="text-accent-brand uppercase tracking-[0.14em] text-[12px] font-medium">
                {q.number} · {q.dimension}
              </p>
              <h2
                className="font-display font-bold mt-4 text-ink"
                style={{
                  fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)",
                  lineHeight: 1.15,
                }}
              >
                {q.title}
              </h2>
              <p className="mt-4 text-[15px] text-ink-soft max-w-[620px] mx-auto">
                {q.desc}
              </p>
              <p className="mt-3 text-[13px] italic text-ink-muted max-w-[620px] mx-auto mb-10">
                {q.note}
              </p>

              <div className="flex flex-col gap-3 max-w-[660px] mx-auto text-left">
                {q.options.map((opt, i) => {
                  const selected = selectedIdx === i;
                  return (
                    <button
                      key={opt.letter}
                      onClick={() => {
                        selectOption(i);
                      }}
                      className={`flex items-center gap-4 rounded-[14px] border transition-all px-[22px] py-[18px] hover:translate-x-[3px] ${
                        selected
                          ? "bg-ink text-white border-ink"
                          : "bg-white text-ink border-ink/10"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-[26px] h-[26px] rounded-full border text-[11px] font-medium ${
                          selected
                            ? "border-white opacity-100"
                            : "border-ink/60 opacity-60"
                        }`}
                      >
                        {opt.letter}
                      </span>
                      <span className="text-[14px] leading-snug">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-left">
              <div className="text-center mb-10">
                <span className="bg-[#E6F2FB] text-accent-brand px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
                  Paso Final: Tensiones Culturales
                </span>
                <h2 className="font-display font-bold text-3xl mt-3 text-ink">
                  Diagnóstico de Tensiones
                </h2>
                <p className="mt-2 text-sm text-ink-soft max-w-[560px] mx-auto">
                  Por favor, indica dónde se sitúa tu equipo o cultura de
                  trabajo actual en cada una de estas {TENSIONS.length}{" "}
                  tensiones estratégicas de adopción de IA (1 = Extremo
                  Izquierdo, 5 = Extremo Derecho).
                </p>
              </div>

              <div className="space-y-8 max-w-[720px] mx-auto">
                <div className="space-y-6">
                  {TENSIONS.map((t, idx) => {
                    const currentVal = tensions[t.id] ?? 3;
                    const isMeta = t.esMeta;

                    if (isMeta) {
                      return (
                        <div
                          key={t.id}
                          className="p-6 bg-gradient-to-br from-[#8C2B18] via-[#631B0E] to-[#2C0D07] text-white rounded-[20px] border-2 border-[#C84B31]/50 shadow-md space-y-4"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="bg-[#C84B31]/30 text-rose-100 border border-[#C84B31]/50 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-[#C84B31] text-white font-black text-[8px] flex items-center justify-center shrink-0 border border-white/30">
                                W
                              </span>
                              Tensión 00 · Meta-Tensión Coherencia (Atraviesa
                              Todas)
                            </span>
                            <span className="text-[11px] font-mono text-rose-200 font-bold">
                              Puntaje: {currentVal} / 5
                            </span>
                          </div>

                          <div>
                            <h3 className="font-display font-extrabold text-xl text-white">
                              {t.name}
                            </h3>
                          </div>

                          {/* Pole Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                            <div className="p-2.5 rounded-lg bg-[#C84B31]/20 border border-[#C84B31]/30">
                              <span className="font-bold text-rose-200 block mb-0.5">
                                Polo 1: {t.leftPole}
                              </span>
                              <span className="text-gray-200 text-[11px]">
                                {t.leftDesc}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-[#C84B31]/20 border border-[#C84B31]/30">
                              <span className="font-bold text-rose-200 block mb-0.5">
                                Polo 5: {t.rightPole}
                              </span>
                              <span className="text-gray-200 text-[11px]">
                                {t.rightDesc}
                              </span>
                            </div>
                          </div>

                          {/* 1-5 Scale */}
                          <div className="pt-2">
                            <p className="text-[11px] font-medium text-rose-200 mb-2 text-center">
                              {t.preguntaResuelve}
                            </p>
                            <div className="flex justify-between items-center max-w-[320px] mx-auto gap-2">
                              {[1, 2, 3, 4, 5].map((val) => {
                                const isSel = currentVal === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => selectTension(t.id, val)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                      isSel
                                        ? "bg-[#C84B31] text-white border-white/40 scale-105 shadow-md"
                                        : "bg-white/10 text-rose-100 border-white/10 hover:bg-white/20"
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-[10px] text-rose-200/80 px-2 mt-1 max-w-[320px] mx-auto">
                              <span>1 = {t.leftPole}</span>
                              <span>5 = {t.rightPole}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={t.id}
                        className="bg-white p-6 rounded-[20px] border border-ink/10 shadow-sm space-y-4 hover:border-ink/20 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="bg-cream text-ink-muted border border-ink/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Tensión {t.id} · CLUSTER: {t.cluster}
                          </span>
                          <span className="text-xs font-mono font-bold text-ink-soft">
                            {currentVal} / 5
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-lg text-ink">
                            {idx + 1}. {t.name}
                          </h4>
                        </div>

                        {/* Poles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60 space-y-0.5">
                            <span className="font-bold text-rose-900 block">
                              Polo 1: {t.leftPole}
                            </span>
                            <p className="text-rose-800 text-[11px] leading-snug">
                              {t.leftDesc}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-0.5">
                            <span className="font-bold text-emerald-900 block">
                              Polo 5: {t.rightPole}
                            </span>
                            <p className="text-emerald-800 text-[11px] leading-snug">
                              {t.rightDesc}
                            </p>
                          </div>
                        </div>

                        {/* 1-5 scale buttons */}
                        <div className="pt-1">
                          <div className="flex justify-between items-center max-w-[360px] mx-auto gap-2">
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSel = currentVal === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => selectTension(t.id, val)}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                    isSel
                                      ? "bg-ink text-white border-ink scale-105 shadow-sm"
                                      : "bg-cream/50 text-ink-muted border-ink/10 hover:bg-cream hover:border-ink/30"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-[10.5px] text-ink-muted px-2 mt-1.5 max-w-[360px] mx-auto font-medium">
                            <span>1 = {t.leftPole}</span>
                            <span>3 = Equilibrio</span>
                            <span>5 = {t.rightPole}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {error && <p className="mt-6 text-[13px] text-tier1">{error}</p>}
        </div>
      </main>

      {/* Footer sticky */}
      <footer className="sticky bottom-0 bg-cream border-t border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevQuestion}
            className={`text-[13px] text-ink-soft hover:text-ink ${
              currentQ === 0 ? "invisible" : ""
            }`}
          >
            ← Atrás
          </button>
          {!isTensionsStep && (
            <span className="text-[12px] text-ink-muted hidden sm:block">
              Presiona A · B · C · D o ↵ para continuar
            </span>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(homeScreen)}
              className="text-[12px] text-ink-muted hover:text-ink"
            >
              Salir
            </button>
            <button
              onClick={handleAdvance}
              disabled={!isComplete || saving}
              className="rounded-[8px] bg-ink text-white text-[13px] font-medium px-[18px] py-[9px] hover:bg-ink-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : isLast ? "Finalizar →" : "Siguiente →"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
