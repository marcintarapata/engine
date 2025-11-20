const FamousError = require('./FamousError');

/**
 * Base class for physics-related errors
 */
class PhysicsError extends FamousError {
  constructor(message, options = {}) {
    super(message, { code: 'PHYSICS_ERROR', ...options });
  }
}

/**
 * Error thrown for constraint violations
 */
class ConstraintError extends PhysicsError {
  constructor(message, options = {}) {
    super(message, { code: 'PHYSICS_CONSTRAINT_ERROR', ...options });
  }
}

/**
 * Error thrown during collision detection
 */
class CollisionError extends PhysicsError {
  constructor(message, options = {}) {
    super(message, { code: 'PHYSICS_COLLISION_ERROR', ...options });
  }
}

/**
 * Error thrown for invalid geometry
 */
class GeometryError extends PhysicsError {
  constructor(message, options = {}) {
    super(message, { code: 'PHYSICS_GEOMETRY_ERROR', ...options });
  }
}

module.exports = {
  PhysicsError,
  ConstraintError,
  CollisionError,
  GeometryError,
};
