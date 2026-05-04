import {
  computeNextNavigationHistory,
  normalizeNavigationHistory,
  recordToLinearHistory,
} from '../navigationHistory';

describe('navigationHistory', () => {
  describe('normalizeNavigationHistory', () => {
    it('keeps a valid linear path ending at focus', () => {
      expect(normalizeNavigationHistory(['a', 'b', 'c'], 'c')).toEqual(['a', 'b', 'c']);
    });

    it('converts legacy parent map to a linear path (A→B→C→D→E)', () => {
      const legacy: Record<string, string> = {
        a: 'a',
        b: 'a',
        c: 'b',
        d: 'c',
        e: 'd',
      };
      expect(normalizeNavigationHistory(legacy, 'e')).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('returns [focus] for empty legacy map', () => {
      expect(normalizeNavigationHistory({}, 'root')).toEqual(['root']);
    });
  });

  describe('recordToLinearHistory', () => {
    it('reconstructs order from backward links', () => {
      const map: Record<string, string> = { x: 'x', y: 'x', z: 'y' };
      expect(recordToLinearHistory(map, 'z')).toEqual(['x', 'y', 'z']);
    });
  });

  describe('computeNextNavigationHistory', () => {
    it('pops one step when navigating to immediate predecessor (back)', () => {
      const hist = ['a', 'b', 'c', 'd', 'e'];
      expect(computeNextNavigationHistory(hist, 'e', 'd')).toEqual(['a', 'b', 'c', 'd']);
    });

    it('appends when navigating forward', () => {
      const hist = ['a', 'b', 'c', 'd'];
      expect(computeNextNavigationHistory(hist, 'd', 'e')).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('does not corrupt predecessor when revisiting after back (regression)', () => {
      let h = normalizeNavigationHistory({}, 'a');
      h = computeNextNavigationHistory(h, 'a', 'b');
      h = computeNextNavigationHistory(h, 'b', 'c');
      h = computeNextNavigationHistory(h, 'c', 'd');
      h = computeNextNavigationHistory(h, 'd', 'e');
      h = computeNextNavigationHistory(h, 'e', 'd');
      expect(h).toEqual(['a', 'b', 'c', 'd']);
      h = computeNextNavigationHistory(h, 'd', 'c');
      expect(h).toEqual(['a', 'b', 'c']);
    });
  });
});
