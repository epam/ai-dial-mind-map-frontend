import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';

import { MarkdownDeletedRenderer, MarkdownSubscriptRenderer } from '../elements/MarkdownInlineRenderers';
import MarkdownRenderer from '../MarkdownRenderer';

jest.mock('react-markdown', () => jest.fn(({ children }) => <div data-testid="mock-markdown">{children}</div>));
jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-supersub', () => jest.fn());
jest.mock('rehype-raw', () => jest.fn());
jest.mock('rehype-sanitize', () => jest.fn());
jest.mock('../elements/ImageRenderer', () => ({
  ImageRenderer: () => null,
}));
jest.mock('../elements/LinkRenderer', () => ({
  LinkRenderer: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
}));
jest.mock('../elements/ParagraphRenderer', () => ({
  ParagraphRenderer: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}));
jest.mock('../elements/ReferenceRenderer', () => ({
  ReferenceRenderer: ({ children }: { children?: ReactNode }) => <sup>{children}</sup>,
}));

describe('MarkdownRenderer', () => {
  test('configures raw HTML sanitization for message text', () => {
    render(
      <MarkdownRenderer text={'<iframe srcdoc="<script>alert(1)</script>"></iframe>'} isShowResponseLoader={false} />,
    );

    expect(ReactMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({
        remarkPlugins: [remarkGfm, remarkSupersub],
        rehypePlugins: [rehypeRaw, rehypeSanitize],
      }),
      undefined,
    );
    expect(screen.getByTestId('mock-markdown')).toHaveTextContent(
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    );
  });

  test('configures tilde-based formatting tags with custom style hooks', () => {
    render(<MarkdownRenderer text="Some ~12~ ~~11~~" isShowResponseLoader={false} />);

    expect(ReactMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({
        components: expect.objectContaining({
          del: MarkdownDeletedRenderer,
          sub: MarkdownSubscriptRenderer,
        }),
      }),
      undefined,
    );
  });
});
