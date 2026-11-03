'use client';

import { AppsEditorClient, AppsEditorMessages } from '@epam/ai-dial-visualizer-connector';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef } from 'react';

import { ApplicationSelectors } from '@/store/builder/application/application.reducer';
import { AuthSelectors } from '@/store/builder/auth/auth.slice';
import { BuilderSelectors } from '@/store/builder/builder/builder.reducers';
import { useBuilderSelector } from '@/store/builder/hooks';
import { UISelectors } from '@/store/builder/ui/ui.reducers';
import {
  connectAppsEditorHosts,
  getAppsEditorApplicationName,
  normalizeHostOrigins,
  sendToAppsEditorHosts,
} from '@/utils/app/apps-editor-host';
import { isClientSessionValid } from '@/utils/auth/session';

/** Longest write debounce in the builder (theme config, generate params) is 500ms. */
export const SAVE_SETTLE_MS = 600;
export const SAVE_POLL_MS = 50;
/** Kept under the host's own 20s save timeout so it receives an explicit error instead. */
export const SAVE_FLUSH_TIMEOUT_MS = 15000;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Speaks the Apps Editor iframe protocol: reports readiness and logged-out state, and answers
 * `TRIGGER_SAVE`. The builder persists every change as it is made, so a save only has to wait
 * for pending writes to finish before it acknowledges.
 */
export const useAppsEditorHost = () => {
  const iframeTitle = useBuilderSelector(UISelectors.selectMindmapIframeTitle);
  const dialChatHost = useBuilderSelector(UISelectors.selectDialChatHost);
  const dialIframeAllowedHosts = useBuilderSelector(UISelectors.selectDialIframeAllowedHosts);
  const isAllowApiKeyAuth = useBuilderSelector(UISelectors.selectIsAllowApiKey);
  const redirectToSignIn = useBuilderSelector(AuthSelectors.selectRedirectToSignin);
  const application = useBuilderSelector(ApplicationSelectors.selectApplication);
  const applicationError = useBuilderSelector(ApplicationSelectors.selectApplicationError);
  const isApplicationReady = useBuilderSelector(ApplicationSelectors.selectIsApplicationReady);
  const isRequestInProgress = useBuilderSelector(BuilderSelectors.selectIsRequestInProgress);
  const { data: session, status: sessionStatus } = useSession();

  // Keyed by value: reconnecting would destroy the client an in-flight save replies through
  const allowedOriginsKey = normalizeHostOrigins(
    dialIframeAllowedHosts?.length ? dialIframeAllowedHosts : [dialChatHost],
  ).join(',');
  const allowedOrigins = useMemo(() => allowedOriginsKey.split(',').filter(Boolean), [allowedOriginsKey]);

  const isLoggedOut =
    !isAllowApiKeyAuth &&
    sessionStatus !== 'loading' &&
    (sessionStatus === 'unauthenticated' || !isClientSessionValid(session) || redirectToSignIn);

  const isReadyToSave = isApplicationReady && !!application && !applicationError && !isLoggedOut;

  const isReadyToSaveRef = useRef(isReadyToSave);
  const isRequestInProgressRef = useRef(isRequestInProgress);
  const pendingSaveRef = useRef<Promise<void> | null>(null);
  isReadyToSaveRef.current = isReadyToSave;
  isRequestInProgressRef.current = isRequestInProgress;

  // Declared before the readiness effects so a reconnect is in place when they re-send
  useEffect(() => {
    const applicationName = getAppsEditorApplicationName(iframeTitle);
    if (!applicationName) return;

    const flushPendingWrites = async () => {
      await sleep(SAVE_SETTLE_MS);
      const deadline = Date.now() + SAVE_FLUSH_TIMEOUT_MS;
      while (isRequestInProgressRef.current) {
        if (Date.now() >= deadline) throw new Error('Timed out waiting for pending changes to be saved.');
        await sleep(SAVE_POLL_MS);
      }
    };

    const handleSave = async (client: AppsEditorClient) => {
      if (!isReadyToSaveRef.current) {
        client.sendSaveError('The mind map editor is not ready to save.');
        return;
      }
      try {
        await flushPendingWrites();
        client.sendSaveSuccess(false);
      } catch (error) {
        client.sendSaveError(error instanceof Error ? error.message : 'Failed to save the mind map.');
      }
    };

    return connectAppsEditorHosts(allowedOrigins, applicationName, (message, client) => {
      if (message.type !== AppsEditorMessages.TriggerSave) return;

      pendingSaveRef.current ??= handleSave(client).finally(() => {
        pendingSaveRef.current = null;
      });
    });
  }, [iframeTitle, allowedOrigins]);

  useEffect(() => {
    if (isReadyToSave) sendToAppsEditorHosts(client => client.sendReadyToSave());
  }, [isReadyToSave, iframeTitle, allowedOrigins]);

  useEffect(() => {
    if (isLoggedOut) sendToAppsEditorHosts(client => client.sendLoggedOut());
  }, [isLoggedOut, iframeTitle, allowedOrigins]);
};
