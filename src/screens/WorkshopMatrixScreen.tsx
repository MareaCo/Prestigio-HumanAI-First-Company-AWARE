import { useState, useEffect } from "react";
import { MatrizInteractiva } from "@/components/report/MatrizInteractiva";
import { useMatriz } from "@/hooks/useMatriz";
import { PrestigioLogo } from "@/components/PrestigioLogo";
import {
  getEmployeesFn,
  insertEmployeeFn,
  recordLoginFn,
} from "@/lib/bigquery.functions";
import type { Employee } from "@/types";
import { AREAS } from "@/data/constants";
import {
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Info,
  LogOut,
  Building2,
  Mail,
  Lock,
  UserCheck,
  Briefcase,
  IdCard,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export function WorkshopMatrixScreen() {
  const { user } = useApp();

  // Active user session state for workshop
  const [workshopUser, setWorkshopUser] = useState<{
    name: string;
    email: string;
    company: string;
    area: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const savedName =
        localStorage.getItem("auth_workshop_user_name") || user?.name;
      const savedEmail =
        localStorage.getItem("auth_workshop_user_email") || user?.email;
      const savedCompany =
        localStorage.getItem("auth_workshop_user_company") || "Taller Matriz";
      const savedArea =
        localStorage.getItem("auth_workshop_user_area") || "General";

      if (savedEmail && savedName) {
        return {
          name: savedName,
          email: savedEmail,
          company: savedCompany,
          area: savedArea,
        };
      }
    }
    return null;
  });

  // Mode: 'register' or 'login' if not authenticated
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  // Form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regArea, setRegArea] = useState(AREAS[0]);
  const [regCedula, setRegCedula] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active matrix key derived from registered email
  const activeKey = workshopUser?.email
    ? workshopUser.email.toLowerCase().trim()
    : "guest";
  const { activities, addActivity } = useMatriz(2, activeKey);

  // Calculate KPIs
  const totalCount = activities.length;

  // Calculate estimated time savings (hrs/month)
  const totalSavedMinsWeek = activities.reduce((acc, act) => {
    const mins = Number(act.mins) || 0;
    if (act.analysis && typeof act.analysis.minutos_optimizados === "number") {
      const minsWithAI = Math.min(
        mins,
        Math.max(0, act.analysis.minutos_optimizados),
      );
      return acc + Math.max(0, mins - minsWithAI);
    }
    if (act.quadrant === "q1") return acc + mins;
    if (act.quadrant === "q3") return acc + mins * 0.8;
    if (act.quadrant === "q4") return acc + mins * 0.7;
    if (act.quadrant === "q2") return acc + mins * 0.5;
    return acc + mins * 0.5;
  }, 0);

  const hoursPerMonth = ((totalSavedMinsWeek * 4.33) / 60).toFixed(1);

  // Registration handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const targetName = regName.trim();
    const targetEmail = regEmail.trim().toLowerCase();
    const targetCompany = regCompany.trim() || "Empresa Taller";
    const targetArea = regArea || "General";
    const targetCedula = regCedula.trim() || "NA";
    const targetPassword = regPassword.trim();

    if (!targetName || !targetEmail || !targetPassword) {
      setErrorMsg("Por favor completa los campos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      // Check if employee already exists
      const employees = (await getEmployeesFn()) as Employee[];
      const found = employees?.find(
        (emp) => emp.email?.trim().toLowerCase() === targetEmail,
      );

      if (found) {
        setErrorMsg(
          "Este correo ya está registrado. Por favor cambia a 'Iniciar Sesión'.",
        );
        setAuthMode("login");
        setLoginEmail(targetEmail);
        setLoading(false);
        return;
      }

      // Tag company name to identify workshop participants in BigQuery / DB
      const companyTagged = `${targetCompany} (Taller Matriz)`;

      // Insert new employee into DB
      const newEmp = await insertEmployeeFn({
        data: {
          name: targetName,
          email: targetEmail,
          area: targetArea,
          cedula: targetCedula,
          empresa_principal: companyTagged,
          empresaPrincipal: companyTagged,
          empresa: targetCompany,
          company_id: "taller-matriz-company",
          password: targetPassword,
        },
      });

      if (!newEmp) {
        setErrorMsg("No se pudo completar el registro. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      // Record login in BigQuery with workshop source tag
      recordLoginFn({
        data: {
          employee_id: newEmp.id,
          user_name: targetName,
          user_email: targetEmail,
          user_role: "employee",
          user_type: "taller_matriz",
          area: targetArea,
          empresa: companyTagged,
        },
      }).catch((err) =>
        console.warn("Error grabando registro taller en BigQuery:", err),
      );

      // Save local workshop session
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_workshop_user_name", targetName);
        localStorage.setItem("auth_workshop_user_email", targetEmail);
        localStorage.setItem("auth_workshop_user_company", targetCompany);
        localStorage.setItem("auth_workshop_user_area", targetArea);
        localStorage.setItem("auth_user_name", targetName);
        localStorage.setItem("auth_user_email", targetEmail);
        localStorage.setItem("auth_is_workshop_user", "true");
      }

      setWorkshopUser({
        name: targetName,
        email: targetEmail,
        company: targetCompany,
        area: targetArea,
      });
    } catch (err) {
      console.error("Error en registro taller:", err);
      setErrorMsg(
        "Ocurrió un error al procesar el registro. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const targetEmail = loginEmail.trim().toLowerCase();
    const targetPassword = loginPassword.trim();

    try {
      const employees = (await getEmployeesFn()) as Employee[];
      const found = employees?.find(
        (emp) => emp.email?.trim().toLowerCase() === targetEmail,
      );

      if (!found) {
        setErrorMsg(
          "Correo no encontrado. Por favor regístrate como asistente.",
        );
        setLoading(false);
        return;
      }

      if (found.password && found.password !== targetPassword) {
        setErrorMsg("Contraseña incorrecta.");
        setLoading(false);
        return;
      }

      const userName = found.name || "Asistente Taller";
      const userCompany =
        found.empresa || found.empresa_principal || "Empresa Taller";
      const userArea = found.area || "General";

      // Record login in BigQuery
      recordLoginFn({
        data: {
          employee_id: found.id,
          user_name: userName,
          user_email: targetEmail,
          user_role: "employee",
          user_type: "taller_matriz",
          area: userArea,
          empresa: `${userCompany} (Taller Matriz)`,
        },
      }).catch((err) =>
        console.warn("Error grabando login taller en BigQuery:", err),
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_workshop_user_name", userName);
        localStorage.setItem("auth_workshop_user_email", targetEmail);
        localStorage.setItem("auth_workshop_user_company", userCompany);
        localStorage.setItem("auth_workshop_user_area", userArea);
        localStorage.setItem("auth_user_name", userName);
        localStorage.setItem("auth_user_email", targetEmail);
        localStorage.setItem("auth_is_workshop_user", "true");
      }

      setWorkshopUser({
        name: userName,
        email: targetEmail,
        company: userCompany,
        area: userArea,
      });
    } catch (err) {
      console.error("Error en login taller:", err);
      setErrorMsg("Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutWorkshop = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_workshop_user_name");
      localStorage.removeItem("auth_workshop_user_email");
      localStorage.removeItem("auth_workshop_user_company");
      localStorage.removeItem("auth_workshop_user_area");
      localStorage.removeItem("auth_is_workshop_user");
    }
    setWorkshopUser(null);
  };

  const handleLoadExamples = async () => {
    const examples = [
      {
        name: "Preparar informe semanal de ventas con datos del CRM",
        valor: "alto",
        freq: "alta",
        mins: 120,
      },
      {
        name: "Responder correos de atención a cliente con dudas frecuentes",
        valor: "bajo",
        freq: "alta",
        mins: 180,
      },
      {
        name: "Redactar propuestas comerciales personalizadas para clientes clave",
        valor: "alto",
        freq: "baja",
        mins: 90,
      },
      {
        name: "Revisar y archivar manualmente recibos de viáticos y facturas",
        valor: "bajo",
        freq: "baja",
        mins: 60,
      },
    ];

    for (const ex of examples) {
      if (!activities.some((a) => a.name === ex.name)) {
        await addActivity(ex.name, ex.valor, ex.freq, ex.mins);
      }
    }
  };

  // IF NOT REGISTERED / LOGGED IN -> SHOW FORMAL WORKSHOP REGISTRATION SCREEN
  if (!workshopUser) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-slate-900 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2DDCF] shadow-md p-6 sm:p-8">
          {/* HEADER BRAND LOCKUP */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-6">
            <PrestigioLogo size="md" showTagline={true} className="mb-3" />
            <div className="mt-2">
              <h1 className="font-poppins text-lg sm:text-xl font-bold text-[#545759] flex items-center justify-center gap-1">
                <span>HumanAI First Company</span>
                <span className="text-xl font-extrabold text-[#545759] relative -top-[1px]">
                  ®
                </span>
                <span className="font-semibold text-[#545759]">
                  by Prestigio
                </span>
              </h1>
              <p className="text-xs uppercase tracking-wider text-amber-800 font-extrabold mt-1">
                TALLER MATRIZ DE ACTIVIDADES
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 text-center">
              {authMode === "register"
                ? "Registro de Asistente de Taller"
                : "Ingreso al Taller Matriz"}
            </h2>
            <p className="text-xs text-slate-600 text-center mt-1">
              {authMode === "register"
                ? "Ingresa tus datos corporativos para guardar tu Matriz de Actividades y calcular tu ahorro potencial con IA."
                : "Ingresa con tu correo corporativo y contraseña registrada para ingresar a tu Matriz."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej. María Fernanda Gómez"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico Corporativo *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ejemplo@empresa.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Empresa / Organización *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="Ej. Comfama"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área / Cargo *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    >
                      {AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Documento / Cédula{" "}
                    <span className="text-slate-400 font-normal">
                      (Opcional)
                    </span>
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regCedula}
                      onChange={(e) => setRegCedula(e.target.value)}
                      placeholder="Número de documento"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Registrarse e Ingresar a la Matriz</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthMode("login");
                  }}
                  className="text-xs text-amber-800 hover:text-amber-900 underline font-medium"
                >
                  ¿Ya te registraste en este taller? Inicia sesión aquí
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@empresa.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>Ingresando...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Iniciar Sesión e Ir a la Matriz</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthMode("register");
                  }}
                  className="text-xs text-amber-800 hover:text-amber-900 underline font-medium"
                >
                  ¿No tienes registro? Regístrate aquí
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            HumanAI First Company® by Prestigio © 2026
          </div>
        </div>
      </div>
    );
  }

  // REGISTERED WORKSHOP USER -> SHOW WORKSHOP MATRIX SCREEN EXCLUSIVELY
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-slate-900 font-sans flex flex-col">
      {/* TOP HEADER / BARRA DE INFORMACIÓN Y KPIS CON BRANDING PRESTIGIO */}
      <header className="sticky top-0 z-30 bg-[#F8F6F0] border-b border-[#E2DDCF] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
            {/* BRAND LOCKUP IDENTICO A IMAGEN 2 */}
            <div className="flex items-center gap-3 shrink-0">
              <PrestigioLogo
                size="sm"
                showTagline={true}
                className="shrink-0"
              />
              <div className="border-l border-slate-300 pl-3 py-0.5">
                <h1 className="font-poppins text-sm sm:text-[15px] font-bold leading-tight text-[#545759] flex items-center gap-1.5">
                  <span className="whitespace-nowrap text-[#545759] flex items-center">
                    HumanAI First Company
                    <span className="text-[22px] sm:text-[24px] font-extrabold ml-0.5 text-[#545759] inline-block align-middle leading-none relative -top-[2px]">
                      ®
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-medium sm:font-bold text-[#545759]">
                    by Prestigio
                  </span>
                </h1>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-800 font-extrabold mt-0.5">
                  TALLER MATRIZ DE ACTIVIDADES
                </p>
              </div>
            </div>

            {/* TOP BAR USER BADGE + KPIS + ACTION BUTTON */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/80 p-2 rounded-xl border border-[#E2DDCF] shadow-2xs">
              {/* USER IDENTITY BADGE */}
              <div className="flex items-center gap-2 bg-amber-50/90 border border-amber-200 px-2.5 py-1 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <User className="w-3 h-3" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[150px] sm:max-w-[200px]">
                      {workshopUser.name}
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium">
                      ({workshopUser.company})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                    {workshopUser.email}
                  </span>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/80 uppercase tracking-wide ml-1">
                  ASISTENTE TALLER
                </span>
                <button
                  type="button"
                  onClick={handleLogoutWorkshop}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors ml-1"
                  title="Cerrar sesión de taller"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* KPI 1: ACTIVIDADES */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                <span>
                  Actividades:{" "}
                  <strong className="text-slate-900">{totalCount}</strong>
                </span>
              </div>

              {/* KPI 2: AHORRO ESTIMADO */}
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-lg text-xs font-semibold text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>
                  Ahorro Est.:{" "}
                  <strong className="text-emerald-800">
                    {Math.round(totalSavedMinsWeek)} min/sem
                  </strong>{" "}
                  <span className="text-emerald-700 font-normal">
                    (~{hoursPerMonth} hrs/mes)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* BANNER DE INSTRUCCIONES DE TALLER */}
        <div className="bg-white/90 p-4 sm:p-5 rounded-2xl border border-[#E2DDCF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100/80 text-amber-800 rounded-xl shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-sm sm:text-base">
                ¡Bienvenido al Diagnóstico de Actividades, {workshopUser.name}!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Ingresa las tareas que ejecutas habitualmente en tu semana. La
                matriz las clasificará automáticamente en cuadrantes
                estratégicos de automatización e IA.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-[#F8F6F0] px-3 py-2 rounded-xl border border-[#E2DDCF] shrink-0 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tus datos están asociados a {workshopUser.email}</span>
          </div>
        </div>

        {/* COMPONENTE MATRIZ DE ACTIVIDADES */}
        <div className="bg-white rounded-2xl p-1 sm:p-2 border border-[#E2DDCF] shadow-sm">
          <MatrizInteractiva tierId={2} diagnosticId={activeKey} />
        </div>
      </main>

      {/* FOOTER MINIMALISTA CON MARCA PRESTIGIO */}
      <footer className="bg-[#F8F6F0] border-t border-[#E2DDCF] py-3 text-center text-xs text-slate-500 font-medium">
        HumanAI First Company® by Prestigio © 2026 — Acceso exclusivo para
        sesión de taller.
      </footer>
    </div>
  );
}
