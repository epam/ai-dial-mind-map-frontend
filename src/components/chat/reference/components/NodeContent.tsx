import classNames from 'classnames';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';

import { NodeReference } from '@/types/graph';

import { LinkRenderer } from '../../chat/conversation/messages/markdown/elements/LinkRenderer';
import {
  MarkdownDeletedRenderer,
  MarkdownSubscriptRenderer,
} from '../../chat/conversation/messages/markdown/elements/MarkdownInlineRenderers';
import { MemoizedReactMarkdown } from '../../chat/conversation/messages/markdown/MemoizedReactMarkdown';

export const NodeContent = ({
  reference,
  isFullscreenReference,
}: {
  reference: NodeReference;
  isFullscreenReference?: boolean;
}) => {
  const { details } = reference;
  return (
    <div
      className={classNames(
        'flex size-full overflow-x-hidden overflow-y-auto',
        isFullscreenReference ? 'justify-center' : '',
      )}
    >
      <MemoizedReactMarkdown
        className={classNames(
          'prose whitespace-normal dark:prose-invert prose-a:text-accent-primary prose-a:no-underline prose-a:hover:underline',
          isFullscreenReference ? 'text-base' : 'text-xs',
        )}
        remarkPlugins={[remarkGfm, remarkSupersub]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          a: LinkRenderer,
          del: MarkdownDeletedRenderer,
          sub: MarkdownSubscriptRenderer,
        }}
      >
        {details}
      </MemoizedReactMarkdown>
    </div>
  );
};
