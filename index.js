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

// Core modules
const components = require('./components');
const core = require('./core');
const renderLoops = require('./render-loops');
const domRenderables = require('./dom-renderables');
const domRenderers = require('./dom-renderers');
const math = require('./math');
const physics = require('./physics');
const renderers = require('./renderers');
const transitions = require('./transitions');
const utilities = require('./utilities');
const webglRenderables = require('./webgl-renderables');
const webglRenderers = require('./webgl-renderers');
const webglGeometries = require('./webgl-geometries');
const webglMaterials = require('./webgl-materials');
const webglShaders = require('./webgl-shaders');
const polyfills = require('./polyfills');

// New Phase 3 modules
const errors = require('./errors');
const builders = require('./builders');

// Builder helper functions for convenient API
function createEngine() {
  const FamousEngine = require('./core/FamousEngine');
  return new builders.EngineBuilder(FamousEngine.constructor || function() {
    // Fallback for singleton pattern - create instance methods
    const instance = Object.create(FamousEngine);
    return instance;
  });
}

function createScene(selector, engine) {
  if (!engine) {
    engine = core.FamousEngine;
  }
  return new builders.SceneBuilder(selector, engine);
}

function createNode(parent) {
  return new builders.NodeBuilder(core.Node, parent);
}

// Main export - namespaced modules for backward compatibility
module.exports = {
  // Existing modules
  components,
  core,
  renderLoops,
  domRenderables,
  domRenderers,
  math,
  physics,
  renderers,
  transitions,
  utilities,
  webglRenderables,
  webglRenderers,
  webglGeometries,
  webglMaterials,
  webglShaders,
  polyfills,

  // New Phase 3 modules
  errors,
  builders,

  // Builder factory functions
  createEngine,
  createScene,
  createNode,
};

// For ESM compatibility - named exports
if (typeof exports !== 'undefined') {
  exports.components = components;
  exports.core = core;
  exports.renderLoops = renderLoops;
  exports.domRenderables = domRenderables;
  exports.domRenderers = domRenderers;
  exports.math = math;
  exports.physics = physics;
  exports.renderers = renderers;
  exports.transitions = transitions;
  exports.utilities = utilities;
  exports.webglRenderables = webglRenderables;
  exports.webglRenderers = webglRenderers;
  exports.webglGeometries = webglGeometries;
  exports.webglMaterials = webglMaterials;
  exports.webglShaders = webglShaders;
  exports.polyfills = polyfills;
  exports.errors = errors;
  exports.builders = builders;
  exports.createEngine = createEngine;
  exports.createScene = createScene;
  exports.createNode = createNode;
}
