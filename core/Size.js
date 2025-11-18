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

const ONES = [1, 1, 1];
const ZEROS = [0, 0, 0];

/**
 * Private method which sets a value within an array
 * and reports if the value has changed.
 *
 * @private
 * @param {Array} vec - The array to set the value in
 * @param {number} index - The index at which to set the value
 * @param {*} val - If the val is undefined or null, or if the value
 *                  is the same as what is already there, then nothing
 *                  is set
 * @returns {boolean} Returns true if anything changed
 */
function _vecOptionalSet(vec, index, val) {
  if (val != null && vec[index] !== val) {
    vec[index] = val;
    return true;
  } else return false;
}

/**
 * Private method which sets three values within an array of three
 * using _vecOptionalSet. Returns whether anything has changed.
 *
 * @private
 * @param {Array} vec - The array to set the values of
 * @param {*} x - The first value to set within the array
 * @param {*} y - The second value to set within the array
 * @param {*} z - The third value to set within the array
 * @returns {boolean} Whether anything has changed
 */
function setVec(vec, x, y, z) {
  let propagate = false;

  propagate = _vecOptionalSet(vec, 0, x) || propagate;
  propagate = _vecOptionalSet(vec, 1, y) || propagate;
  propagate = _vecOptionalSet(vec, 2, z) || propagate;

  return propagate;
}

/**
 * Private method to allow for polymorphism in the size mode such that strings
 * or the numbers from the enumeration can be used.
 *
 * @private
 * @param {string|number} val - The Size mode to resolve
 * @returns {number} The resolved size mode from the enumeration
 */
function resolveSizeMode(val) {
  if (val.constructor === String) {
    switch (val.toLowerCase()) {
      case 'relative':
      case 'default':
        return Size.RELATIVE;
      case 'absolute':
        return Size.ABSOLUTE;
      case 'render':
        return Size.RENDER;
      default:
        throw new Error('unknown size mode: ' + val);
    }
  } else if (val < 0 || val > Size.RENDER) throw new Error('unknown size mode: ' + val);
  return val;
}

/**
 * The Size class is responsible for processing Size from a node.
 */
class Size {
  /**
   * @param {Size} [parent] - The parent size
   */
  constructor(parent) {
    this.finalSize = new Float32Array(3);
    this.sizeChanged = false;

    this.sizeMode = new Uint8Array(3);
    this.sizeModeChanged = false;

    this.absoluteSize = new Float32Array(3);
    this.absoluteSizeChanged = false;

    this.proportionalSize = new Float32Array(ONES);
    this.proportionalSizeChanged = false;

    this.differentialSize = new Float32Array(3);
    this.differentialSizeChanged = false;

    this.renderSize = new Float32Array(3);
    this.renderSizeChanged = false;

    this.parent = parent != null ? parent : null;
  }

  /**
   * Sets the parent of this size.
   *
   * @param {Size} parent - The parent size component
   * @returns {Size} this instance for chaining
   */
  setParent(parent) {
    this.parent = parent;
    return this;
  }

  /**
   * Gets the parent of this size.
   *
   * @returns {Size|undefined} The parent if one exists
   */
  getParent() {
    return this.parent;
  }

  /**
   * Sets the size mode of this size representation.
   *
   * @param {number|string} [x] - The size mode to use for the width
   * @param {number|string} [y] - The size mode to use for the height
   * @param {number|string} [z] - The size mode to use for the depth
   * @returns {Size} this instance for chaining
   */
  setSizeMode(x, y, z) {
    if (x != null) x = resolveSizeMode(x);
    if (y != null) y = resolveSizeMode(y);
    if (z != null) z = resolveSizeMode(z);
    this.sizeModeChanged = setVec(this.sizeMode, x, y, z);
    return this;
  }

  /**
   * Returns the size mode of this component.
   *
   * @returns {Uint8Array} The current size mode
   */
  getSizeMode() {
    return this.sizeMode;
  }

  /**
   * Sets the absolute size of this size representation.
   *
   * @param {number} [x] - The x dimension of the absolute size
   * @param {number} [y] - The y dimension of the absolute size
   * @param {number} [z] - The z dimension of the absolute size
   * @returns {Size} this instance for chaining
   */
  setAbsolute(x, y, z) {
    this.absoluteSizeChanged = setVec(this.absoluteSize, x, y, z);
    return this;
  }

  /**
   * Gets the absolute size of this size representation.
   *
   * @returns {Float32Array} Array of absolute size
   */
  getAbsolute() {
    return this.absoluteSize;
  }

  /**
   * Sets the proportional size of this size representation.
   *
   * @param {number} [x] - The x dimension of the proportional size
   * @param {number} [y] - The y dimension of the proportional size
   * @param {number} [z] - The z dimension of the proportional size
   * @returns {Size} this instance for chaining
   */
  setProportional(x, y, z) {
    this.proportionalSizeChanged = setVec(this.proportionalSize, x, y, z);
    return this;
  }

  /**
   * Gets the proportional size of this size representation.
   *
   * @returns {Float32Array} Array of proportional size
   */
  getProportional() {
    return this.proportionalSize;
  }

  /**
   * Sets the differential size of this size representation.
   *
   * @param {number} [x] - The x dimension of the differential size
   * @param {number} [y] - The y dimension of the differential size
   * @param {number} [z] - The z dimension of the differential size
   * @returns {Size} this instance for chaining
   */
  setDifferential(x, y, z) {
    this.differentialSizeChanged = setVec(this.differentialSize, x, y, z);
    return this;
  }

  /**
   * Gets the differential size of this size representation.
   *
   * @returns {Float32Array} Array of differential size
   */
  getDifferential() {
    return this.differentialSize;
  }

  /**
   * Gets the size of this size representation.
   *
   * @returns {Float32Array} The final size
   */
  get() {
    return this.finalSize;
  }

  /**
   * Takes the parent node's size, the target node's spec,
   * and a target array to write to. Using the node's size mode it calculates
   * a final size for the node from the node's spec. Returns whether or not
   * the final size has changed from its last value.
   *
   * @param {Array} components - The node's components
   * @returns {boolean} True if the size of the node has changed
   */
  fromComponents(components) {
    const mode = this.sizeMode;
    const target = this.finalSize;
    const parentSize = this.parent ? this.parent.get() : ZEROS;
    let prev;
    let changed = false;
    const len = components.length;
    let j;

    for (let i = 0; i < 3; i++) {
      prev = target[i];
      switch (mode[i]) {
        case Size.RELATIVE:
          target[i] =
            parentSize[i] * this.proportionalSize[i] + this.differentialSize[i];
          break;
        case Size.ABSOLUTE:
          target[i] = this.absoluteSize[i];
          break;
        case Size.RENDER:
          let candidate;
          let component;
          for (j = 0; j < len; j++) {
            component = components[j];
            if (component && component.getRenderSize) {
              candidate = component.getRenderSize()[i];
              target[i] =
                target[i] < candidate || target[i] === 0 ? candidate : target[i];
            }
          }
          break;
      }
      changed = changed || prev !== target[i];
    }
    this.sizeChanged = changed;
    return changed;
  }
}

// An enumeration of the different types of size modes
Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

module.exports = Size;
