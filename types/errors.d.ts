/**
 * TypeScript declarations for Famous Engine Errors Module
 * @module famous/errors
 */

declare module 'famous/errors' {
  export { FamousError } from 'famous/errors/FamousError';
  export {
    EngineError,
    InitializationError,
    ConfigurationError,
  } from 'famous/errors/EngineError';
  export { SceneError, MountError, SelectorError } from 'famous/errors/SceneError';
  export { NodeError, ComponentError, HierarchyError } from 'famous/errors/NodeError';
  export {
    RenderError,
    DOMRenderError,
    WebGLRenderError,
    WebGLContextError,
  } from 'famous/errors/RenderError';
  export {
    PhysicsError,
    ConstraintError,
    CollisionError,
    GeometryError,
  } from 'famous/errors/PhysicsError';
  export {
    ValidationError,
    ParameterError,
    StateError,
    RequiredParameterError,
  } from 'famous/errors/ValidationError';

  export function requireParameter<T>(value: T, name: string): T;
  export function requireType<T>(value: T, name: string, expectedType: string): T;
  export function requireInstance<T>(value: T, name: string, expectedClass: new (...args: any[]) => any): T;
  export function validationError(message: string, suggestion: string): ValidationError;
}

declare module 'famous/errors/FamousError' {
  interface FamousErrorOptions {
    code?: string;
    suggestion?: string;
    context?: any;
  }

  class FamousError extends Error {
    name: string;
    code: string;
    suggestion: string | null;
    context: any;

    constructor(message: string, options?: FamousErrorOptions);

    toString(): string;
    toJSON(): {
      name: string;
      code: string;
      message: string;
      suggestion: string | null;
      context: any;
      stack?: string;
    };
  }

  export = FamousError;
}

declare module 'famous/errors/EngineError' {
  import FamousError from 'famous/errors/FamousError';

  class EngineError extends FamousError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class InitializationError extends EngineError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class ConfigurationError extends EngineError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  export { EngineError, InitializationError, ConfigurationError };
}

declare module 'famous/errors/SceneError' {
  import FamousError from 'famous/errors/FamousError';

  class SceneError extends FamousError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class MountError extends SceneError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class SelectorError extends SceneError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  export { SceneError, MountError, SelectorError };
}

declare module 'famous/errors/NodeError' {
  import FamousError from 'famous/errors/FamousError';

  class NodeError extends FamousError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class ComponentError extends NodeError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class HierarchyError extends NodeError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  export { NodeError, ComponentError, HierarchyError };
}

declare module 'famous/errors/RenderError' {
  import FamousError from 'famous/errors/FamousError';

  class RenderError extends FamousError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class DOMRenderError extends RenderError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class WebGLRenderError extends RenderError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class WebGLContextError extends WebGLRenderError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  export { RenderError, DOMRenderError, WebGLRenderError, WebGLContextError };
}

declare module 'famous/errors/PhysicsError' {
  import FamousError from 'famous/errors/FamousError';

  class PhysicsError extends FamousError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class ConstraintError extends PhysicsError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class CollisionError extends PhysicsError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class GeometryError extends PhysicsError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  export { PhysicsError, ConstraintError, CollisionError, GeometryError };
}

declare module 'famous/errors/ValidationError' {
  import FamousError from 'famous/errors/FamousError';

  class ValidationError extends FamousError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class ParameterError extends ValidationError {
    constructor(
      parameterName: string,
      expectedType: string,
      actualValue: any,
      options?: { code?: string; suggestion?: string; context?: any }
    );
  }

  class StateError extends ValidationError {
    constructor(message: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  class RequiredParameterError extends ParameterError {
    constructor(parameterName: string, options?: { code?: string; suggestion?: string; context?: any });
  }

  export { ValidationError, ParameterError, StateError, RequiredParameterError };
}
