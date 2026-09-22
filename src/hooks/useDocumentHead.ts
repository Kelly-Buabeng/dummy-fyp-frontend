import { useEffect } from "react";

function setMeta(attr: "name" | "property", key: string, content: string): string | null {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const previous = el?.getAttribute("content") ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return previous;
}

/**
 * Sets document.title + meta description/OG tags per route.
 *
 * Known tradeoff: this only updates <head> after JS runs, which is a
 * regression from the static site's per-file baked-in tags for
 * crawlers/social-unfurlers that don't execute JS. A custom hook is
 * used here instead of react-helmet-async since this is a 6-route SPA
 * with no nested-route tag merging — not enough surface to justify the
 * dependency. If crawler-visible per-route metadata matters later, the
 * fix is prerendering the marketing routes (/, /about), not this hook.
 */
export function useDocumentHead(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const prevDescription = setMeta("name", "description", description);
    const prevOgTitle = setMeta("property", "og:title", title);
    const prevOgDescription = setMeta("property", "og:description", description);

    return () => {
      document.title = prevTitle;
      if (prevDescription !== null) setMeta("name", "description", prevDescription);
      if (prevOgTitle !== null) setMeta("property", "og:title", prevOgTitle);
      if (prevOgDescription !== null) setMeta("property", "og:description", prevOgDescription);
    };
  }, [title, description]);
}
