/**
 * Builder for creating and configuring a FamousEngine instance
 * Provides a fluent API for engine initialization
 */

const { InitializationError, ConfigurationError } = require('../errors');

/**
 * EngineBuilder provides a fluent API for configuring and initializing
 * the Famous Engine with custom options
 *
 * @example
 * const engine = createEngine()
 *   .withCompositor(customCompositor)
 *   .withRenderLoop(customLoop)
 *   .withClock(customClock)
 *   .build();
 */
class EngineBuilder {
  constructor(FamousEngineClass) {
    this._FamousEngineClass = FamousEngineClass;
    this._options = {};
    this._built = false;
  }

  /**
   * Sets a custom compositor for rendering
   * @param {Compositor} compositor - Custom compositor instance
   * @returns {EngineBuilder} This builder for chaining
   */
  withCompositor(compositor) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._options.compositor = compositor;
    return this;
  }

  /**
   * Sets a custom render loop
   * @param {RequestAnimationFrameLoop} renderLoop - Custom render loop instance
   * @returns {EngineBuilder} This builder for chaining
   */
  withRenderLoop(renderLoop) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._options.renderLoop = renderLoop;
    return this;
  }

  /**
   * Sets a custom clock
   * @param {Clock} clock - Custom clock instance
   * @returns {EngineBuilder} This builder for chaining
   */
  withClock(clock) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._options.clock = clock;
    return this;
  }

  /**
   * Sets a custom channel for communication
   * @param {Channel} channel - Custom channel instance
   * @returns {EngineBuilder} This builder for chaining
   */
  withChannel(channel) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._options.channel = channel;
    return this;
  }

  /**
   * Enables auto-start of the render loop
   * @param {boolean} autoStart - Whether to auto-start (default: false)
   * @returns {EngineBuilder} This builder for chaining
   */
  withAutoStart(autoStart = true) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._options.autoStart = autoStart;
    return this;
  }

  /**
   * Builds and returns the configured FamousEngine instance
   * @returns {FamousEngine} The configured engine instance
   * @throws {InitializationError} If engine cannot be initialized
   */
  build() {
    if (this._built) {
      throw new InitializationError('Engine has already been built');
    }

    try {
      // Create a new instance using the class reference
      const engine = new this._FamousEngineClass();

      // Set custom clock if provided
      if (this._options.clock) {
        engine._clock = this._options.clock;
      }

      // Set custom channel if provided
      if (this._options.channel) {
        engine.setChannel(this._options.channel);
      }

      // Initialize with options
      engine.init({
        compositor: this._options.compositor,
        renderLoop: this._options.renderLoop,
      });

      // Auto-start if configured
      if (this._options.autoStart) {
        engine.startRenderLoop();
      }

      this._built = true;
      return engine;
    } catch (error) {
      throw new InitializationError(`Failed to build engine: ${error.message}`, {
        context: { originalError: error },
        suggestion: 'Check that all provided options are valid instances',
      });
    }
  }

  /**
   * Resets the builder to allow building a new instance
   * @returns {EngineBuilder} This builder for chaining
   */
  reset() {
    this._options = {};
    this._built = false;
    return this;
  }
}

/**
 * Creates a new EngineBuilder instance
 * @param {Function} FamousEngineClass - The FamousEngine class constructor
 * @returns {EngineBuilder} A new builder instance
 */
function createEngineBuilder(FamousEngineClass) {
  return new EngineBuilder(FamousEngineClass);
}

module.exports = {
  EngineBuilder,
  createEngineBuilder,
};
