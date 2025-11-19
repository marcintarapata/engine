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

const Clock = require('./Clock');
const Scene = require('./Scene');
const Channel = require('./Channel');
const Dispatch = require('./Dispatch');
const UIManager = require('../renderers/UIManager');
const Compositor = require('../renderers/Compositor');
const RequestAnimationFrameLoop = require('../render-loops/RequestAnimationFrameLoop');
const TransformSystem = require('./TransformSystem');
const SizeSystem = require('./SizeSystem');
const Commands = require('./Commands');

const ENGINE_START = [Commands.ENGINE, Commands.START];
const ENGINE_STOP = [Commands.ENGINE, Commands.STOP];
const TIME_UPDATE = [Commands.TIME, null];

/**
 * FamousEngine has two responsibilities: one to act as the highest level
 * updater and another to send messages over to the renderers. It is a singleton.
 */
class FamousEngine {
  constructor() {
    Dispatch._setUpdater(this);

    this._updateQueue = []; // The updateQueue is a place where nodes
    // can place themselves in order to be
    // updated on the frame.

    this._nextUpdateQueue = []; // the nextUpdateQueue is used to queue
    // updates for the next tick.
    // this prevents infinite loops where during
    // an update a node continuously puts itself
    // back in the update queue.

    this._scenes = {}; // a hash of all of the scenes that the FamousEngine
    // is responsible for.

    this._messages = TIME_UPDATE; // a queue of all of the draw commands to
    // send to the renderers this frame.

    this._inUpdate = false; // when famous is updating this is true.
    // all requests for updates will get put in the
    // nextUpdateQueue

    this._clock = new Clock(); // a clock to keep track of time for the scene
    // graph.

    this._channel = new Channel();
    this._channel.onMessage = (message) => {
      this.handleMessage(message);
    };
  }

  /**
   * Initializes the FamousEngine with options or default parameters.
   *
   * @param {Object} [options] - A set of options containing a compositor and a render loop
   * @returns {FamousEngine} This instance for chaining
   */
  init(options) {
    if (typeof window === 'undefined') {
      throw new Error(
        'FamousEngine#init needs to have access to the global window object. ' +
          'Instantiate Compositor and UIManager manually in the UI thread.'
      );
    }
    this.compositor = (options && options.compositor) || new Compositor();
    this.renderLoop = (options && options.renderLoop) || new RequestAnimationFrameLoop();
    this.uiManager = new UIManager(this.getChannel(), this.compositor, this.renderLoop);
    return this;
  }

  /**
   * Sets the channel that the engine will use to communicate with the renderers.
   *
   * @param {*} channel - The channel to be used for communicating with the UIManager/Compositor
   * @returns {FamousEngine} This instance for chaining
   */
  setChannel(channel) {
    this._channel = channel;
    return this;
  }

  /**
   * Returns the channel that the engine is currently using to communicate with the renderers.
   *
   * @returns {*} The channel used for communicating with the UIManager/Compositor
   */
  getChannel() {
    return this._channel;
  }

  /**
   * _update is the body of the update loop. The frame consists of
   * appending the nextUpdateQueue to the currentUpdate queue,
   * then moving through the updateQueue and calling onUpdate with the current
   * time on all nodes. While _update is called, _inUpdate is set to true and
   * all requests to be placed in the update queue will be forwarded to the
   * nextUpdateQueue.
   *
   * @private
   * @returns {void}
   */
  _update() {
    this._inUpdate = true;
    const time = this._clock.now();
    const nextQueue = this._nextUpdateQueue;
    const queue = this._updateQueue;
    let item;

    this._messages[1] = time;

    SizeSystem.update();
    TransformSystem.update();

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
      item = queue.shift();
      if (item && item.update) item.update(time);
      if (item && item.onUpdate) item.onUpdate(time);
    }

    this._inUpdate = false;
  }

  /**
   * requestUpdate takes a class that has an onUpdate method and puts it
   * into the updateQueue to be updated at the next frame.
   * If FamousEngine is currently in an update, requestUpdate
   * passes its argument to requestUpdateOnNextTick.
   *
   * @param {Object} requester - An object with an onUpdate method
   * @returns {void}
   */
  requestUpdate(requester) {
    if (!requester)
      throw new Error('requestUpdate must be called with a class to be updated');

    if (this._inUpdate) this.requestUpdateOnNextTick(requester);
    else this._updateQueue.push(requester);
  }

  /**
   * requestUpdateOnNextTick requests an update on the next frame.
   * If FamousEngine is not currently in an update then it is functionally equivalent
   * to requestUpdate. This method should be used to prevent infinite loops where
   * a class is updated on the frame but needs to be updated again next frame.
   *
   * @param {Object} requester - An object with an onUpdate method
   * @returns {void}
   */
  requestUpdateOnNextTick(requester) {
    this._nextUpdateQueue.push(requester);
  }

  /**
   * handleMessage processes a message queue sent into FamousEngine.
   * These messages will be interpreted and sent into the scene graph as events if necessary.
   *
   * @param {Array} messages - An array of commands
   * @returns {FamousEngine} This instance for chaining
   */
  handleMessage(messages) {
    if (!messages) throw new Error('onMessage must be called with an array of messages');

    let command;

    while (messages.length > 0) {
      command = messages.shift();
      switch (command) {
        case Commands.WITH:
          this.handleWith(messages);
          break;
        case Commands.FRAME:
          this.handleFrame(messages);
          break;
        default:
          throw new Error('received unknown command: ' + command);
      }
    }
    return this;
  }

  /**
   * handleWith takes an array of messages following the WITH command.
   * It'll then issue the next commands to the path specified by the WITH command.
   *
   * @param {Array} messages - Array of messages
   * @returns {FamousEngine} This instance for chaining
   */
  handleWith(messages) {
    const path = messages.shift();
    const command = messages.shift();
    switch (command) {
      case Commands.TRIGGER: // the TRIGGER command sends a UIEvent to the specified path
        {
          const type = messages.shift();
          const ev = messages.shift();
          Dispatch.dispatchUIEvent(path, type, ev);
        }
        break;
      default:
        throw new Error('received unknown command: ' + command);
    }
    return this;
  }

  /**
   * handleFrame is called when the renderers issue a FRAME command to FamousEngine.
   * FamousEngine will then step updating the scene graph to the current time.
   *
   * @param {Array} messages - Array of messages
   * @returns {FamousEngine} This instance for chaining
   */
  handleFrame(messages) {
    if (!messages) throw new Error('handleFrame must be called with an array of messages');
    if (!messages.length) throw new Error('FRAME must be sent with a time');

    this.step(messages.shift());
    return this;
  }

  /**
   * step updates the clock and the scene graph and then sends the draw commands
   * that accumulated in the update to the renderers.
   *
   * @param {number} time - Current engine time
   * @returns {FamousEngine} This instance for chaining
   */
  step(time) {
    if (time == null) throw new Error('step must be called with a time');

    this._clock.step(time);
    this._update();

    if (this._messages.length) {
      this._channel.sendMessage(this._messages);
      while (this._messages.length > 2) this._messages.pop();
    }

    return this;
  }

  /**
   * Returns the context of a particular path. The context is looked up by the selector
   * portion of the path and is listed from the start of the string to the first '/'.
   *
   * @param {string} selector - The path to look up the context for
   * @returns {*} The context if found, else undefined
   */
  getContext(selector) {
    if (!selector) throw new Error('getContext must be called with a selector');

    let index = selector.indexOf('/');
    selector = index === -1 ? selector : selector.substring(0, index);

    return this._scenes[selector];
  }

  /**
   * Returns the instance of clock used by the FamousEngine.
   *
   * @returns {Clock} FamousEngine's clock
   */
  getClock() {
    return this._clock;
  }

  /**
   * Enqueues a message to be transferred to the renderers.
   *
   * @param {*} command - Draw Command
   * @returns {FamousEngine} This instance for chaining
   */
  message(command) {
    this._messages.push(command);
    return this;
  }

  /**
   * Creates a scene under which a scene graph could be built.
   *
   * @param {string} [selector='body'] - A DOM selector for where the scene should be placed
   * @returns {Scene} A new instance of Scene
   */
  createScene(selector) {
    selector = selector || 'body';

    if (this._scenes[selector]) this._scenes[selector].dismount();
    this._scenes[selector] = new Scene(selector, this);
    return this._scenes[selector];
  }

  /**
   * Introduce an already instantiated scene to the engine.
   *
   * @param {Scene} scene - The scene to reintroduce to the engine
   * @returns {FamousEngine} This instance for chaining
   */
  addScene(scene) {
    const selector = scene._selector;

    const current = this._scenes[selector];
    if (current && current !== scene) current.dismount();
    if (!scene.isMounted()) scene.mount(scene.getSelector());
    this._scenes[selector] = scene;
    return this;
  }

  /**
   * Remove a scene.
   *
   * @param {Scene} scene - The scene to remove from the engine
   * @returns {FamousEngine} This instance for chaining
   */
  removeScene(scene) {
    const selector = scene._selector;

    const current = this._scenes[selector];
    if (current && current === scene) {
      if (scene.isMounted()) scene.dismount();
      delete this._scenes[selector];
    }
    return this;
  }

  /**
   * Starts the engine running in the Main-Thread.
   * This affects **every** updateable managed by the Engine.
   *
   * @returns {FamousEngine} This instance for chaining
   */
  startRenderLoop() {
    this._channel.sendMessage(ENGINE_START);
    return this;
  }

  /**
   * Stops the engine running in the Main-Thread.
   * This affects **every** updateable managed by the Engine.
   *
   * @returns {FamousEngine} This instance for chaining
   */
  stopRenderLoop() {
    this._channel.sendMessage(ENGINE_STOP);
    return this;
  }

  /**
   * @deprecated Use {@link FamousEngine#startRenderLoop} instead!
   * @returns {FamousEngine} This instance for chaining
   */
  startEngine() {
    console.warn('FamousEngine.startEngine is deprecated! Use FamousEngine.startRenderLoop instead!');
    return this.startRenderLoop();
  }

  /**
   * @deprecated Use {@link FamousEngine#stopRenderLoop} instead!
   * @returns {FamousEngine} This instance for chaining
   */
  stopEngine() {
    console.warn('FamousEngine.stopEngine is deprecated! Use FamousEngine.stopRenderLoop instead!');
    return this.stopRenderLoop();
  }
}

module.exports = new FamousEngine();
