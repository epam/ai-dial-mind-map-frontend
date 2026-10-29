import {
  connectAppsEditorHosts,
  getAppsEditorApplicationName,
  normalizeHostOrigins,
  sendToAppsEditorHosts,
} from '../apps-editor-host';

describe('apps-editor-host', () => {
  describe('normalizeHostOrigins', () => {
    it('reduces URLs to origins and drops empty values', () => {
      expect(normalizeHostOrigins(['https://chat.example.com/path/', undefined, ' ', 'http://localhost:3000'])).toEqual(
        ['https://chat.example.com', 'http://localhost:3000'],
      );
    });

    it('strips trailing slashes from values that are not URLs', () => {
      expect(normalizeHostOrigins(['chat.example.com//'])).toEqual(['chat.example.com']);
    });
  });

  describe('connectAppsEditorHosts', () => {
    const HOST = 'https://chat.example.com';
    const parent = { postMessage: jest.fn() };
    let parentSpy: jest.SpyInstance;

    beforeEach(() => {
      parent.postMessage.mockReset();
      parentSpy = jest.spyOn(window, 'parent', 'get').mockReturnValue(parent as unknown as Window);
    });

    afterEach(() => parentSpy.mockRestore());

    const sendFromHost = (data: unknown, origin: string) =>
      window.dispatchEvent(new MessageEvent('message', { data, origin, source: parent as unknown as Window }));

    it('posts once per configured origin through every connected client', () => {
      const disconnect = connectAppsEditorHosts([HOST, 'http://localhost:3000'], 'Mind map', jest.fn());

      sendToAppsEditorHosts(client => client.sendReadyToSave());

      expect(parent.postMessage.mock.calls).toEqual([
        [{ type: 'Mind map/readyToSave' }, HOST],
        [{ type: 'Mind map/readyToSave' }, 'http://localhost:3000'],
      ]);
      disconnect();
    });

    it('skips wildcard and invalid origins', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const disconnect = connectAppsEditorHosts(['*', 'bad', HOST], 'Mind map', jest.fn());

      sendToAppsEditorHosts(client => client.sendLoggedOut());

      expect(parent.postMessage.mock.calls).toEqual([[{ type: 'Mind map/loggedOut' }, HOST]]);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      disconnect();
      errorSpy.mockRestore();
    });

    it('passes validated host messages with the receiving client', () => {
      const onMessage = jest.fn();
      const disconnect = connectAppsEditorHosts([HOST], 'Mind map', onMessage);

      sendFromHost({ type: 'TRIGGER_SAVE', general: { name: 'x' } }, HOST);
      sendFromHost({ type: 'TRIGGER_SAVE' }, 'https://evil.com');
      sendFromHost({ type: 'UNKNOWN' }, HOST);

      expect(onMessage).toHaveBeenCalledTimes(1);
      expect(onMessage).toHaveBeenCalledWith({ type: 'TRIGGER_SAVE', general: { name: 'x' } }, expect.anything());
      disconnect();
    });

    it('stops sending and receiving after disconnect', () => {
      const onMessage = jest.fn();
      connectAppsEditorHosts([HOST], 'Mind map', onMessage)();

      sendToAppsEditorHosts(client => client.sendReadyToSave());
      sendFromHost({ type: 'TRIGGER_SAVE' }, HOST);

      expect(parent.postMessage).not.toHaveBeenCalled();
      expect(onMessage).not.toHaveBeenCalled();
    });

    it('opens no client when not embedded in an iframe', () => {
      parentSpy.mockReturnValue(window);
      const disconnect = connectAppsEditorHosts([HOST], 'Mind map', jest.fn());

      sendToAppsEditorHosts(client => client.sendReadyToSave());

      expect(parent.postMessage).not.toHaveBeenCalled();
      disconnect();
    });
  });

  describe('getAppsEditorApplicationName', () => {
    afterEach(() => window.history.replaceState({}, '', '/'));

    it('prefers the host-provided applicationName', () => {
      window.history.replaceState({}, '', '/?applicationName=Mind%20map');

      expect(getAppsEditorApplicationName('fallback')).toBe('Mind map');
    });

    it('falls back to the configured title', () => {
      expect(getAppsEditorApplicationName('fallback')).toBe('fallback');
    });
  });
});
