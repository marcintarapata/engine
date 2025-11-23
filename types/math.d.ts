/**
 * TypeScript declarations for Famous Engine Math Module
 * @module famous/math
 */

declare module 'famous/math' {
  export { Vec2 } from 'famous/math/Vec2';
  export { Vec3 } from 'famous/math/Vec3';
  export { Quaternion } from 'famous/math/Quaternion';
  export { Mat33 } from 'famous/math/Mat33';
}

declare module 'famous/math/Vec2' {
  class Vec2 {
    x: number;
    y: number;

    constructor(x?: number, y?: number);

    set(x?: number, y?: number): Vec2;
    add(v: Vec2): Vec2;
    subtract(v: Vec2): Vec2;
    scale(s: number): Vec2;
    rotate(theta: number): Vec2;
    dot(v: Vec2): number;
    cross(v: Vec2): number;
    invert(): Vec2;
    map(fn: (value: number) => number): Vec2;
    length(): number;
    lengthSq(): number;
    copy(v: Vec2): Vec2;
    clear(): Vec2;
    isZero(): boolean;
    toArray(): [number, number];
    normalize(): Vec2;
    clone(): Vec2;
  }

  export = Vec2;
}

declare module 'famous/math/Vec3' {
  class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number);

    set(x?: number, y?: number, z?: number): Vec3;
    add(v: Vec3): Vec3;
    subtract(v: Vec3): Vec3;
    scale(s: number): Vec3;
    rotateX(theta: number): Vec3;
    rotateY(theta: number): Vec3;
    rotateZ(theta: number): Vec3;
    dot(v: Vec3): number;
    cross(v: Vec3): Vec3;
    invert(): Vec3;
    map(fn: (value: number) => number): Vec3;
    length(): number;
    lengthSq(): number;
    copy(v: Vec3): Vec3;
    clear(): Vec3;
    isZero(): boolean;
    toArray(): [number, number, number];
    normalize(): Vec3;
    applyRotation(q: any): Vec3;
    applyMatrix(m: any): Vec3;
    clone(): Vec3;
  }

  export = Vec3;
}

declare module 'famous/math/Quaternion' {
  import Vec3 from 'famous/math/Vec3';

  class Quaternion {
    w: number;
    x: number;
    y: number;
    z: number;

    constructor(w?: number, x?: number, y?: number, z?: number);

    set(w?: number, x?: number, y?: number, z?: number): Quaternion;
    copy(q: Quaternion): Quaternion;
    add(q: Quaternion): Quaternion;
    subtract(q: Quaternion): Quaternion;
    scale(s: number): Quaternion;
    multiply(q: Quaternion): Quaternion;
    rotateX(theta: number): Quaternion;
    rotateY(theta: number): Quaternion;
    rotateZ(theta: number): Quaternion;
    dot(q: Quaternion): number;
    invert(): Quaternion;
    conjugate(): Quaternion;
    length(): number;
    lengthSq(): number;
    normalize(): Quaternion;
    clear(): Quaternion;
    isZero(): boolean;
    toArray(): [number, number, number, number];
    toMatrix(): Float32Array;
    fromEuler(x: number, y: number, z: number): Quaternion;
    toEuler(): Vec3;
    fromAngleAxis(angle: number, axis: Vec3): Quaternion;
    toAngleAxis(): { angle: number; axis: Vec3 };
    slerp(q: Quaternion, t: number): Quaternion;
    clone(): Quaternion;
  }

  export = Quaternion;
}

declare module 'famous/math/Mat33' {
  import Vec3 from 'famous/math/Vec3';

  class Mat33 {
    constructor(values?: number[]);

    get(): number[];
    set(values: number[]): Mat33;
    copy(m: Mat33): Mat33;
    add(m: Mat33): Mat33;
    subtract(m: Mat33): Mat33;
    scale(s: number): Mat33;
    multiply(m: Mat33): Mat33;
    transpose(): Mat33;
    clone(): Mat33;
    vectorMultiply(v: Vec3): Vec3;
    getDeterminant(): number;
    inverse(): Mat33;
  }

  export = Mat33;
}
