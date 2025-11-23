/**
 * TypeScript declarations for Famous Engine Core Module
 * @module famous/core
 */

declare module 'famous/core' {
  export { FamousEngine } from 'famous/core/FamousEngine';
  export { Node } from 'famous/core/Node';
  export { Scene } from 'famous/core/Scene';
  export { Transform } from 'famous/core/Transform';
  export { Size } from 'famous/core/Size';
  export { Clock } from 'famous/core/Clock';
  export { Dispatch } from 'famous/core/Dispatch';
  export { Event } from 'famous/core/Event';
  export { Channel } from 'famous/core/Channel';
  export { Commands } from 'famous/core/Commands';
  export { Path } from 'famous/core/Path';
  export { PathStore } from 'famous/core/PathStore';
  export { SizeSystem } from 'famous/core/SizeSystem';
  export { TransformSystem } from 'famous/core/TransformSystem';
}

declare module 'famous/core/FamousEngine' {
  import { Scene } from 'famous/core/Scene';
  import { Clock } from 'famous/core/Clock';

  interface InitOptions {
    compositor?: any;
    renderLoop?: any;
  }

  interface FamousEngineInstance {
    compositor: any;
    renderLoop: any;
    uiManager: any;

    init(options?: InitOptions): FamousEngineInstance;
    setChannel(channel: any): FamousEngineInstance;
    getChannel(): any;
    requestUpdate(requester: any): void;
    requestUpdateOnNextTick(requester: any): void;
    handleMessage(messages: any[]): FamousEngineInstance;
    handleWith(messages: any[]): FamousEngineInstance;
    handleFrame(messages: any[]): FamousEngineInstance;
    step(time: number): FamousEngineInstance;
    getContext(selector: string): any;
    getClock(): Clock;
    message(command: any): FamousEngineInstance;
    createScene(selector?: string): Scene;
    addScene(scene: Scene): FamousEngineInstance;
    removeScene(scene: Scene): FamousEngineInstance;
    startRenderLoop(): FamousEngineInstance;
    stopRenderLoop(): FamousEngineInstance;
    /** @deprecated Use startRenderLoop() instead */
    startEngine(): FamousEngineInstance;
    /** @deprecated Use stopRenderLoop() instead */
    stopEngine(): FamousEngineInstance;
  }

  const FamousEngine: FamousEngineInstance;
  export = FamousEngine;
}

declare module 'famous/core/Node' {
  import { Transform } from 'famous/core/Transform';

  interface NodeValue {
    location: string;
    align: Float32Array;
    mountPoint: Float32Array;
    origin: Float32Array;
    transform: Float32Array;
    size: Float32Array;
    sizeMode: Uint8Array;
    opacity: number;
  }

  interface Component {
    onMount?(node: Node, id: number): void;
    onDismount?(): void;
    onShow?(): void;
    onHide?(): void;
    onUpdate?(time: number): void;
    onReceive?(event: string, payload: any): void;
    onTransformChange?(transform: Float32Array): void;
    onSizeChange?(size: Float32Array): void;
    onSizeModeChange?(mode: Uint8Array): void;
    onOpacityChange?(opacity: number): void;
    onOriginChange?(origin: Float32Array): void;
    onAlignChange?(align: Float32Array): void;
    onMountPointChange?(mountPoint: Float32Array): void;
  }

  class Node {
    static readonly RELATIVE_SIZE: number;
    static readonly ABSOLUTE_SIZE: number;
    static readonly RENDER_SIZE: number;
    static readonly DEFAULT_SIZE: number;
    static readonly NO_DEFAULT_COMPONENTS: boolean;

    constructor();

    // Location & Identity
    getLocation(): string;
    getId(): string;

    // Events
    emit(event: string, payload?: any): Node;
    on(event: string, handler: (payload: any) => void): void;

    // Values
    getValue(): NodeValue;
    /** @deprecated Use getValue() instead */
    getComputedValue(): NodeValue;

    // Hierarchy
    getChildren(): Node[];
    getParent(): Node | null;
    addChild(child?: Node): Node;
    removeChild(child: Node): boolean;

    // Components
    addComponent(component: Component): number;
    getComponent(index: number): Component | null;
    removeComponent(component: Component): Component | null;
    getComponents(): Component[];

    // Update Requests
    requestUpdate(requester: any): Node;
    requestUpdateOnNextTick(requester: any): Node;

    // State
    isMounted(): boolean;
    isRendered(): boolean;
    isShown(): boolean;

    // Transform Getters
    getOpacity(): number;
    getMountPoint(): Float32Array;
    getAlign(): Float32Array;
    getOrigin(): Float32Array;
    getPosition(): Float32Array;
    getRotation(): Float32Array;
    getScale(): Float32Array;
    getTransform(): Transform;

    // Size Getters
    getSizeMode(): Uint8Array;
    getProportionalSize(): Float32Array;
    getDifferentialSize(): Float32Array;
    getAbsoluteSize(): Float32Array;
    getRenderSize(): Float32Array;
    getSize(): Float32Array;

    // Transform Setters (chainable)
    setAlign(x?: number, y?: number, z?: number): Node;
    setMountPoint(x?: number, y?: number, z?: number): Node;
    setOrigin(x?: number, y?: number, z?: number): Node;
    setPosition(x?: number, y?: number, z?: number): Node;
    setRotation(x?: number, y?: number, z?: number, w?: number): Node;
    setScale(x?: number, y?: number, z?: number): Node;
    setOpacity(val: number): Node;

    // Size Setters (chainable)
    setSizeMode(x?: number | string, y?: number | string, z?: number | string): Node;
    setProportionalSize(x?: number, y?: number, z?: number): Node;
    setDifferentialSize(x?: number, y?: number, z?: number): Node;
    setAbsoluteSize(x?: number, y?: number, z?: number): Node;

    // UI Events
    getUIEvents(): string[];
    addUIEvent(eventName: string): Node;
    removeUIEvent(eventName: string): void;

    // Visibility
    show(): Node;
    hide(): Node;

    // Lifecycle
    update(time: number): void;
    mount(path: string): void;
    dismount(): void;

    /** @deprecated */
    sendDrawMessage(message: any): Node;
  }

  export = Node;
}

declare module 'famous/core/Scene' {
  import { Node } from 'famous/core/Node';

  class Scene extends Node {
    static readonly NO_DEFAULT_COMPONENTS: boolean;

    constructor(selector: string, updater: any);

    getUpdater(): any;
    getSelector(): string;
    /** @deprecated */
    getDispatch(): any;
    onReceive(event: string, payload: any): void;
  }

  export = Scene;
}

declare module 'famous/core/Transform' {
  interface TransformVectors {
    position: Float32Array;
    positionChanged: boolean;
    rotation: Float32Array;
    rotationChanged: boolean;
    scale: Float32Array;
    scaleChanged: boolean;
  }

  interface TransformOffsets {
    align: Float32Array;
    alignChanged: boolean;
    mountPoint: Float32Array;
    mountPointChanged: boolean;
    origin: Float32Array;
    originChanged: boolean;
  }

  class Transform {
    static readonly IDENT: Float32Array;
    static readonly WORLD_CHANGED: number;
    static readonly LOCAL_CHANGED: number;

    local: Float32Array;
    global: Float32Array;
    offsets: TransformOffsets;
    vectors: TransformVectors;
    parent: Transform | null;
    breakPoint: boolean;
    calculatingWorldMatrix: boolean;

    constructor(parent?: Transform);

    reset(): void;
    setParent(parent: Transform): void;
    getParent(): Transform | null;
    setBreakPoint(): void;
    setCalculateWorldMatrix(): void;
    isBreakPoint(): boolean;
    getLocalTransform(): Float32Array;
    getWorldTransform(): Float32Array;
    calculate(node: any): number;
    calculateWorldMatrix(): boolean;

    // Position
    getPosition(): Float32Array;
    setPosition(x?: number, y?: number, z?: number): void;

    // Rotation (quaternion)
    getRotation(): Float32Array;
    setRotation(x?: number, y?: number, z?: number, w?: number): void;

    // Scale
    getScale(): Float32Array;
    setScale(x?: number, y?: number, z?: number): void;

    // Offsets
    getAlign(): Float32Array;
    setAlign(x?: number, y?: number, z?: number): void;
    getMountPoint(): Float32Array;
    setMountPoint(x?: number, y?: number, z?: number): void;
    getOrigin(): Float32Array;
    setOrigin(x?: number, y?: number, z?: number): void;
  }

  export = Transform;
}

declare module 'famous/core/Size' {
  class Size {
    static readonly RELATIVE: number;
    static readonly ABSOLUTE: number;
    static readonly RENDER: number;
    static readonly DEFAULT: number;

    finalSize: Float32Array;
    sizeChanged: boolean;
    sizeMode: Uint8Array;
    sizeModeChanged: boolean;
    absoluteSize: Float32Array;
    absoluteSizeChanged: boolean;
    proportionalSize: Float32Array;
    proportionalSizeChanged: boolean;
    differentialSize: Float32Array;
    differentialSizeChanged: boolean;
    renderSize: Float32Array;
    renderSizeChanged: boolean;
    parent: Size | null;

    constructor(parent?: Size);

    setParent(parent: Size): Size;
    getParent(): Size | undefined;
    setSizeMode(x?: number | string, y?: number | string, z?: number | string): Size;
    getSizeMode(): Uint8Array;
    setAbsolute(x?: number, y?: number, z?: number): Size;
    getAbsolute(): Float32Array;
    setProportional(x?: number, y?: number, z?: number): Size;
    getProportional(): Float32Array;
    setDifferential(x?: number, y?: number, z?: number): Size;
    getDifferential(): Float32Array;
    get(): Float32Array;
    fromComponents(components: any[]): boolean;
  }

  export = Size;
}

declare module 'famous/core/Clock' {
  type TimerCallback = (...args: any[]) => void;
  type TimerRef = () => void;

  class Clock {
    constructor();

    setScale(scale: number): Clock;
    getScale(): number;
    step(time: number): Clock;
    now(): number;
    getFrame(): number;
    setTimeout(callback: TimerCallback, delay: number, ...args: any[]): TimerRef;
    setInterval(callback: TimerCallback, delay: number, ...args: any[]): TimerRef;
    clearTimer(timer: TimerRef): Clock;
    /** @deprecated Use now() instead */
    getTime(): number;
  }

  export = Clock;
}

declare module 'famous/core/Dispatch' {
  interface DispatchInstance {
    addChildrenToQueue(node: any): void;
    next(): any;
    breadthFirstNext(): any;
    mount(path: string, node: any): void;
    dismount(path: string): void;
    getNode(path: string): any;
    show(path: string): void;
    hide(path: string): void;
    lookupNode(location: string): any;
    dispatch(path: string, event: string, payload?: any): void;
    dispatchUIEvent(path: string, event: string, payload?: any): void;
  }

  const Dispatch: DispatchInstance;
  export = Dispatch;
}

declare module 'famous/core/Event' {
  class Event {
    propagationStopped: boolean;

    constructor();

    stopPropagation(): void;
  }

  export = Event;
}

declare module 'famous/core/Channel' {
  class Channel {
    constructor();

    sendMessage(message: any): void;
    onMessage?: (message: any) => void;
  }

  export = Channel;
}

declare module 'famous/core/Commands' {
  const Commands: {
    readonly TIME: number;
    readonly WITH: number;
    readonly TRIGGER: number;
    readonly FRAME: number;
    readonly ENGINE: number;
    readonly START: number;
    readonly STOP: number;
    readonly INIT: number;
    readonly SHOW: number;
    readonly HIDE: number;
    readonly READY: number;
    readonly NEED_SIZE_FOR: number;
    readonly GL_SET_DRAW_OPTIONS: number;
    readonly GL_AMBIENT_LIGHT: number;
    readonly GL_LIGHT_POSITION: number;
    readonly GL_LIGHT_COLOR: number;
    readonly MATERIAL_INPUT: number;
    readonly GL_SET_GEOMETRY: number;
    readonly GL_UNIFORMS: number;
    readonly GL_BUFFER_DATA: number;
    readonly GL_CUTOUT_STATE: number;
    readonly GL_MESH_VISIBILITY: number;
    readonly GL_REMOVE_MESH: number;
    readonly PINHOLE_PROJECTION: number;
    readonly ORTHOGRAPHIC_PROJECTION: number;
    readonly CHANGE_VIEW_TRANSFORM: number;
    readonly PREVENT_DEFAULT: number;
    readonly ALLOW_DEFAULT: number;
    readonly CHANGE_TRANSFORM: number;
    readonly CHANGE_SIZE: number;
    readonly CHANGE_PROPERTY: number;
    readonly CHANGE_CONTENT: number;
    readonly CHANGE_ATTRIBUTE: number;
    readonly ADD_CLASS: number;
    readonly REMOVE_CLASS: number;
    readonly ADD_EVENT_LISTENER: number;
    readonly REMOVE_EVENT_LISTENER: number;
    readonly DOM_RENDER_SIZE: number;
    readonly CHANGE_TAG: number;
  };

  export = Commands;
}

declare module 'famous/core/Path' {
  function depth(path: string): number;
  function parent(path: string): string;
  function hasTrailingSlash(path: string): boolean;
  function index(path: string): number;
  function indexAtDepth(path: string, depth: number): number;

  export { depth, parent, hasTrailingSlash, index, indexAtDepth };
}

declare module 'famous/core/PathStore' {
  class PathStore {
    constructor();

    insert(path: string, node: any): void;
    remove(path: string): void;
    get(path: string): any;
    getItems(): any[];
  }

  export = PathStore;
}

declare module 'famous/core/SizeSystem' {
  const SizeSystem: {
    update(): void;
    registerSizeAtPath(path: string, size?: any): any;
    deregisterSizeAtPath(path: string): void;
    get(path: string): any;
  };

  export = SizeSystem;
}

declare module 'famous/core/TransformSystem' {
  const TransformSystem: {
    update(): void;
    registerTransformAtPath(path: string, transform?: any): any;
    deregisterTransformAtPath(path: string): void;
    get(path: string): any;
    makeBreakPointAt(path: string): void;
    makeCalculateWorldMatrixAt(path: string): void;
  };

  export = TransformSystem;
}
