# Phase 3: Architecture Improvements - Design Document

## Overview
Phase 3 focuses on modernizing the module architecture, API patterns, and export system to create a more maintainable, tree-shakeable, and developer-friendly codebase.

## 1. Module Organization

### Current Structure
- CommonJS modules with `module.exports`
- Flat namespace exports per module
- No clear separation between public and internal APIs
- All modules bundled together in main index.js

### New Structure
```
famous/
├── core/              # Core engine and scene graph
├── components/        # UI components
├── physics/           # Physics engine
├── renderers/         # Rendering systems
│   ├── dom/          # DOM renderer (moved from dom-renderers)
│   ├── webgl/        # WebGL renderer (moved from webgl-renderers)
│   └── common/       # Shared rendering utilities
├── renderables/       # Visual elements
│   ├── dom/          # DOM renderables (moved from dom-renderables)
│   └── webgl/        # WebGL renderables (moved from webgl-renderables)
├── geometry/          # 3D geometry (moved from webgl-geometries)
├── materials/         # Material system (moved from webgl-materials)
├── shaders/           # GLSL shaders (moved from webgl-shaders)
├── math/              # Math library
├── transitions/       # Animation system
├── utilities/         # Helper utilities
├── polyfills/         # Browser polyfills
└── errors/            # Error handling (NEW)
```

### Export Strategy
- **Named exports only** - No default exports for better tree-shaking
- **Module index files** - Each directory has an index.js that re-exports
- **Flat structure** - No nested exports for simplicity
- **Package.json exports** - Fine-grained entry points

## 2. API Modernization

### Builder Pattern for Engine Initialization

**Current Pattern:**
```javascript
const FamousEngine = require('famous/core/FamousEngine');
FamousEngine.init();
const scene = FamousEngine.createScene('body');
```

**New Pattern:**
```javascript
import { createEngine } from 'famous';

const engine = createEngine()
  .withCompositor(customCompositor)
  .withRenderLoop(customLoop)
  .build();

const scene = engine.createScene('body');
```

**Features:**
- Fluent API with method chaining
- Type-safe configuration
- Validation at build time
- Optional configuration with sensible defaults

### Scene Builder Pattern

**New Pattern:**
```javascript
import { createScene } from 'famous';

const scene = createScene('#app')
  .withCamera(camera)
  .withPhysics(physicsConfig)
  .build();
```

### Node Builder Pattern

**New Pattern:**
```javascript
import { createNode } from 'famous';

const node = createNode()
  .withPosition(100, 200, 0)
  .withRotation(0, Math.PI / 4, 0)
  .withScale(1.5, 1.5, 1)
  .withComponent(domElement)
  .build();
```

## 3. Error Handling System

### Error Class Hierarchy
```
FamousError (base)
├── EngineError
│   ├── InitializationError
│   └── ConfigurationError
├── SceneError
│   ├── MountError
│   └── SelectorError
├── NodeError
│   ├── ComponentError
│   └── HierarchyError
├── RenderError
│   ├── DOMRenderError
│   └── WebGLRenderError
├── PhysicsError
│   ├── ConstraintError
│   └── CollisionError
└── ValidationError
    ├── ParameterError
    └── StateError
```

### Error Features
- Stack traces with source maps
- Error codes for programmatic handling
- Detailed error messages with context
- Suggestions for fixes

### Example Usage
```javascript
throw new InitializationError(
  'Engine already initialized',
  { code: 'ENGINE_ALREADY_INIT', suggestion: 'Use getEngine() instead' }
);
```

## 4. Tree-shakeable Exports

### Package.json Exports Field
```json
{
  "exports": {
    ".": "./index.js",
    "./core": "./core/index.js",
    "./components": "./components/index.js",
    "./physics": "./physics/index.js",
    "./renderers/dom": "./renderers/dom/index.js",
    "./renderers/webgl": "./renderers/webgl/index.js",
    "./renderables/dom": "./renderables/dom/index.js",
    "./renderables/webgl": "./renderables/webgl/index.js",
    "./geometry": "./geometry/index.js",
    "./materials": "./materials/index.js",
    "./math": "./math/index.js",
    "./transitions": "./transitions/index.js",
    "./utilities": "./utilities/index.js"
  }
}
```

### Import Examples
```javascript
// Import entire library (for backward compatibility)
import * as Famous from 'famous';

// Import specific modules (tree-shakeable)
import { FamousEngine, Node, Scene } from 'famous/core';
import { Camera, Position, Rotation } from 'famous/components';
import { PhysicsEngine, Particle } from 'famous/physics';
import { DOMElement } from 'famous/renderables/dom';
import { Mesh } from 'famous/renderables/webgl';
import { Box, Sphere } from 'famous/geometry';
import { Vec3, Quaternion } from 'famous/math';

// Import builders
import { createEngine, createScene, createNode } from 'famous';
```

## 5. Consistent Naming Conventions

### Class Names
- PascalCase for classes: `FamousEngine`, `Node`, `Scene`
- Descriptive and specific: `WebGLRenderer` not `Renderer`

### Function Names
- camelCase for functions: `createEngine`, `updateTransform`
- Verb prefixes: `create`, `update`, `get`, `set`, `add`, `remove`

### Constants
- UPPER_SNAKE_CASE: `DEFAULT_RENDER_LOOP`, `MAX_DEPTH`

### Private Members
- Underscore prefix: `_updateQueue`, `_scenes`, `_parent`
- Clear distinction from public API

## 6. Implementation Plan

### Step 1: Error Handling (Foundation)
1. Create `/errors` directory
2. Implement base `FamousError` class
3. Implement specific error classes
4. Add error utilities

### Step 2: Builder Pattern (Core API)
1. Create `EngineBuilder` class
2. Create `SceneBuilder` class
3. Create `NodeBuilder` class
4. Update existing classes to support builders

### Step 3: ESM Conversion (Module System)
1. Convert `/core` to ESM exports
2. Convert `/components` to ESM exports
3. Convert `/physics` to ESM exports
4. Convert `/renderers` to ESM exports
5. Convert remaining modules to ESM exports
6. Update main `/index.js` with named exports

### Step 4: Entry Points (Package Configuration)
1. Add `exports` field to package.json
2. Create module-specific entry points
3. Ensure backward compatibility

### Step 5: Documentation & Testing
1. Update README with new patterns
2. Create migration guide
3. Add examples for new APIs
4. Update tests for new patterns

## 7. Backward Compatibility

### Dual Export Strategy
Maintain both CommonJS and ESM exports during transition:

```javascript
// module.js
export class FamousEngine { /* ... */ }

// For CommonJS compatibility (if needed)
module.exports = { FamousEngine };
```

### Deprecation Warnings
Add warnings for old patterns:
```javascript
// Old pattern (deprecated)
const FamousEngine = require('famous/core/FamousEngine');
// Warning: CommonJS require is deprecated, use ESM import instead
```

## 8. Benefits

### For Developers
- **Better Tree-shaking**: Only import what you need
- **Clearer APIs**: Builder pattern makes initialization intuitive
- **Better Error Messages**: Know exactly what went wrong and how to fix it
- **IDE Support**: Better autocomplete and type inference
- **Consistent Patterns**: Predictable API across all modules

### For Maintenance
- **Clear Separation**: Public vs private APIs
- **Modular Structure**: Easy to test and modify individual modules
- **Modern Patterns**: Align with current JavaScript best practices
- **Easy Extension**: Builder pattern makes adding features simple

### For Bundle Size
- **Tree-shakeable**: Dead code elimination works properly
- **Lazy Loading**: Import specific modules on demand
- **Code Splitting**: Fine-grained control over what's loaded when

## 9. Migration Path

### For Existing Users
1. Continue using CommonJS imports (supported)
2. Gradually migrate to ESM imports
3. Adopt builder patterns for new code
4. Update error handling as needed

### Example Migration
**Before:**
```javascript
const FamousEngine = require('famous/core/FamousEngine');
FamousEngine.init();
```

**After:**
```javascript
import { createEngine } from 'famous';
const engine = createEngine().build();
```

## 10. Success Criteria

- [ ] All modules use ESM named exports
- [ ] Builder pattern implemented for core classes
- [ ] Consistent error handling across all modules
- [ ] Package.json exports field configured
- [ ] Tree-shaking verified (bundle size reduction)
- [ ] Documentation updated
- [ ] Migration guide written
- [ ] Tests passing
- [ ] Backward compatibility maintained

## Timeline

**Phase 3a: Foundation (Current)**
- Error handling system
- Builder patterns

**Phase 3b: Module Conversion**
- ESM exports for all modules
- Package.json configuration

**Phase 3c: Polish**
- Documentation
- Examples
- Migration guide

---

**Next Steps:** Begin implementation with error handling system, followed by builder patterns, then module conversion.
