/**
 * TypeScript declarations for Famous Engine Transitions Module
 * @module famous/transitions
 */

declare module 'famous/transitions' {
  export { Transitionable } from 'famous/transitions/Transitionable';
  export { Curves } from 'famous/transitions/Curves';
}

declare module 'famous/transitions/Transitionable' {
  type EasingFunction = (t: number) => number;

  interface TransitionOptions {
    duration?: number;
    curve?: string | EasingFunction;
  }

  class Transitionable {
    constructor(initialValue?: number);

    get(): number;
    set(value: number, transition?: TransitionOptions, callback?: () => void): Transitionable;
    reset(value: number): Transitionable;
    halt(): Transitionable;
    isActive(): boolean;
    update(): number;
    pause(): Transitionable;
    resume(): Transitionable;
    isPaused(): boolean;
  }

  export = Transitionable;
}

declare module 'famous/transitions/Curves' {
  type EasingFunction = (t: number) => number;

  interface CurvesCollection {
    linear: EasingFunction;
    easeIn: EasingFunction;
    easeOut: EasingFunction;
    easeInOut: EasingFunction;
    easeOutBounce: EasingFunction;
    spring: EasingFunction;
    inQuad: EasingFunction;
    outQuad: EasingFunction;
    inOutQuad: EasingFunction;
    inCubic: EasingFunction;
    outCubic: EasingFunction;
    inOutCubic: EasingFunction;
    inQuart: EasingFunction;
    outQuart: EasingFunction;
    inOutQuart: EasingFunction;
    inQuint: EasingFunction;
    outQuint: EasingFunction;
    inOutQuint: EasingFunction;
    inSine: EasingFunction;
    outSine: EasingFunction;
    inOutSine: EasingFunction;
    inExpo: EasingFunction;
    outExpo: EasingFunction;
    inOutExpo: EasingFunction;
    inCirc: EasingFunction;
    outCirc: EasingFunction;
    inOutCirc: EasingFunction;
    inElastic: EasingFunction;
    outElastic: EasingFunction;
    inOutElastic: EasingFunction;
    inBack: EasingFunction;
    outBack: EasingFunction;
    inOutBack: EasingFunction;
    inBounce: EasingFunction;
    outBounce: EasingFunction;
    inOutBounce: EasingFunction;
    flat: EasingFunction;
  }

  const Curves: CurvesCollection;
  export = Curves;
}
