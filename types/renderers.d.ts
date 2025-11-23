/**
 * TypeScript declarations for Famous Engine Renderers Module
 * @module famous/renderers
 */

declare module 'famous/renderers' {
  export { Compositor } from 'famous/renderers/Compositor';
  export { Context } from 'famous/renderers/Context';
  export { UIManager } from 'famous/renderers/UIManager';
}

declare module 'famous/renderers/Compositor' {
  class Compositor {
    constructor();

    sendEvent(path: string, type: string, event: any): void;
    drawCommands(commands: any[]): void;
    clearCommands(): void;
    receiveCommands(commands: any[]): void;
    getOrSetContext(selector: string): any;
    getContext(selector: string): any;
  }

  export = Compositor;
}

declare module 'famous/renderers/Context' {
  import Compositor from 'famous/renderers/Compositor';

  class Context {
    constructor(selector: string, compositor: Compositor);

    draw(): void;
    getRootSize(): number[];
    getDOMRenderer(): any;
    getWebGLRenderer(): any;
    updateSize(): void;
  }

  export = Context;
}

declare module 'famous/renderers/UIManager' {
  import Compositor from 'famous/renderers/Compositor';

  class UIManager {
    constructor(channel: any, compositor: Compositor, renderLoop: any);

    getChannel(): any;
    getCompositor(): Compositor;
    getRenderLoop(): any;
    update(time: number): void;
    resize(): void;
  }

  export = UIManager;
}
