import { render, screen } from '@testing-library/react';

import { MarkdownDeletedRenderer, MarkdownSubscriptRenderer } from '../MarkdownInlineRenderers';

describe('MarkdownInlineRenderers', () => {
  test('adds a public custom style hook to subscript text', () => {
    render(
      <MarkdownSubscriptRenderer className="font-bold" node={{}}>
        12
      </MarkdownSubscriptRenderer>,
    );

    const text = screen.getByText('12');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('markdown-subscript');
    expect(text).toHaveClass('font-bold');
    expect(text).not.toHaveAttribute('node');
  });

  test('adds a public custom style hook to deleted text', () => {
    render(
      <MarkdownDeletedRenderer className="font-bold" node={{}}>
        11
      </MarkdownDeletedRenderer>,
    );

    const text = screen.getByText('11');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('markdown-deleted');
    expect(text).toHaveClass('font-bold');
    expect(text).not.toHaveAttribute('node');
  });
});
