const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        const path = window.location.pathname;
        const isPublicPage = path === "/" || path === "/login" || path === "/register";
        if (!isPublicPage) {
          window.location.href = "/login?expired=true";
        }
      }
    }
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as { error?: string }).error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: Omit<RequestInit, "method" | "body">
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  options?: Omit<RequestInit, "method" | "body">
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(
  path: string,
  options?: Omit<RequestInit, "method">
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "DELETE" });
}

export { API_BASE_URL, getAuthHeaders };
