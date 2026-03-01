export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError;
};

export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (typeof error.details === 'string' && error.details.trim()) {
      return error.details;
    }
    if (error.details && typeof error.details === 'object') {
      const details = error.details as Record<string, unknown>;
      if (typeof details.message === 'string') {
        return details.message;
      }
      if (Array.isArray(details.errors)) {
        return details.errors.join(', ');
      }
      if (details.errors && typeof details.errors === 'object') {
        const map = details.errors as Record<string, string[] | string>;
        return Object.entries(map)
          .map(([field, val]) => `${field}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      }
    }
    return `${fallback} (HTTP ${error.status})`;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const details = await parseErrorBody(response);
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(`Request failed: ${response.status}`, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as T;
}
