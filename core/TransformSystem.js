/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const PathUtils = require('./Path');
const Transform = require('./Transform');
const Dispatch = require('./Dispatch');
const PathStore = require('./PathStore');

/**
 * Private method to call when align changes. Triggers 'onAlignChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to call onAlignChange if necessary
 * @param {Array} components - The components on which to call onAlignChange if necessary
 * @param {Object} offsets - The set of offsets from the transform
 * @returns {void}
 */
function alignChanged(node, components, offsets) {
  const x = offsets.align[0];
  const y = offsets.align[1];
  const z = offsets.align[2];
  if (node.onAlignChange) node.onAlignChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onAlignChange) components[i].onAlignChange(x, y, z);
  offsets.alignChanged = false;
}

/**
 * Private method to call when MountPoint changes. Triggers 'onMountPointChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Object} offsets - The set of offsets from the transform
 * @returns {void}
 */
function mountPointChanged(node, components, offsets) {
  const x = offsets.mountPoint[0];
  const y = offsets.mountPoint[1];
  const z = offsets.mountPoint[2];
  if (node.onMountPointChange) node.onMountPointChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onMountPointChange)
      components[i].onMountPointChange(x, y, z);
  offsets.mountPointChanged = false;
}

/**
 * Private method to call when Origin changes. Triggers 'onOriginChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Object} offsets - The set of offsets from the transform
 * @returns {void}
 */
function originChanged(node, components, offsets) {
  const x = offsets.origin[0];
  const y = offsets.origin[1];
  const z = offsets.origin[2];
  if (node.onOriginChange) node.onOriginChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onOriginChange) components[i].onOriginChange(x, y, z);
  offsets.originChanged = false;
}

/**
 * Private method to call when Position changes. Triggers 'onPositionChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Object} vectors - The set of vectors from the transform
 * @returns {void}
 */
function positionChanged(node, components, vectors) {
  const x = vectors.position[0];
  const y = vectors.position[1];
  const z = vectors.position[2];
  if (node.onPositionChange) node.onPositionChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onPositionChange) components[i].onPositionChange(x, y, z);
  vectors.positionChanged = false;
}

/**
 * Private method to call when Rotation changes. Triggers 'onRotationChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Object} vectors - The set of vectors from the transform
 * @returns {void}
 */
function rotationChanged(node, components, vectors) {
  const x = vectors.rotation[0];
  const y = vectors.rotation[1];
  const z = vectors.rotation[2];
  const w = vectors.rotation[3];
  if (node.onRotationChange) node.onRotationChange(x, y, z, w);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onRotationChange)
      components[i].onRotationChange(x, y, z, w);
  vectors.rotationChanged = false;
}

/**
 * Private method to call when Scale changes. Triggers 'onScaleChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Object} vectors - The set of vectors from the transform
 * @returns {void}
 */
function scaleChanged(node, components, vectors) {
  const x = vectors.scale[0];
  const y = vectors.scale[1];
  const z = vectors.scale[2];
  if (node.onScaleChange) node.onScaleChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onScaleChange) components[i].onScaleChange(x, y, z);
  vectors.scaleChanged = false;
}

/**
 * Private method to call when either the Local or World Transform changes.
 * Triggers 'onTransformChange' methods on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Transform} transform - The transform class that changed
 * @returns {void}
 */
function transformChanged(node, components, transform) {
  if (node.onTransformChange) node.onTransformChange(transform);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onTransformChange)
      components[i].onTransformChange(transform);
}

/**
 * Private method to call when the local transform changes. Triggers 'onLocalTransformChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Array} transform - The local transform
 * @returns {void}
 */
function localTransformChanged(node, components, transform) {
  if (node.onLocalTransformChange) node.onLocalTransformChange(transform);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onLocalTransformChange)
      components[i].onLocalTransformChange(transform);
}

/**
 * Private method to call when the world transform changes. Triggers 'onWorldTransformChange' methods
 * on the node and all of the node's components.
 *
 * @private
 * @param {*} node - The node on which to trigger a change event if necessary
 * @param {Array} components - The components on which to trigger a change event if necessary
 * @param {Array} transform - The world transform
 * @returns {void}
 */
function worldTransformChanged(node, components, transform) {
  if (node.onWorldTransformChange) node.onWorldTransformChange(transform);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onWorldTransformChange)
      components[i].onWorldTransformChange(transform);
}

/**
 * The TransformSystem class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent.
 */
class TransformSystem {
  constructor() {
    this.pathStore = new PathStore();
  }

  /**
   * Registers a new Transform for the given path. This transform will be updated
   * when the TransformSystem updates.
   *
   * @param {string} path - Path for the transform to be registered to
   * @param {Transform} [transform] - Optional transform to register
   * @returns {void}
   */
  registerTransformAtPath(path, transform) {
    if (!PathUtils.depth(path))
      return this.pathStore.insert(path, transform ? transform : new Transform());

    const parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent)
      throw new Error(
        'No parent transform registered at expected path: ' + PathUtils.parent(path)
      );

    if (transform) transform.setParent(parent);

    this.pathStore.insert(path, transform ? transform : new Transform(parent));
  }

  /**
   * Deregisters a transform registered at the given path.
   *
   * @param {string} path - Path at which to deregister the transform
   * @returns {void}
   */
  deregisterTransformAtPath(path) {
    this.pathStore.remove(path);
  }

  /**
   * Makes the transform currently stored at the given path a breakpoint.
   * A transform being a breakpoint means that both a local and world transform will be calculated
   * for that point. The local transform being the concatenated transform of all ancestor transforms up
   * until the nearest breakpoint, and the world being the concatenated transform of all ancestor transforms.
   * Throws if no transform is at the provided path.
   *
   * @param {string} path - The path at which to turn the transform into a breakpoint
   * @returns {void}
   */
  makeBreakPointAt(path) {
    const transform = this.pathStore.get(path);
    if (!transform) throw new Error('No transform Registered at path: ' + path);
    transform.setBreakPoint();
  }

  /**
   * Makes the transform at this location calculate a world matrix.
   *
   * @param {string} path - The path at which to make the transform calculate a world matrix
   * @returns {void}
   */
  makeCalculateWorldMatrixAt(path) {
    const transform = this.pathStore.get(path);
    if (!transform) throw new Error('No transform Registered at path: ' + path);
    transform.setCalculateWorldMatrix();
  }

  /**
   * Returns the instance of the transform class associated with the given path,
   * or undefined if no transform is associated.
   *
   * @param {string} path - The path to lookup
   * @returns {Transform|undefined} The transform at that path if available, else undefined
   */
  get(path) {
    return this.pathStore.get(path);
  }

  /**
   * Update is called when the transform system requires an update.
   * It traverses the transform array and evaluates the necessary transforms
   * in the scene graph with the information from the corresponding node
   * in the scene graph.
   *
   * @returns {void}
   */
  update() {
    const transforms = this.pathStore.getItems();
    const paths = this.pathStore.getPaths();
    let transform;
    let changed;
    let node;
    let vectors;
    let offsets;
    let components;

    for (let i = 0, len = transforms.length; i < len; i++) {
      node = Dispatch.getNode(paths[i]);
      if (!node) continue;
      components = node.getComponents();
      transform = transforms[i];
      vectors = transform.vectors;
      offsets = transform.offsets;
      if (offsets.alignChanged) alignChanged(node, components, offsets);
      if (offsets.mountPointChanged) mountPointChanged(node, components, offsets);
      if (offsets.originChanged) originChanged(node, components, offsets);
      if (vectors.positionChanged) positionChanged(node, components, vectors);
      if (vectors.rotationChanged) rotationChanged(node, components, vectors);
      if (vectors.scaleChanged) scaleChanged(node, components, vectors);
      if ((changed = transform.calculate(node))) {
        transformChanged(node, components, transform);
        if (changed & Transform.LOCAL_CHANGED)
          localTransformChanged(node, components, transform.getLocalTransform());
        if (changed & Transform.WORLD_CHANGED)
          worldTransformChanged(node, components, transform.getWorldTransform());
      }
    }
  }
}

module.exports = new TransformSystem();
