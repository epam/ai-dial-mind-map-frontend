import classNames from 'classnames';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';

import { DocsReference } from '@/types/graph';

import { LinkRenderer } from '../../chat/conversation/messages/markdown/elements/LinkRenderer';
import {
  MarkdownDeletedRenderer,
  MarkdownSubscriptRenderer,
} from '../../chat/conversation/messages/markdown/elements/MarkdownInlineRenderers';
import { ParagraphRenderer } from '../../chat/conversation/messages/markdown/elements/ParagraphRenderer';
import { MemoizedReactMarkdown } from '../../chat/conversation/messages/markdown/MemoizedReactMarkdown';

export const MarkdownContent = ({
  reference,
  isFullscreenReference,
}: {
  reference: DocsReference;
  isFullscreenReference?: boolean;
}) => {
  const { content } = reference;

  return (
    <div
      className={classNames(
        'scrollable-content scrollbar-hide px-2',
        isFullscreenReference ? 'flex max-h-full justify-center' : 'max-h-[280px]',
      )}
    >
      <MemoizedReactMarkdown
        className={classNames(
          'prose wrap-break-word whitespace-normal dark:prose-invert prose-a:text-accent-primary prose-a:no-underline prose-a:hover:underline',
          isFullscreenReference ? 'max-w-full text-base' : 'text-xs',
        )}
        remarkPlugins={[remarkGfm, remarkSupersub]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          a: LinkRenderer,
          del: MarkdownDeletedRenderer,
          sub: MarkdownSubscriptRenderer,
          p: props => <ParagraphRenderer {...props} className=" whitespace-normal" isShowResponseLoader={false} />,
        }}
      >
        {content}
      </MemoizedReactMarkdown>
    </div>
  );
};
