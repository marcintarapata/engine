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

const QUAT = [0, 0, 0, 1];
const ONES = [1, 1, 1];

/**
 * Private method to potentially set a value within an array.
 * Returns true if the value was set and false if not.
 *
 * @private
 * @param {Array} vec - The array to set the value within
 * @param {number} index - The index at which to set the value
 * @param {*} val - The value to potentially set in the array
 * @returns {boolean} Whether or not a value was set
 */
function _vecOptionalSet(vec, index, val) {
  if (val != null && vec[index] !== val) {
    vec[index] = val;
    return true;
  } else return false;
}

/**
 * Private method to set values within an array.
 * Returns whether or not the array has been changed.
 *
 * @private
 * @param {Array} vec - The vector to be operated upon
 * @param {number} [x] - The x value of the vector
 * @param {number} [y] - The y value of the vector
 * @param {number} [z] - The z value of the vector
 * @param {number} [w] - The w value of the vector
 * @returns {boolean} Whether or not the array was changed
 */
function setVec(vec, x, y, z, w) {
  let propagate = false;

  propagate = _vecOptionalSet(vec, 0, x) || propagate;
  propagate = _vecOptionalSet(vec, 1, y) || propagate;
  propagate = _vecOptionalSet(vec, 2, z) || propagate;
  if (w != null) propagate = _vecOptionalSet(vec, 3, w) || propagate;

  return propagate;
}

/**
 * Private function. Creates a transformation matrix from a Node's spec.
 *
 * @private
 * @param {*} node - The node to create a transform for
 * @param {Transform} transform - Transform to apply
 * @returns {number} Bitwise flags indicating what changed
 */
function fromNode(node, transform) {
  const target = transform.getLocalTransform();
  const mySize = node.getSize();
  const vectors = transform.vectors;
  const offsets = transform.offsets;
  const parentSize = node.getParent().getSize();
  let changed = 0;

  const t00 = target[0];
  const t01 = target[1];
  const t02 = target[2];
  const t10 = target[4];
  const t11 = target[5];
  const t12 = target[6];
  const t20 = target[8];
  const t21 = target[9];
  const t22 = target[10];
  const t30 = target[12];
  const t31 = target[13];
  const t32 = target[14];
  const posX = vectors.position[0];
  const posY = vectors.position[1];
  const posZ = vectors.position[2];
  const rotX = vectors.rotation[0];
  const rotY = vectors.rotation[1];
  const rotZ = vectors.rotation[2];
  const rotW = vectors.rotation[3];
  const scaleX = vectors.scale[0];
  const scaleY = vectors.scale[1];
  const scaleZ = vectors.scale[2];
  const alignX = offsets.align[0] * parentSize[0];
  const alignY = offsets.align[1] * parentSize[1];
  const alignZ = offsets.align[2] * parentSize[2];
  const mountPointX = offsets.mountPoint[0] * mySize[0];
  const mountPointY = offsets.mountPoint[1] * mySize[1];
  const mountPointZ = offsets.mountPoint[2] * mySize[2];
  const originX = offsets.origin[0] * mySize[0];
  const originY = offsets.origin[1] * mySize[1];
  const originZ = offsets.origin[2] * mySize[2];

  const wx = rotW * rotX;
  const wy = rotW * rotY;
  const wz = rotW * rotZ;
  const xx = rotX * rotX;
  const yy = rotY * rotY;
  const zz = rotZ * rotZ;
  const xy = rotX * rotY;
  const xz = rotX * rotZ;
  const yz = rotY * rotZ;

  target[0] = (1 - 2 * (yy + zz)) * scaleX;
  target[1] = (2 * (xy + wz)) * scaleX;
  target[2] = (2 * (xz - wy)) * scaleX;
  target[3] = 0;
  target[4] = (2 * (xy - wz)) * scaleY;
  target[5] = (1 - 2 * (xx + zz)) * scaleY;
  target[6] = (2 * (yz + wx)) * scaleY;
  target[7] = 0;
  target[8] = (2 * (xz + wy)) * scaleZ;
  target[9] = (2 * (yz - wx)) * scaleZ;
  target[10] = (1 - 2 * (xx + yy)) * scaleZ;
  target[11] = 0;
  target[12] =
    alignX +
    posX -
    mountPointX +
    originX -
    (target[0] * originX + target[4] * originY + target[8] * originZ);
  target[13] =
    alignY +
    posY -
    mountPointY +
    originY -
    (target[1] * originX + target[5] * originY + target[9] * originZ);
  target[14] =
    alignZ +
    posZ -
    mountPointZ +
    originZ -
    (target[2] * originX + target[6] * originY + target[10] * originZ);
  target[15] = 1;

  if (transform.calculatingWorldMatrix && transform.calculateWorldMatrix())
    changed |= Transform.WORLD_CHANGED;

  if (
    t00 !== target[0] ||
    t01 !== target[1] ||
    t02 !== target[2] ||
    t10 !== target[4] ||
    t11 !== target[5] ||
    t12 !== target[6] ||
    t20 !== target[8] ||
    t21 !== target[9] ||
    t22 !== target[10] ||
    t30 !== target[12] ||
    t31 !== target[13] ||
    t32 !== target[14]
  )
    changed |= Transform.LOCAL_CHANGED;

  return changed;
}

/**
 * Private function. Uses the parent transform, the node's spec, the node's size, and the parent's size
 * to calculate a final transform for the node.
 *
 * @private
 * @param {*} node - The node to create a transform for
 * @param {Transform} transform - Transform to apply
 * @returns {number} Bitwise flags indicating what changed
 */
function fromNodeWithParent(node, transform) {
  const target = transform.getLocalTransform();
  const parentMatrix = transform.parent.getLocalTransform();
  const mySize = node.getSize();
  const vectors = transform.vectors;
  const offsets = transform.offsets;
  const parentSize = node.getParent().getSize();
  let changed = false;

  // local cache of everything
  const t00 = target[0];
  const t01 = target[1];
  const t02 = target[2];
  const t10 = target[4];
  const t11 = target[5];
  const t12 = target[6];
  const t20 = target[8];
  const t21 = target[9];
  const t22 = target[10];
  const t30 = target[12];
  const t31 = target[13];
  const t32 = target[14];
  const p00 = parentMatrix[0];
  const p01 = parentMatrix[1];
  const p02 = parentMatrix[2];
  const p10 = parentMatrix[4];
  const p11 = parentMatrix[5];
  const p12 = parentMatrix[6];
  const p20 = parentMatrix[8];
  const p21 = parentMatrix[9];
  const p22 = parentMatrix[10];
  const p30 = parentMatrix[12];
  const p31 = parentMatrix[13];
  const p32 = parentMatrix[14];
  const posX = vectors.position[0];
  const posY = vectors.position[1];
  const posZ = vectors.position[2];
  const rotX = vectors.rotation[0];
  const rotY = vectors.rotation[1];
  const rotZ = vectors.rotation[2];
  const rotW = vectors.rotation[3];
  const scaleX = vectors.scale[0];
  const scaleY = vectors.scale[1];
  const scaleZ = vectors.scale[2];
  const alignX = offsets.align[0] * parentSize[0];
  const alignY = offsets.align[1] * parentSize[1];
  const alignZ = offsets.align[2] * parentSize[2];
  const mountPointX = offsets.mountPoint[0] * mySize[0];
  const mountPointY = offsets.mountPoint[1] * mySize[1];
  const mountPointZ = offsets.mountPoint[2] * mySize[2];
  const originX = offsets.origin[0] * mySize[0];
  const originY = offsets.origin[1] * mySize[1];
  const originZ = offsets.origin[2] * mySize[2];

  const wx = rotW * rotX;
  const wy = rotW * rotY;
  const wz = rotW * rotZ;
  const xx = rotX * rotX;
  const yy = rotY * rotY;
  const zz = rotZ * rotZ;
  const xy = rotX * rotY;
  const xz = rotX * rotZ;
  const yz = rotY * rotZ;

  const rs0 = (1 - 2 * (yy + zz)) * scaleX;
  const rs1 = (2 * (xy + wz)) * scaleX;
  const rs2 = (2 * (xz - wy)) * scaleX;
  const rs3 = (2 * (xy - wz)) * scaleY;
  const rs4 = (1 - 2 * (xx + zz)) * scaleY;
  const rs5 = (2 * (yz + wx)) * scaleY;
  const rs6 = (2 * (xz + wy)) * scaleZ;
  const rs7 = (2 * (yz - wx)) * scaleZ;
  const rs8 = (1 - 2 * (xx + yy)) * scaleZ;

  const tx =
    alignX + posX - mountPointX + originX - (rs0 * originX + rs3 * originY + rs6 * originZ);
  const ty =
    alignY + posY - mountPointY + originY - (rs1 * originX + rs4 * originY + rs7 * originZ);
  const tz =
    alignZ + posZ - mountPointZ + originZ - (rs2 * originX + rs5 * originY + rs8 * originZ);

  target[0] = p00 * rs0 + p10 * rs1 + p20 * rs2;
  target[1] = p01 * rs0 + p11 * rs1 + p21 * rs2;
  target[2] = p02 * rs0 + p12 * rs1 + p22 * rs2;
  target[3] = 0;
  target[4] = p00 * rs3 + p10 * rs4 + p20 * rs5;
  target[5] = p01 * rs3 + p11 * rs4 + p21 * rs5;
  target[6] = p02 * rs3 + p12 * rs4 + p22 * rs5;
  target[7] = 0;
  target[8] = p00 * rs6 + p10 * rs7 + p20 * rs8;
  target[9] = p01 * rs6 + p11 * rs7 + p21 * rs8;
  target[10] = p02 * rs6 + p12 * rs7 + p22 * rs8;
  target[11] = 0;
  target[12] = p00 * tx + p10 * ty + p20 * tz + p30;
  target[13] = p01 * tx + p11 * ty + p21 * tz + p31;
  target[14] = p02 * tx + p12 * ty + p22 * tz + p32;
  target[15] = 1;

  if (transform.calculatingWorldMatrix && transform.calculateWorldMatrix())
    changed |= Transform.WORLD_CHANGED;

  if (
    t00 !== target[0] ||
    t01 !== target[1] ||
    t02 !== target[2] ||
    t10 !== target[4] ||
    t11 !== target[5] ||
    t12 !== target[6] ||
    t20 !== target[8] ||
    t21 !== target[9] ||
    t22 !== target[10] ||
    t30 !== target[12] ||
    t31 !== target[13] ||
    t32 !== target[14]
  )
    changed |= Transform.LOCAL_CHANGED;

  return changed;
}

/**
 * Private method to multiply two transforms.
 *
 * @private
 * @param {Array} out - The array to write the result to
 * @param {Array} a - The left hand transform
 * @param {Array} b - The right hand transform
 * @returns {boolean} Whether the result changed
 */
function multiply(out, a, b) {
  const a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a30 = a[12],
    a31 = a[13],
    a32 = a[14];

  let changed = false;
  let res;

  // Cache only the current line of the second matrix
  let b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];

  res = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  changed = changed ? changed : out[0] === res;
  out[0] = res;

  res = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  changed = changed ? changed : out[1] === res;
  out[1] = res;

  res = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  changed = changed ? changed : out[2] === res;
  out[2] = res;

  out[3] = 0;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];

  res = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  changed = changed ? changed : out[4] === res;
  out[4] = res;

  res = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  changed = changed ? changed : out[5] === res;
  out[5] = res;

  res = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  changed = changed ? changed : out[6] === res;
  out[6] = res;

  out[7] = 0;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];

  res = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  changed = changed ? changed : out[8] === res;
  out[8] = res;

  res = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  changed = changed ? changed : out[9] === res;
  out[9] = res;

  res = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  changed = changed ? changed : out[10] === res;
  out[10] = res;

  out[11] = 0;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];

  res = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  changed = changed ? changed : out[12] === res;
  out[12] = res;

  res = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  changed = changed ? changed : out[13] === res;
  out[13] = res;

  res = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  changed = changed ? changed : out[14] === res;
  out[14] = res;

  out[15] = 1;

  return changed;
}

/**
 * The Transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent.
 */
class Transform {
  /**
   * @param {Transform} [parent] - The parent Transform
   */
  constructor(parent) {
    this.local = new Float32Array(Transform.IDENT);
    this.global = new Float32Array(Transform.IDENT);
    this.offsets = {
      align: new Float32Array(3),
      alignChanged: false,
      mountPoint: new Float32Array(3),
      mountPointChanged: false,
      origin: new Float32Array(3),
      originChanged: false,
    };
    this.vectors = {
      position: new Float32Array(3),
      positionChanged: false,
      rotation: new Float32Array(QUAT),
      rotationChanged: false,
      scale: new Float32Array(ONES),
      scaleChanged: false,
    };
    this._lastEulerVals = [0, 0, 0];
    this._lastEuler = false;
    this.parent = parent ? parent : null;
    this.breakPoint = false;
    this.calculatingWorldMatrix = false;
  }

  /**
   * Resets the transform state such that it no longer has a parent
   * and is not a breakpoint.
   *
   * @returns {void}
   */
  reset() {
    this.parent = null;
    this.breakPoint = false;
    this.calculatingWorldMatrix = false;
  }

  /**
   * Sets the parent of this transform.
   *
   * @param {Transform} parent - The transform class that parents this class
   * @returns {void}
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Returns the parent of this transform.
   *
   * @returns {Transform|null} The parent of this transform if one exists
   */
  getParent() {
    return this.parent;
  }

  /**
   * Makes this transform a breakpoint. This will cause it to calculate
   * both a local (relative to the nearest ancestor breakpoint) and a world
   * matrix (relative to the scene).
   *
   * @returns {void}
   */
  setBreakPoint() {
    this.breakPoint = true;
    this.calculatingWorldMatrix = true;
  }

  /**
   * Set this node to calculate the world matrix.
   *
   * @returns {void}
   */
  setCalculateWorldMatrix() {
    this.calculatingWorldMatrix = true;
  }

  /**
   * Returns whether or not this transform is a breakpoint.
   *
   * @returns {boolean} True if this transform is a breakpoint
   */
  isBreakPoint() {
    return this.breakPoint;
  }

  /**
   * Returns the local transform.
   *
   * @returns {Float32Array} Local transform
   */
  getLocalTransform() {
    return this.local;
  }

  /**
   * Returns the world transform. Requires that this transform is a breakpoint.
   *
   * @returns {Float32Array} World transform
   */
  getWorldTransform() {
    if (!this.isBreakPoint() && !this.calculatingWorldMatrix)
      throw new Error('This transform is not calculating world transforms');
    return this.global;
  }

  /**
   * Takes a node and calculates the proper transform from it.
   *
   * @param {*} node - The node to calculate the transform from
   * @returns {number} Bitwise flags indicating what changed
   */
  calculate(node) {
    if (!this.parent || this.parent.isBreakPoint()) return fromNode(node, this);
    else return fromNodeWithParent(node, this);
  }

  /**
   * Gets the position component of the transform.
   *
   * @returns {Float32Array} The position component of the transform
   */
  getPosition() {
    return this.vectors.position;
  }

  /**
   * Sets the position component of the transform.
   *
   * @param {number} [x] - The x dimension of the position
   * @param {number} [y] - The y dimension of the position
   * @param {number} [z] - The z dimension of the position
   * @returns {void}
   */
  setPosition(x, y, z) {
    this.vectors.positionChanged = setVec(this.vectors.position, x, y, z);
  }

  /**
   * Gets the rotation component of the transform. Will return a quaternion.
   *
   * @returns {Float32Array} The quaternion representation of the transform's rotation
   */
  getRotation() {
    return this.vectors.rotation;
  }

  /**
   * Sets the rotation component of the transform. Can take either Euler
   * angles or a quaternion.
   *
   * @param {number} [x] - The rotation about the x axis or the extent in the x dimension
   * @param {number} [y] - The rotation about the y axis or the extent in the y dimension
   * @param {number} [z] - The rotation about the z axis or the extent in the z dimension
   * @param {number} [w] - The rotation about the proceeding vector
   * @returns {void}
   */
  setRotation(x, y, z, w) {
    const quat = this.vectors.rotation;
    let qx, qy, qz, qw;

    if (w != null) {
      qx = x;
      qy = y;
      qz = z;
      qw = w;
      this._lastEulerVals[0] = null;
      this._lastEulerVals[1] = null;
      this._lastEulerVals[2] = null;
      this._lastEuler = false;
    } else {
      if (x == null || y == null || z == null) {
        if (this._lastEuler) {
          x = x == null ? this._lastEulerVals[0] : x;
          y = y == null ? this._lastEulerVals[1] : y;
          z = z == null ? this._lastEulerVals[2] : z;
        } else {
          const sp = -2 * (quat[1] * quat[2] - quat[3] * quat[0]);

          if (Math.abs(sp) > 0.99999) {
            y = y == null ? Math.PI * 0.5 * sp : y;
            x =
              x == null
                ? Math.atan2(
                    -quat[0] * quat[2] + quat[3] * quat[1],
                    0.5 - quat[1] * quat[1] - quat[2] * quat[2]
                  )
                : x;
            z = z == null ? 0 : z;
          } else {
            y = y == null ? Math.asin(sp) : y;
            x =
              x == null
                ? Math.atan2(
                    quat[0] * quat[2] + quat[3] * quat[1],
                    0.5 - quat[0] * quat[0] - quat[1] * quat[1]
                  )
                : x;
            z =
              z == null
                ? Math.atan2(
                    quat[0] * quat[1] + quat[3] * quat[2],
                    0.5 - quat[0] * quat[0] - quat[2] * quat[2]
                  )
                : z;
          }
        }
      }

      const hx = x * 0.5;
      const hy = y * 0.5;
      const hz = z * 0.5;

      const sx = Math.sin(hx);
      const sy = Math.sin(hy);
      const sz = Math.sin(hz);
      const cx = Math.cos(hx);
      const cy = Math.cos(hy);
      const cz = Math.cos(hz);

      const sysz = sy * sz;
      const cysz = cy * sz;
      const sycz = sy * cz;
      const cycz = cy * cz;

      qx = sx * cycz + cx * sysz;
      qy = cx * sycz - sx * cysz;
      qz = cx * cysz + sx * sycz;
      qw = cx * cycz - sx * sysz;

      this._lastEuler = true;
      this._lastEulerVals[0] = x;
      this._lastEulerVals[1] = y;
      this._lastEulerVals[2] = z;
    }

    this.vectors.rotationChanged = setVec(quat, qx, qy, qz, qw);
  }

  /**
   * Gets the scale component of the transform.
   *
   * @returns {Float32Array} The scale component of the transform
   */
  getScale() {
    return this.vectors.scale;
  }

  /**
   * Sets the scale component of the transform.
   *
   * @param {number} [x] - The x dimension of the scale
   * @param {number} [y] - The y dimension of the scale
   * @param {number} [z] - The z dimension of the scale
   * @returns {void}
   */
  setScale(x, y, z) {
    this.vectors.scaleChanged = setVec(this.vectors.scale, x, y, z);
  }

  /**
   * Gets the align value of the transform.
   *
   * @returns {Float32Array} The align value of the transform
   */
  getAlign() {
    return this.offsets.align;
  }

  /**
   * Sets the align value of the transform.
   *
   * @param {number} [x] - The x dimension of the align
   * @param {number} [y] - The y dimension of the align
   * @param {number} [z] - The z dimension of the align
   * @returns {void}
   */
  setAlign(x, y, z) {
    this.offsets.alignChanged = setVec(this.offsets.align, x, y, z != null ? z - 0.5 : z);
  }

  /**
   * Gets the mount point value of the transform.
   *
   * @returns {Float32Array} The mount point of the transform
   */
  getMountPoint() {
    return this.offsets.mountPoint;
  }

  /**
   * Sets the mount point value of the transform.
   *
   * @param {number} [x] - The x dimension of the mount point
   * @param {number} [y] - The y dimension of the mount point
   * @param {number} [z] - The z dimension of the mount point
   * @returns {void}
   */
  setMountPoint(x, y, z) {
    this.offsets.mountPointChanged = setVec(this.offsets.mountPoint, x, y, z != null ? z - 0.5 : z);
  }

  /**
   * Gets the origin of the transform.
   *
   * @returns {Float32Array} The origin
   */
  getOrigin() {
    return this.offsets.origin;
  }

  /**
   * Sets the origin of the transform.
   *
   * @param {number} [x] - The x dimension of the origin
   * @param {number} [y] - The y dimension of the origin
   * @param {number} [z] - The z dimension of the origin
   * @returns {void}
   */
  setOrigin(x, y, z) {
    this.offsets.originChanged = setVec(this.offsets.origin, x, y, z != null ? z - 0.5 : z);
  }

  /**
   * Calculates the world matrix for this particular transform.
   *
   * @returns {boolean} Whether the world matrix changed
   */
  calculateWorldMatrix() {
    let nearestBreakPoint = this.parent;

    while (nearestBreakPoint && !nearestBreakPoint.isBreakPoint())
      nearestBreakPoint = nearestBreakPoint.parent;

    if (nearestBreakPoint)
      return multiply(this.global, nearestBreakPoint.getWorldTransform(), this.local);
    else {
      for (let i = 0; i < 16; i++) this.global[i] = this.local[i];
      return false;
    }
  }
}

// Static constants
Transform.IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
Transform.WORLD_CHANGED = 1;
Transform.LOCAL_CHANGED = 2;

module.exports = Transform;
