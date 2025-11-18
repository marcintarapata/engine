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

const FORCE_REGISTER = new Vec3();

/**
 * An inverse square force dependent on the masses of the source and targets.
 *
 * @class Gravity3D
 * @extends Force
 * @param {Particle} source - The optional source of the attraction field.
 * @param {Particle[]} targets - The targets to affect.
 * @param {Object} options - The options hash.
 */
class Gravity3D extends Force {
  constructor(source, targets, options) {
    super(targets, options);
    this.source = source || null;
  }

  /**
   * Initialize the Force. Sets defaults if a property was not already set.
   *
   * @method init
   * @returns {void}
   */
  init() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 200;
  }

  /**
   * Apply the force.
   *
   * @method update
   * @returns {void}
   */
  update() {
    const source = this.source;
    const targets = this.targets;
    const force = FORCE_REGISTER;
    const strength = this.strength;
    const max = this.max;
    const anchor = this.anchor || source.position;
    const sourceMass = this.anchor ? 1 : source.mass;

    for (let i = 0, len = targets.length; i < len; i++) {
      const target = targets[i];
      Vec3.subtract(anchor, target.position, force);
      const dist = force.length();
      const invDistance = dist ? 1 / dist : 0;
      let magnitude = strength * sourceMass * target.mass * invDistance * invDistance;
      if (magnitude < 0) {
        magnitude = magnitude < -max ? -max : magnitude;
      } else {
        magnitude = magnitude > max ? max : magnitude;
      }
      force.scale(magnitude * invDistance);
      target.applyForce(force);
      if (source) source.applyForce(force.invert());
    }
  }
}

module.exports = Gravity3D;
