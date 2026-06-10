import { API_PATHS } from './config';
import { apiRequest, unwrapList } from './client';

const base = API_PATHS.layouts;

export async function getBranchFloors(branchId) {
  const data = await apiRequest(`${base}/branches/${branchId}/floors/`, { auth: false });
  return unwrapList(data);
}
