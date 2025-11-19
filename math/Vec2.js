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

/**
 * A two-dimensional vector.
 */
class Vec2 {
  /**
   * @param {number|Array|Float32Array} x - The x component or an array of components
   * @param {number} [y] - The y component
   */
  constructor(x, y) {
    if (x instanceof Array || x instanceof Float32Array) {
      this.x = x[0] || 0;
      this.y = x[1] || 0;
    } else {
      this.x = x || 0;
      this.y = y || 0;
    }
  }

  /**
   * Set the components of the current Vec2.
   *
   * @param {number} x - The x component
   * @param {number} y - The y component
   * @returns {Vec2} this instance for chaining
   */
  set(x, y) {
    if (x != null) {
      this.x = x;
    }
    if (y != null) {
      this.y = y;
    }
    return this;
  }

  /**
   * Add the input v to the current Vec2.
   *
   * @param {Vec2} v - The Vec2 to add
   * @returns {Vec2} this instance for chaining
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtract the input v from the current Vec2.
   *
   * @param {Vec2} v - The Vec2 to subtract
   * @returns {Vec2} this instance for chaining
   */
  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Scale the current Vec2 by a scalar or Vec2.
   *
   * @param {number|Vec2} s - The Number or Vec2 by which to scale
   * @returns {Vec2} this instance for chaining
   */
  scale(s) {
    if (s instanceof Vec2) {
      this.x *= s.x;
      this.y *= s.y;
    } else {
      this.x *= s;
      this.y *= s;
    }
    return this;
  }

  /**
   * Rotate the Vec2 counter-clockwise by theta about the z-axis.
   *
   * @param {number} theta - Angle by which to rotate
   * @returns {Vec2} this instance for chaining
   */
  rotate(theta) {
    const x = this.x;
    const y = this.y;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;

    return this;
  }

  /**
   * The dot product of the current Vec2 with the input Vec2.
   *
   * @param {Vec2} v - The other Vec2
   * @returns {number} The dot product
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * The cross product of the current Vec2 with the input Vec2.
   *
   * @param {Vec2} v - The other Vec2
   * @returns {number} The z-component of the cross product
   */
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Preserve the magnitude but invert the orientation of the current Vec2.
   *
   * @returns {Vec2} this instance for chaining
   */
  invert() {
    this.x *= -1;
    this.y *= -1;
    return this;
  }

  /**
   * Apply a function component-wise to the current Vec2.
   *
   * @param {Function} fn - Function to apply
   * @returns {Vec2} this instance for chaining
   */
  map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    return this;
  }

  /**
   * Get the magnitude of the current Vec2.
   *
   * @returns {number} The length of the vector
   */
  length() {
    const x = this.x;
    const y = this.y;
    return Math.sqrt(x * x + y * y);
  }

  /**
   * Copy the input onto the current Vec2.
   *
   * @param {Vec2} v - Vec2 to copy
   * @returns {Vec2} this instance for chaining
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  /**
   * Reset the current Vec2.
   *
   * @returns {Vec2} this instance for chaining
   */
  clear() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  /**
   * Check whether the magnitude of the current Vec2 is exactly 0.
   *
   * @returns {boolean} Whether or not the length is 0
   */
  isZero() {
    return this.x === 0 && this.y === 0;
  }

  /**
   * The array form of the current Vec2.
   *
   * @returns {Array<number>} The Vec2 as an array
   */
  toArray() {
    return [this.x, this.y];
  }

  /**
   * Normalize the input Vec2.
   *
   * @static
   * @param {Vec2} v - The reference Vec2
   * @param {Vec2} output - Vec2 in which to place the result
   * @returns {Vec2} The normalized Vec2
   */
  static normalize(v, output) {
    const x = v.x;
    const y = v.y;
    let length = Math.sqrt(x * x + y * y) || 1;
    length = 1 / length;
    output.x = v.x * length;
    output.y = v.y * length;
    return output;
  }

  /**
   * Clone the input Vec2.
   *
   * @static
   * @param {Vec2} v - The Vec2 to clone
   * @returns {Vec2} The cloned Vec2
   */
  static clone(v) {
    return new Vec2(v.x, v.y);
  }

  /**
   * Add the input Vec2's.
   *
   * @static
   * @param {Vec2} v1 - The left Vec2
   * @param {Vec2} v2 - The right Vec2
   * @param {Vec2} output - Vec2 in which to place the result
   * @returns {Vec2} The result of the addition
   */
  static add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;
    return output;
  }

  /**
   * Subtract the second Vec2 from the first.
   *
   * @static
   * @param {Vec2} v1 - The left Vec2
   * @param {Vec2} v2 - The right Vec2
   * @param {Vec2} output - Vec2 in which to place the result
   * @returns {Vec2} The result of the subtraction
   */
  static subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    return output;
  }

  /**
   * Scale the input Vec2.
   *
   * @static
   * @param {Vec2} v - The reference Vec2
   * @param {number} s - Number to scale by
   * @param {Vec2} output - Vec2 in which to place the result
   * @returns {Vec2} The result of the scaling
   */
  static scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    return output;
  }

  /**
   * The dot product of the input Vec2's.
   *
   * @static
   * @param {Vec2} v1 - The left Vec2
   * @param {Vec2} v2 - The right Vec2
   * @returns {number} The dot product
   */
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * The cross product of the input Vec2's.
   *
   * @static
   * @param {Vec2} v1 - The left Vec2
   * @param {Vec2} v2 - The right Vec2
   * @returns {number} The z-component of the cross product
   */
  static cross(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
  }
}

module.exports = Vec2;
