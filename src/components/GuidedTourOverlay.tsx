import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import type { Screen } from "@/types";
import {
  Compass,
  LayoutDashboard,
  BrainCircuit,
  Globe,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export interface TourStep {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  targetScreen: Screen;
  icon: React.ReactNode;
  highlights: string[];
  accentColor: "blue" | "purple" | "emerald";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "observabilidad",
    title: "Observabilidad",
    badge: "Vista Ejecutiva & C-Level",
    subtitle: "Monitoreo integral del nivel de madurez e impacto en IA",
    description:
      "Supervisa el estado global de apropiación de Inteligencia Artificial en toda la organización. Visualiza mapas de arquetipos, brechas de competencias, referentes internos y reportes ejecutivos consolidados.",
    targetScreen: "dashboard",
    icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
    highlights: [
      "Mapa de Apropiación e Indicador Global de IA",
      "Matriz de Diagnóstico y Brechas Dominantes",
      "Reporte C-Level y Exportación de Resúmenes",
    ],
    accentColor: "blue",
  },
  {
    id: "mi-espacio",
    title: "Mi Espacio",
    badge: "Productividad Individual",
    subtitle: "Centro de control de proyectos, habilidades y prompts maestros",
    description:
      "Tu espacio de trabajo personal habilitado para Inteligencia Artificial. Registra iniciativas, guarda tus prompts más efectivos, consulta tu radar de competencias y accede a herramientas recomendadas.",
    targetScreen: "user-workspace",
    icon: <BrainCircuit className="w-6 h-6 text-purple-600" />,
    highlights: [
      "Gestión de Proyectos e Iniciativas de IA",
      "Biblioteca Personal de Prompts y Recursos",
      "Diagnóstico Individual de Competencias",
    ],
    accentColor: "purple",
  },
  {
    id: "comunidad",
    title: "Comunidad HumanAI",
    badge: "Ecosistema de Conocimiento",
    subtitle:
      "Aprende, comparte y colabora con casos de éxito organizacionales",
    description:
      "Conéctate con la red interna de talento en IA. Descubre recursos publicados por otros colaboradores, clona plantillas útiles, inspírate con proyectos destacados y comparte tus mejores prácticas.",
    targetScreen: "comunidad-humanai",
    icon: <Globe className="w-6 h-6 text-emerald-600" />,
    highlights: [
      "Recursos y Casos de Éxito Compartidos",
      "Directorio de Talentos y Champions de IA",
      "Plantillas Clonables y Aprendizaje Colaborativo",
    ],
    accentColor: "emerald",
  },
];

const STORAGE_KEY = "guided_tour_completed";

export function GuidedTourOverlay() {
  const { navigateTo, role, screen } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Revisar si es un usuario nuevo o si se gatilla manualmente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tourSeen = localStorage.getItem(STORAGE_KEY);
      const isWorkspaceScreen =
        screen !== "quiz" && screen !== "login" && screen !== "report";

      if (!isWorkspaceScreen) {
        setIsOpen(false);
        return;
      }

      if (!tourSeen && role && isWorkspaceScreen) {
        // Mostrar automáticamente 800ms después del ingreso al espacio de trabajo
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [role, screen]);

  // Escuchar evento personalizado para abrir el tour desde cualquier parte
  useEffect(() => {
    const handleTriggerTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("open_guided_tour", handleTriggerTour);
    return () => {
      window.removeEventListener("open_guided_tour", handleTriggerTour);
    };
  }, []);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Al cambiar de paso, navegar a la pantalla correspondiente
  useEffect(() => {
    if (isOpen && currentStep && screen !== "quiz") {
      navigateTo(currentStep.targetScreen);
    }
  }, [isOpen, currentStepIndex, currentStep, navigateTo, screen]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finalizar
      setIsOpen(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }
  }, [currentStepIndex]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, []);

  // Manejo de atajos con teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Clases de acento según la sección activa
  const colorStyles = {
    blue: {
      badge: "bg-blue-50 text-blue-800 border-blue-200",
      border: "border-blue-500",
      ring: "ring-blue-500/20",
      button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25",
      dot: "bg-blue-600",
      lightBg: "bg-blue-50/50",
    },
    purple: {
      badge: "bg-purple-50 text-purple-800 border-purple-200",
      border: "border-purple-500",
      ring: "ring-purple-500/20",
      button:
        "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25",
      dot: "bg-purple-600",
      lightBg: "bg-purple-50/50",
    },
    emerald: {
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      border: "border-emerald-500",
      ring: "ring-emerald-500/20",
      button:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
      dot: "bg-emerald-600",
      lightBg: "bg-emerald-50/50",
    },
  }[currentStep.accentColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Background Spotlight Card */}
      <div
        className={`relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 ${colorStyles.border} ring-8 ${colorStyles.ring} overflow-hidden transition-all duration-300 transform animate-in zoom-in-95`}
      >
        {/* Header decoration bar */}
        <div className={`h-2 w-full ${colorStyles.dot}`} />

        {/* Top Header Row */}
        <div className="p-5 sm:p-6 pb-0 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${colorStyles.lightBg} border border-slate-200/60 shrink-0`}
            >
              {currentStep.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorStyles.badge}`}
                >
                  {currentStep.badge}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Paso {currentStepIndex + 1} de {TOUR_STEPS.length}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-poppins">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            title="Cerrar tour"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 font-poppins">
              {currentStep.subtitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Key Highlights list */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Características destacadas en esta sección
            </p>
            <div className="space-y-1.5">
              {currentStep.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 mt-2">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                title={`Ir al paso: ${step.title}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? `w-8 ${colorStyles.dot}`
                    : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors mr-auto sm:mr-0"
            >
              Omitir
            </button>

            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all ${colorStyles.button}`}
            >
              {isLastStep ? (
                <>
                  <span>Finalizar Tour</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Trigger button component to relaunch the tour anytime
 */
export function GuidedTourTriggerButton({
  className,
  collapsed,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  const trigger = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_guided_tour"));
    }
  };

  return (
    <button
      type="button"
      onClick={trigger}
      title="Iniciar Tour Guiado por la Plataforma"
      className={
        className ||
        `rounded-[8px] hover:bg-ink/5 hover:text-ink transition-all flex items-center gap-2 text-ink-soft text-xs font-medium ${
          collapsed ? "justify-center p-2.5 w-full" : "px-3 py-2 text-left"
        }`
      }
    >
      <Compass className="w-4 h-4 text-blue-600 shrink-0" />
      {!collapsed && <span>Tour Guiado</span>}
    </button>
  );
}
