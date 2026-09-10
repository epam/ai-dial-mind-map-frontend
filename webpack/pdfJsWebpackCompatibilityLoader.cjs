const WEBPACK_EXPORTS_IDENTIFIER = /\b__webpack_exports__\b/g;
const PDFJS_EXPORTS_IDENTIFIER = '__pdfjs_webpack_exports__';

/**
 * Avoid a name collision between the Webpack runtime embedded in pdfjs-dist
 * and the eval-based runtime bundled with Next.js development builds.
 *
 * Webpack fixed this upstream in 5.103.0, but Next.js 15 currently bundles
 * Webpack 5.98.0. This loader can be removed once Next includes that fix.
 */
module.exports = function pdfJsWebpackCompatibilityLoader(source) {
  return source.replace(WEBPACK_EXPORTS_IDENTIFIER, PDFJS_EXPORTS_IDENTIFIER);
};
