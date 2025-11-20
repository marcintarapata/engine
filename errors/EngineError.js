const FamousError = require('./FamousError');

/**
 * Base class for engine-related errors
 */
class EngineError extends FamousError {
  constructor(message, options = {}) {
    super(message, { code: 'ENGINE_ERROR', ...options });
  }
}

/**
 * Error thrown during engine initialization
 */
class InitializationError extends EngineError {
  constructor(message, options = {}) {
    super(message, { code: 'ENGINE_INIT_ERROR', ...options });
  }
}

/**
 * Error thrown for invalid engine configuration
 */
class ConfigurationError extends EngineError {
  constructor(message, options = {}) {
    super(message, { code: 'ENGINE_CONFIG_ERROR', ...options });
  }
}

module.exports = {
  EngineError,
  InitializationError,
  ConfigurationError,
};
