import { DocsReference } from '@/types/graph';
import { SourceType } from '@/types/sources';

import { getReferenceUrl, parseReference } from '../parseReference';

describe('parseReference function', () => {
  test('returns null for undefined input', () => {
    expect(parseReference(undefined)).toBeNull();
  });

  test('returns null for input without matching pattern', () => {
    expect(parseReference('no match')).toBeNull();
  });

  test('extracts chunkId and docId from valid chunked input', () => {
    expect(parseReference('[123.456]')).toEqual({ docId: '123', chunkId: '456', version: 1 });
  });

  test('extracts nodeId from valid non-chunked input', () => {
    expect(parseReference('[789]')).toEqual({ nodeId: '789' });
  });

  test('returns null for input with incorrect format', () => {
    expect(parseReference('[abc.def]')).toBeNull();
    expect(parseReference('[123.abc]')).toBeNull();
    expect(parseReference('[abc.123]')).toBeNull();
    expect(parseReference('[123,456]')).toBeNull();
  });

  test('returns null for input with missing brackets', () => {
    expect(parseReference('123.456')).toBeNull();
    expect(parseReference('123')).toBeNull();
  });
});

describe('getReferenceUrl', () => {
  const reference = {
    doc_url: 'https://example.com/source',
    public_url: 'https://example.com/file.pdf',
  } as DocsReference;

  test('returns public URL for file references', () => {
    expect(getReferenceUrl({ ...reference, doc_type: SourceType.FILE })).toBe(reference.public_url);
  });

  test('returns document URL for link references', () => {
    expect(getReferenceUrl({ ...reference, doc_type: SourceType.LINK })).toBe(reference.doc_url);
  });

  test('returns undefined for file references without public URL', () => {
    expect(getReferenceUrl({ ...reference, doc_type: SourceType.FILE, public_url: undefined })).toBeUndefined();
  });

  test('does not use public URL for other reference types', () => {
    expect(getReferenceUrl({ ...reference, doc_type: 'text' })).toBeUndefined();
  });
});
