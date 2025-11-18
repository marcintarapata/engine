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

/**
 * A lightweight, featureless EventEmitter for managing callbacks.
 */
class CallbackStore {
  constructor() {
    this._events = {};
  }

  /**
   * Adds a listener for the specified event (= key).
   *
   * @param {string} key - The event type (e.g. `click`)
   * @param {Function} callback - A callback function to be invoked whenever the event is triggered
   * @returns {Function} A destroy function to remove the callback
   */
  on(key, callback) {
    if (!this._events[key]) {
      this._events[key] = [];
    }
    const callbackList = this._events[key];
    callbackList.push(callback);
    return () => {
      callbackList.splice(callbackList.indexOf(callback), 1);
    };
  }

  /**
   * Removes a previously added event listener.
   *
   * @param {string} key - The event type from which the callback should be removed
   * @param {Function} callback - The callback function to be removed
   * @returns {CallbackStore} this instance for chaining
   */
  off(key, callback) {
    const events = this._events[key];
    if (events) {
      events.splice(events.indexOf(callback), 1);
    }
    return this;
  }

  /**
   * Invokes all previously registered callbacks for this key.
   *
   * @param {string} key - The event type
   * @param {*} payload - The event payload (event object)
   * @returns {CallbackStore} this instance for chaining
   */
  trigger(key, payload) {
    const events = this._events[key];
    if (events) {
      const len = events.length;
      for (let i = 0; i < len; i++) {
        events[i](payload);
      }
    }
    return this;
  }
}

module.exports = CallbackStore;
