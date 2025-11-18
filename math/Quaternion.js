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

const sin = Math.sin;
const cos = Math.cos;
const asin = Math.asin;
const acos = Math.acos;
const atan2 = Math.atan2;
const sqrt = Math.sqrt;

/**
 * A vector-like object used to represent rotations. If theta is the angle of
 * rotation, and (x', y', z') is a normalized vector representing the axis of
 * rotation, then w = cos(theta/2), x = sin(theta/2)*x', y = sin(theta/2)*y',
 * and z = sin(theta/2)*z'.
 */
class Quaternion {
  /**
   * @param {number} [w] - The w component
   * @param {number} [x] - The x component
   * @param {number} [y] - The y component
   * @param {number} [z] - The z component
   */
  constructor(w, x, y, z) {
    this.w = w || 1;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  /**
   * Multiply the current Quaternion by input Quaternion q.
   * Left-handed multiplication.
   *
   * @param {Quaternion} q - The Quaternion to multiply by on the right
   * @returns {Quaternion} this instance for chaining
   */
  multiply(q) {
    const x1 = this.x;
    const y1 = this.y;
    const z1 = this.z;
    const w1 = this.w;
    const x2 = q.x;
    const y2 = q.y;
    const z2 = q.z;
    const w2 = q.w || 0;

    this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    this.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    this.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return this;
  }

  /**
   * Multiply the current Quaternion by input Quaternion q on the left, i.e. q * this.
   * Left-handed multiplication.
   *
   * @param {Quaternion} q - The Quaternion to multiply by on the left
   * @returns {Quaternion} this instance for chaining
   */
  leftMultiply(q) {
    const x1 = q.x;
    const y1 = q.y;
    const z1 = q.z;
    const w1 = q.w || 0;
    const x2 = this.x;
    const y2 = this.y;
    const z2 = this.z;
    const w2 = this.w;

    this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    this.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    this.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return this;
  }

  /**
   * Apply the current Quaternion to input Vec3 v, according to
   * v' = ~q * v * q.
   *
   * @param {Vec3} v - The reference Vec3
   * @param {Vec3} output - Vec3 in which to place the result
   * @returns {Vec3} The rotated version of the Vec3
   */
  rotateVector(v, output) {
    const cw = this.w;
    const cx = -this.x;
    const cy = -this.y;
    const cz = -this.z;

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
   * Invert the current Quaternion.
   *
   * @returns {Quaternion} this instance for chaining
   */
  invert() {
    this.w = -this.w;
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Conjugate the current Quaternion.
   *
   * @returns {Quaternion} this instance for chaining
   */
  conjugate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Compute the length (norm) of the current Quaternion.
   *
   * @returns {number} Length of the Quaternion
   */
  length() {
    const w = this.w;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return sqrt(w * w + x * x + y * y + z * z);
  }

  /**
   * Alter the current Quaternion to be of unit length.
   *
   * @returns {Quaternion} this instance for chaining
   */
  normalize() {
    const w = this.w;
    const x = this.x;
    const y = this.y;
    const z = this.z;
    let length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return this;
    length = 1 / length;
    this.w *= length;
    this.x *= length;
    this.y *= length;
    this.z *= length;
    return this;
  }

  /**
   * Set the w, x, y, z components of the current Quaternion.
   *
   * @param {number} w - The w component
   * @param {number} x - The x component
   * @param {number} y - The y component
   * @param {number} z - The z component
   * @returns {Quaternion} this instance for chaining
   */
  set(w, x, y, z) {
    if (w != null) this.w = w;
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;
    return this;
  }

  /**
   * Copy input Quaternion q onto the current Quaternion.
   *
   * @param {Quaternion} q - The reference Quaternion
   * @returns {Quaternion} this instance for chaining
   */
  copy(q) {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
  }

  /**
   * Reset the current Quaternion.
   *
   * @returns {Quaternion} this instance for chaining
   */
  clear() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  /**
   * The dot product. Can be used to determine the cosine of the angle between
   * the two rotations, assuming both Quaternions are of unit length.
   *
   * @param {Quaternion} q - The other Quaternion
   * @returns {number} The resulting dot product
   */
  dot(q) {
    return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
  }

  /**
   * Spherical linear interpolation.
   *
   * @param {Quaternion} q - The final orientation
   * @param {number} t - The tween parameter
   * @param {Quaternion} output - Quaternion in which to put the result
   * @returns {Quaternion} The quaternion the slerp results were saved to
   */
  slerp(q, t, output) {
    const w = this.w;
    const x = this.x;
    const y = this.y;
    const z = this.z;

    const qw = q.w;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;

    let omega;
    let cosomega;
    let sinomega;
    let scaleFrom;
    let scaleTo;

    cosomega = w * qw + x * qx + y * qy + z * qz;
    if ((1.0 - cosomega) > 1e-5) {
      omega = acos(cosomega);
      sinomega = sin(omega);
      scaleFrom = sin((1.0 - t) * omega) / sinomega;
      scaleTo = sin(t * omega) / sinomega;
    } else {
      scaleFrom = 1.0 - t;
      scaleTo = t;
    }

    output.w = w * scaleFrom + qw * scaleTo;
    output.x = x * scaleFrom + qx * scaleTo;
    output.y = y * scaleFrom + qy * scaleTo;
    output.z = z * scaleFrom + qz * scaleTo;

    return output;
  }

  /**
   * Get the Mat33 matrix corresponding to the current Quaternion.
   *
   * @param {Mat33} output - Object to process the Transform matrix
   * @returns {Mat33} The Quaternion as a Transform matrix
   */
  toMatrix(output) {
    const w = this.w;
    const x = this.x;
    const y = this.y;
    const z = this.z;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    const xy = x * y;
    const xz = x * z;
    const yz = y * z;

    return output.set([
      1 - 2 * (yy + zz), 2 * (xy - w * z), 2 * (xz + w * y),
      2 * (xy + w * z), 1 - 2 * (xx + zz), 2 * (yz - w * x),
      2 * (xz - w * y), 2 * (yz + w * x), 1 - 2 * (xx + yy),
    ]);
  }

  /**
   * The rotation angles about the x, y, and z axes corresponding to the
   * current Quaternion, when applied in the ZYX order.
   *
   * @param {Vec3} output - Vec3 in which to put the result
   * @returns {Vec3} The Vec3 the result was stored in
   */
  toEuler(output) {
    const w = this.w;
    const x = this.x;
    const y = this.y;
    const z = this.z;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;

    let ty = 2 * (x * z + y * w);
    ty = ty < -1 ? -1 : ty > 1 ? 1 : ty;

    output.x = atan2(2 * (x * w - y * z), 1 - 2 * (xx + yy));
    output.y = asin(ty);
    output.z = atan2(2 * (z * w - x * y), 1 - 2 * (yy + zz));

    return output;
  }

  /**
   * The Quaternion corresponding to the Euler angles x, y, and z,
   * applied in the ZYX order.
   *
   * @param {number} x - The angle of rotation about the x axis
   * @param {number} y - The angle of rotation about the y axis
   * @param {number} z - The angle of rotation about the z axis
   * @returns {Quaternion} this instance for chaining
   */
  fromEuler(x, y, z) {
    const hx = x * 0.5;
    const hy = y * 0.5;
    const hz = z * 0.5;

    const sx = sin(hx);
    const sy = sin(hy);
    const sz = sin(hz);
    const cx = cos(hx);
    const cy = cos(hy);
    const cz = cos(hz);

    this.w = cx * cy * cz - sx * sy * sz;
    this.x = sx * cy * cz + cx * sy * sz;
    this.y = cx * sy * cz - sx * cy * sz;
    this.z = cx * cy * sz + sx * sy * cz;

    return this;
  }

  /**
   * Alter the current Quaternion to reflect a rotation of input angle about
   * input axis x, y, and z.
   *
   * @param {number} angle - The angle of rotation
   * @param {number} x - The x axis of rotation
   * @param {number} y - The y axis of rotation
   * @param {number} z - The z axis of rotation
   * @returns {Quaternion} this instance for chaining
   */
  fromAngleAxis(angle, x, y, z) {
    let len = sqrt(x * x + y * y + z * z);
    if (len === 0) {
      this.w = 1;
      this.x = this.y = this.z = 0;
    } else {
      len = 1 / len;
      const halfTheta = angle * 0.5;
      const s = sin(halfTheta);
      this.w = cos(halfTheta);
      this.x = s * x * len;
      this.y = s * y * len;
      this.z = s * z * len;
    }
    return this;
  }

  /**
   * Multiply the input Quaternions.
   * Left-handed coordinate system multiplication.
   *
   * @static
   * @param {Quaternion} q1 - The left Quaternion
   * @param {Quaternion} q2 - The right Quaternion
   * @param {Quaternion} output - Quaternion in which to place the result
   * @returns {Quaternion} The product of multiplication
   */
  static multiply(q1, q2, output) {
    const w1 = q1.w || 0;
    const x1 = q1.x;
    const y1 = q1.y;
    const z1 = q1.z;

    const w2 = q2.w || 0;
    const x2 = q2.x;
    const y2 = q2.y;
    const z2 = q2.z;

    output.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    output.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    output.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    output.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return output;
  }

  /**
   * Normalize the input quaternion.
   *
   * @static
   * @param {Quaternion} q - The reference Quaternion
   * @param {Quaternion} output - Quaternion in which to place the result
   * @returns {Quaternion} The normalized quaternion
   */
  static normalize(q, output) {
    const w = q.w;
    const x = q.x;
    const y = q.y;
    const z = q.z;
    let length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return output;
    length = 1 / length;
    output.w = w * length;
    output.x = x * length;
    output.y = y * length;
    output.z = z * length;
    return output;
  }

  /**
   * The conjugate of the input Quaternion.
   *
   * @static
   * @param {Quaternion} q - The reference Quaternion
   * @param {Quaternion} output - Quaternion in which to place the result
   * @returns {Quaternion} The conjugate Quaternion
   */
  static conjugate(q, output) {
    output.w = q.w;
    output.x = -q.x;
    output.y = -q.y;
    output.z = -q.z;
    return output;
  }

  /**
   * Clone the input Quaternion.
   *
   * @static
   * @param {Quaternion} q - The reference Quaternion
   * @returns {Quaternion} The cloned Quaternion
   */
  static clone(q) {
    return new Quaternion(q.w, q.x, q.y, q.z);
  }

  /**
   * The dot product of the two input Quaternions.
   *
   * @static
   * @param {Quaternion} q1 - The left Quaternion
   * @param {Quaternion} q2 - The right Quaternion
   * @returns {number} The dot product of the two Quaternions
   */
  static dot(q1, q2) {
    return q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
  }
}

module.exports = Quaternion;
