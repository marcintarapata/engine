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

const Vec3 = require('../../math/Vec3');
const Quaternion = require('../../math/Quaternion');
const Mat33 = require('../../math/Mat33');
const CallbackStore = require('../../utilities/CallbackStore');

const ZERO_VECTOR = new Vec3();
const MAT1_REGISTER = new Mat33();

let _ID = 0;

/**
 * Fundamental physical body. Maintains translational and angular momentum, position and orientation, and other properties
 * such as size and coefficients of restitution and friction used in collision response.
 *
 * @class Particle
 * @param {Object} options - Initial state of the body.
 */
class Particle {
  constructor(options) {
    this.events = new CallbackStore();

    options = options || {};

    this.position = options.position || new Vec3();
    this.orientation = options.orientation || new Quaternion();

    this.velocity = new Vec3();
    this.momentum = new Vec3();
    this.angularVelocity = new Vec3();
    this.angularMomentum = new Vec3();

    this.mass = options.mass || 1;
    this.inverseMass = 1 / this.mass;

    this.force = new Vec3();
    this.torque = new Vec3();

    this.restitution = options.restitution != null ? options.restitution : 0.4;
    this.friction = options.friction != null ? options.friction : 0.2;

    this.inverseInertia = new Mat33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.localInertia = new Mat33([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.localInverseInertia = new Mat33([0, 0, 0, 0, 0, 0, 0, 0, 0]);

    this.size = options.size || [0, 0, 0];

    const v = options.velocity;
    if (v) this.setVelocity(v.x, v.y, v.z);

    this.restrictions = 0;
    this.setRestrictions.apply(this, options.restrictions || []);

    this.collisionMask = options.collisionMask || 1;
    this.collisionGroup = options.collisionGroup || 1;

    this.type = 1 << 0;

    this._ID = _ID++;
  }

  /**
   * Listen for a specific event.
   *
   * @method on
   * @param {string} key - Name of the event.
   * @param {Function} callback - Callback to register for the event.
   * @returns {Particle} this
   */
  on(key, callback) {
    this.events.on(key, callback);
    return this;
  }

  /**
   * Stop listening for a specific event.
   *
   * @method off
   * @param {string} key - Name of the event.
   * @param {Function} callback - Callback to deregister for the event.
   * @returns {Particle} this
   */
  off(key, callback) {
    this.events.off(key, callback);
    return this;
  }

  /**
   * Trigger an event.
   *
   * @method trigger
   * @param {string} key - Name of the event.
   * @param {Object} payload - Payload to pass to the event listeners.
   * @returns {Particle} this
   */
  trigger(key, payload) {
    this.events.trigger(key, payload);
    return this;
  }

  /**
   * Getter for the restriction bitmask. Converts the restrictions to their string representation.
   *
   * @method getRestrictions
   * @returns {string[]} restrictions
   */
  getRestrictions() {
    let linear = '';
    let angular = '';
    const restrictions = this.restrictions;
    if (restrictions & 32) linear += 'x';
    if (restrictions & 16) linear += 'y';
    if (restrictions & 8) linear += 'z';
    if (restrictions & 4) angular += 'x';
    if (restrictions & 2) angular += 'y';
    if (restrictions & 1) angular += 'z';

    return [linear, angular];
  }

  /**
   * Setter for the particle restriction bitmask.
   *
   * @method setRestrictions
   * @param {string} transRestrictions - The restrictions to linear motion.
   * @param {string} rotRestrictions - The restrictions to rotational motion.
   * @returns {Particle} this
   */
  setRestrictions(transRestrictions, rotRestrictions) {
    transRestrictions = transRestrictions || '';
    rotRestrictions = rotRestrictions || '';
    this.restrictions = 0;
    if (transRestrictions.indexOf('x') > -1) this.restrictions |= 32;
    if (transRestrictions.indexOf('y') > -1) this.restrictions |= 16;
    if (transRestrictions.indexOf('z') > -1) this.restrictions |= 8;
    if (rotRestrictions.indexOf('x') > -1) this.restrictions |= 4;
    if (rotRestrictions.indexOf('y') > -1) this.restrictions |= 2;
    if (rotRestrictions.indexOf('z') > -1) this.restrictions |= 1;
    return this;
  }

  /**
   * Getter for mass
   *
   * @method getMass
   * @returns {number} mass
   */
  getMass() {
    return this.mass;
  }

  /**
   * Set the mass of the Particle.
   *
   * @method setMass
   * @param {number} mass - The mass.
   * @returns {Particle} this
   */
  setMass(mass) {
    this.mass = mass;
    this.inverseMass = 1 / mass;
    return this;
  }

  /**
   * Getter for inverse mass
   *
   * @method getInverseMass
   * @returns {number} inverse mass
   */
  getInverseMass() {
    return this.inverseMass;
  }

  /**
   * Resets the inertia tensor and its inverse to reflect the current shape.
   *
   * @method updateLocalInertia
   * @returns {Particle} this
   */
  updateLocalInertia() {
    this.localInertia.set([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.localInverseInertia.set([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    return this;
  }

  /**
   * Updates the world inverse inertia tensor.
   *
   * @method updateInertia
   * @returns {Particle} this
   */
  updateInertia() {
    const localInvI = this.localInverseInertia;
    const q = this.orientation;
    if ((localInvI[0] === localInvI[4] && localInvI[4] === localInvI[8]) || q.w === 1) return this;
    const R = q.toMatrix(MAT1_REGISTER);
    Mat33.multiply(R, this.inverseInertia, this.inverseInertia);
    Mat33.multiply(this.localInverseInertia, R.transpose(), this.inverseInertia);
    return this;
  }

  /**
   * Getter for position
   *
   * @method getPosition
   * @returns {Vec3} position
   */
  getPosition() {
    return this.position;
  }

  /**
   * Setter for position
   *
   * @method setPosition
   * @param {number} x - the x coordinate for position
   * @param {number} y - the y coordinate for position
   * @param {number} z - the z coordinate for position
   * @returns {Particle} this
   */
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    return this;
  }

  /**
   * Getter for velocity
   *
   * @method getVelocity
   * @returns {Vec3} velocity
   */
  getVelocity() {
    return this.velocity;
  }

  /**
   * Setter for velocity
   *
   * @method setVelocity
   * @param {number} x - the x coordinate for velocity
   * @param {number} y - the y coordinate for velocity
   * @param {number} z - the z coordinate for velocity
   * @returns {Particle} this
   */
  setVelocity(x, y, z) {
    this.velocity.set(x, y, z);
    Vec3.scale(this.velocity, this.mass, this.momentum);
    return this;
  }

  /**
   * Getter for momentum
   *
   * @method getMomentum
   * @returns {Vec3} momentum
   */
  getMomentum() {
    return this.momentum;
  }

  /**
   * Setter for momentum
   *
   * @method setMomentum
   * @param {number} x - the x coordinate for momentum
   * @param {number} y - the y coordinate for momentum
   * @param {number} z - the z coordinate for momentum
   * @returns {Particle} this
   */
  setMomentum(x, y, z) {
    this.momentum.set(x, y, z);
    Vec3.scale(this.momentum, this.inverseMass, this.velocity);
    return this;
  }

  /**
   * Getter for orientation
   *
   * @method getOrientation
   * @returns {Quaternion} orientation
   */
  getOrientation() {
    return this.orientation;
  }

  /**
   * Setter for orientation
   *
   * @method setOrientation
   * @param {number} w - The w component.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {Particle} this
   */
  setOrientation(w, x, y, z) {
    this.orientation.set(w, x, y, z).normalize();
    this.updateInertia();
    return this;
  }

  /**
   * Getter for angular velocity
   *
   * @method getAngularVelocity
   * @returns {Vec3} angularVelocity
   */
  getAngularVelocity() {
    return this.angularVelocity;
  }

  /**
   * Setter for angular velocity
   *
   * @method setAngularVelocity
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {Particle} this
   */
  setAngularVelocity(x, y, z) {
    this.angularVelocity.set(x, y, z);
    const I = Mat33.inverse(this.inverseInertia, MAT1_REGISTER);
    if (I) I.vectorMultiply(this.angularVelocity, this.angularMomentum);
    else this.angularMomentum.clear();
    return this;
  }

  /**
   * Getter for angular momentum
   *
   * @method getAngularMomentum
   * @returns {Vec3} angular momentum
   */
  getAngularMomentum() {
    return this.angularMomentum;
  }

  /**
   * Setter for angular momentum
   *
   * @method setAngularMomentum
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {Particle} this
   */
  setAngularMomentum(x, y, z) {
    this.angularMomentum.set(x, y, z);
    this.inverseInertia.vectorMultiply(this.angularMomentum, this.angularVelocity);
    return this;
  }

  /**
   * Getter for the force on the Particle
   *
   * @method getForce
   * @returns {Vec3} force
   */
  getForce() {
    return this.force;
  }

  /**
   * Setter for the force on the Particle
   *
   * @method setForce
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {Particle} this
   */
  setForce(x, y, z) {
    this.force.set(x, y, z);
    return this;
  }

  /**
   * Getter for torque.
   *
   * @method getTorque
   * @returns {Vec3} torque
   */
  getTorque() {
    return this.torque;
  }

  /**
   * Setter for torque.
   *
   * @method setTorque
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {Particle} this
   */
  setTorque(x, y, z) {
    this.torque.set(x, y, z);
    return this;
  }

  /**
   * Extends Particle.applyForce with an optional argument
   * to apply the force at an off-centered location, resulting in a torque.
   *
   * @method applyForce
   * @param {Vec3} force - Force to apply.
   * @returns {Particle} this
   */
  applyForce(force) {
    this.force.add(force);
    return this;
  }

  /**
   * Applied a torque force to a Particle, inducing a rotation.
   *
   * @method applyTorque
   * @param {Vec3} torque - Torque to apply.
   * @returns {Particle} this
   */
  applyTorque(torque) {
    this.torque.add(torque);
    return this;
  }

  /**
   * Applies an impulse to momentum and updates velocity.
   *
   * @method applyImpulse
   * @param {Vec3} impulse - Impulse to apply.
   * @returns {Particle} this
   */
  applyImpulse(impulse) {
    this.momentum.add(impulse);
    Vec3.scale(this.momentum, this.inverseMass, this.velocity);
    return this;
  }

  /**
   * Applies an angular impulse to angular momentum and updates angular velocity.
   *
   * @method applyAngularImpulse
   * @param {Vec3} angularImpulse - Angular impulse to apply.
   * @returns {Particle} this
   */
  applyAngularImpulse(angularImpulse) {
    this.angularMomentum.add(angularImpulse);
    this.inverseInertia.vectorMultiply(this.angularMomentum, this.angularVelocity);
    return this;
  }

  /**
   * Used in collision detection. The support function should accept a Vec3 direction
   * and return the point on the body's shape furthest in that direction. For point particles,
   * this returns the zero vector.
   *
   * @method support
   * @returns {Vec3} The zero vector.
   */
  support() {
    return ZERO_VECTOR;
  }

  /**
   * Update the body's shape to reflect current orientation. Called in Collision.
   * Noop for point particles.
   *
   * @method updateShape
   * @returns {void}
   */
  updateShape() {}
}

module.exports = Particle;
