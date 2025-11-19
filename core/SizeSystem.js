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

const PathStore = require('./PathStore');
const Size = require('./Size');
const Dispatch = require('./Dispatch');
const PathUtils = require('./Path');

/**
 * Private method to alert the node and components that size mode changed.
 *
 * @private
 * @param {*} node - Node to potentially call sizeModeChanged on
 * @param {Array} components - A list of the node's components
 * @param {Size} size - The size class for the Node
 */
function sizeModeChanged(node, components, size) {
  const sizeMode = size.getSizeMode();
  const x = sizeMode[0];
  const y = sizeMode[1];
  const z = sizeMode[2];
  if (node.onSizeModeChange) node.onSizeModeChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onSizeModeChange)
      components[i].onSizeModeChange(x, y, z);
  size.sizeModeChanged = false;
}

/**
 * Private method to alert the node and components that absoluteSize changed.
 *
 * @private
 * @param {*} node - Node to potentially call onAbsoluteSizeChange on
 * @param {Array} components - A list of the node's components
 * @param {Size} size - The size class for the Node
 */
function absoluteSizeChanged(node, components, size) {
  const absoluteSize = size.getAbsolute();
  const x = absoluteSize[0];
  const y = absoluteSize[1];
  const z = absoluteSize[2];
  if (node.onAbsoluteSizeChange) node.onAbsoluteSizeChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onAbsoluteSizeChange)
      components[i].onAbsoluteSizeChange(x, y, z);
  size.absoluteSizeChanged = false;
}

/**
 * Private method to alert the node and components that the proportional size changed.
 *
 * @private
 * @param {*} node - Node to potentially call onProportionalSizeChange on
 * @param {Array} components - A list of the node's components
 * @param {Size} size - The size class for the Node
 */
function proportionalSizeChanged(node, components, size) {
  const proportionalSize = size.getProportional();
  const x = proportionalSize[0];
  const y = proportionalSize[1];
  const z = proportionalSize[2];
  if (node.onProportionalSizeChange) node.onProportionalSizeChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onProportionalSizeChange)
      components[i].onProportionalSizeChange(x, y, z);
  size.proportionalSizeChanged = false;
}

/**
 * Private method to alert the node and components that differential size changed.
 *
 * @private
 * @param {*} node - Node to potentially call onDifferentialSize on
 * @param {Array} components - A list of the node's components
 * @param {Size} size - The size class for the Node
 */
function differentialSizeChanged(node, components, size) {
  const differentialSize = size.getDifferential();
  const x = differentialSize[0];
  const y = differentialSize[1];
  const z = differentialSize[2];
  if (node.onDifferentialSizeChange) node.onDifferentialSizeChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onDifferentialSizeChange)
      components[i].onDifferentialSizeChange(x, y, z);
  size.differentialSizeChanged = false;
}

/**
 * Private method to alert the node and components that render size changed.
 *
 * @private
 * @param {*} node - Node to potentially call onRenderSizeChange on
 * @param {Array} components - A list of the node's components
 * @param {Size} size - The size class for the Node
 */
function renderSizeChanged(node, components, size) {
  const renderSize = size.getRenderSize();
  const x = renderSize[0];
  const y = renderSize[1];
  const z = renderSize[2];
  if (node.onRenderSizeChange) node.onRenderSizeChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onRenderSizeChange)
      components[i].onRenderSizeChange(x, y, z);
  size.renderSizeChanged = false;
}

/**
 * Private method to alert the node and components that the size changed.
 *
 * @private
 * @param {*} node - Node to potentially call onSizeChange on
 * @param {Array} components - A list of the node's components
 * @param {Size} size - The size class for the Node
 */
function sizeChanged(node, components, size) {
  const finalSize = size.get();
  const x = finalSize[0];
  const y = finalSize[1];
  const z = finalSize[2];
  if (node.onSizeChange) node.onSizeChange(x, y, z);
  for (let i = 0, len = components.length; i < len; i++)
    if (components[i] && components[i].onSizeChange)
      components[i].onSizeChange(x, y, z);
  size.sizeChanged = false;
}

/**
 * The size system is used to calculate size throughout the scene graph.
 * It holds size components and operates upon them.
 */
class SizeSystem {
  constructor() {
    this.pathStore = new PathStore();
  }

  /**
   * Registers a size component to a given path. A size component can be passed as the second argument
   * or a default one will be created. Throws if no size component has been added at the parent path.
   *
   * @param {string} path - The path at which to register the size component
   * @param {Size} [size] - The size component to be registered or undefined
   */
  registerSizeAtPath(path, size) {
    if (!PathUtils.depth(path))
      return this.pathStore.insert(path, size ? size : new Size());

    const parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent)
      throw new Error(
        'No parent size registered at expected path: ' + PathUtils.parent(path)
      );

    if (size) size.setParent(parent);

    this.pathStore.insert(path, size ? size : new Size(parent));
  }

  /**
   * Removes the size component from the given path. Will throw if no component is at that path.
   *
   * @param {string} path - The path at which to remove the size
   */
  deregisterSizeAtPath(path) {
    this.pathStore.remove(path);
  }

  /**
   * Returns the size component stored at a given path. Returns undefined if no
   * size component is registered to that path.
   *
   * @param {string} path - The path at which to get the size component
   * @returns {Size|undefined} The size component or undefined
   */
  get(path) {
    return this.pathStore.get(path);
  }

  /**
   * Updates the sizes in the scene graph. Called internally by the famous engine.
   */
  update() {
    const sizes = this.pathStore.getItems();
    const paths = this.pathStore.getPaths();
    let node;
    let size;
    let i;
    let len;
    let components;

    for (i = 0, len = sizes.length; i < len; i++) {
      node = Dispatch.getNode(paths[i]);
      components = node.getComponents();
      if (!node) continue;
      size = sizes[i];
      if (size.sizeModeChanged) sizeModeChanged(node, components, size);
      if (size.absoluteSizeChanged) absoluteSizeChanged(node, components, size);
      if (size.proportionalSizeChanged) proportionalSizeChanged(node, components, size);
      if (size.differentialSizeChanged) differentialSizeChanged(node, components, size);
      if (size.renderSizeChanged) renderSizeChanged(node, components, size);
      if (size.fromComponents(components)) sizeChanged(node, components, size);
    }
  }
}

module.exports = new SizeSystem();
