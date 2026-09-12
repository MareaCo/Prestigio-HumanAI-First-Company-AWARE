import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import {
  getEmployeesFn,
  regenerateSampleDataFn,
  deleteEmployeeFn,
} from "@/lib/bigquery.functions";
import type { Employee, Role } from "@/types";
import {
  AVAILABLE_PERMISSIONS,
  getRolesConfig,
  saveRolesConfig,
  getUserRoleAssignments,
  saveUserRoleAssignment,
  removeUserRoleAssignment,
  loadRolesConfigFromDB,
  loadUserAssignmentsFromDB,
  type RoleConfig,
} from "@/lib/roles";
import {
  Shield,
  Users,
  Search,
  Check,
  Lock,
  Settings,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ResetIntrospectionModal } from "@/components/dashboard/ResetIntrospectionModal";

export function UserManagementScreen() {
  const { navigateTo, role: currentLoggedInRole, companyId } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [seeding, setSeeding] = useState(false);

  // Filtros para la asignación de roles
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("__all__");

  // Estado local para los roles y accesos
  const [rolesConfig, setRolesConfig] =
    useState<Record<Role, RoleConfig>>(getRolesConfig());
  const [userAssignments, setUserAssignments] = useState<Record<string, Role>>(
    getUserRoleAssignments(),
  );

  // Mensaje de feedback/notificación
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Estado para confirmación de eliminación de colaboradores
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Estado para permitir actualizar diagnóstico / resetear introspección
  const [showResetIntrospectionModal, setShowResetIntrospectionModal] =
    useState(false);
  const [employeeToResetIntrospection, setEmployeeToResetIntrospection] =
    useState<Employee | null>(null);

  async function loadEmployees() {
    setLoading(true);
    try {
      const data = (await getEmployeesFn()) as Employee[];
      setEmployees(data || []);
    } catch (err) {
      console.error("Error loading employees for roles assignment:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();

    // Refresh roles and user assignments from DB
    const syncFromDB = async () => {
      const dbConfig = await loadRolesConfigFromDB();
      if (dbConfig) setRolesConfig(dbConfig);
      const dbAssign = await loadUserAssignmentsFromDB();
      if (dbAssign) setUserAssignments(dbAssign);
    };
    syncFromDB();

    const handleUpdate = () => {
      setRolesConfig(getRolesConfig());
      setUserAssignments(getUserRoleAssignments());
    };

    window.addEventListener("roles_permissions_updated", handleUpdate);
    return () => {
      window.removeEventListener("roles_permissions_updated", handleUpdate);
    };
  }, []);

  async function regenerateSampleData() {
    if (!companyId) return;
    setSeeding(true);
    try {
      await regenerateSampleDataFn({ data: { companyId } });
      await loadEmployees();
      showToast("Datos regenerados exitosamente en BigQuery.");
    } catch (err) {
      console.error("Error regenerating sample data in BigQuery:", err);
    } finally {
      setSeeding(false);
    }
  }

  // Mostrar mensaje de éxito temporal
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Guardar asignación de rol para un colaborador específico
  const handleAssignRole = (email: string, role: Role) => {
    if (!email) return;
    const lowerEmail = email.toLowerCase();

    // Evitar que el administrador principal se quite su propio rol
    if (lowerEmail === "admin@empresa.com") {
      showToast(
        "No se puede cambiar el rol del administrador principal.",
        "error",
      );
      return;
    }

    if (role === "employee") {
      removeUserRoleAssignment(lowerEmail);
    } else {
      saveUserRoleAssignment(lowerEmail, role);
    }

    setUserAssignments(getUserRoleAssignments());
    showToast(`Rol cambiado exitosamente para ${email}`);
  };

  // Alternar un permiso específico para un rol determinado
  const handleTogglePermission = (roleId: Role, permissionId: string) => {
    if (roleId === "admin") {
      showToast(
        "Los permisos del Administrador no pueden ser modificados.",
        "error",
      );
      return;
    }

    const updated = { ...rolesConfig };
    updated[roleId].permissions[permissionId] =
      !updated[roleId].permissions[permissionId];

    setRolesConfig(updated);
    saveRolesConfig(updated);
    showToast(`Permiso modificado para el rol ${rolesConfig[roleId].name}`);
  };

  // Obtener áreas únicas para filtrar
  const areas = Array.from(new Set(employees.map((emp) => emp.area))).filter(
    Boolean,
  );

  // Filtrar colaboradores
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArea = selectedArea === "__all__" || emp.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "clevel":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "leader":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "consultant":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleName = (role: Role) => {
    return rolesConfig[role]?.name || role;
  };

  return (
    <main className="min-h-screen bg-cream text-ink flex">
      <AppSidebar
        activeScreen="user-management"
        onRegenerate={regenerateSampleData}
        seeding={seeding}
      />

      <div className="flex-1 mx-auto max-w-[1100px] px-3 sm:px-6 py-4 sm:py-8 w-full min-w-0 flex flex-col justify-between overflow-x-hidden">
        <div>
          <header className="mb-7">
            <h1 className="font-display text-[1.4rem] font-bold leading-tight">
              Gestión de Usuarios y Roles
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-ink-muted">
              CONFIGURACIÓN DE ACCESOS Y PERMISOS DE LA PLATAFORMA
            </p>
          </header>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-[10px] shadow-lg border text-xs font-medium transition-all ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Modal de confirmación de eliminación */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-cream border border-ink/10 rounded-[16px] max-w-[400px] w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-display text-[1.1rem] font-bold text-ink mb-2">
                  ¿Confirmar eliminación?
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-6">
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <strong>{deleteConfirm.name}</strong>? Se borrarán sus datos y
                  reportes asociados. Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="h-9 px-4 rounded-[8px] border border-ink/10 hover:border-ink/20 text-xs font-semibold text-ink-soft bg-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      const id = deleteConfirm.id;
                      const name = deleteConfirm.name;

                      // Remove role assignment from localStorage
                      const emp = employees.find((e) => e.id === id);
                      if (emp && emp.email) {
                        removeUserRoleAssignment(emp.email);
                      }

                      setDeleteConfirm(null);
                      setLoading(true);
                      try {
                        await deleteEmployeeFn({ data: { id } });
                        showToast(
                          `Colaborador ${name} eliminado exitosamente.`,
                        );
                        await loadEmployees();
                      } catch (err) {
                        console.error("Error deleting employee:", err);
                        const errorMessage =
                          err instanceof Error ? err.message : String(err);
                        showToast(
                          `Error al eliminar el colaborador: ${errorMessage}`,
                          "error",
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="h-9 px-4 rounded-[8px] bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-ink/10 mb-6 gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-3 px-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "users"
                  ? "border-ink text-ink font-bold"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Users size={14} />
              Asignación de Roles ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`pb-3 px-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "roles"
                  ? "border-ink text-ink font-bold"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Shield size={14} />
              Accesos y Permisos
            </button>
          </div>

          {activeTab === "users" ? (
            <div>
              {/* Filtros de Colaboradores */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Buscar colaborador por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-[8px] border border-ink/10 bg-white/50 text-xs placeholder:text-ink-muted focus:outline-none focus:border-ink transition-all"
                  />
                </div>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white/50 text-xs text-ink focus:outline-none focus:border-ink transition-all min-w-[150px]"
                >
                  <option value="__all__">Todas las áreas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-ink-muted text-xs p-6 bg-white/30 rounded-[12px] border border-ink/5">
                  <RefreshCw className="animate-spin h-3 w-3" /> Cargando
                  colaboradores y asignaciones...
                </div>
              ) : (
                <div className="border border-ink/10 rounded-[12px] bg-white/40 overflow-hidden shadow-sm">
                  <table className="w-full text-[12px] border-collapse text-left">
                    <thead>
                      <tr className="bg-ink/5 border-b border-ink/10 text-ink font-semibold">
                        <th className="py-3 px-4">Colaborador</th>
                        <th className="py-3 px-4">Departamento</th>
                        <th className="py-3 px-4">Rol Asignado</th>
                        <th className="py-3 px-4">Modificar Rol</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {/* Fila fija del Administrador Principal */}
                      <tr className="hover:bg-ink/2 transition-colors bg-purple-50/20">
                        <td className="py-3 px-4">
                          <div className="font-medium text-ink flex items-center gap-1.5">
                            Admin Principal{" "}
                            <Shield size={10} className="text-purple-600" />
                          </div>
                          <div className="text-[10px] text-ink-muted">
                            admin@empresa.com
                          </div>
                        </td>
                        <td className="py-3 px-4 text-ink-muted">
                          Gerencia General
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-purple-100 text-purple-800 border-purple-200">
                            Administrador
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[10px] text-ink-muted italic">
                          Sistema (No modificable)
                        </td>
                        <td className="py-3 px-4 text-right text-[10px] text-ink-muted">
                          -
                        </td>
                      </tr>

                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 px-4 text-center text-ink-muted"
                          >
                            No se encontraron colaboradores que coincidan con la
                            búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((emp, idx) => {
                          const empEmail = emp.email || "";
                          const assignedRole =
                            userAssignments[empEmail.toLowerCase()] ||
                            "employee";

                          return (
                            <tr
                              key={`${emp.id}-${idx}`}
                              className="hover:bg-ink/2 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="font-medium text-ink">
                                  {emp.name}
                                </div>
                                <div className="text-[10px] text-ink-muted flex flex-wrap items-center gap-x-2">
                                  <span>{emp.email || "Sin correo"}</span>
                                  {emp.cedula && (
                                    <span>· C.C. {emp.cedula}</span>
                                  )}
                                  {emp.empresa && <span>· {emp.empresa}</span>}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-ink-soft">
                                {emp.area}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadgeColor(
                                    assignedRole,
                                  )}`}
                                >
                                  {getRoleName(assignedRole)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={assignedRole}
                                  onChange={(e) =>
                                    handleAssignRole(
                                      empEmail,
                                      e.target.value as Role,
                                    )
                                  }
                                  disabled={!empEmail}
                                  className="text-xs px-2 py-1 rounded-[6px] border border-ink/10 bg-white hover:border-ink/30 focus:outline-none focus:border-ink disabled:opacity-40"
                                >
                                  <option value="employee">Colaborador</option>
                                  <option value="leader">Líder de Área</option>
                                  <option value="clevel">
                                    C-Level / Ejecutivo
                                  </option>
                                  <option value="consultant">
                                    Consultor Externo
                                  </option>
                                  <option value="admin">Administrador</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {currentLoggedInRole === "admin" && (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEmployeeToResetIntrospection(emp);
                                        setShowResetIntrospectionModal(true);
                                      }}
                                      className="p-1.5 text-rose-700 hover:bg-rose-50 hover:text-rose-800 rounded-md transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                                      title="Permitir actualizar diagnóstico (resetear introspección)"
                                    >
                                      <RotateCcw size={13} />
                                      <span className="hidden sm:inline">
                                        Permitir Actualizar
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteConfirm({
                                          id: emp.id,
                                          name: emp.name,
                                        })
                                      }
                                      className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors inline-flex items-center justify-center"
                                      title="Borrar colaborador"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Matriz interactiva de permisos con Tarjetas de Roles integradas */}
              <div className="border border-ink/10 rounded-[12px] bg-white/40 overflow-hidden shadow-sm">
                <div className="bg-ink/5 px-4 py-3 border-b border-ink/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Settings size={14} className="text-ink-soft" />
                    <span className="text-[12px] font-semibold text-ink">
                      Matriz de Control de Accesos
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-muted italic">
                    Haz clic en los selectores para otorgar o remover permisos
                    en tiempo real.
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-white/80 border-b border-ink/10 text-ink text-[10px]">
                        <th className="py-4 px-4 w-[220px] text-left align-top font-semibold uppercase tracking-wider border-r border-ink/5">
                          <div className="text-xs text-ink font-bold mb-1">
                            Funcionalidad / Permiso
                          </div>
                          <div className="text-[10px] text-ink-muted normal-case font-normal leading-relaxed">
                            Matriz de asignación de accesos por rol dentro de la
                            organización.
                          </div>
                        </th>

                        {(
                          [
                            "employee",
                            "leader",
                            "clevel",
                            "consultant",
                            "admin",
                          ] as Role[]
                        ).map((rId) => {
                          const config = rolesConfig[rId];
                          if (!config) return null;
                          const isAdmin = rId === "admin";

                          return (
                            <th
                              key={rId}
                              className={`py-3 px-2.5 align-top text-left font-normal normal-case border-r border-ink/5 last:border-r-0 min-w-[150px] ${
                                isAdmin ? "bg-purple-50/10" : ""
                              }`}
                            >
                              <div className="bg-white/90 border border-ink/10 rounded-[10px] p-3 shadow-2xs h-full flex flex-col justify-between hover:border-ink/20 transition-all">
                                <div>
                                  <span
                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mb-2 ${getRoleBadgeColor(
                                      rId,
                                    )}`}
                                  >
                                    {config.name}
                                  </span>
                                  <p className="text-[10.5px] text-ink-soft leading-snug">
                                    {config.description}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-ink/5 text-[9.5px] text-ink-muted flex items-center gap-1">
                                  <Lock size={9} className="shrink-0" />
                                  <span>
                                    {isAdmin
                                      ? "Permisos administrados por sistema"
                                      : "Permisos dinámicos personalizables"}
                                  </span>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <tr
                          key={perm.id}
                          className="hover:bg-ink/2 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-ink">
                              {perm.name}
                            </div>
                            <div className="text-[10px] text-ink-muted mt-0.5">
                              {perm.description}
                            </div>
                          </td>

                          {/* Colaborador */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                !!rolesConfig.employee?.permissions[perm.id]
                              }
                              onChange={() =>
                                handleTogglePermission("employee", perm.id)
                              }
                              className="h-3.5 w-3.5 rounded border-ink/20 text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer"
                            />
                          </td>

                          {/* Líder de Área */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                !!rolesConfig.leader?.permissions[perm.id]
                              }
                              onChange={() =>
                                handleTogglePermission("leader", perm.id)
                              }
                              className="h-3.5 w-3.5 rounded border-ink/20 text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer"
                            />
                          </td>

                          {/* C-Level */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                !!rolesConfig.clevel?.permissions[perm.id]
                              }
                              onChange={() =>
                                handleTogglePermission("clevel", perm.id)
                              }
                              className="h-3.5 w-3.5 rounded border-ink/20 text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer"
                            />
                          </td>

                          {/* Consultor Externo */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                !!rolesConfig.consultant?.permissions[perm.id]
                              }
                              onChange={() =>
                                handleTogglePermission("consultant", perm.id)
                              }
                              className="h-3.5 w-3.5 rounded border-ink/20 text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer"
                            />
                          </td>

                          {/* Administrador (Solo lectura/Fijo) */}
                          <td className="py-3.5 px-4 text-center bg-purple-50/10">
                            <div className="flex justify-center items-center">
                              <Check
                                size={14}
                                className="text-purple-600 font-bold"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      <ResetIntrospectionModal
        open={showResetIntrospectionModal}
        onClose={() => setShowResetIntrospectionModal(false)}
        employeesToReset={
          employeeToResetIntrospection ? [employeeToResetIntrospection] : []
        }
        onSaved={async () => {
          await loadEmployees();
          showToast(
            "Permiso para actualizar diagnóstico otorgado. Se reseteó la introspección del colaborador.",
          );
        }}
      />
    </main>
  );
}
