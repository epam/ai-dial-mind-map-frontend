import { AppsEditorClient, AppsEditorHostMessage } from '@epam/ai-dial-visualizer-connector';

import { AppsEditorQuery } from '@/types/apps-editor';

const WILDCARD_ORIGIN = '*';

let connectedClients: AppsEditorClient[] = [];

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

/**
 * Opens one `AppsEditorClient` per configured host origin: a client talks to a single origin, and
 * the browser drops every copy whose target is not the parent's real origin. A wildcard or an
 * invalid origin gets no client, so with no concrete origin the editor protocol stays silent.
 * @param hostOrigins - normalized origins of the Apps Editor host
 * @param applicationName - namespace the host expects for lifecycle events
 * @param onMessage - receives validated host messages together with the client that received them
 * @returns a disconnect function that destroys the opened clients
 */
export const connectAppsEditorHosts = (
  hostOrigins: readonly string[],
  applicationName: string,
  onMessage: (message: AppsEditorHostMessage, client: AppsEditorClient) => void,
): (() => void) => {
  if (typeof window === 'undefined' || window.parent === window) return () => {};

  const clients = hostOrigins
    .filter(hostOrigin => hostOrigin !== WILDCARD_ORIGIN)
    .flatMap(hostOrigin => {
      try {
        const client: AppsEditorClient = new AppsEditorClient({
          hostOrigin,
          applicationName,
          onMessage: message => onMessage(message, client),
        });
        return [client];
      } catch (error) {
        console.error(`Invalid Apps Editor host origin "${hostOrigin}"`, error);
        return [];
      }
    });

  connectedClients = [...connectedClients, ...clients];

  return () => {
    clients.forEach(client => client.destroy());
    connectedClients = connectedClients.filter(client => !clients.includes(client));
  };
};

/**
 * Sends one message through every connected Apps Editor client.
 * @param send - posts the message through the given client
 */
export const sendToAppsEditorHosts = (send: (client: AppsEditorClient) => void): void => {
  connectedClients.forEach(send);
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
