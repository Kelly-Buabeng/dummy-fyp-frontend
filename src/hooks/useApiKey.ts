import { useCallback, useState } from "react";
import { getStoredApiKey, storeApiKey } from "@/lib/api";

/**
 * Replaces getStoredApiKey()/storeApiKey() from the vanilla assets/js/api.js.
 * Persistence only happens when persist() is called (on submit), matching
 * the original behavior of not writing to localStorage on every keystroke.
 */
export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [remember, setRemember] = useState(() => Boolean(getStoredApiKey()));

  const persist = useCallback(() => {
    storeApiKey(apiKey, remember);
  }, [apiKey, remember]);

  return { apiKey, setApiKey, remember, setRemember, persist };
}
