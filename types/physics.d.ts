/**
 * TypeScript declarations for Famous Engine Physics Module
 * @module famous/physics
 */

declare module 'famous/physics' {
  export { PhysicsEngine } from 'famous/physics/PhysicsEngine';
  export { Particle } from 'famous/physics/bodies/Particle';
  export { Box } from 'famous/physics/bodies/Box';
  export { Sphere } from 'famous/physics/bodies/Sphere';
  export { Wall } from 'famous/physics/bodies/Wall';
  export { convexBodyFactory } from 'famous/physics/bodies/convexBodyFactory';
  export { Constraint } from 'famous/physics/constraints/Constraint';
  export { Angle } from 'famous/physics/constraints/Angle';
  export { BallAndSocket } from 'famous/physics/constraints/BallAndSocket';
  export { Collision } from 'famous/physics/constraints/Collision';
  export { Curve } from 'famous/physics/constraints/Curve';
  export { Direction } from 'famous/physics/constraints/Direction';
  export { Distance } from 'famous/physics/constraints/Distance';
  export { Hinge } from 'famous/physics/constraints/Hinge';
  export { Force } from 'famous/physics/forces/Force';
  export { Drag } from 'famous/physics/forces/Drag';
  export { Gravity1D } from 'famous/physics/forces/Gravity1D';
  export { Gravity3D } from 'famous/physics/forces/Gravity3D';
  export { RotationalDrag } from 'famous/physics/forces/RotationalDrag';
  export { RotationalSpring } from 'famous/physics/forces/RotationalSpring';
  export { Spring } from 'famous/physics/forces/Spring';
}

declare module 'famous/physics/PhysicsEngine' {
  import Vec3 from 'famous/math/Vec3';

  interface PhysicsEngineOptions {
    steps?: number;
    velocityCap?: number;
    angularVelocityCap?: number;
  }

  class PhysicsEngine {
    constructor(options?: PhysicsEngineOptions);

    setVelocityCap(cap: number): void;
    setAngularVelocityCap(cap: number): void;
    add(item: any, ...targets: any[]): PhysicsEngine;
    remove(item: any): PhysicsEngine;
    addBody(body: any): PhysicsEngine;
    removeBody(body: any): PhysicsEngine;
    addForce(force: any): PhysicsEngine;
    removeForce(force: any): PhysicsEngine;
    addConstraint(constraint: any): PhysicsEngine;
    removeConstraint(constraint: any): PhysicsEngine;
    update(time: number): void;
    getTransform(body: any): { position: Vec3; rotation: number[] };
    getBodies(): any[];
    getForces(): any[];
    getConstraints(): any[];
  }

  export = PhysicsEngine;
}

declare module 'famous/physics/bodies/Particle' {
  import Vec3 from 'famous/math/Vec3';

  interface ParticleOptions {
    mass?: number;
    position?: Vec3 | number[];
    velocity?: Vec3 | number[];
    orientation?: number[];
    angularVelocity?: Vec3 | number[];
    restrictions?: string | number;
  }

  class Particle {
    constructor(options?: ParticleOptions);

    // Events
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
    trigger(event: string, ...args: any[]): void;

    // Mass
    getMass(): number;
    setMass(mass: number): Particle;
    getInverseMass(): number;

    // Position
    getPosition(): Vec3;
    setPosition(x: number, y: number, z: number): Particle;

    // Velocity
    getVelocity(): Vec3;
    setVelocity(x: number, y: number, z: number): Particle;

    // Momentum
    getMomentum(): Vec3;
    setMomentum(x: number, y: number, z: number): Particle;

    // Orientation
    getOrientation(): number[];
    setOrientation(w: number, x: number, y: number, z: number): Particle;

    // Angular Velocity
    getAngularVelocity(): Vec3;
    setAngularVelocity(x: number, y: number, z: number): Particle;

    // Angular Momentum
    getAngularMomentum(): Vec3;
    setAngularMomentum(x: number, y: number, z: number): Particle;

    // Force and Torque
    getForce(): Vec3;
    setForce(x: number, y: number, z: number): Particle;
    getTorque(): Vec3;
    setTorque(x: number, y: number, z: number): Particle;

    // Impulse
    applyImpulse(impulse: Vec3): Particle;
    applyAngularImpulse(impulse: Vec3): Particle;

    // Restrictions
    getRestrictions(): string;
    setRestrictions(restrictions: string | number): Particle;

    // Support
    support(direction: Vec3): Vec3;
  }

  export = Particle;
}

declare module 'famous/physics/bodies/Box' {
  import Particle from 'famous/physics/bodies/Particle';

  interface BoxOptions {
    mass?: number;
    size?: number[];
    position?: number[];
    velocity?: number[];
  }

  class Box extends Particle {
    constructor(options?: BoxOptions);
  }

  export = Box;
}

declare module 'famous/physics/bodies/Sphere' {
  import Particle from 'famous/physics/bodies/Particle';

  interface SphereOptions {
    mass?: number;
    radius?: number;
    position?: number[];
    velocity?: number[];
  }

  class Sphere extends Particle {
    constructor(options?: SphereOptions);
  }

  export = Sphere;
}

declare module 'famous/physics/bodies/Wall' {
  import Particle from 'famous/physics/bodies/Particle';

  interface WallOptions {
    normal?: number[];
    distance?: number;
  }

  class Wall extends Particle {
    constructor(options?: WallOptions);
  }

  export = Wall;
}

declare module 'famous/physics/bodies/convexBodyFactory' {
  import Particle from 'famous/physics/bodies/Particle';

  function convexBodyFactory(vertices: number[][]): typeof Particle;
  export = convexBodyFactory;
}

declare module 'famous/physics/constraints/Constraint' {
  class Constraint {
    constructor(a: any, b: any, options?: any);
    init(): void;
    update(time: number, dt: number): void;
    resolve(time: number, dt: number): void;
  }

  export = Constraint;
}

declare module 'famous/physics/constraints/Angle' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class Angle extends Constraint {
    constructor(a: any, b: any, options?: { angle?: number });
  }

  export = Angle;
}

declare module 'famous/physics/constraints/BallAndSocket' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class BallAndSocket extends Constraint {
    constructor(a: any, b: any, options?: { anchor?: number[] });
  }

  export = BallAndSocket;
}

declare module 'famous/physics/constraints/Collision' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class Collision extends Constraint {
    constructor(a: any, b: any, options?: { restitution?: number });
  }

  export = Collision;
}

declare module 'famous/physics/constraints/Curve' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class Curve extends Constraint {
    constructor(a: any, options?: { equation?: (x: number, y: number, z: number) => number });
  }

  export = Curve;
}

declare module 'famous/physics/constraints/Direction' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class Direction extends Constraint {
    constructor(a: any, b: any, options?: { direction?: number[] });
  }

  export = Direction;
}

declare module 'famous/physics/constraints/Distance' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class Distance extends Constraint {
    constructor(a: any, b: any, options?: { length?: number });
  }

  export = Distance;
}

declare module 'famous/physics/constraints/Hinge' {
  import Constraint from 'famous/physics/constraints/Constraint';

  class Hinge extends Constraint {
    constructor(a: any, b: any, options?: { axis?: number[]; anchor?: number[] });
  }

  export = Hinge;
}

declare module 'famous/physics/forces/Force' {
  class Force {
    constructor(targets?: any[]);
    init(): void;
    update(time: number, dt: number): void;
    addTarget(target: any): void;
    removeTarget(target: any): void;
  }

  export = Force;
}

declare module 'famous/physics/forces/Drag' {
  import Force from 'famous/physics/forces/Force';

  class Drag extends Force {
    constructor(targets?: any[], options?: { strength?: number });
  }

  export = Drag;
}

declare module 'famous/physics/forces/Gravity1D' {
  import Force from 'famous/physics/forces/Force';

  class Gravity1D extends Force {
    constructor(targets?: any[], options?: { strength?: number; direction?: number[] });
  }

  export = Gravity1D;
}

declare module 'famous/physics/forces/Gravity3D' {
  import Force from 'famous/physics/forces/Force';

  class Gravity3D extends Force {
    constructor(source: any, targets?: any[], options?: { strength?: number });
  }

  export = Gravity3D;
}

declare module 'famous/physics/forces/RotationalDrag' {
  import Force from 'famous/physics/forces/Force';

  class RotationalDrag extends Force {
    constructor(targets?: any[], options?: { strength?: number });
  }

  export = RotationalDrag;
}

declare module 'famous/physics/forces/RotationalSpring' {
  import Force from 'famous/physics/forces/Force';

  class RotationalSpring extends Force {
    constructor(a: any, b: any, options?: { period?: number; dampingRatio?: number });
  }

  export = RotationalSpring;
}

declare module 'famous/physics/forces/Spring' {
  import Force from 'famous/physics/forces/Force';

  class Spring extends Force {
    constructor(a: any, b: any, options?: { period?: number; dampingRatio?: number; length?: number; anchor?: number[] });
  }

  export = Spring;
}
