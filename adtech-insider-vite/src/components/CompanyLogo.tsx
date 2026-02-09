import type { CompanyBase } from "@/types/company";

const LOGO_MAX_SIZE = 56;

interface CompanyLogoProps {
  company: CompanyBase;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: 28, md: 40, lg: 56 };

export function CompanyLogo({
  company,
  size = "md",
  className = "",
}: CompanyLogoProps) {
  const px = sizeMap[size];
  const initial = company.name.charAt(0).toUpperCase();

  if (company.logoDataUrl) {
    return (
      <img
        src={company.logoDataUrl}
        alt={`${company.name} logo`}
        width={px}
        height={px}
        className={`rounded-lg object-contain shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  if (company.logoSrc) {
    return (
      <img
        src={company.logoSrc}
        alt={`${company.name} logo`}
        width={px}
        height={px}
        className={`rounded-lg object-contain shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  if (company.id?.toLowerCase() === "criteo") {
    return (
      <img
        src="/logos/criteo.png"
        alt="Criteo logo"
        width={px}
        height={px}
        className={`rounded-lg object-contain shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg font-bold text-white shrink-0 ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: Math.max(10, Math.floor(px * 0.5)),
        backgroundColor: "#6366f1",
      }}
    >
      {initial}
    </div>
  );
}
