import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Play,
  ExternalLink,
  Bot,
  Target,
  Zap,
  CheckCircle2,
  Filter,
  Youtube,
  GraduationCap,
  ArrowRight,
  Video,
  Bookmark,
} from "lucide-react";
import { CURATED_COURSES, type CuratedCourse } from "@/data/curatedCourses";
import { getGapType, getSubperfil } from "@/data/scoring";

interface EducateWidgetProps {
  subperfil?: string;
  arquetipo?: string;
  tier?: number;
  gapType?: "convencido_sin_herramientas" | "poder_sin_proposito" | "alineado";
  dimScores?: Record<string, number>;
  userArea?: string;
  userName?: string;
}

export function EducateWidget({
  subperfil = "Explorador",
  arquetipo = "Táctico",
  tier = 2,
  gapType,
  dimScores,
  userArea = "General",
  userName = "Colaborador",
}: EducateWidgetProps) {
  const [filterMode, setFilterMode] = useState<
    "todos" | "subperfil" | "brecha" | "basico" | "intermedio" | "avanzado"
  >("subperfil");
  const [activeCourseModal, setActiveCourseModal] =
    useState<CuratedCourse | null>(null);
  const [savedCourses, setSavedCourses] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(
          localStorage.getItem("educate_saved_courses") || "[]",
        );
      } catch {
        return [];
      }
    }
    return [];
  });

  // Calculate actual gapType if not explicitly passed
  const computedGapType =
    gapType ||
    getGapType(arquetipo, subperfil) ||
    "convencido_sin_herramientas";

  // Find lowest dimension score to identify priority development gap
  const lowestDimension = dimScores
    ? Object.entries(dimScores)
        .map(([dim, score]) => ({ dim, score: Number(score) }))
        .sort((a, b) => a.score - b.score)[0]
    : { dim: "Contexto & Prompts", score: 3 };

  // Filter courses based on user selection
  const filteredCourses = CURATED_COURSES.filter((course) => {
    if (filterMode === "todos") return true;
    if (filterMode === "subperfil") {
      return (
        course.subprofiles.includes(
          subperfil as CuratedCourse["subprofiles"][number],
        ) || course.subprofiles.includes("Explorador")
      );
    }
    if (filterMode === "brecha") {
      return (
        course.gapTypes.includes(computedGapType) ||
        course.dimensions.includes(lowestDimension.dim)
      );
    }
    if (filterMode === "basico") return course.level === "Básico";
    if (filterMode === "intermedio") return course.level === "Intermedio";
    if (filterMode === "avanzado") return course.level === "Avanzado";
    return true;
  });

  const toggleSaveCourse = (courseId: string) => {
    const updated = savedCourses.includes(courseId)
      ? savedCourses.filter((id) => id !== courseId)
      : [...savedCourses, courseId];
    setSavedCourses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("educate_saved_courses", JSON.stringify(updated));
    }
  };

  const handleTriggerMia = (promptText: string) => {
    window.dispatchEvent(
      new CustomEvent("open-mia-chat", {
        detail: { prompt: promptText },
      }),
    );
  };

  const getGapDescription = (gap: string) => {
    switch (gap) {
      case "convencido_sin_herramientas":
        return {
          title: "Alta Actitud, Brecha de Herramientas Técnicas",
          badge: "Práctica & Prompting",
          color: "bg-amber-50 text-amber-900 border-amber-200",
          desc: "Tienes excelente disposición pero necesitas dominar técnicas de prompting estructurado, contexto y automatización de tareas cotidianas.",
        };
      case "poder_sin_proposito":
        return {
          title: "Alto Dominio Técnico, Brecha de Alineación Estratégica",
          badge: "Estrategia & Gobernanza",
          color: "bg-indigo-50 text-indigo-900 border-indigo-200",
          desc: "Dominas herramientas técnicas pero necesitas conectar tus proyectos con los objetivos estratégicos del negocio, ética y gestión del cambio.",
        };
      default:
        return {
          title: "Perfil Equilibrado en Desarrollo",
          badge: "Escalamiento & Liderazgo",
          color: "bg-emerald-50 text-emerald-900 border-emerald-200",
          desc: "Mantienes un equilibrio saludable entre actitud y habilidad. Tu foco debe estar en escalar soluciones, crear skills reutilizables y mentoría.",
        };
    }
  };

  const gapInfo = getGapDescription(computedGapType);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER: User Profile & Development Gap */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-md border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Pilar REDUCATE · Rutas Personalizadas
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
                Subperfil: {subperfil}
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400 shrink-0" />
              Ecosistema de Formación de Prestigio
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Cursos curados de YouTube, laboratorios Crearia y mentoría
              generativa con MIA diseñados específicamente para tu nivel{" "}
              <strong>{subperfil}</strong> y tu área de{" "}
              <strong>{userArea}</strong>.
            </p>
          </div>

          <button
            onClick={() =>
              handleTriggerMia(
                `Hola MIA, soy ${userName} (${subperfil} en ${userArea}). Mi brecha prioritaria está en ${lowestDimension.dim} (Score ${lowestDimension.score}). ¿Puedes generarme un plan de aprendizaje semanal personalizado de 3 pasos?`,
              )
            }
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Plan Personalizado con MIA</span>
          </button>
        </div>

        {/* Development Gap Alert Box */}
        <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 block">
                Brecha Identificada
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                {gapInfo.title}
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                {gapInfo.desc}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-sky-300 block">
                Dimensión por Reforzar
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                {lowestDimension.dim} (Score: {lowestDimension.score}/8)
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Tus diagnósticos muestran la mayor oportunidad de crecimiento en
                la dimensión {lowestDimension.dim}.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 block">
                Tutoría Inteligente MIA
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                Acompañamiento Continuo 24/7
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Usa MIA para resolver dudas de código, traducir teoría a prompts
                y revisar tus proyectos en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR & CURATED COURSES SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-black/10">
          <div>
            <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600" />
              Cursos YouTube Curados & Recursos Especializados
            </h3>
            <p className="text-xs text-ink-muted">
              Contenido de alta calidad seleccionado según tu nivel de madurez
              en IA
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setFilterMode("subperfil")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                filterMode === "subperfil"
                  ? "bg-ink text-white shadow-xs"
                  : "bg-slate-100 text-ink-muted hover:text-ink hover:bg-slate-200"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Para Mi Subperfil ({subperfil})
            </button>

            <button
              onClick={() => setFilterMode("brecha")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                filterMode === "brecha"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-ink-muted hover:text-ink hover:bg-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Cerrar Brecha Prioritaria
            </button>

            <button
              onClick={() => setFilterMode("todos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterMode === "todos"
                  ? "bg-ink text-white shadow-xs"
                  : "bg-slate-100 text-ink-muted hover:text-ink hover:bg-slate-200"
              }`}
            >
              Todos ({CURATED_COURSES.length})
            </button>
          </div>
        </div>

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const isSaved = savedCourses.includes(course.id);
            const isSubprofileMatch = course.subprofiles.includes(
              subperfil as CuratedCourse["subprofiles"][number],
            );

            return (
              <div
                key={course.id}
                className="group bg-white rounded-xl border border-black/10 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Play Badge Overlay */}
                    <a
                      href={course.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </a>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-black/70 text-white backdrop-blur-xs">
                        {course.level}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSaveCourse(course.id);
                        }}
                        className={`p-1.5 rounded-full pointer-events-auto transition-colors ${
                          isSaved
                            ? "bg-amber-500 text-white"
                            : "bg-black/60 text-white/80 hover:text-white hover:bg-black/80"
                        }`}
                        title={
                          isSaved
                            ? "Guardado"
                            : "Guardar en mi lista de estudio"
                        }
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Bottom Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                      {course.duration}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-ink-soft bg-slate-100 px-2 py-0.5 rounded">
                        {course.channel}
                      </span>
                      {isSubprofileMatch && (
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ✓ Recomendado
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-bold text-sm text-ink leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                      {course.title}
                    </h4>

                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9.5px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3 bg-slate-50 border-t border-black/5 flex items-center justify-between gap-2">
                  <a
                    href={course.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-ink text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                    <span>Ver en YouTube</span>
                  </a>

                  <button
                    onClick={() =>
                      handleTriggerMia(
                        `MIA, voy a ver el curso "${course.title}". ¿Me das un resumen ejecutivo con los 3 conceptos clave y 1 ejercicio práctico para aplicar en mi puesto de ${userArea}?`,
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Estudiar con MIA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MIA LEARNING & CREARIA LABS SECTION */}
      <div className="p-5 rounded-2xl bg-[#EBF6F1]/80 border border-[#0D7A5F]/20 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0D7A5F] shrink-0" />
            <div>
              <h4 className="font-display font-bold text-sm text-ink">
                Aprende Creando: Laboratorios MIA & Crearia
              </h4>
              <p className="text-xs text-ink/80">
                Combina cursos teóricos con la creación de Skills y Prompts
                aplicados en tu día a día
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              handleTriggerMia(
                `Hola MIA, ayúdame a crear una Skill o Prompt para mi trabajo en ${userArea}. Dame una plantilla probada para mi nivel ${subperfil}.`,
              )
            }
            className="px-3.5 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#0D7A5F]/90 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span>Crear Skill/Prompt Guiado con MIA</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-white rounded-xl border border-[#0D7A5F]/15 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D7A5F] block">
              Paso 1: Diagnóstico & Vídeo
            </span>
            <p className="text-xs font-bold text-ink mt-0.5">
              Refuerza tu base técnica
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Mira los módulos sugeridos de YouTube enfocados en tu brecha
              prioritaria ({lowestDimension.dim}).
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#0D7A5F]/15 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D7A5F] block">
              Paso 2: Conversa con MIA
            </span>
            <p className="text-xs font-bold text-ink mt-0.5">
              Adapta el conocimiento a tu área
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Pídele a MIA que traduzca el curso en un prompt específico para tu
              departamento de {userArea}.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#0D7A5F]/15 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D7A5F] block">
              Paso 3: Publica en la Comunidad
            </span>
            <p className="text-xs font-bold text-ink mt-0.5">
              Comparte tu Skill con el equipo
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Guarda y publica tu creación en la Comunidad HumanAI para subir tu
              puntuación de EXPERIMENT & EMPOWER.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
