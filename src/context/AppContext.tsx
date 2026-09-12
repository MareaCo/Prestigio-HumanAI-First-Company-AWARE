import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, Screen } from "@/types";

interface AppState {
  screen: Screen;
  role: Role | null;
  areaFilter: string;
  companyFilter: string;
  currentEmployeeId: string | null;
  latestDiagnosticId: string | null;
  companyId: string | null;
  returnScreen: Screen | null;
}

interface AppContextValue extends AppState {
  navigateTo: (screen: Screen, params?: Partial<AppState>) => void;
  setAreaFilter: (area: string) => void;
  setCompanyFilter: (company: string) => void;
  setRole: (role: Role | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    screen: "login",
    role: null,
    areaFilter: "__all__",
    companyFilter: "__all__",
    currentEmployeeId: null,
    latestDiagnosticId: null,
    companyId: null,
    returnScreen: null,
  });

  // Cargar sesión persistente o compañía
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRole = urlParams.get("auth_role") as Role | null;
      const urlEmployeeId = urlParams.get("auth_employee_id");
      const urlLatestDiagnosticId = urlParams.get("auth_latest_diagnostic_id");
      const urlScreen = urlParams.get("auth_screen") as Screen | null;
      const urlReturnScreen = urlParams.get(
        "auth_return_screen",
      ) as Screen | null;
      const urlTriggerPrint = urlParams.get("trigger_print");

      if (urlTriggerPrint === "true") {
        localStorage.setItem("trigger_print", "true");
      }

      const savedRole =
        urlRole || (localStorage.getItem("auth_role") as Role | null);
      const savedEmployeeId =
        urlEmployeeId || localStorage.getItem("auth_employee_id");
      const savedLatestDiagnosticId =
        urlLatestDiagnosticId ||
        localStorage.getItem("auth_latest_diagnostic_id");
      const savedReturnScreen =
        urlReturnScreen ||
        (localStorage.getItem("auth_return_screen") as Screen | null);
      let savedScreen =
        urlScreen || (localStorage.getItem("auth_screen") as Screen | null);

      // Para colaboradores (employee), sanitizar la pantalla inicial para que siempre sea su espacio de trabajo
      // a menos que vengan explícitamente a presentar el quiz o a ver un reporte directo por URL.
      if (
        !urlScreen &&
        savedRole === "employee" &&
        savedScreen !== "quiz" &&
        savedScreen !== "report"
      ) {
        savedScreen = "user-workspace";
      }

      if (savedRole) {
        // Guardar en localStorage para persistir en la nueva pestaña (contexto primer origen)
        localStorage.setItem("auth_role", savedRole);
        if (savedScreen) localStorage.setItem("auth_screen", savedScreen);
        if (savedReturnScreen) {
          localStorage.setItem("auth_return_screen", savedReturnScreen);
        }
        if (savedEmployeeId) {
          localStorage.setItem("auth_employee_id", savedEmployeeId);
        }
        if (savedLatestDiagnosticId) {
          localStorage.setItem(
            "auth_latest_diagnostic_id",
            savedLatestDiagnosticId,
          );
        }

        // Limpiar parámetros de la URL para que quede estética
        if (
          urlRole ||
          urlScreen ||
          urlReturnScreen ||
          urlEmployeeId ||
          urlLatestDiagnosticId ||
          urlTriggerPrint
        ) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        let effectiveScreen = savedScreen;
        if (
          savedRole === "employee" &&
          (savedScreen === "dashboard" ||
            savedScreen === "users" ||
            savedScreen === "user-management" ||
            savedScreen === "employee-detail")
        ) {
          effectiveScreen = "user-workspace";
        }

        setState({
          screen:
            effectiveScreen ||
            (savedRole === "employee" ? "user-workspace" : "dashboard"),
          role: savedRole,
          areaFilter: "__all__",
          companyFilter: "__all__",
          currentEmployeeId: savedEmployeeId || null,
          latestDiagnosticId: savedLatestDiagnosticId || null,
          companyId: "company-default-id",
          returnScreen: savedReturnScreen || null,
        });
      } else {
        setState((prev) => ({ ...prev, companyId: "company-default-id" }));
      }
    } else {
      setState((prev) => ({ ...prev, companyId: "company-default-id" }));
    }
  }, []);

  const navigateTo = useCallback(
    (screen: Screen, params?: Partial<AppState>) => {
      setState((prev) => {
        const nextReturnScreen =
          params && "returnScreen" in params ? params.returnScreen : null;
        const next = {
          ...prev,
          returnScreen: nextReturnScreen ?? null,
          ...params,
          screen,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_screen", next.screen);
          if (next.role) {
            localStorage.setItem("auth_role", next.role);
          }
          if (next.returnScreen) {
            localStorage.setItem("auth_return_screen", next.returnScreen);
          } else {
            localStorage.removeItem("auth_return_screen");
          }
          if (next.currentEmployeeId) {
            localStorage.setItem("auth_employee_id", next.currentEmployeeId);
          } else {
            localStorage.removeItem("auth_employee_id");
          }
          if (next.latestDiagnosticId) {
            localStorage.setItem(
              "auth_latest_diagnostic_id",
              next.latestDiagnosticId,
            );
          } else {
            localStorage.removeItem("auth_latest_diagnostic_id");
          }
        }
        return next;
      });
    },
    [],
  );

  const setAreaFilter = useCallback((areaFilter: string) => {
    setState((prev) => ({ ...prev, areaFilter }));
  }, []);

  const setCompanyFilter = useCallback((companyFilter: string) => {
    setState((prev) => ({ ...prev, companyFilter }));
  }, []);

  const setRole = useCallback((role: Role | null) => {
    setState((prev) => {
      if (typeof window !== "undefined") {
        if (role) {
          localStorage.setItem("auth_role", role);
        } else {
          localStorage.removeItem("auth_role");
          localStorage.removeItem("auth_screen");
          localStorage.removeItem("auth_employee_id");
          localStorage.removeItem("auth_latest_diagnostic_id");
        }
      }
      return { ...prev, role };
    });
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_screen");
      localStorage.removeItem("auth_employee_id");
      localStorage.removeItem("auth_latest_diagnostic_id");
      localStorage.removeItem("auth_user_name");
      localStorage.removeItem("auth_user_email");
    }
    setState((prev) => ({
      ...prev,
      screen: "login",
      role: null,
      areaFilter: "__all__",
      companyFilter: "__all__",
      currentEmployeeId: null,
      latestDiagnosticId: null,
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      navigateTo,
      setAreaFilter,
      setCompanyFilter,
      setRole,
      logout,
    }),
    [state, navigateTo, setAreaFilter, setCompanyFilter, setRole, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
