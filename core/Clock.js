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
 * Equivalent of an Engine in the Worker Thread. Used to synchronize and manage
 * time across different Threads.
 *
 * @private
 */
class Clock {
  constructor() {
    this._time = 0;
    this._frame = 0;
    this._timerQueue = [];
    this._updatingIndex = 0;

    this._scale = 1;
    this._scaledTime = this._time;
  }

  /**
   * Sets the scale at which the clock time is passing.
   * Useful for slow-motion or fast-forward effects.
   *
   * `1` means no time scaling ("realtime"),
   * `2` means the clock time is passing twice as fast,
   * `0.5` means the clock time is passing two times slower than the "actual"
   * time at which the Clock is being updated via `.step`.
   *
   * Initially the clock time is not being scaled (factor `1`).
   *
   * @param {number} scale - The scale at which the clock time is passing
   * @returns {Clock} this instance for chaining
   */
  setScale(scale) {
    this._scale = scale;
    return this;
  }

  /**
   * Gets the current time scale.
   *
   * @returns {number} The scale at which the clock time is passing
   */
  getScale() {
    return this._scale;
  }

  /**
   * Updates the internal clock time.
   *
   * @param {number} time - High resolution timestamp used for invoking the `update` method on all registered objects
   * @returns {Clock} this instance for chaining
   */
  step(time) {
    this._frame++;

    this._scaledTime = this._scaledTime + (time - this._time) * this._scale;
    this._time = time;

    for (let i = 0; i < this._timerQueue.length; i++) {
      if (this._timerQueue[i](this._scaledTime)) {
        this._timerQueue.splice(i, 1);
      }
    }
    return this;
  }

  /**
   * Returns the internal clock time.
   *
   * @returns {number} High resolution timestamp
   */
  now() {
    return this._scaledTime;
  }

  /**
   * Returns the number of frames elapsed so far.
   *
   * @returns {number} Number of frames
   */
  getFrame() {
    return this._frame;
  }

  /**
   * Wraps a function to be invoked after a certain amount of time.
   * After a set duration has passed, it executes the function and
   * removes it as a listener to 'prerender'.
   *
   * @param {Function} callback - Function to be run after a specified duration
   * @param {number} delay - Milliseconds from now to execute the function
   * @param {...*} args - Additional arguments to pass to callback
   * @returns {Function} Timer function used for Clock#clearTimer
   */
  setTimeout(callback, delay, ...args) {
    const startedAt = this._time;
    const timer = (time) => {
      if (time - startedAt >= delay) {
        callback.apply(null, args);
        return true;
      }
      return false;
    };
    this._timerQueue.push(timer);
    return timer;
  }

  /**
   * Wraps a function to be invoked after a certain amount of time.
   * After a set duration has passed, it executes the function and
   * resets the execution time.
   *
   * @param {Function} callback - Function to be run after a specified duration
   * @param {number} delay - Interval to execute function in milliseconds
   * @param {...*} args - Additional arguments to pass to callback
   * @returns {Function} Timer function used for Clock#clearTimer
   */
  setInterval(callback, delay, ...args) {
    let startedAt = this._time;
    const timer = (time) => {
      if (time - startedAt >= delay) {
        callback.apply(null, args);
        startedAt = time;
      }
      return false;
    };
    this._timerQueue.push(timer);
    return timer;
  }

  /**
   * Removes previously via `Clock#setTimeout` or `Clock#setInterval`
   * registered callback function.
   *
   * @param {Function} timer - Previously by `Clock#setTimeout` or `Clock#setInterval` returned callback function
   * @returns {Clock} this instance for chaining
   */
  clearTimer(timer) {
    const index = this._timerQueue.indexOf(timer);
    if (index !== -1) {
      this._timerQueue.splice(index, 1);
    }
    return this;
  }
}

/**
 * Alias for Clock#now (deprecated).
 *
 * @deprecated Use #now instead
 */
Clock.prototype.getTime = Clock.prototype.now;

module.exports = Clock;
