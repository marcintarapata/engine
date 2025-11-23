/**
 * TypeScript declarations for Famous Engine
 * @module famous
 */

/// <reference path="./core.d.ts" />
/// <reference path="./components.d.ts" />
/// <reference path="./math.d.ts" />
/// <reference path="./transitions.d.ts" />
/// <reference path="./errors.d.ts" />
/// <reference path="./builders.d.ts" />
/// <reference path="./physics.d.ts" />
/// <reference path="./dom-renderables.d.ts" />
/// <reference path="./renderers.d.ts" />
/// <reference path="./utilities.d.ts" />

declare module 'famous' {
  // Core module
  import * as core from 'famous/core';
  export { core };

  // Components module
  import * as components from 'famous/components';
  export { components };

  // Math module
  import * as math from 'famous/math';
  export { math };

  // Physics module
  import * as physics from 'famous/physics';
  export { physics };

  // Transitions module
  import * as transitions from 'famous/transitions';
  export { transitions };

  // Utilities module
  import * as utilities from 'famous/utilities';
  export { utilities };

  // Renderers module
  import * as renderers from 'famous/renderers';
  export { renderers };

  // DOM modules
  import * as domRenderables from 'famous/dom-renderables';
  import * as domRenderers from 'famous/dom-renderers';
  export { domRenderables, domRenderers };

  // WebGL modules
  import * as webglRenderables from 'famous/webgl-renderables';
  import * as webglRenderers from 'famous/webgl-renderers';
  import * as webglGeometries from 'famous/webgl-geometries';
  import * as webglMaterials from 'famous/webgl-materials';
  import * as webglShaders from 'famous/webgl-shaders';
  export { webglRenderables, webglRenderers, webglGeometries, webglMaterials, webglShaders };

  // Render loops
  import * as renderLoops from 'famous/render-loops';
  export { renderLoops };

  // Polyfills
  import * as polyfills from 'famous/polyfills';
  export { polyfills };

  // Errors module
  import * as errors from 'famous/errors';
  export { errors };

  // Builders module
  import * as builders from 'famous/builders';
  export { builders };

  // Builder factory functions
  import { EngineBuilder } from 'famous/builders/EngineBuilder';
  import { SceneBuilder } from 'famous/builders/SceneBuilder';
  import { NodeBuilder } from 'famous/builders/NodeBuilder';
  import { Node } from 'famous/core/Node';
  import { Scene } from 'famous/core/Scene';

  export function createEngine(): EngineBuilder;
  export function createScene(selector: string, engine?: any): SceneBuilder;
  export function createNode(parent?: Node): NodeBuilder;
}

// Additional module declarations for less-used modules

declare module 'famous/utilities' {
  export function clamp(value: number, min: number, max: number): number;
  export function clone<T>(obj: T): T;
  export function strip(str: string): string;
  export function vendorPrefix(property: string): string;
  export function loadURL(url: string, callback: (err: Error | null, data: string) => void): void;

  export class CallbackStore {
    constructor();
    on(key: string, callback: Function): void;
    off(key: string, callback?: Function): void;
    trigger(key: string, ...args: any[]): void;
  }

  export class Registry {
    constructor();
    register(key: string, value: any): void;
    unregister(key: string): void;
    get(key: string): any;
  }

  export class ObjectManager {
    constructor();
    register(type: string, Constructor: new () => any): void;
    requestObject(type: string): any;
    disposeObject(obj: any, type: string): void;
  }

  export class Color {
    constructor(color?: string | number[] | Color);
    set(r: number, g: number, b: number, a?: number): Color;
    getHex(): string;
    getRGB(): string;
    getRGBA(): string;
    getNormalizedRGB(): number[];
    getNormalizedRGBA(): number[];
    toArray(): number[];
    clone(): Color;
  }

  export const KeyCodes: {
    [key: string]: number;
  };
}

declare module 'famous/render-loops' {
  export class RequestAnimationFrameLoop {
    constructor();
    start(): RequestAnimationFrameLoop;
    stop(): RequestAnimationFrameLoop;
    step(time: number): RequestAnimationFrameLoop;
    isRunning(): boolean;
  }

  export class ContainerLoop {
    constructor(container: HTMLElement);
    start(): ContainerLoop;
    stop(): ContainerLoop;
    step(time: number): ContainerLoop;
    isRunning(): boolean;
  }
}

declare module 'famous/renderers' {
  export class Compositor {
    constructor();
    sendEvent(path: string, type: string, event: any): void;
    drawCommands(commands: any[]): void;
    clearCommands(): void;
    receiveCommands(commands: any[]): void;
    getOrSetContext(selector: string): any;
    getContext(selector: string): any;
  }

  export class Context {
    constructor(selector: string, compositor: Compositor);
    draw(): void;
    getRootSize(): number[];
    getDOMRenderer(): any;
    getWebGLRenderer(): any;
    updateSize(): void;
  }

  export class UIManager {
    constructor(channel: any, compositor: Compositor, renderLoop: any);
    getChannel(): any;
    getCompositor(): Compositor;
    getRenderLoop(): any;
    update(time: number): void;
    resize(): void;
  }
}

declare module 'famous/polyfills' {
  export function animationFrame(): void;
}
