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

'use strict';

/**
 * PerformanceMonitor provides real-time performance metrics for the Famous Engine.
 * Tracks FPS, frame times, memory usage, and GPU performance.
 *
 * @class PerformanceMonitor
 * @constructor
 *
 * @param {Object} options Configuration options
 * @param {Number} options.sampleSize Number of frames to average (default: 60)
 * @param {Boolean} options.trackMemory Whether to track memory usage (default: false)
 *
 * @return {undefined} undefined
 */
function PerformanceMonitor(options) {
    options = options || {};

    this._sampleSize = options.sampleSize || 60;
    this._trackMemory = options.trackMemory || false;

    // Frame timing
    this._frameTimes = [];
    this._lastFrameTime = 0;
    this._frameCount = 0;

    // FPS calculation
    this._fps = 0;
    this._avgFrameTime = 0;
    this._minFrameTime = Infinity;
    this._maxFrameTime = 0;

    // Memory tracking (Chrome only)
    this._memoryUsage = null;

    // GPU timing (WebGL 2 only)
    this._gpuTime = 0;
    this._gpuQueries = [];

    // Callbacks
    this._onUpdate = null;

    // Performance marks for custom measurements
    this._marks = {};

    // Check for high-resolution timer
    this._now = (typeof performance !== 'undefined' && performance.now)
        ? function() { return performance.now(); }
        : function() { return Date.now(); };

    // Check for memory API (Chrome only)
    this._hasMemoryAPI = typeof performance !== 'undefined' &&
                         performance.memory !== undefined;
}

/**
 * Marks the start of a frame. Call at the beginning of each render loop iteration.
 *
 * @method
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.frameStart = function frameStart() {
    this._lastFrameTime = this._now();
    return this;
};

/**
 * Marks the end of a frame. Call at the end of each render loop iteration.
 * Updates all performance metrics.
 *
 * @method
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.frameEnd = function frameEnd() {
    var frameTime = this._now() - this._lastFrameTime;

    // Update frame times array
    this._frameTimes.push(frameTime);
    if (this._frameTimes.length > this._sampleSize) {
        this._frameTimes.shift();
    }

    this._frameCount++;

    // Calculate metrics
    this._calculateMetrics();

    // Track memory if enabled
    if (this._trackMemory && this._hasMemoryAPI) {
        this._updateMemory();
    }

    // Call update callback if set
    if (this._onUpdate) {
        this._onUpdate(this.getMetrics());
    }

    return this;
};

/**
 * Calculates FPS and frame time metrics from collected samples.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
PerformanceMonitor.prototype._calculateMetrics = function _calculateMetrics() {
    if (this._frameTimes.length === 0) return;

    var sum = 0;
    var min = Infinity;
    var max = 0;

    for (var i = 0; i < this._frameTimes.length; i++) {
        var time = this._frameTimes[i];
        sum += time;
        if (time < min) min = time;
        if (time > max) max = time;
    }

    this._avgFrameTime = sum / this._frameTimes.length;
    this._minFrameTime = min;
    this._maxFrameTime = max;
    this._fps = 1000 / this._avgFrameTime;
};

/**
 * Updates memory usage metrics (Chrome only).
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
PerformanceMonitor.prototype._updateMemory = function _updateMemory() {
    if (this._hasMemoryAPI) {
        var memory = performance.memory;
        this._memoryUsage = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usedMB: Math.round(memory.usedJSHeapSize / (1024 * 1024) * 100) / 100,
            totalMB: Math.round(memory.totalJSHeapSize / (1024 * 1024) * 100) / 100
        };
    }
};

/**
 * Starts a named performance mark for custom measurements.
 *
 * @method
 *
 * @param {String} name Name of the mark
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.mark = function mark(name) {
    this._marks[name] = this._now();
    return this;
};

/**
 * Measures the time since a named mark was started.
 *
 * @method
 *
 * @param {String} name Name of the mark to measure from
 *
 * @return {Number} Time in milliseconds since mark was started, or -1 if mark not found
 */
PerformanceMonitor.prototype.measure = function measure(name) {
    if (this._marks[name] === undefined) return -1;
    var duration = this._now() - this._marks[name];
    delete this._marks[name];
    return duration;
};

/**
 * Gets all current performance metrics.
 *
 * @method
 *
 * @return {Object} Object containing all metrics
 */
PerformanceMonitor.prototype.getMetrics = function getMetrics() {
    return {
        fps: Math.round(this._fps * 10) / 10,
        avgFrameTime: Math.round(this._avgFrameTime * 100) / 100,
        minFrameTime: Math.round(this._minFrameTime * 100) / 100,
        maxFrameTime: Math.round(this._maxFrameTime * 100) / 100,
        frameCount: this._frameCount,
        memory: this._memoryUsage,
        gpuTime: this._gpuTime
    };
};

/**
 * Gets the current FPS.
 *
 * @method
 *
 * @return {Number} Current FPS
 */
PerformanceMonitor.prototype.getFPS = function getFPS() {
    return Math.round(this._fps);
};

/**
 * Gets the average frame time in milliseconds.
 *
 * @method
 *
 * @return {Number} Average frame time
 */
PerformanceMonitor.prototype.getAvgFrameTime = function getAvgFrameTime() {
    return this._avgFrameTime;
};

/**
 * Sets a callback to be called after each frame with updated metrics.
 *
 * @method
 *
 * @param {Function} callback Function to call with metrics object
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.onUpdate = function onUpdate(callback) {
    this._onUpdate = callback;
    return this;
};

/**
 * Resets all metrics to initial values.
 *
 * @method
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.reset = function reset() {
    this._frameTimes = [];
    this._frameCount = 0;
    this._fps = 0;
    this._avgFrameTime = 0;
    this._minFrameTime = Infinity;
    this._maxFrameTime = 0;
    this._memoryUsage = null;
    this._marks = {};
    return this;
};

/**
 * Creates a formatted string of current metrics for display.
 *
 * @method
 *
 * @return {String} Formatted metrics string
 */
PerformanceMonitor.prototype.toString = function toString() {
    var metrics = this.getMetrics();
    var str = 'FPS: ' + metrics.fps + ' | ' +
              'Frame: ' + metrics.avgFrameTime + 'ms ' +
              '(min: ' + metrics.minFrameTime + ', max: ' + metrics.maxFrameTime + ')';

    if (metrics.memory) {
        str += ' | Memory: ' + metrics.memory.usedMB + 'MB / ' + metrics.memory.totalMB + 'MB';
    }

    return str;
};

/**
 * Initializes GPU timing queries for WebGL 2.
 * Call this method with a WebGL 2 context to enable GPU timing.
 *
 * @method
 *
 * @param {WebGL2RenderingContext} gl WebGL 2 context
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.initGPUTiming = function initGPUTiming(gl) {
    if (!gl || typeof gl.createQuery !== 'function') {
        console.warn('PerformanceMonitor: GPU timing requires WebGL 2');
        return this;
    }

    var ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if (!ext) {
        console.warn('PerformanceMonitor: EXT_disjoint_timer_query_webgl2 not available');
        return this;
    }

    this._gpuTimingExt = ext;
    this._gl = gl;
    this._gpuQueryPool = [];

    return this;
};

/**
 * Starts a GPU timing query. Call before draw calls.
 *
 * @method
 *
 * @return {Object|null} Query object or null if not available
 */
PerformanceMonitor.prototype.beginGPUQuery = function beginGPUQuery() {
    if (!this._gpuTimingExt || !this._gl) return null;

    var gl = this._gl;
    var query = this._gpuQueryPool.pop() || gl.createQuery();

    gl.beginQuery(this._gpuTimingExt.TIME_ELAPSED_EXT, query);

    return query;
};

/**
 * Ends a GPU timing query. Call after draw calls.
 *
 * @method
 *
 * @param {Object} query Query object from beginGPUQuery
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.endGPUQuery = function endGPUQuery(query) {
    if (!query || !this._gpuTimingExt || !this._gl) return this;

    var gl = this._gl;
    gl.endQuery(this._gpuTimingExt.TIME_ELAPSED_EXT);

    this._gpuQueries.push(query);

    return this;
};

/**
 * Resolves pending GPU queries and updates GPU timing metrics.
 * Should be called each frame after all draw calls.
 *
 * @method
 *
 * @return {PerformanceMonitor} this
 */
PerformanceMonitor.prototype.resolveGPUQueries = function resolveGPUQueries() {
    if (!this._gpuTimingExt || !this._gl || this._gpuQueries.length === 0) return this;

    var gl = this._gl;
    var ext = this._gpuTimingExt;
    var totalTime = 0;
    var resolved = [];

    for (var i = 0; i < this._gpuQueries.length; i++) {
        var query = this._gpuQueries[i];

        // Check if result is available
        var available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
        var disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);

        if (available && !disjoint) {
            var elapsed = gl.getQueryParameter(query, gl.QUERY_RESULT);
            totalTime += elapsed / 1000000; // Convert nanoseconds to milliseconds
            resolved.push(query);
        }
    }

    // Return resolved queries to pool
    for (var j = 0; j < resolved.length; j++) {
        var idx = this._gpuQueries.indexOf(resolved[j]);
        if (idx > -1) {
            this._gpuQueries.splice(idx, 1);
            this._gpuQueryPool.push(resolved[j]);
        }
    }

    if (totalTime > 0) {
        this._gpuTime = totalTime;
    }

    return this;
};

module.exports = PerformanceMonitor;
