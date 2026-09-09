import { useEffect, useRef, useState, type DependencyList } from "react";
import { getErrorMessage } from "@/services/api";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = [],
) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    let active = true;
    fetcherRef.current = fetcher;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, loading: false, error: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
    // deps are intentionally dynamic so the caller controls when to refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshKey]);

  const refetch = () => setRefreshKey((key) => key + 1);

  return { ...state, refetch };
}