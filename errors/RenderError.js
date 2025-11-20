const FamousError = require('./FamousError');

/**
 * Base class for rendering errors
 */
class RenderError extends FamousError {
  constructor(message, options = {}) {
    super(message, { code: 'RENDER_ERROR', ...options });
  }
}

/**
 * Error thrown during DOM rendering
 */
class DOMRenderError extends RenderError {
  constructor(message, options = {}) {
    super(message, { code: 'DOM_RENDER_ERROR', ...options });
  }
}

/**
 * Error thrown during WebGL rendering
 */
class WebGLRenderError extends RenderError {
  constructor(message, options = {}) {
    super(message, { code: 'WEBGL_RENDER_ERROR', ...options });
  }
}

/**
 * Error thrown when WebGL context is not available
 */
class WebGLContextError extends WebGLRenderError {
  constructor(message, options = {}) {
    super(message, { code: 'WEBGL_CONTEXT_ERROR', ...options });
  }
}

module.exports = {
  RenderError,
  DOMRenderError,
  WebGLRenderError,
  WebGLContextError,
};
