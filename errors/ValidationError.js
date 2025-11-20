const FamousError = require('./FamousError');

/**
 * Base class for validation errors
 */
class ValidationError extends FamousError {
  constructor(message, options = {}) {
    super(message, { code: 'VALIDATION_ERROR', ...options });
  }
}

/**
 * Error thrown for invalid parameters
 */
class ParameterError extends ValidationError {
  constructor(parameterName, expectedType, actualValue, options = {}) {
    const message =
      `Invalid parameter '${parameterName}': expected ${expectedType}, ` +
      `got ${typeof actualValue}${actualValue !== null && actualValue !== undefined ? ` (${actualValue})` : ''}`;

    super(message, {
      code: 'VALIDATION_PARAMETER_ERROR',
      context: { parameterName, expectedType, actualValue },
      ...options,
    });
  }
}

/**
 * Error thrown for invalid state
 */
class StateError extends ValidationError {
  constructor(message, options = {}) {
    super(message, { code: 'VALIDATION_STATE_ERROR', ...options });
  }
}

/**
 * Error thrown for required parameters
 */
class RequiredParameterError extends ParameterError {
  constructor(parameterName, options = {}) {
    super(parameterName, 'required', undefined, {
      code: 'VALIDATION_REQUIRED_ERROR',
      suggestion: `Provide a value for parameter '${parameterName}'`,
      ...options,
    });
  }
}

module.exports = {
  ValidationError,
  ParameterError,
  StateError,
  RequiredParameterError,
};
