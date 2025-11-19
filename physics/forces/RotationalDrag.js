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

const TORQUE_REGISTER = new Vec3();

/**
 * A behavior that slows angular velocity by applying torque.
 *
 * @class RotationalDrag
 * @extends Force
 * @param {Particle[]} targets - The targets to affect.
 * @param {Object} options - options to set on drag
 */
class RotationalDrag extends Force {
  constructor(targets, options) {
    super(targets, options);
  }

  /**
   * Initialize the Force. Sets defaults if a property was not already set.
   *
   * @method init
   * @returns {void}
   */
  init() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || RotationalDrag.LINEAR;
  }

  /**
   * Adds a rotational drag force to a physics body's torque accumulator.
   *
   * @method update
   * @returns {void}
   */
  update() {
    const targets = this.targets;
    const type = this.type;
    const torque = TORQUE_REGISTER;
    const max = this.max;
    const strength = this.strength;

    for (let i = 0, len = targets.length; i < len; i++) {
      const target = targets[i];
      const omega = target.angularVelocity;
      const magnitude = -strength * type(omega);
      Vec3.scale(omega, magnitude < -max ? -max : magnitude, torque);
      target.applyTorque(torque);
    }
  }
}

/**
 * Used to scale angular velocity in the computation of the drag torque.
 *
 * @property {Function} QUADRATIC
 * @param {Vec3} omega - The angular velocity.
 * @returns {number} The scale by which to multiply.
 */
RotationalDrag.QUADRATIC = (omega) => omega.length();

/**
 * Used to scale angular velocity in the computation of the drag torque.
 *
 * @property {Function} LINEAR
 * @returns {number} The scale by which to multiply.
 */
RotationalDrag.LINEAR = () => 1;

module.exports = RotationalDrag;
