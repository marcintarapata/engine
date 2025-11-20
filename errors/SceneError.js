const FamousError = require('./FamousError');

/**
 * Base class for scene-related errors
 */
class SceneError extends FamousError {
  constructor(message, options = {}) {
    super(message, { code: 'SCENE_ERROR', ...options });
  }
}

/**
 * Error thrown when mounting a scene fails
 */
class MountError extends SceneError {
  constructor(message, options = {}) {
    super(message, { code: 'SCENE_MOUNT_ERROR', ...options });
  }
}

/**
 * Error thrown for invalid DOM selector
 */
class SelectorError extends SceneError {
  constructor(message, options = {}) {
    super(message, { code: 'SCENE_SELECTOR_ERROR', ...options });
  }
}

module.exports = {
  SceneError,
  MountError,
  SelectorError,
};
