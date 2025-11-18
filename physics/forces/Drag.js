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
 * Use drag to oppose momentum of a moving object
 *
 * @class Drag
 * @extends Force
 * @param {Particle[]} targets - The targets to affect.
 * @param {Object} options - The options hash.
 */
class Drag extends Force {
  constructor(targets, options) {
    super(targets, options);
  }

  /**
   * Initialize the Force. Sets defaults if a property was not already set.
   *
   * @method init
   * @param {Object} options - The options hash.
   * @returns {void}
   */
  init() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || Drag.LINEAR;
  }

  /**
   * Apply the force.
   *
   * @method update
   * @returns {void}
   */
  update() {
    const targets = this.targets;
    const type = this.type;
    const force = FORCE_REGISTER;
    const max = this.max;
    const strength = this.strength;

    for (let i = 0, len = targets.length; i < len; i++) {
      const target = targets[i];
      const velocity = target.velocity;
      const v = velocity.length();
      const invV = v ? 1 / v : 0;
      const magnitude = -strength * type(v);
      Vec3.scale(velocity, (magnitude < -max ? -max : magnitude) * invV, force);
      target.applyForce(force);
    }
  }
}

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @property {Function} QUADRATIC
 * @param {number} v - The speed.
 * @returns {number} The scale by which to multiply.
 */
Drag.QUADRATIC = (v) => v * v;

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @property {Function} LINEAR
 * @param {number} v - The speed.
 * @returns {number} The scale by which to multiply.
 */
Drag.LINEAR = (v) => v;

module.exports = Drag;
