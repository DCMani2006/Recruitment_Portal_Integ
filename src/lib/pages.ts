import { Domain } from "./api";

export type PageKey =
  | "cover"
  | "editorial"
  | "design"
  | "marketing"
  | "research"
  | "management"
  | "tech"
  | "coupon"
  | "thankyou";

export interface PageConfig {
  key: PageKey;
  pageNumber: number;
  pageIndex: number;
  label: string;
  domainCode?: Domain;
  showInIndex: boolean;
  showPoster: boolean;
  isOxblood?: boolean;
}

export const PAGE_CONFIGS: PageConfig[] = [
  { key: "cover", pageNumber: 1, pageIndex: 0, label: "Cover", showInIndex: false, showPoster: false },
  { key: "editorial", pageNumber: 2, pageIndex: 1, label: "Editorial", domainCode: "EDITORIAL", showInIndex: true, showPoster: false },
  { key: "design", pageNumber: 3, pageIndex: 2, label: "Design", domainCode: "DESIGN", showInIndex: true, showPoster: false },
  { key: "marketing", pageNumber: 4, pageIndex: 3, label: "Marketing", domainCode: "MARKETING", showInIndex: true, showPoster: false },
  { key: "research", pageNumber: 5, pageIndex: 4, label: "Research", domainCode: "R_AND_D", showInIndex: true, showPoster: false },
  { key: "management", pageNumber: 6, pageIndex: 5, label: "Management", domainCode: "MANAGEMENT", showInIndex: true, showPoster: false },
  { key: "tech", pageNumber: 7, pageIndex: 6, label: "Tech", domainCode: "TECHNICAL", showInIndex: true, showPoster: false },
  { key: "coupon", pageNumber: 8, pageIndex: 7, label: "Clip & Subscribe", showInIndex: true, showPoster: false, isOxblood: true },
  { key: "thankyou", pageNumber: 9, pageIndex: 8, label: "Thank You", showInIndex: true, showPoster: false },
];

export const TOTAL_PAGES = PAGE_CONFIGS.length; // 9

export function pageNo(key: PageKey): number {
  const p = PAGE_CONFIGS.find((cfg) => cfg.key === key);
  return p ? p.pageNumber : 1;
}

export function pageIndex(key: PageKey): number {
  const p = PAGE_CONFIGS.find((cfg) => cfg.key === key);
  return p ? p.pageIndex : 0;
}

export function pageConfig(key: PageKey): PageConfig {
  return PAGE_CONFIGS.find((cfg) => cfg.key === key) || PAGE_CONFIGS[0];
}

export const INSIDE_ENTRIES = PAGE_CONFIGS.filter((p) => p.showInIndex);
