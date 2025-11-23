/**
 * TypeScript declarations for Famous Engine Components Module
 * @module famous/components
 */

declare module 'famous/components' {
  export { Align } from 'famous/components/Align';
  export { Camera } from 'famous/components/Camera';
  export { GestureHandler } from 'famous/components/GestureHandler';
  export { MountPoint } from 'famous/components/MountPoint';
  export { Opacity } from 'famous/components/Opacity';
  export { Origin } from 'famous/components/Origin';
  export { Position } from 'famous/components/Position';
  export { Rotation } from 'famous/components/Rotation';
  export { Scale } from 'famous/components/Scale';
  export { Size } from 'famous/components/Size';
  export { Transform } from 'famous/components/Transform';
}

declare module 'famous/components/Align' {
  import { Node } from 'famous/core/Node';

  class Align {
    constructor(node: Node);

    getValue(): { x: number; y: number; z: number };
    getX(): number;
    getY(): number;
    getZ(): number;
    setValue(x?: number, y?: number, z?: number): Align;
    setX(x: number): Align;
    setY(y: number): Align;
    setZ(z: number): Align;
    halt(): Align;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Align;
}

declare module 'famous/components/Camera' {
  import { Node } from 'famous/core/Node';

  interface CameraOptions {
    depth?: number;
  }

  class Camera {
    static readonly ORTHOGRAPHIC_PROJECTION: string;
    static readonly PINHOLE_PROJECTION: string;

    constructor(node: Node, options?: CameraOptions);

    getValue(): { depth: number };
    setDepth(depth: number): Camera;
    getDepth(): number;
    setFlat(): Camera;
    set(depth: number): Camera;

    onUpdate(): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
    onTransformChange(transform: Float32Array): void;
  }

  export = Camera;
}

declare module 'famous/components/GestureHandler' {
  import { Node } from 'famous/core/Node';

  interface GestureEvent {
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    centerDelta: { x: number; y: number };
    points: number;
    velocity: number;
    scale: number;
    rotation: number;
  }

  interface GestureHandlerOptions {
    events?: {
      drag?: (event: GestureEvent) => void;
      tap?: (event: GestureEvent) => void;
      pinch?: (event: GestureEvent) => void;
      rotate?: (event: GestureEvent) => void;
    };
  }

  class GestureHandler {
    constructor(node: Node, options?: GestureHandlerOptions);

    onMount(node: Node, id: number): void;
    onReceive(event: string, payload: any): void;
    onUpdate(): void;

    triggerDrag(event: GestureEvent): void;
    triggerTap(event: GestureEvent): void;
    triggerPinch(event: GestureEvent): void;
    triggerRotate(event: GestureEvent): void;

    on(event: string, callback: (event: GestureEvent) => void): GestureHandler;
    off(event: string, callback?: (event: GestureEvent) => void): GestureHandler;
  }

  export = GestureHandler;
}

declare module 'famous/components/MountPoint' {
  import { Node } from 'famous/core/Node';

  class MountPoint {
    constructor(node: Node);

    getValue(): { x: number; y: number; z: number };
    getX(): number;
    getY(): number;
    getZ(): number;
    setValue(x?: number, y?: number, z?: number): MountPoint;
    setX(x: number): MountPoint;
    setY(y: number): MountPoint;
    setZ(z: number): MountPoint;
    halt(): MountPoint;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = MountPoint;
}

declare module 'famous/components/Opacity' {
  import { Node } from 'famous/core/Node';

  class Opacity {
    constructor(node: Node);

    getValue(): number;
    setValue(value: number): Opacity;
    halt(): Opacity;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Opacity;
}

declare module 'famous/components/Origin' {
  import { Node } from 'famous/core/Node';

  class Origin {
    constructor(node: Node);

    getValue(): { x: number; y: number; z: number };
    getX(): number;
    getY(): number;
    getZ(): number;
    setValue(x?: number, y?: number, z?: number): Origin;
    setX(x: number): Origin;
    setY(y: number): Origin;
    setZ(z: number): Origin;
    halt(): Origin;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Origin;
}

declare module 'famous/components/Position' {
  import { Node } from 'famous/core/Node';
  import { Transitionable } from 'famous/transitions';

  class Position {
    constructor(node: Node);

    getValue(): { x: number; y: number; z: number };
    getX(): number;
    getY(): number;
    getZ(): number;
    setValue(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Position;
    setX(x: number, transition?: any, callback?: () => void): Position;
    setY(y: number, transition?: any, callback?: () => void): Position;
    setZ(z: number, transition?: any, callback?: () => void): Position;
    halt(): Position;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Position;
}

declare module 'famous/components/Rotation' {
  import { Node } from 'famous/core/Node';

  class Rotation {
    constructor(node: Node);

    getValue(): { x: number; y: number; z: number; w: number };
    getX(): number;
    getY(): number;
    getZ(): number;
    getW(): number;
    setValue(x?: number, y?: number, z?: number, w?: number, transition?: any, callback?: () => void): Rotation;
    setX(x: number, transition?: any, callback?: () => void): Rotation;
    setY(y: number, transition?: any, callback?: () => void): Rotation;
    setZ(z: number, transition?: any, callback?: () => void): Rotation;
    setW(w: number, transition?: any, callback?: () => void): Rotation;
    halt(): Rotation;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Rotation;
}

declare module 'famous/components/Scale' {
  import { Node } from 'famous/core/Node';

  class Scale {
    constructor(node: Node);

    getValue(): { x: number; y: number; z: number };
    getX(): number;
    getY(): number;
    getZ(): number;
    setValue(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Scale;
    setX(x: number, transition?: any, callback?: () => void): Scale;
    setY(y: number, transition?: any, callback?: () => void): Scale;
    setZ(z: number, transition?: any, callback?: () => void): Scale;
    halt(): Scale;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Scale;
}

declare module 'famous/components/Size' {
  import { Node } from 'famous/core/Node';

  class Size {
    constructor(node: Node);

    setMode(x?: number | string, y?: number | string, z?: number | string): Size;
    getMode(): { x: number; y: number; z: number };
    setAbsolute(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Size;
    getAbsolute(): { x: number; y: number; z: number };
    setProportional(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Size;
    getProportional(): { x: number; y: number; z: number };
    setDifferential(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Size;
    getDifferential(): { x: number; y: number; z: number };
    get(): { x: number; y: number; z: number };
    halt(): Size;
    isActive(): boolean;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Size;
}

declare module 'famous/components/Transform' {
  import { Node } from 'famous/core/Node';

  class Transform {
    constructor(node: Node);

    // Position
    setPosition(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Transform;
    getPosition(): { x: number; y: number; z: number };

    // Rotation
    setRotation(x?: number, y?: number, z?: number, w?: number, transition?: any, callback?: () => void): Transform;
    getRotation(): { x: number; y: number; z: number; w: number };

    // Scale
    setScale(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Transform;
    getScale(): { x: number; y: number; z: number };

    // Align
    setAlign(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Transform;
    getAlign(): { x: number; y: number; z: number };

    // MountPoint
    setMountPoint(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Transform;
    getMountPoint(): { x: number; y: number; z: number };

    // Origin
    setOrigin(x?: number, y?: number, z?: number, transition?: any, callback?: () => void): Transform;
    getOrigin(): { x: number; y: number; z: number };

    halt(): Transform;
    isActive(): boolean;
    clean(): void;

    onUpdate(time: number): void;
    onMount(node: Node, id: number): void;
    onDismount(): void;
  }

  export = Transform;
}
