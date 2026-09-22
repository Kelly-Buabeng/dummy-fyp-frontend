import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiQueryResult<T> extends QueryState<T> {
  refetch: () => void;
}

/**
 * Shared GET-fetch hook: loading/data/error state plus
 * AbortController-based cancellation, so rapid dependency changes
 * (e.g. the heatmap page's confidence slider) can't resolve out of
 * order and show stale data — a real race the original vanilla-JS
 * version didn't guard against.
 */
export function useApiQuery<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList = []
): UseApiQueryResult<T> {
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  // Keeps the latest fn without making it a dependency of the fetch
  // effect below (inline fetcher functions aren't referentially
  // stable across renders, and including them in deps would refetch
  // every render). Updated in its own effect rather than during
  // render, per the react-hooks/refs rule.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    // This is React's own documented data-fetching pattern (see "Fetching
    // data" at react.dev/learn/synchronizing-with-effects): resetting
    // loading/error synchronously when deps change, before the async call
    // resolves. eslint-plugin-react-hooks' newer React-Compiler-readiness
    // rule flags any synchronous setState in an effect body on principle,
    // but there's no external subscription to move this into — it's
    // exactly the "start of a request" transition, not a cascading update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ data: s.data, loading: true, error: null }));

    fnRef
      .current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setState({ data: result, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState((s) => ({
          data: s.data,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, refetch };
}
