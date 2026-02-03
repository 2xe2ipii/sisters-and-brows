import { getAppConfig } from '@/lib/googleSheets';

export async function getDynamicConfig() {
  const config = await getAppConfig();
  const BRANCH_MAP: Record<string, string> = {};
  const BRANCH_LIMITS: Record<string, number> = {};
  
  if (config.branches && Array.isArray(config.branches)) {
    config.branches.forEach((b: any) => {
      BRANCH_MAP[b.name] = b.code;
      BRANCH_LIMITS[b.code] = b.limit;
    });
  }
  
  return { BRANCH_MAP, BRANCH_LIMITS };
}

