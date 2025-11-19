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

const Event = require('./Event');
const PathUtils = require('./Path');

/**
 * The Dispatch class is used to propagate events down the
 * scene graph.
 */
class Dispatch {
  constructor() {
    this._nodes = {}; // a container for constant time lookup of nodes

    this._queue = []; // The queue is used for two purposes
    // 1. It is used to list indices in the
    //    Nodes path which are then used to lookup
    //    a node in the scene graph.
    // 2. It is used to assist dispatching
    //    such that it is possible to do a breadth first
    //    traversal of the scene graph.
  }

  /**
   * Protected method that sets the updater for the dispatch. The updater will
   * almost certainly be the FamousEngine class.
   *
   * @protected
   * @param {*} updater - The updater which will be passed through the scene graph
   */
  _setUpdater(updater) {
    this._updater = updater;

    for (const key in this._nodes) this._nodes[key]._setUpdater(updater);
  }

  /**
   * Enqueue the children of a node within the dispatcher. Does not clear
   * the dispatcher's queue first.
   *
   * @param {*} node - Node from which to add children to the queue
   */
  addChildrenToQueue(node) {
    const children = node.getChildren();
    for (let i = 0, len = children.length; i < len; i++) {
      const child = children[i];
      if (child) this._queue.push(child);
    }
  }

  /**
   * Returns the next item in the Dispatch's queue.
   *
   * @returns {*} Next node in the queue
   */
  next() {
    return this._queue.shift();
  }

  /**
   * Returns the next node in the queue, but also adds its children to
   * the end of the queue. Continually calling this method will result
   * in a breadth first traversal of the render tree.
   *
   * @returns {*} The next node in the traversal if one exists
   */
  breadthFirstNext() {
    const child = this._queue.shift();
    if (!child) return undefined;
    this.addChildrenToQueue(child);
    return child;
  }

  /**
   * Calls the onMount method for the node at a given path and
   * properly registers all of that node's children to their proper
   * paths. Throws if that path doesn't have a node registered as
   * a parent or if there is no node registered at that path.
   *
   * @param {string} path - Path at which to begin mounting
   * @param {*} node - The node that was mounted
   */
  mount(path, node) {
    if (!node) throw new Error('Dispatch: no node passed to mount at: ' + path);
    if (this._nodes[path])
      throw new Error('Dispatch: there is a node already registered at: ' + path);

    node._setUpdater(this._updater);
    this._nodes[path] = node;
    const parentPath = PathUtils.parent(path);

    // scenes are their own parents
    const parent = !parentPath ? node : this._nodes[parentPath];

    if (!parent)
      throw new Error(
        'Parent to path: ' + path + " doesn't exist at expected path: " + parentPath
      );

    const children = node.getChildren();
    const components = node.getComponents();
    let i;
    let len;

    if (parent.isMounted()) node._setMounted(true, path);
    if (parent.isShown()) node._setShown(true);

    if (parent.isMounted()) {
      node._setParent(parent);
      if (node.onMount) node.onMount(path);

      for (i = 0, len = components.length; i < len; i++)
        if (components[i] && components[i].onMount) components[i].onMount(node, i);

      for (i = 0, len = children.length; i < len; i++)
        if (children[i] && children[i].mount) children[i].mount(path + '/' + i);
        else if (children[i]) this.mount(path + '/' + i, children[i]);
    }

    if (parent.isShown()) {
      if (node.onShow) node.onShow();
      for (i = 0, len = components.length; i < len; i++)
        if (components[i] && components[i].onShow) components[i].onShow();
    }
  }

  /**
   * Calls the onDismount method for the node at a given path
   * and deregisters all of that node's children. Throws if there
   * is no node registered at that path.
   *
   * @param {string} path - Path at which to begin dismounting
   */
  dismount(path) {
    const node = this._nodes[path];

    if (!node) throw new Error('No node registered to path: ' + path);

    const children = node.getChildren();
    const components = node.getComponents();
    let i;
    let len;

    if (node.isShown()) {
      node._setShown(false);
      if (node.onHide) node.onHide();
      for (i = 0, len = components.length; i < len; i++)
        if (components[i] && components[i].onHide) components[i].onHide();
    }

    if (node.isMounted()) {
      if (node.onDismount) node.onDismount(path);

      for (i = 0, len = children.length; i < len; i++)
        if (children[i] && children[i].dismount) children[i].dismount();
        else if (children[i]) this.dismount(path + '/' + i);

      for (i = 0, len = components.length; i < len; i++)
        if (components[i] && components[i].onDismount) components[i].onDismount();

      node._setMounted(false);
      node._setParent(null);
    }

    this._nodes[path] = null;
  }

  /**
   * Returns the node registered to the given path, or none
   * if no node exists at that path.
   *
   * @param {string} path - Path at which to look up the node
   * @returns {*} Node at the given path
   */
  getNode(path) {
    return this._nodes[path];
  }

  /**
   * Issues the onShow method to the node registered at the given path,
   * and shows the entire subtree below that node. Throws if no node
   * is registered to this path.
   *
   * @param {string} path - The path of the node to show
   */
  show(path) {
    const node = this._nodes[path];

    if (!node) throw new Error('No node registered to path: ' + path);

    if (node.onShow) node.onShow();

    const components = node.getComponents();
    for (let i = 0, len = components.length; i < len; i++)
      if (components[i] && components[i].onShow) components[i].onShow();

    this.addChildrenToQueue(node);
    let child;

    while ((child = this.breadthFirstNext())) this.show(child.getLocation());
  }

  /**
   * Issues the onHide method to the node registered at the given path,
   * and hides the entire subtree below that node. Throws if no node
   * is registered to this path.
   *
   * @param {string} path - The path of the node to hide
   */
  hide(path) {
    const node = this._nodes[path];

    if (!node) throw new Error('No node registered to path: ' + path);

    if (node.onHide) node.onHide();

    const components = node.getComponents();
    for (let i = 0, len = components.length; i < len; i++)
      if (components[i] && components[i].onHide) components[i].onHide();

    this.addChildrenToQueue(node);
    let child;

    while ((child = this.breadthFirstNext())) this.hide(child.getLocation());
  }

  /**
   * Takes a path and returns the node at the location specified
   * by the path, if one exists. If not, it returns undefined.
   *
   * @param {string} location - The location of the node specified by its path
   * @returns {*} The node at the requested path
   */
  lookupNode(location) {
    if (!location) throw new Error('lookupNode must be called with a path');

    this._queue.length = 0;
    const path = this._queue;

    _splitTo(location, path);

    for (let i = 0, len = path.length; i < len; i++) path[i] = this._nodes[path[i]];

    return path[path.length - 1];
  }

  /**
   * Takes an event name and a payload and dispatches it to the
   * entire scene graph below the node that the dispatcher is on. The nodes
   * receive the events in a breadth first traversal, meaning that parents
   * have the opportunity to react to the event before children.
   *
   * @param {string} path - Path of the node to send the event to
   * @param {string} event - Name of the event
   * @param {*} payload - Data associated with the event
   */
  dispatch(path, event, payload) {
    if (!path) throw new Error("dispatch requires a path as its first argument");
    if (!event) throw new Error("dispatch requires an event name as its second argument");

    const node = this._nodes[path];

    if (!node) return;

    this.addChildrenToQueue(node);
    let child;

    while ((child = this.breadthFirstNext()))
      if (child && child.onReceive) child.onReceive(event, payload);
  }

  /**
   * Takes a path, an event name, and a payload and dispatches them in
   * a manner analogous to DOM bubbling. It first traverses down to the node specified at
   * the path. That node receives the event first, and then every ancestor receives the event
   * until the context.
   *
   * @param {string} path - The path of the node
   * @param {string} event - The event name
   * @param {*} payload - The payload
   */
  dispatchUIEvent(path, event, payload) {
    if (!path) throw new Error('dispatchUIEvent needs a valid path to dispatch to');
    if (!event)
      throw new Error('dispatchUIEvent needs an event name as its second argument');
    let node;

    Event.call(payload);
    node = this.getNode(path);
    if (node) {
      let parent;
      let components;
      let i;
      let len;

      payload.node = node;

      while (node) {
        if (node.onReceive) node.onReceive(event, payload);
        components = node.getComponents();

        for (i = 0, len = components.length; i < len; i++)
          if (components[i] && components[i].onReceive)
            components[i].onReceive(event, payload);

        if (payload.propagationStopped) break;
        parent = node.getParent();
        if (parent === node) return;
        node = parent;
      }
    }
  }
}

/**
 * Splits a path at every '/' pushing the result into the supplied array.
 * This is a destructive change.
 *
 * @private
 * @param {string} string - The specified path
 * @param {Array} target - The array to which the result should be written
 * @returns {Array} The target after having been written to
 */
function _splitTo(string, target) {
  target.length = 0; // clears the array first.
  let last = 0;
  let i;
  const len = string.length;

  for (i = 0; i < len; i++) {
    if (string[i] === '/') {
      target.push(string.substring(last, i));
      last = i + 1;
    }
  }

  if (i - last > 0) target.push(string.substring(last, i));

  return target;
}

module.exports = new Dispatch();
