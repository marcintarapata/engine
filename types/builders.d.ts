/**
 * TypeScript declarations for Famous Engine Builders Module
 * @module famous/builders
 */

declare module 'famous/builders' {
  export { EngineBuilder, createEngineBuilder } from 'famous/builders/EngineBuilder';
  export { SceneBuilder, createSceneBuilder } from 'famous/builders/SceneBuilder';
  export { NodeBuilder, createNodeBuilder } from 'famous/builders/NodeBuilder';
}

declare module 'famous/builders/EngineBuilder' {
  interface FamousEngineInstance {
    init(options?: any): FamousEngineInstance;
    setChannel(channel: any): FamousEngineInstance;
    startRenderLoop(): FamousEngineInstance;
    createScene(selector?: string): any;
  }

  class EngineBuilder {
    constructor(FamousEngineClass: new () => FamousEngineInstance);

    withCompositor(compositor: any): EngineBuilder;
    withRenderLoop(renderLoop: any): EngineBuilder;
    withClock(clock: any): EngineBuilder;
    withChannel(channel: any): EngineBuilder;
    withAutoStart(autoStart?: boolean): EngineBuilder;
    build(): FamousEngineInstance;
    reset(): EngineBuilder;
  }

  function createEngineBuilder(FamousEngineClass: new () => FamousEngineInstance): EngineBuilder;

  export { EngineBuilder, createEngineBuilder };
}

declare module 'famous/builders/SceneBuilder' {
  import { Node } from 'famous/core/Node';

  interface Scene extends Node {
    getSelector(): string;
    getUpdater(): any;
  }

  interface FamousEngineInstance {
    createScene(selector: string): Scene;
  }

  class SceneBuilder {
    constructor(selector: string, engine: FamousEngineInstance);

    withCamera(camera: any): SceneBuilder;
    withPhysics(physics: any): SceneBuilder;
    build(): Scene;
    reset(): SceneBuilder;
  }

  function createSceneBuilder(selector: string, engine: FamousEngineInstance): SceneBuilder;

  export { SceneBuilder, createSceneBuilder };
}

declare module 'famous/builders/NodeBuilder' {
  import { Node } from 'famous/core/Node';

  class NodeBuilder {
    constructor(NodeClass: new () => Node, parent?: Node | null);

    withPosition(x: number, y: number, z: number): NodeBuilder;
    withRotation(x: number, y: number, z: number): NodeBuilder;
    withScale(x: number, y: number, z: number): NodeBuilder;
    withAlign(x: number, y: number, z: number): NodeBuilder;
    withMountPoint(x: number, y: number, z: number): NodeBuilder;
    withOrigin(x: number, y: number, z: number): NodeBuilder;
    withOpacity(opacity: number): NodeBuilder;
    withComponent(component: any): NodeBuilder;
    build(): Node;
    reset(): NodeBuilder;
  }

  function createNodeBuilder(NodeClass: new () => Node, parent?: Node | null): NodeBuilder;

  export { NodeBuilder, createNodeBuilder };
}
