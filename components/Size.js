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
const SizeSystem = require('../core/SizeSystem');

/**
 * Size component used for managing the size of the Node it is attached to.
 * Supports absolute and relative (proportional and differential) sizing.
 *
 * @param {*} node - Node that the Size component is attached to
 */
class Size {
  constructor(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._requestingUpdate = false;

    const initialProportionalSize = node.getProportionalSize();
    const initialDifferentialSize = node.getDifferentialSize();
    const initialAbsoluteSize = node.getAbsoluteSize();

    this._proportional = {
      x: new Transitionable(initialProportionalSize[0]),
      y: new Transitionable(initialProportionalSize[1]),
      z: new Transitionable(initialProportionalSize[2]),
    };
    this._differential = {
      x: new Transitionable(initialDifferentialSize[0]),
      y: new Transitionable(initialDifferentialSize[1]),
      z: new Transitionable(initialDifferentialSize[2]),
    };
    this._absolute = {
      x: new Transitionable(initialAbsoluteSize[0]),
      y: new Transitionable(initialAbsoluteSize[1]),
      z: new Transitionable(initialAbsoluteSize[2]),
    };
  }

  /**
   * Set which mode each axis of Size will have its dimensions
   * calculated by. Size can be calculated by absolute pixel definitions,
   * relative to its parent, or by the size of its renderables.
   *
   * @param {number} x - The mode of size for the width
   * @param {number} y - The mode of size for the height
   * @param {number} z - The mode of size for the depth
   * @returns {Size} This instance for chaining
   */
  setMode(x, y, z) {
    this._node.setSizeMode(x, y, z);
    return this;
  }

  /**
   * Return the name of the Size component.
   *
   * @returns {string} Name of the component
   */
  toString() {
    return 'Size';
  }

  /**
   * Returns serialized state of the component.
   *
   * @returns {Object} The internal state of the component
   */
  getValue() {
    return {
      sizeMode: SizeSystem.get(this._node.getLocation()).getSizeMode(),
      absolute: {
        x: this._absolute.x.get(),
        y: this._absolute.y.get(),
        z: this._absolute.z.get(),
      },
      differential: {
        x: this._differential.x.get(),
        y: this._differential.y.get(),
        z: this._differential.z.get(),
      },
      proportional: {
        x: this._proportional.x.get(),
        y: this._proportional.y.get(),
        z: this._proportional.z.get(),
      },
    };
  }

  /**
   * Updates state of component.
   *
   * @param {Object} state - State encoded in same format as state retrieved through `getValue`
   * @returns {boolean} Boolean indicating whether the new state has been applied
   */
  setValue(state) {
    if (this.toString() === state.component) {
      this.setMode.apply(this, state.sizeMode);
      if (state.absolute) {
        this.setAbsolute(state.absolute.x, state.absolute.y, state.absolute.z);
      }
      if (state.differential) {
        this.setAbsolute(state.differential.x, state.differential.y, state.differential.z);
      }
      if (state.proportional) {
        this.setAbsolute(state.proportional.x, state.proportional.y, state.proportional.z);
      }
    }
    return false;
  }

  /**
   * Helper function that grabs the activity of a certain type of size.
   *
   * @private
   * @param {Object} type - Representation of a type of the sizing model
   * @returns {boolean} Boolean indicating whether the type is active
   */
  _isActive(type) {
    return type.x.isActive() || type.y.isActive() || type.z.isActive();
  }

  /**
   * Checks if any size transitions are active.
   *
   * @returns {boolean} Boolean indicating whether the new state has been applied
   */
  isActive() {
    return (
      this._isActive(this._absolute) ||
      this._isActive(this._proportional) ||
      this._isActive(this._differential)
    );
  }

  /**
   * When the node this component is attached to updates, update the value
   * of the Node's size.
   *
   * @returns {void}
   */
  onUpdate() {
    const abs = this._absolute;
    this._node.setAbsoluteSize(abs.x.get(), abs.y.get(), abs.z.get());
    const prop = this._proportional;
    const diff = this._differential;
    this._node.setProportionalSize(prop.x.get(), prop.y.get(), prop.z.get());
    this._node.setDifferentialSize(diff.x.get(), diff.y.get(), diff.z.get());

    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
  }

  /**
   * Applies absolute size.
   *
   * @param {number} [x] - Used to set absolute size in x-direction (width)
   * @param {number} [y] - Used to set absolute size in y-direction (height)
   * @param {number} [z] - Used to set absolute size in z-direction (depth)
   * @param {Object} [options] - Options hash
   * @param {Function} [callback] - Callback function to be executed after the transitions have been completed
   * @returns {void}
   */
  setAbsolute(x, y, z, options, callback) {
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

    const abs = this._absolute;
    if (x != null) {
      abs.x.set(x, options, xCallback);
    }
    if (y != null) {
      abs.y.set(y, options, yCallback);
    }
    if (z != null) {
      abs.z.set(z, options, zCallback);
    }
  }

  /**
   * Applies proportional size.
   *
   * @param {number} [x] - Used to set proportional size in x-direction (width)
   * @param {number} [y] - Used to set proportional size in y-direction (height)
   * @param {number} [z] - Used to set proportional size in z-direction (depth)
   * @param {Object} [options] - Options hash
   * @param {Function} [callback] - Callback function to be executed after the transitions have been completed
   * @returns {Size} This instance for chaining
   */
  setProportional(x, y, z, options, callback) {
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

    const prop = this._proportional;
    if (x != null) {
      prop.x.set(x, options, xCallback);
    }
    if (y != null) {
      prop.y.set(y, options, yCallback);
    }
    if (z != null) {
      prop.z.set(z, options, zCallback);
    }
    return this;
  }

  /**
   * Applies differential size to Size component.
   *
   * @param {number} [x] - Used to set differential size in x-direction (width)
   * @param {number} [y] - Used to set differential size in y-direction (height)
   * @param {number} [z] - Used to set differential size in z-direction (depth)
   * @param {Object} [options] - Options hash
   * @param {Function} [callback] - Callback function to be executed after the transitions have been completed
   * @returns {Size} This instance for chaining
   */
  setDifferential(x, y, z, options, callback) {
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

    const diff = this._differential;
    if (x != null) {
      diff.x.set(x, options, xCallback);
    }
    if (y != null) {
      diff.y.set(y, options, yCallback);
    }
    if (z != null) {
      diff.z.set(z, options, zCallback);
    }
    return this;
  }

  /**
   * Retrieves the computed size applied to the underlying Node.
   *
   * @returns {Array} Three dimensional computed size
   */
  get() {
    return this._node.getSize();
  }

  /**
   * Halts all currently active size transitions.
   *
   * @returns {Size} This instance for chaining
   */
  halt() {
    this._proportional.x.halt();
    this._proportional.y.halt();
    this._proportional.z.halt();
    this._differential.x.halt();
    this._differential.y.halt();
    this._differential.z.halt();
    this._absolute.x.halt();
    this._absolute.y.halt();
    this._absolute.z.halt();
    return this;
  }
}

Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

module.exports = Size;
