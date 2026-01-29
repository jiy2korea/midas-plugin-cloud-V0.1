/**
 * BESTO Design Cloud API 엔드포인트 함수.
 * getHealth, getBeamInfo, getBeamNeighbors, postCalculate.
 */
import type { DetailResult } from '../types';
import { request } from './client';

/** GET /api/health */
export async function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>('/api/health');
}

/** GET /api/beam-info?section_name= */
export async function getBeamInfo(sectionName: string): Promise<Record<string, unknown>> {
  const q = new URLSearchParams({ section_name: sectionName });
  return request<Record<string, unknown>>(`/api/beam-info?${q.toString()}`);
}

/** GET /api/beam-neighbors?selected_member= */
export async function getBeamNeighbors(selectedMember: string): Promise<string[]> {
  const q = new URLSearchParams({ selected_member: selectedMember });
  return request<string[]>(`/api/beam-neighbors?${q.toString()}`);
}

/**
 * POST /api/calculate. Body = pythonInput 동일 JSON.
 * 응답 = DetailResult 형태.
 */
export async function postCalculate(
  body: Record<string, unknown> & { selectedMember: string }
): Promise<DetailResult> {
  return request<DetailResult>('/api/calculate', { method: 'POST', body });
}
