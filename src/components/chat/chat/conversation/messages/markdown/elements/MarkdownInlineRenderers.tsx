import classNames from 'classnames';
import { HTMLAttributes } from 'react';

type MarkdownInlineRendererProps = HTMLAttributes<HTMLSpanElement> & {
  node?: unknown;
};

export const MarkdownSubscriptRenderer = ({ children, className, node, ...props }: MarkdownInlineRendererProps) => {
  void node;

  return (
    <span {...props} className={classNames('markdown-subscript', className)}>
      {children}
    </span>
  );
};

export const MarkdownDeletedRenderer = ({ children, className, node, ...props }: MarkdownInlineRendererProps) => {
  void node;

  return (
    <span {...props} className={classNames('markdown-deleted', className)}>
      {children}
    </span>
  );
};
