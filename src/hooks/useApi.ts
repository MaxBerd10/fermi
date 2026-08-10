import { useEffect, useState, type DependencyList } from "react";
import { ApiError } from "../types/api";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
}

/**
 * Fetch-on-mount (and on every `deps` change). Deliberately minimal —
 * no external cache/query library, since every page here just needs a
 * single fetch on mount/param-change plus a loading/error flag. See the
 * plan's react-query rejection rationale for why.
 */
export function useApi<T>(fetchFn: () => Promise<T>, deps: DependencyList): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchFn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
