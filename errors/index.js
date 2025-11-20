/**
 * Famous Engine Error Handling System
 *
 * Provides a comprehensive error class hierarchy with:
 * - Error codes for programmatic handling
 * - Suggestions for fixing common errors
 * - Context information for debugging
 * - Proper stack traces
 *
 * @module errors
 */

// Base error
const FamousError = require('./FamousError');

// Engine errors
const { EngineError, InitializationError, ConfigurationError } = require('./EngineError');

// Scene errors
const { SceneError, MountError, SelectorError } = require('./SceneError');

// Node errors
const { NodeError, ComponentError, HierarchyError } = require('./NodeError');

// Render errors
const {
  RenderError,
  DOMRenderError,
  WebGLRenderError,
  WebGLContextError,
} = require('./RenderError');

// Physics errors
const { PhysicsError, ConstraintError, CollisionError, GeometryError } = require('./PhysicsError');

// Validation errors
const {
  ValidationError,
  ParameterError,
  StateError,
  RequiredParameterError,
} = require('./ValidationError');

/**
 * Error utility functions
 */

/**
 * Validates that a parameter is not null or undefined
 * @param {*} value - Value to check
 * @param {string} name - Parameter name
 * @throws {RequiredParameterError} If value is null or undefined
 */
function requireParameter(value, name) {
  if (value === null || value === undefined) {
    throw new RequiredParameterError(name);
  }
  return value;
}

/**
 * Validates that a parameter is of the expected type
 * @param {*} value - Value to check
 * @param {string} name - Parameter name
 * @param {string} expectedType - Expected type
 * @throws {ParameterError} If type doesn't match
 */
function requireType(value, name, expectedType) {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    throw new ParameterError(name, expectedType, value);
  }
  return value;
}

/**
 * Validates that a parameter is an instance of the expected class
 * @param {*} value - Value to check
 * @param {string} name - Parameter name
 * @param {Function} expectedClass - Expected class constructor
 * @throws {ParameterError} If not an instance
 */
function requireInstance(value, name, expectedClass) {
  if (!(value instanceof expectedClass)) {
    throw new ParameterError(name, expectedClass.name, value);
  }
  return value;
}

/**
 * Creates a validation error with suggestions
 * @param {string} message - Error message
 * @param {string} suggestion - Suggestion for fixing
 * @returns {ValidationError} Validation error
 */
function validationError(message, suggestion) {
  return new ValidationError(message, { suggestion });
}

module.exports = {
  // Base error
  FamousError,

  // Engine errors
  EngineError,
  InitializationError,
  ConfigurationError,

  // Scene errors
  SceneError,
  MountError,
  SelectorError,

  // Node errors
  NodeError,
  ComponentError,
  HierarchyError,

  // Render errors
  RenderError,
  DOMRenderError,
  WebGLRenderError,
  WebGLContextError,

  // Physics errors
  PhysicsError,
  ConstraintError,
  CollisionError,
  GeometryError,

  // Validation errors
  ValidationError,
  ParameterError,
  StateError,
  RequiredParameterError,

  // Utility functions
  requireParameter,
  requireType,
  requireInstance,
  validationError,
};
