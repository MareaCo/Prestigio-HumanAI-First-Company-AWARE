import { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { LoginScreen } from "@/screens/Login";
import { DashboardScreen } from "@/screens/Dashboard";
import { PlanDeTrabajoScreen } from "@/screens/PlanDeTrabajo";
import { UsersScreen } from "@/screens/Users";
import { EmployeeDetailScreen } from "@/screens/EmployeeDetail";
import { QuizScreen } from "@/screens/Quiz";
import { ReportScreen } from "@/screens/Report";
import { UserManagementScreen } from "@/screens/UserManagement";
import { UserWorkspaceScreen } from "@/screens/UserWorkspace";
import { MethodologyScreen } from "@/screens/Methodology";
import { WorkshopMatrixScreen } from "@/screens/WorkshopMatrixScreen";
import { MiaChatWidget } from "@/components/MiaChatWidget";
import { GuidedTourOverlay } from "@/components/GuidedTourOverlay";
import { hasPermission } from "@/lib/roles";

function ScreenRouter() {
  const { screen, role } = useApp();
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

  // Check URL params OR stored workshop session flag for direct workshop matrix view (?section=matriz or ?mode=taller)
  const isWorkshopRoute =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("section") === "matriz" ||
      new URLSearchParams(window.location.search).get("mode") === "taller" ||
      localStorage.getItem("auth_is_workshop_user") === "true");

  if (isWorkshopRoute) {
    return <WorkshopMatrixScreen />;
  }

  if (!role || screen === "login") {
    return <LoginScreen />;
  }

  const renderActiveScreen = () => {
    // Guardas de ruta basados en rol y permisos
    if (!hasPermission(role, "manage_users") && screen === "user-management") {
      return role === "employee" ? (
        <UserWorkspaceScreen />
      ) : (
        <DashboardScreen />
      );
    }

    if (!hasPermission(role, "view_dashboard") && screen === "dashboard") {
      return <UserWorkspaceScreen />;
    }

    if (
      !hasPermission(role, "view_community") &&
      screen === "comunidad-humanai"
    ) {
      return <UserWorkspaceScreen />;
    }

    if (!hasPermission(role, "view_methodology") && screen === "methodology") {
      return <UserWorkspaceScreen />;
    }

    if (!hasPermission(role, "view_workplan") && screen === "plan-de-trabajo") {
      return <UserWorkspaceScreen />;
    }

    if (
      !hasPermission(role, "manage_collaborators") &&
      (screen === "users" || screen === "employee-detail")
    ) {
      return <UserWorkspaceScreen />;
    }

    switch (screen) {
      case "dashboard":
        return <DashboardScreen />;
      case "plan-de-trabajo":
        return <PlanDeTrabajoScreen />;
      case "methodology":
        return <MethodologyScreen />;
      case "users":
        return <UsersScreen />;
      case "user-management":
        return <UserManagementScreen />;
      case "quiz":
        return <QuizScreen />;
      case "employee-detail":
        return <EmployeeDetailScreen />;
      case "user-workspace":
        return <UserWorkspaceScreen />;
      case "comunidad-humanai":
        return <UserWorkspaceScreen />;
      case "report":
        return <ReportScreen />;
      default:
        return role === "admin" ? <DashboardScreen /> : <UserWorkspaceScreen />;
    }
  };

  return (
    <>
      {renderActiveScreen()}
      <MiaChatWidget />
      <GuidedTourOverlay />
    </>
  );
}

export function MainAppRouter() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  );
}
