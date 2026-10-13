import { AppsEditorQuery } from '@/types/apps-editor';

const WILDCARD_ORIGIN = '*';

/**
 * Reduces configured hosts (full URLs or bare origins, with or without a trailing
 * slash) to the origins `postMessage` and `MessageEvent.origin` work with.
 * @param hosts - raw host values from configuration
 */
export const normalizeHostOrigins = (hosts: readonly (string | null | undefined)[]): string[] =>
  hosts
    .map(host => host?.trim())
    .filter((host): host is string => !!host)
    .map(host => {
      try {
        return new URL(host).origin;
      } catch {
        return host.replace(/\/+$/, '');
      }
    });

const isWildcard = (origins: readonly string[]) => !origins.length || origins.includes(WILDCARD_ORIGIN);

/**
 * No configured origins means "any origin", matching the Quick Apps editor's default for local development.
 * @param origin - `event.origin` of the received message
 * @param allowedOrigins - normalized origins of the Apps Editor host
 */
export const isHostOriginAllowed = (origin: string, allowedOrigins: readonly string[]): boolean =>
  isWildcard(allowedOrigins) || allowedOrigins.includes(origin);

/**
 * `postMessage` takes one target origin, so with several allowed origins the message is posted
 * once per origin; the browser drops every copy whose target is not the parent's real origin.
 * @param message - payload to post to the parent window
 * @param allowedOrigins - normalized origins of the Apps Editor host
 */
export const postToHost = (message: unknown, allowedOrigins: readonly string[]): void => {
  if (typeof window === 'undefined' || window.parent === window) return;

  if (isWildcard(allowedOrigins)) {
    window.parent.postMessage(message, WILDCARD_ORIGIN);
    return;
  }

  allowedOrigins.forEach(origin => {
    try {
      window.parent.postMessage(message, origin);
    } catch (error) {
      console.error(`Invalid Apps Editor host origin "${origin}"`, error);
    }
  });
};

/**
 * Name the Apps Editor expects as the message type prefix. The host passes its schema display name
 * in the editor URL, which is the source of truth; the configured iframe title is the fallback.
 * @param fallbackTitle - configured `MINDMAP_IFRAME_TITLE`
 */
export const getAppsEditorApplicationName = (fallbackTitle: string): string => {
  if (typeof window === 'undefined') return fallbackTitle;
  return new URLSearchParams(window.location.search).get(AppsEditorQuery.ApplicationName) || fallbackTitle;
};
