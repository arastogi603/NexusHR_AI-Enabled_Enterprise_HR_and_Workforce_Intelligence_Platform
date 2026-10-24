export const CLUB_ROLES = [
  "system_admin",
  "president",
  "vice-president",
  "ctc",
  "co-ctc",
  "general-secretary",
  "management-head",
  "programming-lead",
  "programming-head",
  "web-dev-lead",
  "web-development-head",
  "technical-lead",
  "technical-head",
  "design-lead",
  "design-head",
  "programmer",
  "programming",
  "web-developer",
  "web-development",
  "technical-member",
  "technical",
  "designer",
  "design",
  "faculty-coordinator"
];

export const isAdminRights = (role: string | undefined | null): boolean => {
  if (!role) return false;
  const lowerRole = role.toLowerCase();
  return lowerRole === 'system_admin' || lowerRole === 'admin' || lowerRole === 'president' || lowerRole === 'ctc';
};

export const isCoreTeam = (role: string | undefined | null): boolean => {
  if (!role) return false;
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'student') return false;
  return isAdminRights(role) || lowerRole === 'core-team' || CLUB_ROLES.includes(lowerRole);
};

export const formatRoleName = (role: string): string => {
  if (!role) return "Student";
  const r = role.toLowerCase();
  if (r === "student") return "Student";
  if (r === "system_admin" || r === "admin") return "System Admin";
  if (r === "president") return "President";
  if (r === "vice-president" || r === "vice_president") return "Vice President";
  if (r === "ctc") return "CTC";
  if (r === "co-ctc" || r === "co_ctc") return "Co-CTC";
  if (r === "general-secretary" || r === "general_secretary") return "General Secretary";
  if (r === "management-head" || r === "management_head") return "Management Head";
  if (r === "programming-lead" || r === "programming-head") return "Programming Lead";
  if (r === "web-dev-lead" || r === "web-development-head" || r === "web-dev-head") return "Web Dev Lead";
  if (r === "technical-lead" || r === "technical-head") return "Technical Lead";
  if (r === "design-lead" || r === "design-head") return "Design Lead";
  if (r === "programmer" || r === "programming") return "Programmer";
  if (r === "web-developer" || r === "web-development" || r === "web-dev") return "Web Developer";
  if (r === "technical-member" || r === "technical") return "Technical Member";
  if (r === "designer" || r === "design") return "Designer";
  if (r === "faculty-coordinator" || r === "faculty_coordinator") return "Faculty Coordinator";
  return role.split('_').map(w => w.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(' ');
};