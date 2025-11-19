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

const Particle = require('./Particle');
const Mat33 = require('../../math/Mat33');
const Vec3 = require('../../math/Vec3');
const Geometry = require('../Geometry');
const ConvexHull = Geometry.ConvexHull;

const TEMP_REGISTER = new Vec3();

/**
 * Determines mass and inertia tensor based off the density, size, and facet information of the polyhedron.
 *
 * @method _computeInertiaProperties
 * @private
 * @param {Mat33} T - The matrix transforming the initial set of vertices to a set reflecting the body size.
 * @returns {void}
 */
function _computeInertiaProperties(T) {
  const polyhedralProperties = this.hull.polyhedralProperties;
  const T_values = T.get();
  const detT = T_values[0] * T_values[4] * T_values[8];

  const E_o = polyhedralProperties.eulerTensor;

  const E = new Mat33();
  Mat33.multiply(T, E_o, E);
  Mat33.multiply(E, T, E);
  const E_values = E.get();

  const Exx = E_values[0];
  const Eyy = E_values[4];
  const Ezz = E_values[8];
  const Exy = E_values[1];
  const Eyz = E_values[7];
  const Exz = E_values[2];

  const newVolume = polyhedralProperties.volume * detT;
  const mass = this.mass;
  const density = mass / newVolume;

  let Ixx = Eyy + Ezz;
  let Iyy = Exx + Ezz;
  let Izz = Exx + Eyy;
  let Ixy = -Exy;
  let Iyz = -Eyz;
  let Ixz = -Exz;

  const centroid = polyhedralProperties.centroid;

  Ixx -= newVolume * (centroid.y * centroid.y + centroid.z * centroid.z);
  Iyy -= newVolume * (centroid.z * centroid.z + centroid.x * centroid.x);
  Izz -= newVolume * (centroid.x * centroid.x + centroid.y * centroid.y);
  Ixy += newVolume * centroid.x * centroid.y;
  Iyz += newVolume * centroid.y * centroid.z;
  Ixz += newVolume * centroid.z * centroid.x;

  Ixx *= density * detT;
  Iyy *= density * detT;
  Izz *= density * detT;
  Ixy *= density * detT;
  Iyz *= density * detT;
  Ixz *= density * detT;

  const inertia = [
    Ixx, Ixy, Ixz,
    Ixy, Iyy, Iyz,
    Ixz, Iyz, Izz
  ];

  this.localInertia.set(inertia);
  Mat33.inverse(this.localInertia, this.localInverseInertia);
}

/**
 * Returns a constructor for a physical body reflecting the shape defined by input ConvexHull or Vec3 array.
 *
 * @method convexBodyFactory
 * @param {ConvexHull | Vec3[]} hull - ConvexHull instance or Vec3 array.
 * @returns {Function} The constructor for the custom convex body type.
 */
function convexBodyFactory(hull) {
  if (!(hull instanceof ConvexHull)) {
    if (!(hull instanceof Array)) throw new Error('convexBodyFactory requires a ConvexHull object or an array of Vec3\'s as input.');
    else hull = new ConvexHull(hull);
  }

  /**
   * The body class with inertia and vertices inferred from the input ConvexHull or Vec3 array.
   *
   * @class ConvexBody
   * @param {Object} options - The options hash.
   */
  class ConvexBody extends Particle {
    constructor(options) {
      super(options);

      const originalSize = hull.polyhedralProperties.size;
      const size = options.size || originalSize;

      const scaleX = size[0] / originalSize[0];
      const scaleY = size[1] / originalSize[1];
      const scaleZ = size[2] / originalSize[2];

      this._scale = [scaleX, scaleY, scaleZ];

      const T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

      this.hull = hull;

      this.vertices = [];
      for (let i = 0, len = hull.vertices.length; i < len; i++) {
        this.vertices.push(T.vectorMultiply(hull.vertices[i], new Vec3()));
      }

      _computeInertiaProperties.call(this, T);
      this.inverseInertia.copy(this.localInverseInertia);
      this.updateInertia();

      const w = options.angularVelocity;
      if (w) this.setAngularVelocity(w.x, w.y, w.z);
    }

    /**
     * Set the size and recalculate
     *
     * @method setSize
     * @chainable
     * @param {number} x - The x span.
     * @param {number} y - The y span.
     * @param {number} z - The z span.
     * @returns {ConvexBody} this
     */
    setSize(x, y, z) {
      const originalSize = hull.polyhedralProperties.size;

      this.size[0] = x;
      this.size[1] = y;
      this.size[2] = z;

      const scaleX = x / originalSize[0];
      const scaleY = y / originalSize[1];
      const scaleZ = z / originalSize[2];

      this._scale = [scaleX, scaleY, scaleZ];

      const T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

      const vertices = this.vertices;
      for (let i = 0, len = hull.vertices.length; i < len; i++) {
        T.vectorMultiply(hull.vertices[i], vertices[i]);
      }

      return this;
    }

    /**
     * Update the local inertia and inverse inertia to reflect the current size.
     *
     * @method updateLocalInertia
     * @returns {ConvexBody} this
     */
    updateLocalInertia() {
      const scaleX = this._scale[0];
      const scaleY = this._scale[1];
      const scaleZ = this._scale[2];

      const T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

      _computeInertiaProperties.call(this, T);

      return this;
    }

    /**
     * Retrieve the vertex furthest in a direction. Used internally for collision detection.
     *
     * @method support
     * @param {Vec3} direction - The direction in which to search.
     * @returns {Vec3} The furthest vertex.
     */
    support(direction) {
      const vertices = this.vertices;
      let vertex, dot, furthest;
      let max = -Infinity;
      for (let i = 0, len = vertices.length; i < len; i++) {
        vertex = vertices[i];
        dot = Vec3.dot(vertex, direction);
        if (dot > max) {
          furthest = vertex;
          max = dot;
        }
      }
      return furthest;
    }

    /**
     * Update vertices to reflect current orientation.
     *
     * @method updateShape
     * @returns {ConvexBody} this
     */
    updateShape() {
      const vertices = this.vertices;
      const q = this.orientation;
      const modelVertices = this.hull.vertices;

      const scaleX = this._scale[0];
      const scaleY = this._scale[1];
      const scaleZ = this._scale[2];

      const t = TEMP_REGISTER;
      for (let i = 0, len = vertices.length; i < len; i++) {
        t.copy(modelVertices[i]);
        t.x *= scaleX;
        t.y *= scaleY;
        t.z *= scaleZ;
        Vec3.applyRotation(t, q, vertices[i]);
      }

      return this;
    }
  }

  return ConvexBody;
}

module.exports = convexBodyFactory;
