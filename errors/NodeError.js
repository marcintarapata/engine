const FamousError = require('./FamousError');

/**
 * Base class for node-related errors
 */
class NodeError extends FamousError {
  constructor(message, options = {}) {
    super(message, { code: 'NODE_ERROR', ...options });
  }
}

/**
 * Error thrown for component-related issues
 */
class ComponentError extends NodeError {
  constructor(message, options = {}) {
    super(message, { code: 'NODE_COMPONENT_ERROR', ...options });
  }
}

/**
 * Error thrown for node hierarchy issues
 */
class HierarchyError extends NodeError {
  constructor(message, options = {}) {
    super(message, { code: 'NODE_HIERARCHY_ERROR', ...options });
  }
}

module.exports = {
  NodeError,
  ComponentError,
  HierarchyError,
};
