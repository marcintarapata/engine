/**
 * TypeScript declarations for Famous Engine DOM Renderables Module
 * @module famous/dom-renderables
 */

declare module 'famous/dom-renderables' {
  export { DOMElement } from 'famous/dom-renderables/DOMElement';
}

declare module 'famous/dom-renderables/DOMElement' {
  import { Node } from 'famous/core/Node';

  interface DOMElementOptions {
    tagName?: string;
    id?: string;
    classes?: string[];
    attributes?: { [key: string]: string };
    properties?: { [key: string]: string };
    content?: string;
    cutoutState?: boolean;
  }

  interface EventCallback {
    (event: Event): void;
  }

  class DOMElement {
    constructor(node: Node, options?: DOMElementOptions);

    // Content
    setContent(content: string): DOMElement;
    getContent(): string;

    // Tag
    setTagName(tagName: string): DOMElement;

    // ID
    setId(id: string): DOMElement;
    getId(): string;

    // Classes
    addClass(className: string): DOMElement;
    removeClass(className: string): DOMElement;
    hasClass(className: string): boolean;

    // Attributes
    setAttribute(name: string, value: string): DOMElement;
    getAttribute(name: string): string | undefined;
    removeAttribute(name: string): DOMElement;

    // Properties (CSS)
    setProperty(name: string, value: string): DOMElement;
    getProperty(name: string): string | undefined;
    removeProperty(name: string): DOMElement;

    // Events
    on(event: string, callback: EventCallback): DOMElement;
    off(event: string, callback?: EventCallback): DOMElement;

    // Cutout
    setCutoutState(state: boolean): DOMElement;
    getCutoutState(): boolean;

    // Prevention
    preventDefault(eventType: string): void;
    allowDefault(eventType: string): void;

    // Lifecycle hooks
    onMount(node: Node, id: number): void;
    onDismount(): void;
    onShow(): void;
    onHide(): void;
    onTransformChange(transform: Float32Array): void;
    onSizeChange(size: Float32Array): void;
    onOpacityChange(opacity: number): void;
    onOriginChange(origin: Float32Array): void;
    onAlignChange(align: Float32Array): void;
    onMountPointChange(mountPoint: Float32Array): void;
    onSizeModeChange(sizeMode: Uint8Array): void;
    onUpdate(): void;
    onReceive(event: string, payload: any): void;
  }

  export = DOMElement;
}
