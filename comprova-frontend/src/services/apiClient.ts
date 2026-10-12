const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = errorData && typeof errorData === 'object'
      ? { status: response.status, ...errorData }
      : { status: response.status, message: response.statusText || "Erro na requisição da API" };
    throw err;
  }

  // Se a resposta for 204 No Content, ou se for vazia (length 0), não tentamos fazer o parse.
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch {
    return {} as T;
  }
};
