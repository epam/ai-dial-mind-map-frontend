'use client';

import dynamic from 'next/dynamic';

import { ApplicationSelectors } from '@/store/chat/application/application.reducer';
import { useChatSelector } from '@/store/chat/hooks';
import { DocsReference } from '@/types/graph';

import { getReferenceUrl } from './utils/parseReference';

const DocumentPreview = dynamic(
  () => import('@epam/ai-dial-react-pdf-highlighter').then(module => module.DocumentPreview),
  { ssr: false },
);

interface PdfContentProps {
  reference: DocsReference;
  initialPage?: number;
}

const loadPdf = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Failed to load PDF: ${response.status}`);
  }

  return response.blob();
};

export const PdfContent: React.FC<PdfContentProps> = ({ reference, initialPage = 0 }) => {
  const name = useChatSelector(ApplicationSelectors.selectAppName) ?? '';
  const pdfUrl =
    getReferenceUrl(reference) ??
    `/api/mindmaps/${encodeURIComponent(name)}/documents/${reference.doc_id}/versions/${reference.version}/file`;

  return (
    <div className="relative size-full min-h-0 overflow-hidden">
      <DocumentPreview
        fileUrl={pdfUrl}
        loadFileCb={loadPdf}
        highlights={[]}
        selectedPageNumber={initialPage + 1}
        showOccurrences={false}
        containerClassName="gap-2 bg-layer-1 px-4 py-3 [&_[aria-haspopup='listbox']]:w-20"
        pdfViewerClassName="rounded-md border border-secondary"
        onViewerReady={() => window.dispatchEvent(new Event('resize'))}
      />
    </div>
  );
};
