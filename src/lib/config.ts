export const SIGNUP_NEEDS_DOMAIN = true;
export const INTERVIEW_ALWAYS_UNLOCKED = false;
export const LOGO_STYLE: "ink" | "original" = "ink";

export const DOMAIN_LABELS: Record<string, string> = {
  DESIGN: "Design",
  MARKETING: "Marketing",
  R_AND_D: "Research & Development",
  MANAGEMENT: "Management",
  TECHNICAL: "Tech",
};

export function getDomainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] || domain;
}
