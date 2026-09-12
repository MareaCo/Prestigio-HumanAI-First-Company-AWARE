import {
  analyzeActivityFn,
  type ActivityAnalysis,
} from "@/lib/analyzeActivity.functions";

export type { ActivityAnalysis };

export async function analyzeActivity(
  name: string,
  mins: number,
): Promise<ActivityAnalysis> {
  return await analyzeActivityFn({ data: { name, mins } });
}
