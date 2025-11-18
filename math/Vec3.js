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
 * A three-dimensional vector.
 */
class Vec3 {
  /**
   * @param {number} [x] - The x component
   * @param {number} [y] - The y component
   * @param {number} [z] - The z component
   */
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  /**
   * Set the components of the current Vec3.
   *
   * @param {number} x - The x component
   * @param {number} y - The y component
   * @param {number} z - The z component
   * @returns {Vec3} this instance for chaining
   */
  set(x, y, z) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;
    return this;
  }

  /**
   * Add the input v to the current Vec3.
   *
   * @param {Vec3} v - The Vec3 to add
   * @returns {Vec3} this instance for chaining
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * Subtract the input v from the current Vec3.
   *
   * @param {Vec3} v - The Vec3 to subtract
   * @returns {Vec3} this instance for chaining
   */
  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Rotate the current Vec3 by theta clockwise about the x axis.
   *
   * @param {number} theta - Angle by which to rotate
   * @returns {Vec3} this instance for chaining
   */
  rotateX(theta) {
    const y = this.y;
    const z = this.z;

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    this.y = y * cosTheta - z * sinTheta;
    this.z = y * sinTheta + z * cosTheta;

    return this;
  }

  /**
   * Rotate the current Vec3 by theta clockwise about the y axis.
   *
   * @param {number} theta - Angle by which to rotate
   * @returns {Vec3} this instance for chaining
   */
  rotateY(theta) {
    const x = this.x;
    const z = this.z;

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    this.x = z * sinTheta + x * cosTheta;
    this.z = z * cosTheta - x * sinTheta;

    return this;
  }

  /**
   * Rotate the current Vec3 by theta clockwise about the z axis.
   *
   * @param {number} theta - Angle by which to rotate
   * @returns {Vec3} this instance for chaining
   */
  rotateZ(theta) {
    const x = this.x;
    const y = this.y;

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;

    return this;
  }

  /**
   * The dot product of the current Vec3 with input Vec3 v.
   *
   * @param {Vec3} v - The other Vec3
   * @returns {number} The dot product
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * The cross product of the current Vec3 with input Vec3 v.
   * Stores the result in the current Vec3.
   *
   * @param {Vec3} v - The other Vec3
   * @returns {Vec3} this instance for chaining
   */
  cross(v) {
    const x = this.x;
    const y = this.y;
    const z = this.z;

    const vx = v.x;
    const vy = v.y;
    const vz = v.z;

    this.x = y * vz - z * vy;
    this.y = z * vx - x * vz;
    this.z = x * vy - y * vx;
    return this;
  }

  /**
   * Scale the current Vec3 by a scalar.
   *
   * @param {number} s - The Number by which to scale
   * @returns {Vec3} this instance for chaining
   */
  scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /**
   * Preserve the magnitude but invert the orientation of the current Vec3.
   *
   * @returns {Vec3} this instance for chaining
   */
  invert() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Apply a function component-wise to the current Vec3.
   *
   * @param {Function} fn - Function to apply
   * @returns {Vec3} this instance for chaining
   */
  map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    this.z = fn(this.z);
    return this;
  }

  /**
   * The magnitude of the current Vec3.
   *
   * @returns {number} The magnitude of the Vec3
   */
  length() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * The magnitude squared of the current Vec3.
   *
   * @returns {number} Magnitude of the Vec3 squared
   */
  lengthSq() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return x * x + y * y + z * z;
  }

  /**
   * Copy the input onto the current Vec3.
   *
   * @param {Vec3} v - Vec3 to copy
   * @returns {Vec3} this instance for chaining
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * Reset the current Vec3.
   *
   * @returns {Vec3} this instance for chaining
   */
  clear() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  /**
   * Check whether the magnitude of the current Vec3 is exactly 0.
   *
   * @returns {boolean} Whether or not the magnitude is zero
   */
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  /**
   * The array form of the current Vec3.
   *
   * @returns {Array<number>} A three element array representing the components of the Vec3
   */
  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * Preserve the orientation but change the length of the current Vec3 to 1.
   *
   * @returns {Vec3} this instance for chaining
   */
  normalize() {
    const x = this.x;
    const y = this.y;
    const z = this.z;

    let len = Math.sqrt(x * x + y * y + z * z) || 1;
    len = 1 / len;

    this.x *= len;
    this.y *= len;
    this.z *= len;
    return this;
  }

  /**
   * Apply the rotation corresponding to the input (unit) Quaternion
   * to the current Vec3.
   *
   * @param {Quaternion} q - Unit Quaternion representing the rotation to apply
   * @returns {Vec3} this instance for chaining
   */
  applyRotation(q) {
    const cw = q.w;
    const cx = -q.x;
    const cy = -q.y;
    const cz = -q.z;

    const vx = this.x;
    const vy = this.y;
    const vz = this.z;

    const tw = -cx * vx - cy * vy - cz * vz;
    const tx = vx * cw + vy * cz - cy * vz;
    const ty = vy * cw + cx * vz - vx * cz;
    const tz = vz * cw + vx * cy - cx * vy;

    const w = cw;
    const x = -cx;
    const y = -cy;
    const z = -cz;

    this.x = tx * w + x * tw + y * tz - ty * z;
    this.y = ty * w + y * tw + tx * z - x * tz;
    this.z = tz * w + z * tw + x * ty - tx * y;
    return this;
  }

  /**
   * Apply the input Mat33 to the current Vec3.
   *
   * @param {Mat33} matrix - Mat33 to apply
   * @returns {Vec3} this instance for chaining
   */
  applyMatrix(matrix) {
    const M = matrix.get();

    const x = this.x;
    const y = this.y;
    const z = this.z;

    this.x = M[0] * x + M[1] * y + M[2] * z;
    this.y = M[3] * x + M[4] * y + M[5] * z;
    this.z = M[6] * x + M[7] * y + M[8] * z;
    return this;
  }

  /**
   * Normalize the input Vec3.
   *
   * @static
   * @param {Vec3} v - The reference Vec3
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The normalized Vec3
   */
  static normalize(v, output) {
    const x = v.x;
    const y = v.y;
    const z = v.z;

    let length = Math.sqrt(x * x + y * y + z * z) || 1;
    length = 1 / length;

    output.x = x * length;
    output.y = y * length;
    output.z = z * length;
    return output;
  }

  /**
   * Apply a rotation to the input Vec3.
   *
   * @static
   * @param {Vec3} v - The reference Vec3
   * @param {Quaternion} q - Unit Quaternion representing the rotation to apply
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The rotated version of the input Vec3
   */
  static applyRotation(v, q, output) {
    const cw = q.w;
    const cx = -q.x;
    const cy = -q.y;
    const cz = -q.z;

    const vx = v.x;
    const vy = v.y;
    const vz = v.z;

    const tw = -cx * vx - cy * vy - cz * vz;
    const tx = vx * cw + vy * cz - cy * vz;
    const ty = vy * cw + cx * vz - vx * cz;
    const tz = vz * cw + vx * cy - cx * vy;

    const w = cw;
    const x = -cx;
    const y = -cy;
    const z = -cz;

    output.x = tx * w + x * tw + y * tz - ty * z;
    output.y = ty * w + y * tw + tx * z - x * tz;
    output.z = tz * w + z * tw + x * ty - tx * y;
    return output;
  }

  /**
   * Clone the input Vec3.
   *
   * @static
   * @param {Vec3} v - The Vec3 to clone
   * @returns {Vec3} The cloned Vec3
   */
  static clone(v) {
    return new Vec3(v.x, v.y, v.z);
  }

  /**
   * Add the input Vec3's.
   *
   * @static
   * @param {Vec3} v1 - The left Vec3
   * @param {Vec3} v2 - The right Vec3
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The result of the addition
   */
  static add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;
    output.z = v1.z + v2.z;
    return output;
  }

  /**
   * Subtract the second Vec3 from the first.
   *
   * @static
   * @param {Vec3} v1 - The left Vec3
   * @param {Vec3} v2 - The right Vec3
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The result of the subtraction
   */
  static subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    output.z = v1.z - v2.z;
    return output;
  }

  /**
   * Scale the input Vec3.
   *
   * @static
   * @param {Vec3} v - The reference Vec3
   * @param {number} s - Number to scale by
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The result of the scaling
   */
  static scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    output.z = v.z * s;
    return output;
  }

  /**
   * The dot product of the input Vec3's.
   *
   * @static
   * @param {Vec3} v1 - The left Vec3
   * @param {Vec3} v2 - The right Vec3
   * @returns {number} The dot product
   */
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * The (right-handed) cross product of the input Vec3's.
   * v1 x v2.
   *
   * @static
   * @param {Vec3} v1 - The left Vec3
   * @param {Vec3} v2 - The right Vec3
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The result of the cross product
   */
  static cross(v1, v2, output) {
    const x1 = v1.x;
    const y1 = v1.y;
    const z1 = v1.z;
    const x2 = v2.x;
    const y2 = v2.y;
    const z2 = v2.z;

    output.x = y1 * z2 - z1 * y2;
    output.y = z1 * x2 - x1 * z2;
    output.z = x1 * y2 - y1 * x2;
    return output;
  }

  /**
   * The projection of v1 onto v2.
   *
   * @static
   * @param {Vec3} v1 - The left Vec3
   * @param {Vec3} v2 - The right Vec3
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The result of the projection
   */
  static project(v1, v2, output) {
    const x1 = v1.x;
    const y1 = v1.y;
    const z1 = v1.z;
    const x2 = v2.x;
    const y2 = v2.y;
    const z2 = v2.z;

    let scale = x1 * x2 + y1 * y2 + z1 * z2;
    scale /= x2 * x2 + y2 * y2 + z2 * z2;

    output.x = x2 * scale;
    output.y = y2 * scale;
    output.z = z2 * scale;

    return output;
  }
}

module.exports = Vec3;
