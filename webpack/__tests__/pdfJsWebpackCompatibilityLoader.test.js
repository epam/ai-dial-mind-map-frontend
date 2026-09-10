// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfJsWebpackCompatibilityLoader = require('../pdfJsWebpackCompatibilityLoader.cjs');

describe('pdfJsWebpackCompatibilityLoader', () => {
  it('renames the PDF.js Webpack exports identifier', () => {
    const source = 'var __webpack_exports__ = {};';

    expect(pdfJsWebpackCompatibilityLoader(source)).toBe('var __pdfjs_webpack_exports__ = {};');
  });

  it('leaves unrelated source unchanged', () => {
    const source = 'export const version = "5.4.149";';

    expect(pdfJsWebpackCompatibilityLoader(source)).toBe(source);
  });
});
