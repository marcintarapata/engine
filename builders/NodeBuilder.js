/**
 * Builder for creating and configuring Node instances
 * Provides a fluent API for node construction
 */

const { ConfigurationError, ParameterError } = require('../errors');

/**
 * NodeBuilder provides a fluent API for creating and configuring nodes
 *
 * @example
 * const node = createNode(parent)
 *   .withPosition(100, 200, 0)
 *   .withRotation(0, Math.PI / 4, 0)
 *   .withScale(1.5, 1.5, 1)
 *   .withComponent(domElement)
 *   .build();
 */
class NodeBuilder {
  constructor(NodeClass, parent = null) {
    this._NodeClass = NodeClass;
    this._parent = parent;
    this._position = null;
    this._rotation = null;
    this._scale = null;
    this._align = null;
    this._mountPoint = null;
    this._origin = null;
    this._opacity = null;
    this._components = [];
    this._built = false;
  }

  /**
   * Sets the position of the node
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @returns {NodeBuilder} This builder for chaining
   */
  withPosition(x, y, z) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._position = [x, y, z];
    return this;
  }

  /**
   * Sets the rotation of the node
   * @param {number} x - X rotation (Euler angle)
   * @param {number} y - Y rotation (Euler angle)
   * @param {number} z - Z rotation (Euler angle)
   * @returns {NodeBuilder} This builder for chaining
   */
  withRotation(x, y, z) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._rotation = [x, y, z];
    return this;
  }

  /**
   * Sets the scale of the node
   * @param {number} x - X scale
   * @param {number} y - Y scale
   * @param {number} z - Z scale
   * @returns {NodeBuilder} This builder for chaining
   */
  withScale(x, y, z) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._scale = [x, y, z];
    return this;
  }

  /**
   * Sets the alignment of the node
   * @param {number} x - X alignment (0-1)
   * @param {number} y - Y alignment (0-1)
   * @param {number} z - Z alignment (0-1)
   * @returns {NodeBuilder} This builder for chaining
   */
  withAlign(x, y, z) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._align = [x, y, z];
    return this;
  }

  /**
   * Sets the mount point of the node
   * @param {number} x - X mount point (0-1)
   * @param {number} y - Y mount point (0-1)
   * @param {number} z - Z mount point (0-1)
   * @returns {NodeBuilder} This builder for chaining
   */
  withMountPoint(x, y, z) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._mountPoint = [x, y, z];
    return this;
  }

  /**
   * Sets the origin of the node
   * @param {number} x - X origin (0-1)
   * @param {number} y - Y origin (0-1)
   * @param {number} z - Z origin (0-1)
   * @returns {NodeBuilder} This builder for chaining
   */
  withOrigin(x, y, z) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    this._origin = [x, y, z];
    return this;
  }

  /**
   * Sets the opacity of the node
   * @param {number} opacity - Opacity value (0-1)
   * @returns {NodeBuilder} This builder for chaining
   */
  withOpacity(opacity) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
      throw new ParameterError('opacity', 'number between 0 and 1', opacity);
    }
    this._opacity = opacity;
    return this;
  }

  /**
   * Adds a component to the node
   * @param {*} component - Component instance
   * @returns {NodeBuilder} This builder for chaining
   */
  withComponent(component) {
    if (this._built) {
      throw new ConfigurationError('Cannot modify builder after build() has been called');
    }
    if (!component) {
      throw new ParameterError('component', 'valid component', component);
    }
    this._components.push(component);
    return this;
  }

  /**
   * Builds and returns the configured Node instance
   * @returns {Node} The configured node
   */
  build() {
    if (this._built) {
      throw new ConfigurationError('Node has already been built');
    }

    // Create node
    const node = this._parent ? this._parent.addChild() : new this._NodeClass();

    // Get the transform component (usually ID 0)
    const transform = node.getComponent && node.getComponent(0);

    // Apply transformations
    if (transform) {
      if (this._position) {
        transform.setPosition(...this._position);
      }
      if (this._rotation) {
        transform.setRotation(...this._rotation);
      }
      if (this._scale) {
        transform.setScale(...this._scale);
      }
    }

    // Apply layout properties
    if (this._align) {
      const Align = require('../components/Align');
      new Align(node).setValue(...this._align);
    }
    if (this._mountPoint) {
      const MountPoint = require('../components/MountPoint');
      new MountPoint(node).setValue(...this._mountPoint);
    }
    if (this._origin) {
      const Origin = require('../components/Origin');
      new Origin(node).setValue(...this._origin);
    }

    // Apply opacity
    if (this._opacity !== null) {
      const Opacity = require('../components/Opacity');
      new Opacity(node).setValue(this._opacity);
    }

    // Add components
    this._components.forEach((component) => {
      node.addComponent(component);
    });

    this._built = true;
    return node;
  }

  /**
   * Resets the builder to allow building a new node
   * @returns {NodeBuilder} This builder for chaining
   */
  reset() {
    this._position = null;
    this._rotation = null;
    this._scale = null;
    this._align = null;
    this._mountPoint = null;
    this._origin = null;
    this._opacity = null;
    this._components = [];
    this._built = false;
    return this;
  }
}

/**
 * Creates a new NodeBuilder instance
 * @param {Function} NodeClass - The Node class constructor
 * @param {Node} parent - Optional parent node
 * @returns {NodeBuilder} A new builder instance
 */
function createNodeBuilder(NodeClass, parent = null) {
  return new NodeBuilder(NodeClass, parent);
}

module.exports = {
  NodeBuilder,
  createNodeBuilder,
};
