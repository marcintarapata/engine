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

const Transitionable = require('../transitions/Transitionable');

/**
 * The Position component serves as a way to tween to translation of a Node.
 * It is also the base class for the other core components that interact
 * with the Vec3 properties on the Node.
 *
 * @param {*} node - Node that the Position component will be attached to
 */
class Position {
  constructor(node) {
    this._node = node;
    this._id = node.addComponent(this);

    this._requestingUpdate = false;

    const initialPosition = node.getPosition();

    this._x = new Transitionable(initialPosition[0]);
    this._y = new Transitionable(initialPosition[1]);
    this._z = new Transitionable(initialPosition[2]);
  }

  /**
   * Return the name of the Position component.
   *
   * @returns {string} Name of the component
   */
  toString() {
    return 'Position';
  }

  /**
   * Gets object containing stringified constructor, and corresponding dimensional values.
   *
   * @returns {Object} The internal state of the component
   */
  getValue() {
    return {
      component: this.toString(),
      x: this._x.get(),
      y: this._y.get(),
      z: this._z.get(),
    };
  }

  /**
   * Set the translation of the Node.
   *
   * @param {Object} state - Object with component: stringified constructor, x: number, y: number, z: number
   * @returns {boolean} Status of the set
   */
  setValue(state) {
    if (this.toString() === state.component) {
      this.set(state.x, state.y, state.z);
      return true;
    }
    return false;
  }

  /**
   * Getter for X translation.
   *
   * @returns {number} The Node's translation along its x-axis
   */
  getX() {
    return this._x.get();
  }

  /**
   * Getter for Y translation.
   *
   * @returns {number} The Node's translation along its y-axis
   */
  getY() {
    return this._y.get();
  }

  /**
   * Getter for z translation.
   *
   * @returns {number} The Node's translation along its z-axis
   */
  getZ() {
    return this._z.get();
  }

  /**
   * Whether or not the Position is currently changing.
   *
   * @returns {boolean} Whether or not the Position is changing the Node's position
   */
  isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
  }

  /**
   * Decide whether the component needs to be updated on the next tick.
   *
   * @private
   * @returns {void}
   */
  _checkUpdate() {
    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
  }

  /**
   * When the node this component is attached to updates, update the value
   * of the Node's position.
   *
   * @returns {void}
   */
  update() {
    this._node.setPosition(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
  }

  /**
   * Setter for X position.
   *
   * @param {number} val - Used to set x coordinate
   * @param {Object} [transition] - Options for the transition
   * @param {Function} [callback] - Function to execute after setting X
   * @returns {Position} This instance for chaining
   */
  setX(val, transition, callback) {
    if (!this._requestingUpdate) {
      this._node.requestUpdate(this._id);
      this._requestingUpdate = true;
    }

    this._x.set(val, transition, callback);
    return this;
  }

  /**
   * Setter for Y position.
   *
   * @param {number} val - Used to set y coordinate
   * @param {Object} [transition] - Options for the transition
   * @param {Function} [callback] - Function to execute after setting Y
   * @returns {Position} This instance for chaining
   */
  setY(val, transition, callback) {
    if (!this._requestingUpdate) {
      this._node.requestUpdate(this._id);
      this._requestingUpdate = true;
    }

    this._y.set(val, transition, callback);
    return this;
  }

  /**
   * Setter for Z position.
   *
   * @param {number} val - Used to set z coordinate
   * @param {Object} [transition] - Options for the transition
   * @param {Function} [callback] - Function to execute after setting Z
   * @returns {Position} This instance for chaining
   */
  setZ(val, transition, callback) {
    if (!this._requestingUpdate) {
      this._node.requestUpdate(this._id);
      this._requestingUpdate = true;
    }

    this._z.set(val, transition, callback);
    return this;
  }

  /**
   * Setter for X, Y, and Z positions.
   *
   * @param {number} [x] - Used to set x coordinate
   * @param {number} [y] - Used to set y coordinate
   * @param {number} [z] - Used to set z coordinate
   * @param {Object} [transition] - Options for the transition
   * @param {Function} [callback] - Function to execute after setting
   * @returns {Position} This instance for chaining
   */
  set(x, y, z, transition, callback) {
    if (!this._requestingUpdate) {
      this._node.requestUpdate(this._id);
      this._requestingUpdate = true;
    }

    let xCallback;
    let yCallback;
    let zCallback;

    if (z != null) {
      zCallback = callback;
    } else if (y != null) {
      yCallback = callback;
    } else if (x != null) {
      xCallback = callback;
    }

    if (x != null) this._x.set(x, transition, xCallback);
    if (y != null) this._y.set(y, transition, yCallback);
    if (z != null) this._z.set(z, transition, zCallback);

    return this;
  }

  /**
   * Stops transition of Position component.
   *
   * @returns {Position} This instance for chaining
   */
  halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
  }
}

Position.prototype.onUpdate = Position.prototype.update;

module.exports = Position;
