import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  getEmployeesFn,
  getDiagnosticsFn,
  insertEmployeeFn,
  recordLoginFn,
} from "@/lib/bigquery.functions";
import type { Diagnostic, Employee } from "@/types";
import { getUserRoleAssignments } from "@/lib/roles";
import { AREAS } from "@/data/constants";
import {
  PrestigioLogo,
  PrestigioBrandLockup,
} from "@/components/PrestigioLogo";
import { ANDRES_PIEDRAHITA_EMPLOYEE } from "@/data/seedData";

export function LoginScreen() {
  const { navigateTo, setRole } = useApp();
  const [isRegistering, setIsRegistering] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("mode") === "register" ||
        params.get("register") === "true" ||
        window.location.hash === "#register"
      );
    }
    return false;
  });

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register states
  const [registerName, setRegisterName] = useState("");
  const [registerCedula, setRegisterCedula] = useState("");
  const [registerEmpresaPrincipal, setRegisterEmpresaPrincipal] =
    useState("Comfama");
  const [registerEmpresa, setRegisterEmpresa] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerArea, setRegisterArea] = useState(AREAS[0]);
  const [registerPassword, setRegisterPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const targetEmail = email.trim().toLowerCase();

    // 1. Acceso de administrador principal
    if (targetEmail === "admin@empresa.com") {
      if (password !== "admin") {
        setErrorMsg("Contraseña de administrador incorrecta.");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user_name", "Administrador del Sistema");
        localStorage.setItem("auth_user_email", "admin@empresa.com");
      }

      // Registrar ingreso en BigQuery
      recordLoginFn({
        data: {
          employee_id: "admin",
          user_name: "Administrador del Sistema",
          user_email: "admin@empresa.com",
          user_role: "admin",
          user_type: "actual",
          area: "Administración",
          empresa: "HumanAI First",
        },
      }).catch((err) => console.warn("Error grabando login admin:", err));

      setRole("admin");
      navigateTo("dashboard");
      setLoading(false);
      return;
    }

    // 2. Acceso de colaboradores
    try {
      const employees = (await getEmployeesFn()) as Employee[];
      let foundEmployee = employees?.find(
        (emp) => emp.email?.trim().toLowerCase() === targetEmail,
      );

      if (
        !foundEmployee &&
        targetEmail === "andres.piedrahita@strategicbrands.com"
      ) {
        foundEmployee = ANDRES_PIEDRAHITA_EMPLOYEE as unknown as Employee;
      }

      if (!foundEmployee) {
        setErrorMsg(
          "El correo ingresado no está registrado como colaborador. Si eres nuevo, por favor regístrate abajo.",
        );
        setLoading(false);
        return;
      }

      // Bloquear acceso a la app completa para usuarios registrados exclusivamente en el taller
      const isWorkshopAcc =
        foundEmployee.empresa_principal?.includes("Taller Matriz") ||
        foundEmployee.empresa?.includes("Taller Matriz");

      if (isWorkshopAcc) {
        setErrorMsg(
          "Esta cuenta está registrada exclusivamente para las sesiones del Taller de Matriz de Actividades. Por favor ingresa utilizando el enlace del taller.",
        );
        setLoading(false);
        return;
      }

      // Guardar nombre y correo del usuario para mostrar en perfil
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user_name", foundEmployee.name);
        if (foundEmployee.email) {
          localStorage.setItem("auth_user_email", foundEmployee.email);
        }
      }

      // Verificar contraseña
      if (foundEmployee.password && foundEmployee.password !== password) {
        setErrorMsg("La contraseña ingresada es incorrecta.");
        setLoading(false);
        return;
      }

      // Si el colaborador no tiene contraseña guardada todavía (primer ingreso), se la guardamos
      if (!foundEmployee.password) {
        await insertEmployeeFn({
          data: {
            id: foundEmployee.id,
            name: foundEmployee.name,
            email: foundEmployee.email,
            area: foundEmployee.area,
            company_id: foundEmployee.company_id,
            password: password,
          },
        });
      }

      // Buscar si ya tiene algún diagnóstico realizado
      const diagnostics = (await getDiagnosticsFn()) as unknown as Diagnostic[];
      const employeeDiags = diagnostics?.filter(
        (diag) => diag.employee_id === foundEmployee.id,
      );

      let latestDiagnosticId: string | null = null;
      if (employeeDiags && employeeDiags.length > 0) {
        // Al estar ordenados por created_at desc, el primero es el último
        latestDiagnosticId = employeeDiags[0].id;
      }

      // Buscar rol asignado dinámicamente
      const assignments = getUserRoleAssignments();
      const assignedRole = assignments[targetEmail] || "employee";

      // Registrar ingreso de usuario existente en BigQuery
      recordLoginFn({
        data: {
          employee_id: foundEmployee.id,
          user_name: foundEmployee.name,
          user_email: targetEmail,
          user_role: assignedRole,
          user_type: "actual",
          area: foundEmployee.area || "General",
          empresa:
            foundEmployee.empresa ||
            foundEmployee.empresa_principal ||
            "Comfama",
        },
      }).catch((err) =>
        console.warn("Error registrando ingreso en BigQuery:", err),
      );

      setRole(assignedRole);

      if (assignedRole === "employee") {
        navigateTo("user-workspace", {
          role: assignedRole,
          currentEmployeeId: foundEmployee.id,
          latestDiagnosticId,
        });
      } else {
        navigateTo("dashboard", {
          role: assignedRole,
          currentEmployeeId: foundEmployee.id,
          latestDiagnosticId,
        });
      }
    } catch (err) {
      console.error("Error en login:", err);
      setErrorMsg(
        "Ocurrió un error al verificar sus datos. Por favor reintente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const targetEmail = registerEmail.trim().toLowerCase();
    const targetName = registerName.trim();
    const targetCedula = registerCedula.trim();
    const targetEmpresaPrincipal = registerEmpresaPrincipal.trim() || "Comfama";
    const targetEmpresa = registerEmpresa.trim();
    const targetArea = registerArea;
    const targetPassword = registerPassword;

    if (
      !targetName ||
      !targetCedula ||
      !targetEmpresaPrincipal ||
      !targetEmpresa ||
      !targetEmail ||
      !targetArea ||
      !targetPassword
    ) {
      setErrorMsg("Por favor, complete todos los campos.");
      setLoading(false);
      return;
    }

    try {
      const employees = (await getEmployeesFn()) as Employee[];
      const foundEmployee = employees?.find(
        (emp) => emp.email?.trim().toLowerCase() === targetEmail,
      );

      if (foundEmployee) {
        setErrorMsg(
          "Este correo electrónico ya está registrado como colaborador. Por favor, inicia sesión.",
        );
        setLoading(false);
        return;
      }

      // Insertar nuevo empleado
      const newEmp = await insertEmployeeFn({
        data: {
          name: targetName,
          email: targetEmail,
          area: targetArea,
          cedula: targetCedula,
          empresa_principal: targetEmpresaPrincipal,
          empresaPrincipal: targetEmpresaPrincipal,
          empresa: targetEmpresa,
          company_id: "company-default-id",
          password: targetPassword,
        },
      });

      if (!newEmp) {
        setErrorMsg(
          "No se pudo registrar el colaborador. Por favor reintente.",
        );
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user_name", targetName);
        localStorage.setItem("auth_user_email", targetEmail);
      }

      // Registrar ingreso de nuevo usuario registrado en BigQuery
      recordLoginFn({
        data: {
          employee_id: newEmp.id,
          user_name: targetName,
          user_email: targetEmail,
          user_role: "employee",
          user_type: "nuevo",
          area: targetArea,
          empresa: targetEmpresaPrincipal || targetEmpresa || "Comfama",
        },
      }).catch((err) =>
        console.warn("Error registrando nuevo ingreso en BigQuery:", err),
      );

      // Iniciar sesión e ir al diagnóstico (introspección)
      navigateTo("quiz", {
        role: "employee",
        currentEmployeeId: newEmp.id,
        latestDiagnosticId: null,
      });
    } catch (err) {
      console.error("Error en registro:", err);
      setErrorMsg("Ocurrió un error al registrarse. Por favor reintente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <PrestigioBrandLockup className="mb-2 animate-fade-in" />

        {!isRegistering ? (
          <form onSubmit={handleSubmit} className="w-full mt-10">
            <div className="space-y-4 text-left">
              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="tu@empresa.com"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Contraseña
                </span>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="••••••••"
                />
              </label>
            </div>

            {errorMsg && (
              <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-[10px] text-[12px] text-left">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 h-12 rounded-full bg-[#545759] text-white font-medium hover:bg-[#434547] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Ingresando…" : "Ingresar →"}
            </button>

            <div className="mt-8 pt-6 border-t border-ink/5 text-[12px] text-ink-muted flex flex-col gap-2 items-center">
              <span>¿Es tu primera vez utilizando la plataforma?</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsRegistering(true);
                }}
                className="text-ink hover:underline font-bold text-[13px] flex items-center gap-1"
              >
                Registrarme como colaborador
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="w-full mt-10">
            <div className="space-y-4 text-left">
              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Nombre y Apellidos
                </span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="Ej. Juan Pérez"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Cédula
                </span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={registerCedula}
                  onChange={(e) => setRegisterCedula(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="Ej. 1234567890"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Empresa Principal
                </span>
                <select
                  required
                  disabled={loading}
                  value={registerEmpresaPrincipal}
                  onChange={(e) => setRegisterEmpresaPrincipal(e.target.value)}
                  className="w-full h-11 px-3 rounded-[10px] border border-ink/10 bg-white text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                >
                  <option value="Comfama">Comfama</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Tu Empresa
                </span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={registerEmpresa}
                  onChange={(e) => setRegisterEmpresa(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="Ej. Prestigio"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="tu@empresa.com"
                />
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Área / Departamento
                </span>
                <select
                  required
                  disabled={loading}
                  value={registerArea}
                  onChange={(e) => setRegisterArea(e.target.value)}
                  className="w-full h-11 px-3 rounded-[10px] border border-ink/10 bg-white text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-[13px] font-medium text-ink-soft mb-2">
                  Define tu Contraseña
                </span>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors disabled:opacity-60"
                  placeholder="••••••••"
                />
              </label>
            </div>

            {errorMsg && (
              <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-[10px] text-[12px] text-left">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 h-12 rounded-full bg-[#545759] text-white font-medium hover:bg-[#434547] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? "Registrando…"
                : "Registrarse y comenzar diagnóstico →"}
            </button>

            <div className="mt-8 pt-6 border-t border-ink/5 text-[12px] text-ink-muted flex flex-col gap-2 items-center">
              <span>¿Ya tienes una cuenta registrada?</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsRegistering(false);
                }}
                className="text-ink hover:underline font-bold text-[13px]"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        <p className="mt-10 text-[11px] text-ink-muted font-medium select-none">
          ©2026 Prestigio · Todos los Derechos Reservados
        </p>
      </div>
    </main>
  );
}
