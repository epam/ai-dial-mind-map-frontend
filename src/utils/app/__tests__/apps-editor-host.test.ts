import {
  getAppsEditorApplicationName,
  isHostOriginAllowed,
  normalizeHostOrigins,
  postToHost,
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

  describe('isHostOriginAllowed', () => {
    it('allows any origin when none are configured or a wildcard is present', () => {
      expect(isHostOriginAllowed('https://evil.com', [])).toBe(true);
      expect(isHostOriginAllowed('https://evil.com', ['*'])).toBe(true);
    });

    it('allows only configured origins otherwise', () => {
      expect(isHostOriginAllowed('https://chat.example.com', ['https://chat.example.com'])).toBe(true);
      expect(isHostOriginAllowed('https://evil.com', ['https://chat.example.com'])).toBe(false);
    });
  });

  describe('postToHost', () => {
    const parent = { postMessage: jest.fn() };
    let parentSpy: jest.SpyInstance;

    beforeEach(() => {
      parent.postMessage.mockReset();
      parentSpy = jest.spyOn(window, 'parent', 'get').mockReturnValue(parent as unknown as Window);
    });

    afterEach(() => parentSpy.mockRestore());

    it('posts with a wildcard target when no origins are configured', () => {
      postToHost({ type: 'a' }, []);

      expect(parent.postMessage).toHaveBeenCalledWith({ type: 'a' }, '*');
    });

    it('posts once per configured origin and survives an invalid one', () => {
      parent.postMessage.mockImplementationOnce(() => {
        throw new Error('invalid');
      });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      postToHost({ type: 'a' }, ['bad', 'https://chat.example.com']);

      expect(parent.postMessage).toHaveBeenCalledTimes(2);
      expect(parent.postMessage).toHaveBeenLastCalledWith({ type: 'a' }, 'https://chat.example.com');
      errorSpy.mockRestore();
    });

    it('does nothing when not embedded in an iframe', () => {
      parentSpy.mockReturnValue(window);

      postToHost({ type: 'a' }, []);

      expect(parent.postMessage).not.toHaveBeenCalled();
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
