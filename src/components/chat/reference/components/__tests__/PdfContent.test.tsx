import { render } from '@testing-library/react';

import { useChatSelector } from '@/store/chat/hooks';
import { DocsReference } from '@/types/graph';

import { PdfContent } from '../PdfContent';

const mockDocumentPreview = jest.fn((props: unknown) => {
  void props;
  return <div data-testid="document-preview" />;
});

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => (props: unknown) => mockDocumentPreview(props),
}));

jest.mock('@/store/chat/hooks', () => ({
  useChatSelector: jest.fn(),
}));

describe('PdfContent', () => {
  const reference: DocsReference = {
    content: '',
    doc_name: 'document.pdf',
    doc_url: '',
    doc_id: 'document-id',
    chunk_id: '3',
    doc_type: 'file',
    doc_content_type: 'application/pdf',
    content_type: 'text/plain',
    version: 2,
    source_name: 'document.pdf',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (useChatSelector as jest.Mock).mockReturnValue('test app');
  });

  test('renders the referenced page with the authenticated document URL', () => {
    render(<PdfContent reference={reference} initialPage={2} />);

    expect(mockDocumentPreview).toHaveBeenCalledWith(
      expect.objectContaining({
        fileUrl: '/api/mindmaps/test%20app/documents/document-id/versions/2/file',
        highlights: [],
        selectedPageNumber: 3,
        showOccurrences: false,
        containerClassName: 'gap-2 px-4 py-3',
        pdfViewerClassName: 'rounded-md border border-secondary',
      }),
    );
  });

  test('loads the PDF with credentials and rejects unsuccessful responses', async () => {
    render(<PdfContent reference={reference} />);
    const { loadFileCb } = mockDocumentPreview.mock.calls[0][0] as {
      loadFileCb: (url: string) => Promise<Blob>;
    };
    const blob = new Blob(['pdf']);
    const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob } as Response);
    global.fetch = fetchMock;

    await expect(loadFileCb('/document.pdf')).resolves.toBe(blob);
    expect(fetchMock).toHaveBeenCalledWith('/document.pdf', { credentials: 'include' });

    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 } as Response);
    await expect(loadFileCb('/missing.pdf')).rejects.toThrow('Failed to load PDF: 404');
  });
});
