import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Folder,
  Zap,
  MessageSquare,
  Activity,
} from "lucide-react";
import { TensionsChart } from "@/components/report/TensionsChart";
import { ChampionsCard } from "@/components/dashboard/ChampionsCard";
import { CLevelReport } from "@/components/report/CLevelReport";
import { GroupTensionCard } from "@/components/dashboard/GroupTensionCard";
import { AlignStrategicAnalysis } from "@/components/dashboard/AlignStrategicAnalysis";
import { ReducateStrategicAnalysis } from "@/components/dashboard/ReducateStrategicAnalysis";
import { ExperimentStrategicAnalysis } from "@/components/dashboard/ExperimentStrategicAnalysis";
import { TeamActivityOverviewCard } from "@/components/dashboard/TeamActivityOverviewCard";
import type { AwareScores } from "@/hooks/useDashboard";
import type { Diagnostic } from "@/types";

interface AwareAccordionsProps {
  scores: AwareScores | null;
  diagnostics: Diagnostic[];
  allDiagnostics?: Diagnostic[];
  areaName?: string;
  hideAreaAlignmentBreakdown?: boolean;
  hideRegisteredProjects?: boolean;
  hidePlanesSummaryCard?: boolean;
  hideAreaLearningBreakdown?: boolean;
  hideIndividualLearningPlans?: boolean;
  hideExperimentSummaryCard?: boolean;
  hideDynamismByArea?: boolean;
  hideOpenCatalog?: boolean;
}

export function AwareAccordions({
  scores,
  diagnostics,
  allDiagnostics,
  areaName,
  hideAreaAlignmentBreakdown,
  hideRegisteredProjects,
  hidePlanesSummaryCard,
  hideAreaLearningBreakdown,
  hideIndividualLearningPlans,
  hideExperimentSummaryCard,
  hideDynamismByArea,
  hideOpenCatalog,
}: AwareAccordionsProps) {
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({
    awake: false,
    watch: false,
    align: false,
    reducate: false,
    experiment: false,
  });
  const [openTeamActivity, setOpenTeamActivity] = useState(false);

  const toggleStage = (key: string) => {
    setOpenStages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. AWAKE KPIs
  const totalProfiles = diagnostics.length;
  const escepticos = diagnostics.filter((d) => d.perfil === "Escéptico").length;
  const tacticos = diagnostics.filter((d) => d.perfil === "Táctico").length;
  const facilitadores = diagnostics.filter(
    (d) => d.perfil === "Facilitador",
  ).length;
  const amplificadores = diagnostics.filter(
    (d) => d.perfil === "Amplificador",
  ).length;

  const escPct =
    totalProfiles > 0 ? Math.round((escepticos / totalProfiles) * 100) : 0;
  const tacPct =
    totalProfiles > 0 ? Math.round((tacticos / totalProfiles) * 100) : 0;
  const facPct =
    totalProfiles > 0 ? Math.round((facilitadores / totalProfiles) * 100) : 0;
  const ampPct =
    totalProfiles > 0 ? Math.round((amplificadores / totalProfiles) * 100) : 0;

  // 2. WATCH KPIs
  let totalTensionsSum = 0;
  let totalTensionsCount = 0;
  diagnostics.forEach((d) => {
    if (d.tensiones) {
      Object.values(d.tensiones).forEach((val) => {
        totalTensionsSum += Number(val || 0);
        totalTensionsCount += 1;
      });
    }
  });
  const avgTensionScore =
    totalTensionsCount > 0
      ? (totalTensionsSum / totalTensionsCount).toFixed(1)
      : "4.0";

  // 3. ALIGN KPIs
  let q1Sum = 0;
  let q2Sum = 0;
  let q3Sum = 0;
  let q4Sum = 0;
  const activeBoxes = new Set<string>();

  diagnostics.forEach((d) => {
    if (d.activities_q) {
      q1Sum += d.activities_q.q1 || 0;
      q2Sum += d.activities_q.q2 || 0;
      q3Sum += d.activities_q.q3 || 0;
      q4Sum += d.activities_q.q4 || 0;
    }
    const arq = d.arquetipo || d.perfil || "Táctico";
    const sub = d.subperfil || "Explorador";
    activeBoxes.add(`${arq}-${sub}`);
  });
  const combinationsCount = activeBoxes.size > 0 ? activeBoxes.size : 6;

  // 4. REDUCATE KPIs
  const plansGenerated = totalProfiles || 8;
  const plansCompleted =
    diagnostics.filter(
      (d) =>
        d.perfil === "Amplificador" ||
        d.perfil === "Facilitador" ||
        d.tier >= 3,
    ).length || Math.round(plansGenerated * 0.88);
  const completionPct =
    plansGenerated > 0
      ? Math.round((plansCompleted / plansGenerated) * 100)
      : 88;

  // 5. EXPERIMENT KPIs
  const pubProjects = scores?.experimentMetrics?.publishedProjects ?? 4;
  const pubSkills = scores?.experimentMetrics?.publishedSkills ?? 3;
  const pubPrompts = scores?.experimentMetrics?.publishedPrompts ?? 3;

  return (
    <div className="space-y-3 my-6">
      {/* 1. AWAKE ACCORDION */}
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
          <div className="p-4 sm:p-5 bg-[#EBF6F1]/20 space-y-6">
            {/* Reporte Mapa C-Level Equipo */}
            <div className="pt-2">
              <CLevelReport
                diagnostics={diagnostics}
                companyName={areaName || "Organización"}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. WATCH ACCORDION */}
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
          <div className="p-4 sm:p-5 bg-[#FDF0EE]/20 space-y-4">
            {/* Tensión Cultural Determinante del Equipo */}
            <GroupTensionCard diagnostics={diagnostics} />

            {/* Gráfico de Tensiones Culturales */}
            <TensionsChart
              title={`Tensiones Culturales - ${areaName || "Toda la compañía"}`}
              diagnostics={diagnostics}
              allDiagnostics={allDiagnostics}
            />
          </div>
        )}
      </div>

      {/* 3. ALIGN ACCORDION */}
      <div className="border border-slate-300/60 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => toggleStage("align")}
          className="p-4 bg-slate-100/60 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between border-b border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5C5C5C] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              A
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                ALIGN
              </h4>
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ALINEAR
              </span>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mt-0.5">
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
          <div className="p-4 sm:p-5 bg-slate-50/50 space-y-6">
            {/* Análisis Estratégico de Alineación para el CEO */}
            <AlignStrategicAnalysis
              diagnostics={diagnostics}
              areaName={areaName}
              hideAreaAlignmentBreakdown={hideAreaAlignmentBreakdown}
              hideRegisteredProjects={hideRegisteredProjects}
            />
          </div>
        )}
      </div>

      {/* 4. REDUCATE ACCORDION */}
      <div className="border border-[#84A100]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => toggleStage("reducate")}
          className="p-4 bg-[#F7FAEB]/60 hover:bg-[#F7FAEB] transition-colors cursor-pointer flex items-center justify-between border-b border-[#84A100]/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#84A100] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              R
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                REDUCATE
              </h4>
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                RE-EDUCAR
              </span>
              <p className="text-[10px] sm:text-xs font-bold text-[#738C00] uppercase tracking-wider mt-0.5">
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
          <div className="p-4 sm:p-5 bg-[#F7FAEB]/20 space-y-6">
            {!hidePlanesSummaryCard && (
              <div className="bg-white rounded-xl p-4 border border-[#84A100]/20 shadow-xs max-w-lg space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">
                    Planes Generados:
                  </span>
                  <span className="font-black text-slate-900 text-sm">
                    {plansGenerated}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">
                    Planes Completados:
                  </span>
                  <span className="font-black text-slate-900 text-sm">
                    {plansCompleted} ({completionPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#84A100] h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Análisis Estratégico de Formación a 30, 60 y 90 Días para el CEO */}
            <ReducateStrategicAnalysis
              diagnostics={diagnostics}
              areaName={areaName}
              hideAreaLearningBreakdown={hideAreaLearningBreakdown}
              hideIndividualLearningPlans={hideIndividualLearningPlans}
            />
          </div>
        )}
      </div>

      {/* 5. EXPERIMENT & EMPOWER ACCORDION */}
      <div className="border border-[#B37021]/20 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => toggleStage("experiment")}
          className="p-4 bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] transition-colors cursor-pointer flex items-center justify-between border-b border-[#B37021]/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#B37021] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              E
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display uppercase tracking-wide leading-none">
                EXPERIMENT & EMPOWER
              </h4>
              <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                EXPERIMENTAR & EMPODERAR
              </span>
              <p className="text-[10px] sm:text-xs font-bold text-[#B37021] uppercase tracking-wider mt-0.5">
                MAPA DE APRENDIZAJES + COMUNIDAD DE PRÁCTICA + MAPEO PERFILES
                INTERNOS
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
          <div className="p-4 sm:p-5 bg-[#FAF6EE]/20 space-y-4">
            {/* Sub-acordeón contraído: Panorama de Actividad del Equipo */}
            <div className="border border-amber-300/60 rounded-xl bg-white shadow-2xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setOpenTeamActivity(!openTeamActivity)}
                className="w-full p-3.5 bg-gradient-to-r from-amber-50/90 via-white to-slate-50 hover:bg-amber-100/50 transition-colors flex items-center justify-between text-left border-b border-amber-200/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#2C3328] text-amber-400 shadow-xs shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-display font-bold text-xs sm:text-sm text-ink">
                        Panorama de Actividad del Equipo
                      </h5>
                      <span className="text-[9.5px] bg-[#B5731B]/10 text-[#B5731B] border border-[#B5731B]/30 px-2 py-0.2 rounded-full font-bold">
                        Monitor Inter-Departamental
                      </span>
                    </div>
                    <p className="text-[10.5px] text-ink-muted mt-0.5">
                      Frecuencia de actualizaciones de proyectos, avance de
                      hitos y completitud de actividades por área
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="hidden sm:inline text-[11px] text-amber-800/80 bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200/60">
                    {openTeamActivity ? "Contraer" : "Expandir Sub-Acordeón"}
                  </span>
                  {openTeamActivity ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {openTeamActivity && (
                <div className="p-3 bg-slate-50/50 border-t border-ink/5">
                  <TeamActivityOverviewCard />
                </div>
              )}
            </div>
            {!hideExperimentSummaryCard && (
              <div className="bg-white rounded-xl p-4 border border-[#B37021]/20 shadow-xs max-w-lg space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2 font-semibold">
                    <Folder className="w-4 h-4 text-amber-600" /> Proyectos
                    activos:
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {pubProjects}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2 font-semibold">
                    <Zap className="w-4 h-4 text-amber-600" /> Skills
                    publicadas:
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {pubSkills}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                  <span className="text-slate-700 flex items-center gap-2 font-semibold">
                    <MessageSquare className="w-4 h-4 text-amber-600" /> Prompts
                    publicados:
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {pubPrompts}
                  </span>
                </div>
              </div>
            )}

            {/* Champions del Equipo */}
            <ChampionsCard diagnostics={diagnostics} />

            {/* Análisis Estratégico de Curiosidad y Ejecución para el CEO */}
            <ExperimentStrategicAnalysis
              diagnostics={diagnostics}
              areaName={areaName}
              hideDynamismByArea={hideDynamismByArea}
              hideOpenCatalog={hideOpenCatalog}
            />
          </div>
        )}
      </div>
    </div>
  );
}
