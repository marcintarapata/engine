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

const Force = require('./Force');
const Vec3 = require('../../math/Vec3');
const Mat33 = require('../../math/Mat33');
const Quaternion = require('../../math/Quaternion');

const Q_REGISTER = new Quaternion();
const DAMPING_REGISTER = new Vec3();
const XYZ_REGISTER = new Vec3();
const MAT_REGISTER = new Mat33();

const PI = Math.PI;

/**
 * A spring-like behavior that attempts to enforce a specific orientation by applying torque.
 *
 * @class RotationalSpring
 * @extends Force
 * @param {Particle} source - The optional source of the spring.
 * @param {Particle[]} targets - The targets to affect.
 * @param {Object} options - The options hash.
 */
class RotationalSpring extends Force {
  constructor(source, targets, options) {
    super(targets, options);
    this.source = source || null;
  }

  /**
   * Initialize the Force. Sets defaults if a property was not already set.
   *
   * @method init
   * @param {Object} options - The options hash.
   * @returns {void}
   */
  init(options) {
    if (!this.source) this.anchor = this.anchor ? this.anchor.normalize() : new Quaternion(1, 0, 0, 0);
    if (options.stiffness || options.damping) {
      this.stiffness = this.stiffness || 100;
      this.damping = this.damping || 0;
      this.period = null;
      this.dampingRatio = null;
    } else if (options.period || options.dampingRatio) {
      this.period = this.period || 1;
      this.dampingRatio = this.dampingRatio || 0;

      this.stiffness = 2 * PI / this.period;
      this.stiffness *= this.stiffness;
      this.damping = 4 * PI * this.dampingRatio / this.period;
    }
  }

  /**
   * Adds a torque force to a physics body's torque accumulator.
   *
   * @method update
   * @returns {void}
   */
  update() {
    const source = this.source;
    const targets = this.targets;
    const deltaQ = Q_REGISTER;
    const dampingTorque = DAMPING_REGISTER;
    const XYZ = XYZ_REGISTER;
    const effInertia = MAT_REGISTER;
    const max = this.max;
    const stiffness = this.stiffness;
    const damping = this.damping;
    const anchor = this.anchor || source.orientation;
    const invSourceInertia = this.anchor ? null : source.inverseInertia;

    for (let i = 0, len = targets.length; i < len; i++) {
      const target = targets[i];
      const q = target.orientation;
      Quaternion.conjugate(q, deltaQ);
      deltaQ.multiply(anchor);

      if (deltaQ.w >= 1) continue;
      const halftheta = Math.acos(deltaQ.w);
      const length = Math.sqrt(1 - deltaQ.w * deltaQ.w);

      const deltaOmega = XYZ.copy(deltaQ).scale(2 * halftheta / length);

      deltaOmega.scale(stiffness);

      if (invSourceInertia !== null) {
        Mat33.add(invSourceInertia, target.inverseInertia, effInertia).inverse();
      } else {
        Mat33.inverse(target.inverseInertia, effInertia);
      }

      if (damping !== 0) {
        if (source) {
          deltaOmega.add(Vec3.subtract(target.angularVelocity, source.angularVelocity, dampingTorque).scale(-damping));
        } else {
          deltaOmega.add(Vec3.scale(target.angularVelocity, -damping, dampingTorque));
        }
      }

      const torque = deltaOmega.applyMatrix(effInertia);
      const magnitude = torque.length();

      if (magnitude > max) torque.scale(max / magnitude);

      target.applyTorque(torque);
      if (source) source.applyTorque(torque.invert());
    }
  }
}

module.exports = RotationalSpring;
