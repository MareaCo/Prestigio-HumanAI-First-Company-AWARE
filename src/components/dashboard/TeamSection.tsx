import { ChampionsCard } from "@/components/dashboard/ChampionsCard";
import type { Diagnostic } from "@/types";

interface Props {
  teamDiagnostics: Diagnostic[];
  allDiagnostics: Diagnostic[];
  areaName: string;
  isCompanyWide?: boolean;
  hideBanner?: boolean;
}

export function CompanyBanner({
  areaName,
  isCompanyWide,
}: {
  areaName: string;
  isCompanyWide?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{ background: "#2D3036" }}
    >
      <p
        className="uppercase"
        style={{ fontSize: 10, opacity: 0.5, letterSpacing: "0.1em" }}
      >
        {isCompanyWide ? "Vista general" : "Vista de equipo"}
      </p>
      <h3 className="font-display text-xl font-bold mt-1">{areaName}</h3>
      <p className="text-[12px] mt-1" style={{ opacity: 0.7 }}>
        {isCompanyWide
          ? "Resumen consolidado para Admin / RRHH."
          : "Detalle adicional para el Líder de esta área."}
      </p>
    </div>
  );
}

export function TeamSection({
  teamDiagnostics,
  allDiagnostics: _allDiagnostics,
  areaName,
  isCompanyWide,
  hideBanner = false,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Banner */}
      {!hideBanner && (
        <CompanyBanner areaName={areaName} isCompanyWide={isCompanyWide} />
      )}

      {/* Champions */}
      <ChampionsCard diagnostics={teamDiagnostics} />
    </div>
  );
}
