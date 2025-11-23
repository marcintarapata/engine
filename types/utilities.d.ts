/**
 * TypeScript declarations for Famous utilities module
 * @module famous/utilities
 */

declare module 'famous/utilities' {
  /**
   * Callback store for managing event callbacks
   */
  export class CallbackStore {
    constructor();
    on(key: string, callback: Function): CallbackStore;
    off(key: string, callback?: Function): CallbackStore;
    trigger(key: string, ...args: any[]): CallbackStore;
  }

  /**
   * Clamps a value between min and max
   */
  export function clamp(value: number, min: number, max: number): number;

  /**
   * Deep clones an object
   */
  export function clone<T>(obj: T): T;

  /**
   * Color utility class for color manipulation
   */
  export class Color {
    constructor(color?: string | number[] | Color);
    static isColorInstance(obj: any): boolean;
    getNormalizedRGB(): number[];
    getNormalizedRGBA(): number[];
    getHex(): string;
    setHex(hex: string): Color;
    setRGB(r: number, g: number, b: number): Color;
    setRGBA(r: number, g: number, b: number, a: number): Color;
    setHSL(h: number, s: number, l: number): Color;
    setHSLA(h: number, s: number, l: number, a: number): Color;
    getR(): number;
    getG(): number;
    getB(): number;
    getA(): number;
  }

  /**
   * Key code constants
   */
  export const KeyCodes: {
    BACKSPACE: number;
    TAB: number;
    ENTER: number;
    SHIFT: number;
    CTRL: number;
    ALT: number;
    PAUSE: number;
    CAPS_LOCK: number;
    ESCAPE: number;
    SPACE: number;
    PAGE_UP: number;
    PAGE_DOWN: number;
    END: number;
    HOME: number;
    LEFT: number;
    UP: number;
    RIGHT: number;
    DOWN: number;
    INSERT: number;
    DELETE: number;
    [key: string]: number;
  };

  /**
   * Converts key-value pairs to arrays
   */
  export function keyValueToArrays(obj: { [key: string]: any }): { keys: string[]; values: any[] };

  /**
   * Loads a URL and returns a promise with the response
   */
  export function loadURL(url: string, callback?: (err: Error | null, response?: any) => void): void;

  /**
   * Object pool manager
   */
  export class ObjectManager {
    constructor();
    register(type: string, constructor: Function): ObjectManager;
    requestObject(type: string): any;
    freeObject(type: string, obj: any): ObjectManager;
  }

  /**
   * Generic registry for storing and retrieving objects by path
   */
  export class Registry {
    constructor();
    register(path: string, obj: any): any;
    unregister(path: string): any;
    get(path: string): any;
    getValues(): any[];
    getKeys(): string[];
  }

  /**
   * Strips specified characters from a string
   */
  export function strip(str: string, chars: string): string;

  /**
   * Gets vendor-prefixed property name
   */
  export function vendorPrefix(property: string): string | false;

  /**
   * Performance metrics interface
   */
  export interface PerformanceMetrics {
    fps: number;
    avgFrameTime: number;
    minFrameTime: number;
    maxFrameTime: number;
    frameCount: number;
    memory: MemoryMetrics | null;
    gpuTime: number;
  }

  /**
   * Memory metrics interface (Chrome only)
   */
  export interface MemoryMetrics {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usedMB: number;
    totalMB: number;
  }

  /**
   * Performance monitor options
   */
  export interface PerformanceMonitorOptions {
    /** Number of frames to average (default: 60) */
    sampleSize?: number;
    /** Whether to track memory usage (default: false) */
    trackMemory?: boolean;
  }

  /**
   * Performance monitor for tracking FPS, frame times, and GPU performance
   */
  export class PerformanceMonitor {
    constructor(options?: PerformanceMonitorOptions);

    /**
     * Marks the start of a frame
     */
    frameStart(): PerformanceMonitor;

    /**
     * Marks the end of a frame and updates metrics
     */
    frameEnd(): PerformanceMonitor;

    /**
     * Starts a named performance mark
     */
    mark(name: string): PerformanceMonitor;

    /**
     * Measures time since a named mark was started
     */
    measure(name: string): number;

    /**
     * Gets all current performance metrics
     */
    getMetrics(): PerformanceMetrics;

    /**
     * Gets the current FPS
     */
    getFPS(): number;

    /**
     * Gets the average frame time in milliseconds
     */
    getAvgFrameTime(): number;

    /**
     * Sets a callback to be called after each frame
     */
    onUpdate(callback: (metrics: PerformanceMetrics) => void): PerformanceMonitor;

    /**
     * Resets all metrics to initial values
     */
    reset(): PerformanceMonitor;

    /**
     * Creates a formatted string of current metrics
     */
    toString(): string;

    /**
     * Initializes GPU timing queries for WebGL 2
     */
    initGPUTiming(gl: WebGL2RenderingContext): PerformanceMonitor;

    /**
     * Starts a GPU timing query
     */
    beginGPUQuery(): object | null;

    /**
     * Ends a GPU timing query
     */
    endGPUQuery(query: object): PerformanceMonitor;

    /**
     * Resolves pending GPU queries
     */
    resolveGPUQueries(): PerformanceMonitor;
  }
}

/**
 * WebGL capabilities interface
 */
declare module 'famous/webgl-renderers' {
  export interface WebGLCapabilities {
    webglVersion: 1 | 2;
    isWebGL2: boolean;
    maxTextureUnits: number;
    maxVertexAttribs: number;
    maxTextureSize: number;
    maxCubeMapSize: number;
    maxRenderbufferSize: number;
    maxViewportDims: [number, number];
    renderer: string;
    vendor: string;
    vao: boolean;
    instancedArrays: boolean;
    floatTextures: boolean;
    depthTextures: boolean;
    anisotropicFiltering: boolean;
    maxAnisotropy: number;
  }

  export class WebGLRenderer {
    constructor(canvas: HTMLCanvasElement, compositor: any);

    /** WebGL context */
    gl: WebGLRenderingContext | WebGL2RenderingContext;

    /** WebGL version (1 or 2) */
    webglVersion: number;

    /** Whether WebGL 2 is being used */
    isWebGL2: boolean;

    /** WebGL capabilities object */
    capabilities: WebGLCapabilities;

    /**
     * Gets the current WebGL capabilities
     */
    getCapabilities(): WebGLCapabilities;

    /**
     * Creates a Vertex Array Object (if supported)
     */
    _createVAO?(): WebGLVertexArrayObject;

    /**
     * Binds a Vertex Array Object (if supported)
     */
    _bindVAO?(vao: WebGLVertexArrayObject | null): void;

    /**
     * Deletes a Vertex Array Object (if supported)
     */
    _deleteVAO?(vao: WebGLVertexArrayObject): void;

    /**
     * Draws arrays with instancing (if supported)
     */
    _drawArraysInstanced?(mode: number, first: number, count: number, instanceCount: number): void;

    /**
     * Draws elements with instancing (if supported)
     */
    _drawElementsInstanced?(mode: number, count: number, type: number, offset: number, instanceCount: number): void;

    /**
     * Sets vertex attribute divisor for instancing (if supported)
     */
    _vertexAttribDivisor?(index: number, divisor: number): void;
  }
}
