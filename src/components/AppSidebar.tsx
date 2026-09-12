import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import type { Employee, Screen } from "@/types";
import { hasPermission } from "@/lib/roles";
import { getEmployeesFn } from "@/lib/bigquery.functions";
import { GuidedTourTriggerButton } from "@/components/GuidedTourOverlay";
import {
  Sparkles,
  LayoutDashboard,
  BrainCircuit,
  BookOpen,
  Users,
  UserCog,
  RefreshCw,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  ClipboardList,
  User,
} from "lucide-react";

interface Props {
  activeScreen: Screen;
  onNewEmployee?: () => void;
  onRegenerate?: () => void;
  seeding?: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  admin: {
    label: "Administrador",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  leader: {
    label: "Líder de Área",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  clevel: {
    label: "C-Level / Ejecutivo",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  consultant: {
    label: "Consultor Externo",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  employee: {
    label: "Colaborador",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function AppSidebar({
  activeScreen,
  onNewEmployee,
  onRegenerate,
  seeding,
}: Props) {
  const { role, currentEmployeeId, logout, navigateTo } = useApp();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string | null;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("auth_user_name");
      const savedEmail = localStorage.getItem("auth_user_email");
      if (savedName) {
        return { name: savedName, email: savedEmail || null };
      }
    }
    return null;
  });

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // En versión mobile (< 768px), debe estar siempre contraído por defecto
    if (window.innerWidth < 768) return true;
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored !== null) return stored === "true";
    return false;
  });

  const [, setPermVersion] = useState(0);

  useEffect(() => {
    const handlePermUpdate = () => {
      setPermVersion((prev) => prev + 1);
    };
    window.addEventListener("roles_permissions_updated", handlePermUpdate);
    return () => {
      window.removeEventListener("roles_permissions_updated", handlePermUpdate);
    };
  }, []);

  // Garantizar que en vista mobile siempre empiece contraído
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      localStorage.setItem("sidebar_collapsed", String(collapsed));
    }
  }, [collapsed]);

  // Cargar información completa del usuario actualmente autenticado
  useEffect(() => {
    let isMounted = true;
    async function loadUserInfo() {
      if (role === "admin" && !currentEmployeeId) {
        setCurrentUser({
          name: "Administrador del Sistema",
          email: "admin@empresa.com",
        });
        return;
      }

      if (currentEmployeeId) {
        try {
          const employees = (await getEmployeesFn()) as Employee[];
          const emp = employees?.find((e) => e.id === currentEmployeeId);
          if (emp && isMounted) {
            setCurrentUser({
              name: emp.name,
              email: emp.email || null,
            });
            if (typeof window !== "undefined") {
              localStorage.setItem("auth_user_name", emp.name);
              if (emp.email) {
                localStorage.setItem("auth_user_email", emp.email);
              }
            }
            return;
          }
        } catch (err) {
          console.error("Error al cargar datos del usuario:", err);
        }
      }

      if (typeof window !== "undefined") {
        const savedName = localStorage.getItem("auth_user_name");
        const savedEmail = localStorage.getItem("auth_user_email");
        if (savedName && isMounted) {
          setCurrentUser({ name: savedName, email: savedEmail || null });
          return;
        }
      }

      if (isMounted) {
        if (role === "admin") {
          setCurrentUser({
            name: "Administrador del Sistema",
            email: "admin@empresa.com",
          });
        } else {
          setCurrentUser({
            name: "Usuario Registrado",
            email: null,
          });
        }
      }
    }

    loadUserInfo();
    return () => {
      isMounted = false;
    };
  }, [currentEmployeeId, role]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const userRoleMeta = ROLE_CONFIG[role || "employee"] || ROLE_CONFIG.employee;

  const userInitials = useMemo(() => {
    if (!currentUser?.name) return "U";
    const parts = currentUser.name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }, [currentUser?.name]);

  return (
    <aside
      className={`shrink-0 border-r border-ink/10 bg-white/70 min-h-screen sticky top-0 self-start transition-all duration-300 z-30 ${
        collapsed ? "w-[56px] sm:w-[72px]" : "w-[220px]"
      }`}
    >
      <div className="px-3 py-5 flex flex-col h-screen">
        {/* Header with Title & Collapse Toggle */}
        <div
          className={`flex items-center mb-4 transition-all ${
            collapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">
              Menú
            </p>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            className="p-1.5 rounded-lg hover:bg-ink/5 text-ink-muted hover:text-ink transition-colors flex items-center justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-ink" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-ink" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 text-[13px]">
          {onNewEmployee && (
            <button
              onClick={onNewEmployee}
              title={collapsed ? "Nuevo colaborador" : undefined}
              className={`rounded-[8px] bg-ink text-white font-medium hover:bg-ink-soft transition-all mb-1.5 flex items-center ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2 gap-2 text-left"
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Nuevo colaborador</span>}
            </button>
          )}

          {hasPermission(role, "view_dashboard") && (
            <SideItem
              label="Observabilidad"
              icon={<LayoutDashboard className="w-4 h-4" />}
              onClick={() => navigateTo("dashboard")}
              active={activeScreen === "dashboard"}
              collapsed={collapsed}
            />
          )}

          <SideItem
            label="Mi Espacio"
            icon={<BrainCircuit className="w-4 h-4" />}
            onClick={() => navigateTo("user-workspace")}
            active={
              activeScreen === "user-workspace" || activeScreen === "report"
            }
            collapsed={collapsed}
          />

          {hasPermission(role, "view_community") && (
            <SideItem
              label="Comunidad HumanAI"
              icon={<Globe className="w-4 h-4" />}
              onClick={() => navigateTo("comunidad-humanai")}
              active={activeScreen === "comunidad-humanai"}
              collapsed={collapsed}
            />
          )}

          {hasPermission(role, "view_workplan") && (
            <SideItem
              label="Plan de Trabajo"
              icon={<ClipboardList className="w-4 h-4" />}
              onClick={() => navigateTo("plan-de-trabajo")}
              active={activeScreen === "plan-de-trabajo"}
              collapsed={collapsed}
            />
          )}

          {hasPermission(role, "view_methodology") && (
            <SideItem
              label="Metodología"
              icon={<BookOpen className="w-4 h-4" />}
              onClick={() => navigateTo("methodology")}
              active={activeScreen === "methodology"}
              collapsed={collapsed}
            />
          )}

          {hasPermission(role, "manage_collaborators") && (
            <SideItem
              label="Colaboradores"
              icon={<Users className="w-4 h-4" />}
              onClick={() => navigateTo("users")}
              active={activeScreen === "users"}
              collapsed={collapsed}
            />
          )}

          {hasPermission(role, "manage_users") && (
            <SideItem
              label="Gestión de Usuarios"
              icon={<UserCog className="w-4 h-4" />}
              onClick={() => navigateTo("user-management")}
              active={activeScreen === "user-management"}
              collapsed={collapsed}
            />
          )}

          {hasPermission(role, "regenerate_data") && onRegenerate && (
            <SideItem
              label={seeding ? "Regenerando…" : "Regenerar datos"}
              icon={
                <RefreshCw
                  className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`}
                />
              }
              onClick={onRegenerate}
              disabled={seeding}
              collapsed={collapsed}
            />
          )}

          <GuidedTourTriggerButton collapsed={collapsed} />
        </nav>

        {/* Footer actions */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {/* MIA Chatbot Trigger */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-mia-chat"));
            }}
            title={collapsed ? "Chatbot MIA (IA)" : undefined}
            className={`rounded-[8px] hover:bg-[#0D7A5F]/15 text-ink font-medium flex items-center transition-colors border border-[#0D7A5F]/30 bg-[#EBF6F1]/80 shadow-xs ${
              collapsed
                ? "justify-center p-2.5"
                : "px-3 py-2 justify-between group"
            }`}
          >
            {collapsed ? (
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#0D7A5F] animate-pulse" />
                <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#0D7A5F] rounded-full" />
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <Sparkles className="w-3.5 h-3.5 text-[#0D7A5F] animate-pulse" />
                MIA
              </span>
            )}
          </button>

          {/* User Profile Card & Salir */}
          <div className="pt-2 border-t border-ink/10">
            {!collapsed ? (
              <div className="p-2.5 rounded-[10px] bg-white/90 border border-ink/10 mb-2 shadow-2xs transition-all hover:border-ink/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#B37021] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[12px] font-bold text-ink truncate leading-tight"
                      title={currentUser?.name || "Usuario"}
                    >
                      {currentUser?.name || "Usuario"}
                    </p>
                    {currentUser?.email && (
                      <p
                        className="text-[10px] text-ink-muted truncate leading-tight mt-0.5"
                        title={currentUser.email}
                      >
                        {currentUser.email}
                      </p>
                    )}
                    <div className="mt-1 flex items-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold border ${userRoleMeta.badgeClass}`}
                      >
                        <User className="w-2.5 h-2.5 mr-1 shrink-0" />
                        {userRoleMeta.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-9 h-9 mx-auto rounded-full bg-[#B37021] text-white font-bold text-xs flex items-center justify-center shadow-xs mb-2 cursor-pointer relative group uppercase"
                title={`${currentUser?.name || "Usuario"} (${userRoleMeta.label})`}
              >
                {userInitials}
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                  <p className="font-bold text-[11px]">
                    {currentUser?.name || "Usuario"}
                  </p>
                  {currentUser?.email && (
                    <p className="text-[9.5px] text-slate-300">
                      {currentUser.email}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[8.5px] font-semibold ${userRoleMeta.badgeClass}`}
                  >
                    {userRoleMeta.label}
                  </span>
                </div>
              </div>
            )}

            <SideItem
              label="Salir"
              icon={<LogOut className="w-4 h-4" />}
              onClick={logout}
              collapsed={collapsed}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SideItem({
  label,
  icon,
  onClick,
  disabled,
  active,
  collapsed,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={collapsed ? label : undefined}
      className={`rounded-[8px] hover:bg-ink/5 hover:text-ink disabled:opacity-60 transition-all flex items-center gap-2.5 ${
        collapsed
          ? "justify-center p-2.5 w-full"
          : "px-3 py-2 text-left text-[13px]"
      } ${active ? "bg-ink/10 text-ink font-semibold" : "text-ink-soft"}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
