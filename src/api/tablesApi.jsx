import { API_PATHS } from './config';
import { apiRequest, unwrapList } from './client';

const base = API_PATHS.tables;

export async function getBranchTables(branchId, params = {}) {
  const data = await apiRequest(`${base}/branches/${branchId}/tables/`, {
    params,
    auth: false,
  });
  return unwrapList(data);
}
