import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useDashboard } from "@/hooks/useDashboard";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { regenerateSampleDataFn } from "@/lib/bigquery.functions";
import { PrestigioLogo } from "@/components/PrestigioLogo";
import {
  Sparkles,
  BookOpen,
  Target,
  Beaker,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  Sun,
  Eye,
  Brain,
  TrendingUp,
  Bot,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Sliders,
  Cpu,
} from "lucide-react";

export function MethodologyScreen() {
  const { companyId } = useApp();
  const { awareScores, reload } = useDashboard("__all__");
  const [seeding, setSeeding] = useState(false);

  const [openStages, setOpenStages] = useState<Record<string, boolean>>({
    awake: true,
    watch: true,
    align: true,
    reducate: true,
    experiment: true,
  });

  const toggleStage = (key: string) => {
    setOpenStages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
        activeScreen="methodology"
        onRegenerate={regenerateSampleData}
        seeding={seeding}
      />
      <div className="flex-1 mx-auto max-w-[1100px] px-3 sm:px-6 py-4 sm:py-8 w-full min-w-0 flex flex-col justify-between overflow-x-hidden">
        <div>
          {/* Header */}
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
                  METODOLOGÍA Y MARCO CONCEPTUAL
                </p>
              </div>
            </div>
          </header>

          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-black/5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-[#0D7A5F]" />
                <h2 className="font-display font-bold text-xl text-ink">
                  Metodología AWARE
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#EBF6F1] px-3 py-2 rounded-xl border border-[#0D7A5F]/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0D7A5F]" />
              <span className="text-[11px] font-semibold text-[#0D7A5F]">
                Modelo Patentado AWARE v2.5
              </span>
            </div>
          </div>

          {/* ACCORDION STAGES SECTION */}
          <div className="mb-8 space-y-4">
            <h3 className="font-display font-bold text-lg text-ink mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#0D7A5F]" />
              Etapas de la Metodología AWARE
            </h3>

            {/* STAGE 1: AWAKE */}
            <div className="border border-[#0D7A5F]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleStage("awake")}
                className="p-4 bg-[#EBF6F1]/50 hover:bg-[#EBF6F1] transition-colors cursor-pointer flex items-center justify-between border-b border-[#0D7A5F]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0D7A5F] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                      AWAKE
                    </h4>
                    <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      DESPERTAR
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-[#0D7A5F] uppercase tracking-wider mt-0.5">
                      PERFIL DE APROPIACIÓN + RIESGO DE NO ACELERAR
                    </p>
                  </div>
                </div>
                {openStages.awake ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {openStages.awake && (
                <div className="p-6 md:p-8 bg-slate-50/30 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#EBF6F1] border border-[#0D7A5F]/30 text-[#0D7A5F] flex items-center justify-center mb-4">
                    <Sun className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 font-display tracking-tight mb-0.5">
                    AWAKE
                  </h3>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    DESPERTAR
                  </span>
                  <p className="text-xs md:text-sm font-bold text-[#0D7A5F] uppercase tracking-widest mb-8">
                    PERFIL DE APROPIACIÓN + RIESGO DE NO ACELERAR
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full text-left">
                    <div className="lg:col-span-6 space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        Desmitificar la IA, activar la mentalidad de crecimiento
                        en los líderes y eliminar el miedo operativo.
                      </p>

                      <div className="bg-[#EBF6F1]/60 border border-[#0D7A5F]/20 p-5 rounded-2xl">
                        <span className="text-xs font-bold text-[#0D7A5F] uppercase tracking-wider mb-2 block">
                          RESULTADO VISIBLE
                        </span>
                        <p className="text-slate-900 text-sm md:text-base font-semibold leading-relaxed">
                          La dirección deja de hablar de IA como moda y empieza
                          a hablar de negocio, cliente, capacidades humanas y
                          futuro.
                        </p>
                      </div>
                    </div>

                    {/* AWAKE Mockup Visual */}
                    <div className="lg:col-span-6">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm max-w-md mx-auto">
                        <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[#0D7A5F] text-white text-[10px] font-bold flex items-center justify-center">
                              A
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              AWAKE — Perfil de Apropiación
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Prestigio | ESIC
                          </span>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 mb-3">
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                            Tu perfil de apropiación
                          </span>
                          <span className="text-xs font-black text-rose-900 uppercase">
                            PREDOMINIO ESCÉPTICO
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-bold text-slate-700 block mb-0.5">
                              TENDENCIA DEL PERFIL
                            </span>
                            <span className="text-slate-500">
                              Evaluación prudente de riesgos y necesidad de
                              comprender el impacto antes de dar un paso.
                            </span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-bold text-[#0D7A5F] block mb-0.5">
                              Para AUTODESARROLLAR
                            </span>
                            <span className="text-slate-500">
                              Evolucionar rápidamente hacia un nivel de
                              amplificación mediante victorias cortas.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                          <span>Apropiación IA</span>
                          <span className="text-[#0D7A5F]">
                            Riesgo Controlado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STAGE 2: WATCH */}
            <div className="border border-[#C84B31]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleStage("watch")}
                className="p-4 bg-[#FDF0EE]/50 hover:bg-[#FDF0EE] transition-colors cursor-pointer flex items-center justify-between border-b border-[#C84B31]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C84B31] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    W
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                      WATCH
                    </h4>
                    <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      OBSERVAR
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-[#C84B31] uppercase tracking-wider mt-0.5">
                      LECTURA DE REALIDAD
                    </p>
                  </div>
                </div>
                {openStages.watch ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {openStages.watch && (
                <div className="p-6 md:p-8 bg-slate-50/30 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDF0EE] border border-[#C84B31]/30 text-[#C84B31] flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 font-display tracking-tight mb-0.5">
                    WATCH
                  </h3>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    OBSERVAR
                  </span>
                  <p className="text-xs md:text-sm font-bold text-[#C84B31] uppercase tracking-widest mb-8">
                    LECTURA DE REALIDAD
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full text-left">
                    <div className="lg:col-span-6 space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        Diagnóstico profundo del estado digital actual, procesos
                        clave y nivel de madurez tecnológica del equipo.
                      </p>

                      <div className="bg-[#FDF0EE]/60 border border-[#C84B31]/20 p-5 rounded-2xl">
                        <span className="text-xs font-bold text-[#C84B31] uppercase tracking-wider mb-2 block">
                          RESULTADO VISIBLE
                        </span>
                        <p className="text-slate-900 text-sm md:text-base font-semibold leading-relaxed">
                          La organización empieza a distinguir síntomas de
                          causas y el equipo directivo le da espacio real al
                          proceso de transformación.
                        </p>
                      </div>
                    </div>

                    {/* WATCH Mockup Visual */}
                    <div className="lg:col-span-6">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm max-w-md mx-auto space-y-2.5">
                        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Diagnóstico de 7 Tensiones Clave
                          </span>
                          <span className="text-[10px] bg-[#FDF0EE] text-[#C84B31] px-2 py-0.5 rounded font-semibold border border-[#C84B31]/20">
                            Madurez: 68%
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[10px]">
                          {[
                            {
                              name: "1. Mentalidad & Adopción",
                              val: 75,
                              color: "bg-[#C84B31]",
                            },
                            {
                              name: "2. Emocionalidad & Miedo",
                              val: 62,
                              color: "bg-[#A87028]",
                            },
                            {
                              name: "3. Contexto & Procesos",
                              val: 80,
                              color: "bg-[#2B5B84]",
                            },
                            {
                              name: "4. Datos & Gobernanza",
                              val: 55,
                              color: "bg-[#C84B31]",
                            },
                            {
                              name: "5. Automatización IA",
                              val: 68,
                              color: "bg-[#0D7A5F]",
                            },
                            {
                              name: "6. Calidad & Criterio",
                              val: 82,
                              color: "bg-[#0D7A5F]",
                            },
                            {
                              name: "7. Autonomía Directiva",
                              val: 60,
                              color: "bg-[#2B5B84]",
                            },
                          ].map((t) => (
                            <div key={t.name}>
                              <div className="flex justify-between text-slate-600 font-medium mb-0.5">
                                <span>{t.name}</span>
                                <span>{t.val}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${t.color} rounded-full`}
                                  style={{ width: `${t.val}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STAGE 3: ALIGN */}
            <div className="border border-[#888880]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleStage("align")}
                className="p-4 bg-[#F0F0EC]/50 hover:bg-[#F0F0EC] transition-colors cursor-pointer flex items-center justify-between border-b border-[#888880]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#888880] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                      ALIGN
                    </h4>
                    <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      ALINEAR
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-[#888880] uppercase tracking-wider mt-0.5">
                      MATRIZ VALOR VS FRECUENCIA + PROYECTOS CLAVE
                    </p>
                  </div>
                </div>
                {openStages.align ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {openStages.align && (
                <div className="p-6 md:p-8 bg-slate-50/30 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0F0EC] border border-[#888880]/30 text-[#888880] flex items-center justify-center mb-4">
                    <Target className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 font-display tracking-tight mb-0.5">
                    ALIGN
                  </h3>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    ALINEAR
                  </span>
                  <p className="text-xs md:text-sm font-bold text-[#888880] uppercase tracking-widest mb-8">
                    MATRIZ VALOR VS FRECUENCIA + PROYECTOS CLAVE
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full text-left">
                    <div className="lg:col-span-6 space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        Conectar la adopción tecnológica con el propósito, la
                        estrategia del negocio y el bienestar del talento.
                      </p>

                      <div className="bg-[#F0F0EC]/60 border border-[#888880]/20 p-5 rounded-2xl">
                        <span className="text-xs font-bold text-[#888880] uppercase tracking-wider mb-2 block">
                          RESULTADO VISIBLE
                        </span>
                        <p className="text-slate-900 text-sm md:text-base font-semibold leading-relaxed">
                          La organización entiende qué sí, qué no, qué importa
                          más y cómo decidir en medio de la incertidumbre.
                        </p>
                      </div>
                    </div>

                    {/* ALIGN Mockup Visual */}
                    <div className="lg:col-span-6">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm max-w-md mx-auto space-y-3">
                        <div className="border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-800 block">
                            MATRIZ DE ACTIVIDADES
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Describe tus actividades reales y la IA sugiere
                            dónde va cada una
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
                            <span className="font-bold text-amber-800 block mb-1">
                              Q2 · ASISTENTES & ASISTENTES ESPECIALIZADOS (1/5)
                            </span>
                            <p className="text-slate-700 font-semibold text-[10px]">
                              Realizar Reportes Junta Directiva
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              300 min · Copiloto con prompt
                            </span>
                          </div>

                          <div className="p-2.5 bg-[#E8F1F8] rounded-xl border border-[#2B5B84]/20">
                            <span className="font-bold text-[#2B5B84] block mb-1">
                              Q4 · AGENTES & GENERACIÓN DE CÓDIGO (1/5)
                            </span>
                            <p className="text-slate-700 font-semibold text-[10px]">
                              Analizar tendencias de mercado
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              600 min · Sistemas integrados
                            </span>
                          </div>

                          <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200/80">
                            <span className="font-bold text-rose-800 block mb-1">
                              Q1 · RIDICULIST (0/5)
                            </span>
                            <span className="text-slate-400 italic text-[9px]">
                              Eliminar o delegar actividades
                            </span>
                          </div>

                          <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                            <span className="font-bold text-emerald-800 block mb-1">
                              Q3 · AUTOMATIZACIÓN (1/5)
                            </span>
                            <p className="text-slate-700 font-semibold text-[10px]">
                              Gestionar correos automática
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              Flujos autónomos
                            </span>
                          </div>
                        </div>

                        <div className="text-[9.5px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span>3 actividades mapeadas</span>
                          <span className="text-[#888880] font-semibold">
                            AI*SER Matriz
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STAGE 4: REDUCATE */}
            <div className="border border-[#96a900]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleStage("reducate")}
                className="p-4 bg-[#F3F7E6]/50 hover:bg-[#F3F7E6] transition-colors cursor-pointer flex items-center justify-between border-b border-[#96a900]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#96a900] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    R
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                      REDUCATE
                    </h4>
                    <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      RE-EDUCAR
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-[#96a900] uppercase tracking-wider mt-0.5">
                      MIA + CONTENIDOS HIPER-PERSONALIZADOS
                    </p>
                  </div>
                </div>
                {openStages.reducate ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {openStages.reducate && (
                <div className="p-6 md:p-8 bg-slate-50/30 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#F3F7E6] border border-[#96a900]/30 text-[#96a900] flex items-center justify-center mb-4">
                    <Brain className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 font-display tracking-tight mb-0.5">
                    REDUCATE
                  </h3>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    RE-EDUCAR
                  </span>
                  <p className="text-xs md:text-sm font-bold text-[#96a900] uppercase tracking-widest mb-8">
                    MIA + CONTENIDOS HIPER-PERSONALIZADOS
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full text-left">
                    <div className="lg:col-span-6 space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        Aprender a usar copilotos y prompts, pero sobre todo,
                        desarrollar el criterio humano y la toma de decisiones.
                      </p>

                      <div className="bg-[#F3F7E6]/60 border border-[#96a900]/20 p-5 rounded-2xl">
                        <span className="text-xs font-bold text-[#96a900] uppercase tracking-wider mb-2 block">
                          RESULTADO VISIBLE
                        </span>
                        <p className="text-slate-900 text-sm md:text-base font-semibold leading-relaxed">
                          La organización deja de depender de entrenamientos
                          masivos y comienza a construir apropiación real con
                          data medible por persona y área.
                        </p>
                      </div>
                    </div>

                    {/* REDUCATE Mockup Visual */}
                    <div className="lg:col-span-6">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm max-w-md mx-auto space-y-3">
                        <div className="flex items-center gap-3 bg-[#F3F7E6] p-3 rounded-xl border border-[#96a900]/20">
                          <div className="w-10 h-10 rounded-full bg-[#96a900] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                            MIA
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block">
                              MÍA
                            </span>
                            <span className="text-[10px] text-[#96a900] font-medium">
                              Copiloto de Capacitación Personalizada
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-800 block mb-1">
                              Estilo Convergente
                            </span>
                            <span className="text-slate-500">
                              Enfoque práctico y estructurado para resolución de
                              retos con IA.
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-800 block mb-1">
                              Plan 30 - 60 - 90 Días
                            </span>
                            <span className="text-slate-500">
                              Rutas activas en Crearia + YouTube + Prompts.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>Data Medible por Persona</span>
                          <span className="text-[#96a900] font-semibold">
                            Prestigio AWARE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STAGE 5: EXPERIMENT */}
            <div className="border border-[#A87028]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
              <div
                onClick={() => toggleStage("experiment")}
                className="p-4 bg-[#FBF5E8]/50 hover:bg-[#FBF5E8] transition-colors cursor-pointer flex items-center justify-between border-b border-[#A87028]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#A87028] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    E
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                      EXPERIMENT & EMPOWER
                    </h4>
                    <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      EXPERIMENTAR & EMPODERAR
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold text-[#A87028] uppercase tracking-wider mt-0.5">
                      MAPA DE APRENDIZAJES + COMUNIDAD DE PRÁCTICA + MAPEO
                      PERFILES INTERNOS
                    </p>
                  </div>
                </div>
                {openStages.experiment ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {openStages.experiment && (
                <div className="p-6 md:p-8 bg-slate-50/30 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#FBF5E8] border border-[#A87028]/30 text-[#A87028] flex items-center justify-center mb-4">
                    <Beaker className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 font-display tracking-tight mb-0.5">
                    EXPERIMENT & EMPOWER
                  </h3>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    EXPERIMENTAR & EMPODERAR
                  </span>
                  <p className="text-xs md:text-sm font-bold text-[#A87028] uppercase tracking-widest mb-8">
                    MAPA DE APRENDIZAJES + COMUNIDAD DE PRÁCTICA + MAPEO
                    PERFILES INTERNOS
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full text-left">
                    <div className="lg:col-span-6 space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        Crear laboratorios de experimentación segura y eficiente
                        con células de trabajo preparadas para iterar.
                      </p>

                      <div className="bg-[#FBF5E8]/60 border border-[#A87028]/20 p-5 rounded-2xl">
                        <span className="text-xs font-bold text-[#A87028] uppercase tracking-wider mb-2 block">
                          RESULTADO VISIBLE
                        </span>
                        <p className="text-slate-900 text-sm md:text-base font-semibold leading-relaxed">
                          La organización aprende más rápido, con menos miedo y
                          con más sentido.
                        </p>
                      </div>
                    </div>

                    {/* EXPERIMENT Mockup Visual */}
                    <div className="lg:col-span-6">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm max-w-md mx-auto space-y-2.5">
                        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Comunidad de Práctica AWARE
                          </span>
                          <span className="text-[10px] bg-[#FBF5E8] text-[#A87028] px-2 py-0.5 rounded font-semibold border border-[#A87028]/20">
                            Ecosistema Activo
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[10px]">
                          <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                            <span className="font-semibold text-emerald-900">
                              🚀 Proyecto: Generador de Propuestas
                            </span>
                            <span className="text-emerald-700 font-bold">
                              92% Eficiencia
                            </span>
                          </div>

                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <span className="font-semibold text-slate-700">
                              ⚡ Skill: Extractor de Insights PDF
                            </span>
                            <span className="text-slate-500">45 Usos</span>
                          </div>

                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <span className="font-semibold text-slate-700">
                              💬 Prompt: Estructurador de Minutas
                            </span>
                            <span className="text-slate-500">Validado</span>
                          </div>
                        </div>

                        <div className="text-[9.5px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span>Mapeo de Perfiles Internos</span>
                          <span className="text-[#A87028] font-semibold">
                            Laboratorios Reales
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
