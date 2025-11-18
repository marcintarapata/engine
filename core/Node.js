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

const SizeSystem = require('./SizeSystem');
const Dispatch = require('./Dispatch');
const TransformSystem = require('./TransformSystem');
const Size = require('./Size');
const Transform = require('./Transform');

/**
 * Nodes define hierarchy and geometrical transformations. They can be moved
 * (translated), scaled and rotated.
 *
 * A Node is either mounted or unmounted. Unmounted nodes are detached from the
 * scene graph. Unmounted nodes have no parent node, while each mounted node has
 * exactly one parent. Nodes have an arbitrary number of children, which can be
 * dynamically added using {@link Node#addChild}.
 *
 * Each Node has an arbitrary number of `components`. Those components can
 * send `draw` commands to the renderer or mutate the node itself, in which case
 * they define behavior in the most explicit way. Components that send `draw`
 * commands are considered `renderables`. From the node's perspective, there is
 * no distinction between nodes that send draw commands and nodes that define
 * behavior.
 *
 * Because of the fact that Nodes themselves are very unopinionated (they don't
 * "render" to anything), they are often being subclassed in order to add e.g.
 * components at initialization to them. Because of this flexibility, they might
 * as well have been called `Entities`.
 *
 * @example
 * // create three detached (unmounted) nodes
 * const parent = new Node();
 * const child1 = new Node();
 * const child2 = new Node();
 *
 * // build an unmounted subtree (parent is still detached)
 * parent.addChild(child1);
 * parent.addChild(child2);
 *
 * // mount parent by adding it to the context
 * const context = Famous.createContext("body");
 * context.addChild(parent);
 */
class Node {
  constructor() {
    this._requestingUpdate = false;
    this._inUpdate = false;
    this._mounted = false;
    this._shown = true;
    this._updater = null;
    this._opacity = 1;
    this._UIEvents = [];

    this._updateQueue = [];
    this._nextUpdateQueue = [];

    this._freedComponentIndicies = [];
    this._components = [];

    this._freedChildIndicies = [];
    this._children = [];

    this._fullChildren = [];

    this._parent = null;

    this._id = null;

    this._transformID = null;
    this._sizeID = null;

    if (!this.constructor.NO_DEFAULT_COMPONENTS) this._init();
  }

  /**
   * Protected method. Initializes a node with a default Transform and Size component.
   *
   * @protected
   * @returns {void}
   */
  _init() {
    this._transformID = this.addComponent(new Transform());
    this._sizeID = this.addComponent(new Size());
  }

  /**
   * Protected method. Sets the parent of this node such that it can be looked up.
   *
   * @param {Node} parent - The node to set as the parent of this
   * @returns {void}
   */
  _setParent(parent) {
    if (this._parent && this._parent.getChildren().indexOf(this) !== -1) {
      this._parent.removeChild(this);
    }
    this._parent = parent;
  }

  /**
   * Protected method. Sets the mount state of the node. Should only be called by the dispatch.
   *
   * @param {boolean} mounted - Whether or not the Node is mounted
   * @param {string} [path] - The path that the node will be mounted to
   * @returns {void}
   */
  _setMounted(mounted, path) {
    this._mounted = mounted;
    this._id = path ? path : null;
  }

  /**
   * Protected method, sets whether or not the Node is shown. Should only be called by the dispatch.
   *
   * @param {boolean} shown - Whether or not the node is shown
   * @returns {void}
   */
  _setShown(shown) {
    this._shown = shown;
  }

  /**
   * Protected method. Sets the updater of the node.
   *
   * @param {*} updater - The Updater of the node
   * @returns {void}
   */
  _setUpdater(updater) {
    this._updater = updater;
    if (this._requestingUpdate) this._updater.requestUpdate(this);
  }

  /**
   * Determine the node's location in the scene graph hierarchy.
   * A location of `body/0/1` can be interpreted as the following scene graph
   * hierarchy (ignoring siblings of ancestors and additional child nodes):
   *
   * `Context:body` -> `Node:0` -> `Node:1`, where `Node:1` is the node the
   * `getLocation` method has been invoked on.
   *
   * @returns {string} Location (path), e.g. `body/0/1`
   */
  getLocation() {
    return this._id;
  }

  /**
   * Dispatches the event using the Dispatch. All descendent nodes will
   * receive the dispatched event.
   *
   * @param {string} event - Event type
   * @param {Object} payload - Event object to be dispatched
   * @returns {Node} This instance for chaining
   */
  emit(event, payload) {
    Dispatch.dispatch(this.getLocation(), event, payload);
    return this;
  }

  /**
   * @deprecated
   * @param {*} message - Message to send
   * @returns {Node} This instance for chaining
   */
  sendDrawCommand(message) {
    this._updater.message(message);
    return this;
  }

  /**
   * Recursively serializes the Node, including all previously added components.
   *
   * @returns {Object} Serialized representation of the node, including components
   */
  getValue() {
    const numberOfChildren = this._children.length;
    const numberOfComponents = this._components.length;
    let i = 0;

    const value = {
      location: this.getId(),
      spec: {
        location: this.getId(),
        showState: {
          mounted: this.isMounted(),
          shown: this.isShown(),
          opacity: this.getOpacity() || null,
        },
        offsets: {
          mountPoint: [0, 0, 0],
          align: [0, 0, 0],
          origin: [0, 0, 0],
        },
        vectors: {
          position: [0, 0, 0],
          rotation: [0, 0, 0, 1],
          scale: [1, 1, 1],
        },
        size: {
          sizeMode: [0, 0, 0],
          proportional: [1, 1, 1],
          differential: [0, 0, 0],
          absolute: [0, 0, 0],
          render: [0, 0, 0],
        },
      },
      UIEvents: this._UIEvents,
      components: [],
      children: [],
    };

    if (value.location) {
      const transform = TransformSystem.get(this.getId());
      const size = SizeSystem.get(this.getId());

      for (i = 0; i < 3; i++) {
        value.spec.offsets.mountPoint[i] = transform.offsets.mountPoint[i];
        value.spec.offsets.align[i] = transform.offsets.align[i];
        value.spec.offsets.origin[i] = transform.offsets.origin[i];
        value.spec.vectors.position[i] = transform.vectors.position[i];
        value.spec.vectors.rotation[i] = transform.vectors.rotation[i];
        value.spec.vectors.scale[i] = transform.vectors.scale[i];
        value.spec.size.sizeMode[i] = size.sizeMode[i];
        value.spec.size.proportional[i] = size.proportionalSize[i];
        value.spec.size.differential[i] = size.differentialSize[i];
        value.spec.size.absolute[i] = size.absoluteSize[i];
        value.spec.size.render[i] = size.renderSize[i];
      }

      value.spec.vectors.rotation[3] = transform.vectors.rotation[3];
    }

    for (i = 0; i < numberOfChildren; i++)
      if (this._children[i] && this._children[i].getValue)
        value.children.push(this._children[i].getValue());

    for (i = 0; i < numberOfComponents; i++)
      if (this._components[i] && this._components[i].getValue)
        value.components.push(this._components[i].getValue());

    return value;
  }

  /**
   * Similar to {@link Node#getValue}, but returns the actual "computed" value. E.g.
   * a proportional size of 0.5 might resolve into a "computed" size of 200px
   * (assuming the parent has a width of 400px).
   *
   * @deprecated Use Node.getValue instead
   * @returns {Object} Serialized representation of the node, including children, excluding components
   */
  getComputedValue() {
    console.warn('Node.getComputedValue is deprecated. Use Node.getValue instead');
    const numberOfChildren = this._children.length;

    const value = {
      location: this.getId(),
      computedValues: {
        transform: this.isMounted()
          ? TransformSystem.get(this.getLocation()).getLocalTransform()
          : null,
        size: this.isMounted() ? SizeSystem.get(this.getLocation()).get() : null,
      },
      children: [],
    };

    for (let i = 0; i < numberOfChildren; i++)
      if (this._children[i] && this._children[i].getComputedValue)
        value.children.push(this._children[i].getComputedValue());

    return value;
  }

  /**
   * Retrieves all children of the current node.
   *
   * @returns {Array.<Node>} An array of children
   */
  getChildren() {
    return this._fullChildren;
  }

  /**
   * Method used internally to retrieve the children of a node. Each index in the
   * returned array represents a path fragment.
   *
   * @private
   * @returns {Array} An array of children. Might contain `null` elements
   */
  getRawChildren() {
    return this._children;
  }

  /**
   * Retrieves the parent of the current node. Unmounted nodes do not have a
   * parent node.
   *
   * @returns {Node} Parent node
   */
  getParent() {
    return this._parent;
  }

  /**
   * Schedules the {@link Node#update} function of the node to be invoked on the
   * next frame (if no update during this frame has been scheduled already).
   * If the node is currently being updated (which means one of the requesters
   * invoked requestsUpdate while being updated itself), an update will be
   * scheduled on the next frame.
   *
   * @param {Object} requester - If the requester has an `onUpdate` method, it
   *                             will be invoked during the next update phase of the node
   * @returns {Node} This instance for chaining
   */
  requestUpdate(requester) {
    if (this._inUpdate || !this.isMounted()) return this.requestUpdateOnNextTick(requester);
    if (this._updateQueue.indexOf(requester) === -1) {
      this._updateQueue.push(requester);
      if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
  }

  /**
   * Schedules an update on the next tick. Similarly to
   * {@link Node#requestUpdate}, `requestUpdateOnNextTick` schedules the node's
   * `onUpdate` function to be invoked on the frame after the next invocation on
   * the node's onUpdate function.
   *
   * @param {Object} requester - If the requester has an `onUpdate` method, it
   *                             will be invoked during the next update phase of the node
   * @returns {Node} This instance for chaining
   */
  requestUpdateOnNextTick(requester) {
    if (this._nextUpdateQueue.indexOf(requester) === -1) this._nextUpdateQueue.push(requester);
    return this;
  }

  /**
   * Checks if the node is mounted. Unmounted nodes are detached from the scene graph.
   *
   * @returns {boolean} Boolean indicating whether the node is mounted or not
   */
  isMounted() {
    return this._mounted;
  }

  /**
   * Checks if the node is being rendered. A node is being rendered when it is
   * mounted to a parent node **and** shown.
   *
   * @returns {boolean} Boolean indicating whether the node is rendered or not
   */
  isRendered() {
    return this._mounted && this._shown;
  }

  /**
   * Checks if the node is visible ("shown").
   *
   * @returns {boolean} Boolean indicating whether the node is visible ("shown") or not
   */
  isShown() {
    return this._shown;
  }

  /**
   * Determines the node's relative opacity.
   * The opacity needs to be within [0, 1], where 0 indicates a completely
   * transparent, therefore invisible node, whereas an opacity of 1 means the
   * node is completely solid.
   *
   * @returns {number} Relative opacity of the node
   */
  getOpacity() {
    return this._opacity;
  }

  /**
   * Determines the node's previously set mount point.
   *
   * @returns {Float32Array} An array representing the mount point
   */
  getMountPoint() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._transformID).getMountPoint();
    else if (this.isMounted()) return TransformSystem.get(this.getLocation()).getMountPoint();
    else throw new Error('This node does not have access to a transform component');
  }

  /**
   * Determines the node's previously set align.
   *
   * @returns {Float32Array} An array representing the align
   */
  getAlign() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._transformID).getAlign();
    else if (this.isMounted()) return TransformSystem.get(this.getLocation()).getAlign();
    else throw new Error('This node does not have access to a transform component');
  }

  /**
   * Determines the node's previously set origin.
   *
   * @returns {Float32Array} An array representing the origin
   */
  getOrigin() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._transformID).getOrigin();
    else if (this.isMounted()) return TransformSystem.get(this.getLocation()).getOrigin();
    else throw new Error('This node does not have access to a transform component');
  }

  /**
   * Determines the node's previously set position.
   *
   * @returns {Float32Array} An array representing the position
   */
  getPosition() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._transformID).getPosition();
    else if (this.isMounted()) return TransformSystem.get(this.getLocation()).getPosition();
    else throw new Error('This node does not have access to a transform component');
  }

  /**
   * Returns the node's current rotation.
   *
   * @returns {Float32Array} An array of four values, showing the rotation as a quaternion
   */
  getRotation() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._transformID).getRotation();
    else if (this.isMounted()) return TransformSystem.get(this.getLocation()).getRotation();
    else throw new Error('This node does not have access to a transform component');
  }

  /**
   * Returns the scale of the node.
   *
   * @returns {Float32Array} An array showing the current scale vector
   */
  getScale() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._transformID).getScale();
    else if (this.isMounted()) return TransformSystem.get(this.getLocation()).getScale();
    else throw new Error('This node does not have access to a transform component');
  }

  /**
   * Returns the current size mode of the node.
   *
   * @returns {Uint8Array} An array of numbers showing the current size mode
   */
  getSizeMode() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._sizeID).getSizeMode();
    else if (this.isMounted()) return SizeSystem.get(this.getLocation()).getSizeMode();
    else throw new Error('This node does not have access to a size component');
  }

  /**
   * Returns the current proportional size.
   *
   * @returns {Float32Array} A vector 3 showing the current proportional size
   */
  getProportionalSize() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._sizeID).getProportional();
    else if (this.isMounted()) return SizeSystem.get(this.getLocation()).getProportional();
    else throw new Error('This node does not have access to a size component');
  }

  /**
   * Returns the differential size of the node.
   *
   * @returns {Float32Array} A vector 3 showing the current differential size
   */
  getDifferentialSize() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._sizeID).getDifferential();
    else if (this.isMounted()) return SizeSystem.get(this.getLocation()).getDifferential();
    else throw new Error('This node does not have access to a size component');
  }

  /**
   * Returns the absolute size of the node.
   *
   * @returns {Float32Array} A vector 3 showing the current absolute size of the node
   */
  getAbsoluteSize() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      return this.getComponent(this._sizeID).getAbsolute();
    else if (this.isMounted()) return SizeSystem.get(this.getLocation()).getAbsolute();
    else throw new Error('This node does not have access to a size component');
  }

  /**
   * Returns the current Render Size of the node. Note that the render size
   * is asynchronous (will always be one frame behind) and needs to be explicitly
   * calculated by setting the proper size mode.
   *
   * @returns {Float32Array} A vector 3 showing the current render size
   */
  getRenderSize() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS) return this.getComponent(this._sizeID).getRender();
    else if (this.isMounted()) return SizeSystem.get(this.getLocation()).getRender();
    else throw new Error('This node does not have access to a size component');
  }

  /**
   * Returns the external size of the node.
   *
   * @returns {Float32Array} A vector 3 of the final calculated size of the node
   */
  getSize() {
    if (!this.constructor.NO_DEFAULT_COMPONENTS) return this.getComponent(this._sizeID).get();
    else if (this.isMounted()) return SizeSystem.get(this.getLocation()).get();
    else throw new Error('This node does not have access to a size component');
  }

  /**
   * Returns the current world transform of the node.
   *
   * @returns {*} A transform object
   */
  getTransform() {
    return TransformSystem.get(this.getLocation());
  }

  /**
   * Get the list of the UI Events that are currently associated with this node.
   *
   * @returns {Array} An array of strings representing the current subscribed UI event of this node
   */
  getUIEvents() {
    return this._UIEvents;
  }

  /**
   * Adds a new child to this node. If this method is called with no argument it will
   * create a new node, however it can also be called with an existing node which it will
   * append to the node that this method is being called on. Returns the new or passed in node.
   *
   * @param {Node} [child] - The node to append or no node to create a new node
   * @returns {Node} The appended node
   */
  addChild(child) {
    let index = child ? this._children.indexOf(child) : -1;
    child = child ? child : new Node();

    if (index === -1) {
      index = this._freedChildIndicies.length
        ? this._freedChildIndicies.pop()
        : this._children.length;

      this._children[index] = child;
      this._fullChildren.push(child);
    }

    if (this.isMounted()) child.mount(this.getLocation() + '/' + index);

    return child;
  }

  /**
   * Removes a child node from another node. The passed in node must be
   * a child of the node that this method is called upon.
   *
   * @param {Node} child - Node to be removed
   * @returns {boolean} Whether or not the node was successfully removed
   */
  removeChild(child) {
    const index = this._children.indexOf(child);

    if (index > -1) {
      this._freedChildIndicies.push(index);

      this._children[index] = null;

      if (child.isMounted()) child.dismount();

      const fullChildrenIndex = this._fullChildren.indexOf(child);
      const len = this._fullChildren.length;

      for (let i = fullChildrenIndex; i < len - 1; i++)
        this._fullChildren[i] = this._fullChildren[i + 1];

      this._fullChildren.pop();

      return true;
    } else {
      return false;
    }
  }

  /**
   * Each component can only be added once per node.
   *
   * @param {Object} component - A component to be added
   * @returns {number} The index at which the component has been registered.
   *                   Indices aren't necessarily consecutive
   */
  addComponent(component) {
    let index = this._components.indexOf(component);
    if (index === -1) {
      index = this._freedComponentIndicies.length
        ? this._freedComponentIndicies.pop()
        : this._components.length;
      this._components[index] = component;

      if (this.isMounted() && component.onMount) component.onMount(this, index);

      if (this.isShown() && component.onShow) component.onShow();
    }

    return index;
  }

  /**
   * Get a component at a specific index.
   *
   * @param {number} index - Index at which the component has been registered
   *                         (using `Node#addComponent`)
   * @returns {*} The component registered at the passed in index (if any)
   */
  getComponent(index) {
    return this._components[index];
  }

  /**
   * Removes a previously via {@link Node#addComponent} added component.
   *
   * @param {Object} component - A component that has previously been added
   *                             using {@link Node#addComponent}
   * @returns {Object} The removed component
   */
  removeComponent(component) {
    const index = this._components.indexOf(component);
    if (index !== -1) {
      this._freedComponentIndicies.push(index);
      if (this.isShown() && component.onHide) component.onHide();

      if (this.isMounted() && component.onDismount) component.onDismount();

      this._components[index] = null;
    }
    return component;
  }

  /**
   * Removes a node's subscription to a particular UIEvent. All components
   * on the node will have the opportunity to remove all listeners depending
   * on this event.
   *
   * @param {string} eventName - The name of the event
   * @returns {void}
   */
  removeUIEvent(eventName) {
    const UIEvents = this.getUIEvents();
    const components = this._components;

    const index = UIEvents.indexOf(eventName);
    if (index !== -1) {
      UIEvents.splice(index, 1);
      for (let i = 0, len = components.length; i < len; i++) {
        const component = components[i];
        if (component && component.onRemoveUIEvent) component.onRemoveUIEvent(eventName);
      }
    }
  }

  /**
   * Subscribes a node to a UI Event. All components on the node
   * will have the opportunity to begin listening to that event
   * and alerting the scene graph.
   *
   * @param {string} eventName - The name of the event
   * @returns {Node} This instance for chaining
   */
  addUIEvent(eventName) {
    const UIEvents = this.getUIEvents();
    const components = this._components;

    const added = UIEvents.indexOf(eventName) !== -1;
    if (!added) {
      UIEvents.push(eventName);
      for (let i = 0, len = components.length; i < len; i++) {
        const component = components[i];
        if (component && component.onAddUIEvent) component.onAddUIEvent(eventName);
      }
    }

    return this;
  }

  /**
   * Private method for the Node to request an update for itself.
   *
   * @private
   * @param {boolean} [force] - Whether or not to force the update
   * @returns {void}
   */
  _requestUpdate(force) {
    if (force || !this._requestingUpdate) {
      if (this._updater) this._updater.requestUpdate(this);
      this._requestingUpdate = true;
    }
  }

  /**
   * Private method to set an optional value in an array, and
   * request an update if this changes the value of the array.
   *
   * @private
   * @param {Array} vec - The array to insert the value into
   * @param {number} index - The index at which to insert the value
   * @param {*} val - The value to potentially insert (if not null or undefined)
   * @returns {boolean} Whether or not a new value was inserted
   */
  _vecOptionalSet(vec, index, val) {
    if (val != null && vec[index] !== val) {
      vec[index] = val;
      if (!this._requestingUpdate) this._requestUpdate();
      return true;
    }
    return false;
  }

  /**
   * Shows the node, which is to say, calls onShow on all of the
   * node's components. Renderable components can then issue the
   * draw commands necessary to be shown.
   *
   * @returns {Node} This instance for chaining
   */
  show() {
    Dispatch.show(this.getLocation());
    this._shown = true;
    return this;
  }

  /**
   * Hides the node, which is to say, calls onHide on all of the
   * node's components. Renderable components can then issue
   * the draw commands necessary to be hidden.
   *
   * @returns {Node} This instance for chaining
   */
  hide() {
    Dispatch.hide(this.getLocation());
    this._shown = false;
    return this;
  }

  /**
   * Sets the align value of the node. Will call onAlignChange
   * on all of the Node's components.
   *
   * @param {number} [x] - Align value in the x dimension
   * @param {number} [y] - Align value in the y dimension
   * @param {number} [z] - Align value in the z dimension
   * @returns {Node} This instance for chaining
   */
  setAlign(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._transformID).setAlign(x, y, z);
    else if (this.isMounted()) TransformSystem.get(this.getLocation()).setAlign(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
  }

  /**
   * Sets the mount point value of the node. Will call onMountPointChange
   * on all of the node's components.
   *
   * @param {number} [x] - MountPoint value in x dimension
   * @param {number} [y] - MountPoint value in y dimension
   * @param {number} [z] - MountPoint value in z dimension
   * @returns {Node} This instance for chaining
   */
  setMountPoint(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._transformID).setMountPoint(x, y, z);
    else if (this.isMounted()) TransformSystem.get(this.getLocation()).setMountPoint(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
  }

  /**
   * Sets the origin value of the node. Will call onOriginChange
   * on all of the node's components.
   *
   * @param {number} [x] - Origin value in x dimension
   * @param {number} [y] - Origin value in y dimension
   * @param {number} [z] - Origin value in z dimension
   * @returns {Node} This instance for chaining
   */
  setOrigin(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._transformID).setOrigin(x, y, z);
    else if (this.isMounted()) TransformSystem.get(this.getLocation()).setOrigin(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
  }

  /**
   * Sets the position of the node. Will call onPositionChange
   * on all of the node's components.
   *
   * @param {number} [x] - Position value in x
   * @param {number} [y] - Position value in y
   * @param {number} [z] - Position value in z
   * @returns {Node} This instance for chaining
   */
  setPosition(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._transformID).setPosition(x, y, z);
    else if (this.isMounted()) TransformSystem.get(this.getLocation()).setPosition(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
  }

  /**
   * Sets the rotation of the node. Will call onRotationChange
   * on all of the node's components. This method takes either
   * Euler angles or a quaternion. If the fourth argument is undefined
   * Euler angles are assumed.
   *
   * @param {number} [x] - Either the rotation around the x axis or the magnitude in x of the axis of rotation
   * @param {number} [y] - Either the rotation around the y axis or the magnitude in y of the axis of rotation
   * @param {number} [z] - Either the rotation around the z axis or the magnitude in z of the axis of rotation
   * @param {number} [w] - The amount of rotation around the axis of rotation if a quaternion is being set
   * @returns {Node} This instance for chaining
   */
  setRotation(x, y, z, w) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._transformID).setRotation(x, y, z, w);
    else if (this.isMounted()) TransformSystem.get(this.getLocation()).setRotation(x, y, z, w);
    else throw new Error('This node does not have access to a transform component');
    return this;
  }

  /**
   * Sets the scale of the node. The default value is 1 in all dimensions.
   * The node's components will have onScaleChanged called on them.
   *
   * @param {number} [x] - Scale value in x
   * @param {number} [y] - Scale value in y
   * @param {number} [z] - Scale value in z
   * @returns {Node} This instance for chaining
   */
  setScale(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._transformID).setScale(x, y, z);
    else if (this.isMounted()) TransformSystem.get(this.getLocation()).setScale(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
  }

  /**
   * Sets the opacity of this node. All of this node's components will have
   * the onOpacityChange method called on them.
   *
   * @param {number} val - Value of the opacity. 1 is the default.
   * @returns {Node} This instance for chaining
   */
  setOpacity(val) {
    if (this._vecOptionalSet(this, '_opacity', val)) {
      let i = 0;
      const list = this._components;
      const len = list.length;
      for (; i < len; i++)
        if (list[i] && list[i].onOpacityChange) list[i].onOpacityChange(val);
    }
    return this;
  }

  /**
   * Sets the size mode being used for determining the node's final width, height
   * and depth.
   * Size modes are a way to define the way the node's size is being calculated.
   * Size modes are enums set on the @{@link Size} constructor (and aliased on
   * the Node).
   *
   * @example
   * node.setSizeMode(Node.RELATIVE_SIZE, Node.ABSOLUTE_SIZE, Node.ABSOLUTE_SIZE);
   * // Instead of null, any proporional height or depth can be passed in, since
   * // it would be ignored in any case.
   * node.setProportionalSize(0.5, null, null);
   * node.setAbsoluteSize(null, 100, 200);
   *
   * @param {number|string} [x] - The size mode being used for determining the size in x direction
   * @param {number|string} [y] - The size mode being used for determining the size in y direction
   * @param {number|string} [z] - The size mode being used for determining the size in z direction
   * @returns {Node} This instance for chaining
   */
  setSizeMode(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS) this.getComponent(this._sizeID).setSizeMode(x, y, z);
    else if (this.isMounted()) SizeSystem.get(this.getLocation()).setSizeMode(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
  }

  /**
   * Sets the proportional size to be used in determining the size of the node.
   *
   * Proportional size is directly related to the size of its parent.
   * If the parent's size was `[100, 150]`, the node's `setProportionalSize(0.5, 0.5)`
   * caused the node to be `[50, 75]`.
   *
   * @param {number} [x] - The proportional width to be set
   * @param {number} [y] - The proportional height to be set
   * @param {number} [z] - The proportional depth to be set
   * @returns {Node} This instance for chaining
   */
  setProportionalSize(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._sizeID).setProportional(x, y, z);
    else if (this.isMounted()) SizeSystem.get(this.getLocation()).setProportional(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
  }

  /**
   * Sets the differential size to be used in determining the size of the node.
   *
   * Differential size is defined with respect to the total size of the node
   * and is a way to remove or add space from the total size of the node.
   *
   * @example
   * node.setProportionalSize(0.5, 0.5);
   * node.setDifferentialSize(-20, -20);
   *
   * @param {number} [x] - The differential width to be set in pixels
   * @param {number} [y] - The differential height to be set in pixels
   * @param {number} [z] - The differential depth to be set in pixels
   * @returns {Node} This instance for chaining
   */
  setDifferentialSize(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
      this.getComponent(this._sizeID).setDifferential(x, y, z);
    else if (this.isMounted()) SizeSystem.get(this.getLocation()).setDifferential(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
  }

  /**
   * Sets the absolute size to be used in determining the size of the node.
   *
   * @param {number} [x] - The width to be set in pixels
   * @param {number} [y] - The height to be set in pixels
   * @param {number} [z] - The depth to be set in pixels
   * @returns {Node} This instance for chaining
   */
  setAbsoluteSize(x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS) this.getComponent(this._sizeID).setAbsolute(x, y, z);
    else if (this.isMounted()) SizeSystem.get(this.getLocation()).setAbsolute(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
  }

  /**
   * Private method for getting the time from the Engine's clock
   *
   * @private
   * @returns {number|undefined} The clock time of the Engine's clock
   */
  getFrame() {
    return this._updater ? this._updater.getClock().getTime() : undefined;
  }

  /**
   * Get the list of components currently attached to this node.
   *
   * @returns {Array} List of components
   */
  getComponents() {
    return this._components;
  }

  /**
   * The update method gets called by the Engine for all nodes.
   *
   * @param {number} time - The current time in milliseconds
   * @returns {void}
   */
  update(time) {
    this._inUpdate = true;
    const nextQueue = this._nextUpdateQueue;
    const queue = this._updateQueue;
    let item;

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
      item = queue.shift();
      if (item && item.onUpdate) item.onUpdate(time);
    }

    this._inUpdate = false;
    this._requestingUpdate = false;
  }

  /**
   * Mounts the node and therefore its subtree by setting its new path and
   * triggering the `onMount` method on all its components (placing new Draw
   * Commands, etc.).
   *
   * @param {string} path - Path the node will be mounted to
   * @returns {void}
   */
  mount(path) {
    if (this.isMounted()) throw new Error('Node is already mounted at: ' + this.getLocation());

    Dispatch.mount(path, this);

    if (!this.constructor.NO_DEFAULT_COMPONENTS) {
      TransformSystem.registerTransformAtPath(
        path,
        this.getComponent(this._transformID),
        this._parent
      );
      SizeSystem.registerSizeAtPath(path, this.getComponent(this._sizeID));
    } else {
      TransformSystem.registerTransformAtPath(path);
      SizeSystem.registerSizeAtPath(path);
    }
  }

  /**
   * Dismounts (detaches) the node from the scene graph by removing it from the
   * registry and triggering the `onDismount` method on all of its components.
   *
   * @returns {void}
   */
  dismount() {
    if (!this.isMounted()) throw new Error('Node is not mounted at path: ' + this.getLocation());

    const path = this.getLocation();

    Dispatch.dismount(path);

    TransformSystem.deregisterTransformAtPath(path);
    SizeSystem.deregisterSizeAtPath(path);
  }
}

// Alias for getLocation
Node.prototype.getId = Node.prototype.getLocation;

// Static size mode constants
Node.RELATIVE_SIZE = 0;
Node.ABSOLUTE_SIZE = 1;
Node.RENDER_SIZE = 2;
Node.DEFAULT_SIZE = 0;
Node.NO_DEFAULT_COMPONENTS = false;

module.exports = Node;
