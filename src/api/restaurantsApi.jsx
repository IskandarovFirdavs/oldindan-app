import { API_PATHS } from './config';
import { apiRequest, unwrapList } from './client';

const base = API_PATHS.restaurants;

export async function getBranches(params = {}) {
  const data = await apiRequest(`${base}/branches/`, { params, auth: false });
  return unwrapList(data);
}

export async function getBranchDetail(id) {
  return apiRequest(`${base}/branches/${id}/`, { auth: false });
}
