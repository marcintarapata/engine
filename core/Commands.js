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
 * An enumeration of the commands in our command queue.
 */
const Commands = {
  INIT_DOM: 0,
  DOM_RENDER_SIZE: 1,
  CHANGE_TRANSFORM: 2,
  CHANGE_SIZE: 3,
  CHANGE_PROPERTY: 4,
  CHANGE_CONTENT: 5,
  CHANGE_ATTRIBUTE: 6,
  ADD_CLASS: 7,
  REMOVE_CLASS: 8,
  SUBSCRIBE: 9,
  GL_SET_DRAW_OPTIONS: 10,
  GL_AMBIENT_LIGHT: 11,
  GL_LIGHT_POSITION: 12,
  GL_LIGHT_COLOR: 13,
  MATERIAL_INPUT: 14,
  GL_SET_GEOMETRY: 15,
  GL_UNIFORMS: 16,
  GL_BUFFER_DATA: 17,
  GL_CUTOUT_STATE: 18,
  GL_MESH_VISIBILITY: 19,
  GL_REMOVE_MESH: 20,
  PINHOLE_PROJECTION: 21,
  ORTHOGRAPHIC_PROJECTION: 22,
  CHANGE_VIEW_TRANSFORM: 23,
  WITH: 24,
  FRAME: 25,
  ENGINE: 26,
  START: 27,
  STOP: 28,
  TIME: 29,
  TRIGGER: 30,
  NEED_SIZE_FOR: 31,
  DOM: 32,
  READY: 33,
  ALLOW_DEFAULT: 34,
  PREVENT_DEFAULT: 35,
  UNSUBSCRIBE: 36,

  /**
   * Pretty prints a command buffer for debugging.
   *
   * @param {Array} buffer - The command buffer
   * @param {number} [start=0] - Start index
   * @param {number} [count] - Number of commands to print
   * @returns {string} Pretty printed command buffer
   */
  prettyPrint(buffer, start, count) {
    start = start ? start : 0;
    const data = {
      i: start,
      result: '',
    };
    const len = count ? count + start : buffer.length;
    for (; data.i < len; data.i++) {
      const callback = commandPrinters[buffer[data.i]];
      if (!callback)
        throw new Error('PARSE ERROR: no command registered for: ' + buffer[data.i]);
      callback(buffer, data);
    }
    return data.result;
  },
};

const commandPrinters = [];

commandPrinters[Commands.INIT_DOM] = (buffer, data) => {
  data.result += data.i + '. INIT_DOM\n    tagName: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.DOM_RENDER_SIZE] = (buffer, data) => {
  data.result += data.i + '. DOM_RENDER_SIZE\n    selector: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_TRANSFORM] = (buffer, data) => {
  data.result += data.i + '. CHANGE_TRANSFORM\n    val: [';
  for (let j = 0; j < 16; j++)
    data.result += buffer[++data.i] + (j < 15 ? ', ' : '');
  data.result += ']\n\n';
};

commandPrinters[Commands.CHANGE_SIZE] = (buffer, data) => {
  data.result +=
    data.i + '. CHANGE_SIZE\n    x: ' + buffer[++data.i] + ', y: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_PROPERTY] = (buffer, data) => {
  data.result +=
    data.i +
    '. CHANGE_PROPERTY\n    key: ' +
    buffer[++data.i] +
    ', value: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.CHANGE_CONTENT] = (buffer, data) => {
  data.result += data.i + '. CHANGE_CONTENT\n    content: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_ATTRIBUTE] = (buffer, data) => {
  data.result +=
    data.i +
    '. CHANGE_ATTRIBUTE\n    key: ' +
    buffer[++data.i] +
    ', value: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.ADD_CLASS] = (buffer, data) => {
  data.result += data.i + '. ADD_CLASS\n    className: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.REMOVE_CLASS] = (buffer, data) => {
  data.result += data.i + '. REMOVE_CLASS\n    className: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.SUBSCRIBE] = (buffer, data) => {
  data.result += data.i + '. SUBSCRIBE\n    event: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_SET_DRAW_OPTIONS] = (buffer, data) => {
  data.result += data.i + '. GL_SET_DRAW_OPTIONS\n    options: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_AMBIENT_LIGHT] = (buffer, data) => {
  data.result +=
    data.i +
    '. GL_AMBIENT_LIGHT\n    r: ' +
    buffer[++data.i] +
    'g: ' +
    buffer[++data.i] +
    'b: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.GL_LIGHT_POSITION] = (buffer, data) => {
  data.result +=
    data.i +
    '. GL_LIGHT_POSITION\n    x: ' +
    buffer[++data.i] +
    'y: ' +
    buffer[++data.i] +
    'z: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.GL_LIGHT_COLOR] = (buffer, data) => {
  data.result +=
    data.i +
    '. GL_LIGHT_COLOR\n    r: ' +
    buffer[++data.i] +
    'g: ' +
    buffer[++data.i] +
    'b: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.MATERIAL_INPUT] = (buffer, data) => {
  data.result +=
    data.i +
    '. MATERIAL_INPUT\n    key: ' +
    buffer[++data.i] +
    ', value: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.GL_SET_GEOMETRY] = (buffer, data) => {
  data.result +=
    data.i +
    '. GL_SET_GEOMETRY\n   x: ' +
    buffer[++data.i] +
    ', y: ' +
    buffer[++data.i] +
    ', z: ' +
    buffer[++data.i] +
    '\n\n';
};

commandPrinters[Commands.GL_UNIFORMS] = (buffer, data) => {
  data.result +=
    data.i + '. GL_UNIFORMS\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_BUFFER_DATA] = (buffer, data) => {
  data.result += data.i + '. GL_BUFFER_DATA\n    data: ';
  for (let i = 0; i < 5; i++) data.result += buffer[++data.i] + ', ';
  data.result += '\n\n';
};

commandPrinters[Commands.GL_CUTOUT_STATE] = (buffer, data) => {
  data.result += data.i + '. GL_CUTOUT_STATE\n    state: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_MESH_VISIBILITY] = (buffer, data) => {
  data.result += data.i + '. GL_MESH_VISIBILITY\n    visibility: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_REMOVE_MESH] = (buffer, data) => {
  data.result += data.i + '. GL_REMOVE_MESH\n\n';
};

commandPrinters[Commands.PINHOLE_PROJECTION] = (buffer, data) => {
  data.result += data.i + '. PINHOLE_PROJECTION\n    depth: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ORTHOGRAPHIC_PROJECTION] = (buffer, data) => {
  data.result += data.i + '. ORTHOGRAPHIC_PROJECTION\n';
};

commandPrinters[Commands.CHANGE_VIEW_TRANSFORM] = (buffer, data) => {
  data.result += data.i + '. CHANGE_VIEW_TRANSFORM\n   value: [';
  for (let i = 0; i < 16; i++) data.result += buffer[++data.i] + (i < 15 ? ', ' : '');
  data.result += ']\n\n';
};

commandPrinters[Commands.PREVENT_DEFAULT] = (buffer, data) => {
  data.result += data.i + '. PREVENT_DEFAULT\n    value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ALLOW_DEFAULT] = (buffer, data) => {
  data.result += data.i + '. ALLOW_DEFAULT\n    value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.READY] = (buffer, data) => {
  data.result += data.i + '. READY\n\n';
};

commandPrinters[Commands.WITH] = (buffer, data) => {
  data.result += data.i + '. **WITH**\n     path: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.TIME] = (buffer, data) => {
  data.result += data.i + '. TIME\n     ms: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.NEED_SIZE_FOR] = (buffer, data) => {
  data.result += data.i + '. NEED_SIZE_FOR\n    selector: ' + buffer[++data.i] + '\n\n';
};

module.exports = Commands;
