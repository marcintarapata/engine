/**
 * Builder for creating and configuring Scene instances
 * Provides a fluent API for scene initialization
 */

const { SelectorError, ConfigurationError } = require('../errors');

/**
 * SceneBuilder provides a fluent API for configuring and creating scenes
 *
 * @example
 * const scene = createScene('#app')
 *   .withCamera(camera)
 *   .withPhysics({ gravity: [0, -9.8, 0] })
 *   .build();
 */
class SceneBuilder {
  constructor(selector, engine) {
    if (!selector) {
      throw new SelectorError('Scene selector is required', {
        suggestion: 'Provide a valid DOM selector like "#app" or "body"',
      });
    }

    if (!engine) {
      throw new ConfigurationError('Engine instance is required', {
        suggestion: 'Pass a FamousEngine instance to createScene()',
      });
    }

    this._selector = selector;
    this._engine = engine;
    this._camera = null;
    this._physics = null;
    this._built = false;
  }

  /**
   * Sets a camera for the scene
   * @param {Camera} camera - Camera instance
   * @returns {SceneBuilder} This builder for chaining
   */
  withCamera(camera) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._camera = camera;
    return this;
  }

  /**
   * Configures physics for the scene
   * @param {Object|PhysicsEngine} physics - Physics config or engine instance
   * @returns {SceneBuilder} This builder for chaining
   */
  withPhysics(physics) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._physics = physics;
    return this;
  }

  /**
   * Builds and returns the configured Scene instance
   * @returns {Scene} The configured scene
   */
  build() {
    if (this._built) {
      throw new ConfigurationError('Scene has already been built');
    }

    // Create scene using engine
    const scene = this._engine.createScene(this._selector);

    // Add camera if configured
    if (this._camera) {
      scene.addChild().addComponent(this._camera);
    }

    // Configure physics if provided
    if (this._physics) {
      // Physics integration would be added here
      // This is a placeholder for future physics integration
      scene._physics = this._physics;
    }

    this._built = true;
    return scene;
  }

  /**
   * Resets the builder to allow building a new scene
   * @returns {SceneBuilder} This builder for chaining
   */
  reset() {
    this._camera = null;
    this._physics = null;
    this._built = false;
    return this;
  }
}

/**
 * Creates a new SceneBuilder instance
 * @param {string} selector - DOM selector for the scene
 * @param {FamousEngine} engine - Engine instance
 * @returns {SceneBuilder} A new builder instance
 */
function createSceneBuilder(selector, engine) {
  return new SceneBuilder(selector, engine);
}

module.exports = {
  SceneBuilder,
  createSceneBuilder,
};
