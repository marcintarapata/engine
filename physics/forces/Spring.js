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
const DAMPING_REGISTER = new Vec3();

const PI = Math.PI;

/**
 * A force that accelerates a Particle towards a specific anchor point. Can be anchored to
 * a Vec3 or another source Particle.
 *
 * @class Spring
 * @extends Force
 * @param {Particle} source - The optional source of the spring.
 * @param {Particle[]} targets - The targets to affect.
 * @param {Object} options - The options hash.
 */
class Spring extends Force {
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
    this.max = this.max || Infinity;
    this.length = this.length || 0;
    this.type = this.type || Spring.HOOKE;
    this.maxLength = this.maxLength || Infinity;
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
   * Apply the force.
   *
   * @method update
   * @returns {void}
   */
  update() {
    const source = this.source;
    const targets = this.targets;
    const force = FORCE_REGISTER;
    const dampingForce = DAMPING_REGISTER;
    const max = this.max;
    let stiffness = this.stiffness;
    let damping = this.damping;
    const restLength = this.length;
    const maxLength = this.maxLength;
    const anchor = this.anchor || source.position;
    const invSourceMass = this.anchor ? 0 : source.inverseMass;
    const type = this.type;

    for (let i = 0, len = targets.length; i < len; i++) {
      const target = targets[i];
      Vec3.subtract(anchor, target.position, force);
      const dist = force.length();
      const stretch = dist - restLength;

      if (Math.abs(stretch) < 1e-6) continue;

      const effMass = 1 / (target.inverseMass + invSourceMass);
      if (this.period !== null) {
        stiffness *= effMass;
        damping *= effMass;
      }

      force.scale(stiffness * type(stretch, maxLength) / stretch);

      if (damping !== 0) {
        if (source) {
          force.add(Vec3.subtract(target.velocity, source.velocity, dampingForce).scale(-damping));
        } else {
          force.add(Vec3.scale(target.velocity, -damping, dampingForce));
        }
      }

      const magnitude = force.length();
      const invMag = magnitude ? 1 / magnitude : 0;

      Vec3.scale(force, (magnitude > max ? max : magnitude) * invMag, force);

      target.applyForce(force);
      if (source) source.applyForce(force.invert());
    }
  }
}

/**
 * A FENE (Finitely Extensible Nonlinear Elastic) spring force. See: http://en.wikipedia.org/wiki/FENE
 *
 * @property {Function} FENE
 * @param {number} dist - Current distance from source body.
 * @param {number} rMax - Maximum range of influence.
 * @returns {number} unscaled force
 */
Spring.FENE = (dist, rMax) => {
  const rMaxSmall = rMax * 0.99;
  const r = Math.max(Math.min(dist, rMaxSmall), -rMaxSmall);
  return r / (1 - r * r / (rMax * rMax));
};

/**
 * A Hookean spring force, linear in the displacement
 * see: http://en.wikipedia.org/wiki/Hooke's_law
 *
 * @property {Function} HOOKE
 * @param {number} dist - Current distance from source body.
 * @returns {number} unscaled force
 */
Spring.HOOKE = (dist) => dist;

module.exports = Spring;
