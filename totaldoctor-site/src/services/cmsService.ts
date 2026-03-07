const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.renovaprime.com.br/api/v1';

export async function fetchAllCms(): Promise<Record<string, string>> {
  try {
    const response = await fetch(`${API_BASE_URL}/cms/public`);
    if (!response.ok) return {};
    const result = await response.json();
    return result.data ?? {};
  } catch {
    return {};
  }
}
