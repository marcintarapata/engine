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

const Position = require('./Position');

/**
 * Rotation is a component that allows the tweening of a Node's rotation. Rotation
 * happens about a Node's origin which is by default [0, 0, .5].
 *
 * @extends Position
 * @param {*} node - Node that the Rotation component will be attached to
 */
class Rotation extends Position {
  constructor(node) {
    super(node);

    const initial = node.getRotation();

    const x = initial[0];
    const y = initial[1];
    const z = initial[2];
    const w = initial[3];

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;

    let ty = 2 * (x * z + y * w);
    ty = ty < -1 ? -1 : ty > 1 ? 1 : ty;

    const rx = Math.atan2(2 * (x * w - y * z), 1 - 2 * (xx + yy));
    const ry = Math.asin(ty);
    const rz = Math.atan2(2 * (z * w - x * y), 1 - 2 * (yy + zz));

    this._x.set(rx);
    this._y.set(ry);
    this._z.set(rz);
  }

  /**
   * Return the name of the Rotation component.
   *
   * @returns {string} Name of the component
   */
  toString() {
    return 'Rotation';
  }

  /**
   * When the node this component is attached to updates, update the value
   * of the Node's rotation.
   *
   * @returns {void}
   */
  update() {
    this._node.setRotation(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
  }
}

Rotation.prototype.onUpdate = Rotation.prototype.update;

module.exports = Rotation;
