import { act, renderHook } from '@testing-library/react';

import { postToHost } from '@/utils/app/apps-editor-host';

import { SAVE_FLUSH_TIMEOUT_MS, SAVE_SETTLE_MS, useAppsEditorHost } from '../useAppsEditorHost';

const HOST = 'https://chat.example.com';

const mockState: Record<string, unknown> = {};

function mockKey(key: string) {
  return Object.assign(() => 0, { key });
}

jest.mock('@/store/builder/hooks', () => ({
  useBuilderSelector: (selector: { key: string }) => mockState[selector.key],
}));

jest.mock('@/store/builder/ui/ui.reducers', () => ({
  UISelectors: {
    selectMindmapIframeTitle: mockKey('title'),
    selectDialChatHost: mockKey('host'),
    selectDialIframeAllowedHosts: mockKey('allowedHosts'),
    selectIsAllowApiKey: mockKey('apiKey'),
  },
}));
jest.mock('@/store/builder/auth/auth.slice', () => ({
  AuthSelectors: { selectRedirectToSignin: mockKey('redirect') },
}));
jest.mock('@/store/builder/application/application.reducer', () => ({
  ApplicationSelectors: {
    selectApplication: mockKey('application'),
    selectApplicationError: mockKey('applicationError'),
    selectIsApplicationReady: mockKey('isReady'),
  },
}));
jest.mock('@/store/builder/builder/builder.reducers', () => ({
  BuilderSelectors: { selectIsRequestInProgress: mockKey('inProgress') },
}));

const mockSession = jest.fn();
jest.mock('next-auth/react', () => ({ useSession: () => mockSession() }));

jest.mock('@/utils/app/apps-editor-host', () => ({
  ...jest.requireActual('@/utils/app/apps-editor-host'),
  postToHost: jest.fn(),
}));

const setState = (overrides: Record<string, unknown> = {}) => {
  Object.assign(mockState, {
    title: 'Mind map',
    host: HOST,
    allowedHosts: [],
    apiKey: false,
    redirect: false,
    application: { name: 'applications/bucket/app' },
    applicationError: null,
    isReady: true,
    inProgress: false,
    ...overrides,
  });
  mockSession.mockReturnValue({ data: { user: {} }, status: 'authenticated' });
};

const sendFromHost = (data: unknown, origin = HOST, source: unknown = window.parent) => {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin, source: source as Window }));
  });
};

const settleSave = async () => {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(SAVE_SETTLE_MS + 100);
  });
};

describe('useAppsEditorHost', () => {
  const posted = () => (postToHost as jest.Mock).mock.calls.map(([message]) => message);

  beforeEach(() => {
    jest.useFakeTimers();
    (postToHost as jest.Mock).mockClear();
    setState();
  });

  afterEach(() => jest.useRealTimers());

  describe('readiness', () => {
    it('sends the prefixed readyToSave once the application is loaded', () => {
      renderHook(() => useAppsEditorHost());

      expect(posted()).toContainEqual({ type: 'Mind map/readyToSave' });
    });

    it('prefers the applicationName passed by the host in the URL', () => {
      window.history.replaceState({}, '', '/?applicationName=Host%20Name');

      renderHook(() => useAppsEditorHost());

      expect(posted()).toContainEqual({ type: 'Host Name/readyToSave' });
      window.history.replaceState({}, '', '/');
    });

    it.each([
      ['the application is still loading', { isReady: false }],
      ['the application failed to load', { applicationError: 'boom' }],
      ['there is no application', { application: undefined }],
    ])('does not send readyToSave while %s', (_, overrides) => {
      setState(overrides);

      renderHook(() => useAppsEditorHost());

      expect(posted()).not.toContainEqual({ type: 'Mind map/readyToSave' });
    });
  });

  describe('logged out', () => {
    it('sends loggedOut instead of readyToSave when unauthenticated', () => {
      mockSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      renderHook(() => useAppsEditorHost());

      expect(posted()).toContainEqual({ type: 'Mind map/loggedOut' });
      expect(posted()).not.toContainEqual({ type: 'Mind map/readyToSave' });
    });

    it('never reports logged out with API key auth', () => {
      setState({ apiKey: true });
      mockSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      renderHook(() => useAppsEditorHost());

      expect(posted()).not.toContainEqual({ type: 'Mind map/loggedOut' });
    });
  });

  describe('TRIGGER_SAVE', () => {
    it('acknowledges with SAVE_SUCCESS after the settle delay', async () => {
      renderHook(() => useAppsEditorHost());

      sendFromHost({ type: 'TRIGGER_SAVE', general: { name: 'x' } });
      expect(posted()).not.toContainEqual(expect.objectContaining({ type: 'SAVE_SUCCESS' }));
      await settleSave();

      expect(posted()).toContainEqual({ type: 'SAVE_SUCCESS', hasChanges: false });
    });

    it('waits for in-flight requests before acknowledging', async () => {
      setState({ inProgress: true });
      const { rerender } = renderHook(() => useAppsEditorHost());

      sendFromHost({ type: 'TRIGGER_SAVE' });
      await settleSave();
      expect(posted()).not.toContainEqual(expect.objectContaining({ type: 'SAVE_SUCCESS' }));

      setState({ inProgress: false });
      rerender();
      await act(async () => {
        await jest.advanceTimersByTimeAsync(100);
      });

      expect(posted()).toContainEqual({ type: 'SAVE_SUCCESS', hasChanges: false });
    });

    it('replies SAVE_ERROR when requests never finish', async () => {
      setState({ inProgress: true });
      renderHook(() => useAppsEditorHost());

      sendFromHost({ type: 'TRIGGER_SAVE' });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(SAVE_FLUSH_TIMEOUT_MS + SAVE_SETTLE_MS + 200);
      });

      expect(posted()).toContainEqual(expect.objectContaining({ type: 'SAVE_ERROR' }));
    });

    it('replies SAVE_ERROR immediately when the editor is not ready', () => {
      setState({ isReady: false });
      renderHook(() => useAppsEditorHost());

      sendFromHost({ type: 'TRIGGER_SAVE' });

      expect(posted()).toContainEqual(expect.objectContaining({ type: 'SAVE_ERROR' }));
    });

    it('answers a burst of triggers once', async () => {
      renderHook(() => useAppsEditorHost());

      sendFromHost({ type: 'TRIGGER_SAVE' });
      sendFromHost({ type: 'TRIGGER_SAVE' });
      await settleSave();

      expect(posted().filter(message => message.type === 'SAVE_SUCCESS')).toHaveLength(1);
    });

    it('ignores messages from other origins, other windows and other types', async () => {
      setState({ allowedHosts: [HOST] });
      renderHook(() => useAppsEditorHost());

      sendFromHost({ type: 'TRIGGER_SAVE' }, 'https://evil.com');
      sendFromHost({ type: 'TRIGGER_SAVE' }, HOST, {});
      sendFromHost({ type: 'SOMETHING_ELSE' });
      await settleSave();

      expect(posted().filter(message => message.type === 'SAVE_SUCCESS')).toHaveLength(0);
    });
  });
});
