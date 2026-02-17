export type PlanType = 'free' | 'pro' | 'team' | 'business';

export interface PlanLimits {
  maxFileSize: number;       // bytes
  monthlyAnalyses: number;   // 0 = unlimited
  maxStorageBytes: number;
  pdfExport: boolean;
  maxTeamMembers: number;    // 0 = unlimited
  deepInsights: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxFileSize: 5 * 1024 * 1024,         // 5MB
    monthlyAnalyses: 3,
    maxStorageBytes: 100 * 1024 * 1024,    // 100MB
    pdfExport: false,
    maxTeamMembers: 1,                      // solo only
    deepInsights: false,
  },
  pro: {
    maxFileSize: 50 * 1024 * 1024,         // 50MB
    monthlyAnalyses: 0,                     // unlimited
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    pdfExport: true,
    maxTeamMembers: 0,                      // unlimited
    deepInsights: true,
  },
  team: {
    maxFileSize: 100 * 1024 * 1024,        // 100MB
    monthlyAnalyses: 0,                     // unlimited
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100GB
    pdfExport: true,
    maxTeamMembers: 5,
    deepInsights: true,
  },
  business: {
    maxFileSize: 500 * 1024 * 1024,        // 500MB
    monthlyAnalyses: 0,
    maxStorageBytes: 500 * 1024 * 1024 * 1024,
    pdfExport: true,
    maxTeamMembers: 0,                      // unlimited
    deepInsights: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[(plan as PlanType)] || PLAN_LIMITS.free;
}
