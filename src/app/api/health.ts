import { apiFetch } from './client';

export type HealthData = {
  status?: string;
  message?: string;
};

export async function fetchHealth(): Promise<HealthData> {
  return apiFetch<HealthData>('/health');
}
