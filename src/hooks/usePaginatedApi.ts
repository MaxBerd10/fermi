import { useEffect, useState, type DependencyList } from "react";
import type { ApiMeta } from "../types/api";
import { ApiError } from "../types/api";
import type { ApiResult } from "../api/client";

export interface UsePaginatedApiState<T> {
  items: T[];
  meta: ApiMeta | null;
  loading: boolean;
  error: ApiError | Error | null;
}

/**
 * Same idea as useApi, but for endpoints returning {data: T[], meta}.
 */
export function usePaginatedApi<T>(
  fetchFn: () => Promise<ApiResult<T[]>>,
  deps: DependencyList
): UsePaginatedApiState<T> {
  const [state, setState] = useState<UsePaginatedApiState<T>>({
    items: [],
    meta: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchFn()
      .then((result) => {
        if (!cancelled) {
          setState({ items: result.data, meta: result.meta ?? null, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) setState({ items: [], meta: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
