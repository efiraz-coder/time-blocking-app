export type Category =
  | "PERSONAL"
  | "FAMILY"
  | "HOUSEHOLD"
  | "RELATIONSHIP"
  | "PAID_WORK"
  | "UNPAID_WORK"
  | "EMPTY";

export const CATEGORY_COLORS: Record<Category, string> = {
  PERSONAL: "#60A5FA",
  FAMILY: "#34D399",
  HOUSEHOLD: "#FBBF24",
  RELATIONSHIP: "#A78BFA",
  PAID_WORK: "#FB923C",
  UNPAID_WORK: "#9CA3AF",
  EMPTY: "transparent",
};

export const CATEGORY_BG: Record<Category, string> = {
  PERSONAL: "#DBEAFE",
  FAMILY: "#D1FAE5",
  HOUSEHOLD: "#FEF3C7",
  RELATIONSHIP: "#EDE9FE",
  PAID_WORK: "#FFEDD5",
  UNPAID_WORK: "#F3F4F6",
  EMPTY: "#F9FAFB",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  PERSONAL: "זמן עצמי",
  FAMILY: "משפחה",
  HOUSEHOLD: "משק בית",
  RELATIONSHIP: "זוגיות",
  PAID_WORK: "עבודה משולמת",
  UNPAID_WORK: "עבודה לא משולמת",
  EMPTY: "ריק",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  PERSONAL: "User",
  FAMILY: "Home",
  HOUSEHOLD: "Wrench",
  RELATIONSHIP: "Heart",
  PAID_WORK: "Briefcase",
  UNPAID_WORK: "Coffee",
  EMPTY: "X",
};

export const DAY_LABELS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
export const DAY_FULL_LABELS = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי"];
export const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6-23 (06:00 עד 24:00)
export const FRIDAY_HOURS = Array.from({ length: 8 }, (_, i) => i + 6); // 6-13 (06:00 עד 14:00)
export const WEEKDAYS = [0, 1, 2, 3, 4, 5]; // Sunday(0) through Friday(5)
export const ALL_CATEGORIES: Category[] = ["PERSONAL", "FAMILY", "HOUSEHOLD", "RELATIONSHIP", "PAID_WORK", "UNPAID_WORK"];
