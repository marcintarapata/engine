# Migration Guide

This guide helps you migrate from legacy Famous Engine code to the modernized API.

## Overview

The modernized Famous Engine maintains **100% backward compatibility**. All existing code continues to work. New APIs are opt-in and can be adopted gradually.

## Node.js Requirements

**Before:** Node 0.10+, io.js
**After:** Node 18.0.0+, npm 9.0.0+

Update your environment or CI pipelines accordingly.

## Import Patterns

### Module Imports (Recommended)

**Legacy:**
```javascript
var FamousEngine = require('famous/core/FamousEngine');
var DOMElement = require('famous/dom-renderables/DOMElement');
var Vec3 = require('famous/math/Vec3');
```

**Modern (tree-shakeable):**
```javascript
const { FamousEngine } = require('famous/core');
const { DOMElement } = require('famous/dom-renderables');
const { Vec3 } = require('famous/math');
```

**Both patterns still work.** The modern pattern enables better tree-shaking.

### Available Module Entry Points

| Module | Entry Point |
|--------|-------------|
| Core | `famous/core` |
| Components | `famous/components` |
| Physics | `famous/physics` |
| Math | `famous/math` |
| Transitions | `famous/transitions` |
| DOM Renderables | `famous/dom-renderables` |
| WebGL Renderables | `famous/webgl-renderables` |
| WebGL Geometries | `famous/webgl-geometries` |
| WebGL Materials | `famous/webgl-materials` |
| Renderers | `famous/renderers` |
| Errors | `famous/errors` |
| Builders | `famous/builders` |

## Engine Initialization

### Legacy Approach

```javascript
var FamousEngine = require('famous/core/FamousEngine');

FamousEngine.init();
var scene = FamousEngine.createScene('#app');
```

### Modern Builder Pattern

```javascript
const { createEngine, createScene } = require('famous');

const engine = createEngine()
  .withAutoStart()
  .build();

const scene = createScene('#app', engine).build();
```

### Builder Configuration Options

```javascript
const engine = createEngine()
  .withCompositor(customCompositor)    // Custom compositor
  .withRenderLoop(customLoop)          // Custom render loop
  .withClock(customClock)              // Custom clock
  .withAutoStart(true)                 // Auto-start on build
  .build();
```

## Node Creation

### Legacy Approach

```javascript
var node = scene.addChild();
var transform = node.getComponent(0);
transform.setPosition(100, 200, 0);
transform.setRotation(0, Math.PI / 4, 0);
transform.setScale(1.5, 1.5, 1);
transform.setAlign(0.5, 0.5, 0);
transform.setOpacity(0.8);
```

### Modern Builder Pattern

```javascript
const { createNode } = require('famous');

const node = createNode(scene)
  .withPosition(100, 200, 0)
  .withRotation(0, Math.PI / 4, 0)
  .withScale(1.5, 1.5, 1)
  .withAlign(0.5, 0.5, 0)
  .withOpacity(0.8)
  .build();
```

### Adding Components

**Legacy:**
```javascript
var DOMElement = require('famous/dom-renderables/DOMElement');

var node = scene.addChild();
var el = new DOMElement(node, {
  content: 'Hello',
  properties: { color: 'red' }
});
```

**Modern:**
```javascript
const { createNode } = require('famous');
const { DOMElement } = require('famous/dom-renderables');

const node = createNode(scene)
  .withComponent(new DOMElement(null, {
    content: 'Hello',
    properties: { color: 'red' }
  }))
  .build();
```

## Scene Configuration

### Legacy Approach

```javascript
var scene = FamousEngine.createScene('#app');
var camera = new Camera(scene);
```

### Modern Builder Pattern

```javascript
const { createScene } = require('famous');
const { Camera } = require('famous/components');

const scene = createScene('#app', engine)
  .withCamera(new Camera())
  .withPhysics({ gravity: [0, -9.8, 0] })
  .build();
```

## Error Handling

### Legacy Approach

```javascript
if (!value) {
  throw new Error('Value is required');
}

if (typeof value !== 'number') {
  throw new Error('Value must be a number');
}
```

### Modern Error System

```javascript
const {
  requireParameter,
  requireType,
  requireInstance,
  ValidationError,
  ParameterError
} = require('famous/errors');

// Simple parameter validation
requireParameter(value, 'value');
requireType(value, 'value', 'number');
requireInstance(node, 'node', Node);

// Custom errors with suggestions
throw new ParameterError('opacity', 'number between 0 and 1', actualValue);
```

### Error Classes Available

| Error Class | Use Case |
|-------------|----------|
| `FamousError` | Base class for all errors |
| `EngineError` | Engine initialization issues |
| `InitializationError` | Failed initialization |
| `ConfigurationError` | Invalid configuration |
| `SceneError` | Scene-related issues |
| `MountError` | Scene mounting failed |
| `SelectorError` | Invalid DOM selector |
| `NodeError` | Node-related issues |
| `ComponentError` | Component issues |
| `HierarchyError` | Scene graph hierarchy issues |
| `RenderError` | Rendering failures |
| `PhysicsError` | Physics simulation issues |
| `ValidationError` | Validation failures |
| `ParameterError` | Invalid parameters |

### Catching Errors

```javascript
const { FamousError } = require('famous/errors');

try {
  // Famous operations
} catch (error) {
  if (error instanceof FamousError) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Suggestion:', error.suggestion);
    console.error('Context:', error.context);
  }
}
```

## TypeScript Migration

### Adding Types to Existing Code

```typescript
import { createEngine, createScene, createNode } from 'famous';
import type { Node, Scene, FamousEngine } from 'famous/core';
import type { EngineBuilder, SceneBuilder, NodeBuilder } from 'famous/builders';

const engine: FamousEngine = createEngine().withAutoStart().build();
const scene: Scene = createScene('#app', engine).build();
const node: Node = createNode(scene).withPosition(0, 0, 0).build();
```

### Type Definitions Location

All type definitions are in the `types/` directory:
- `types/index.d.ts` - Main entry point
- `types/core.d.ts` - Core classes
- `types/components.d.ts` - UI components
- `types/physics.d.ts` - Physics engine
- `types/math.d.ts` - Math utilities
- `types/transitions.d.ts` - Animations
- `types/errors.d.ts` - Error classes
- `types/builders.d.ts` - Builder pattern

## Build System Migration

### From Browserify to Vite

**Legacy (browserify):**
```json
{
  "scripts": {
    "build": "browserify index.js --standalone famous > dist/famous.js"
  }
}
```

**Modern (vite):**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Development Server

```bash
# Legacy
# (No built-in dev server)

# Modern
npm run dev
```

## Testing Migration

### From Tape to Vitest

**Legacy (tape):**
```javascript
var test = require('tape');

test('my test', function(t) {
  t.equal(1 + 1, 2);
  t.end();
});
```

**Modern (vitest):**
```javascript
import { describe, it, expect } from 'vitest';

describe('my test suite', () => {
  it('should add numbers', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage
npm run test:coverage
```

## Linting Migration

### From ESLint 0.x to ESLint 9.x

ESLint configuration is now in `eslint.config.js` using flat config format.

```bash
# Lint
npm run lint

# Lint and fix
npm run lint:fix
```

### Prettier Integration

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Step-by-Step Migration

### Phase 1: Update Environment

1. Update Node.js to 18+
2. Run `npm install`
3. Verify existing code works: `npm test`

### Phase 2: Update Imports (Optional)

1. Change deep imports to module imports
2. Test after each file change

**Before:**
```javascript
var Camera = require('famous/components/Camera');
```

**After:**
```javascript
const { Camera } = require('famous/components');
```

### Phase 3: Adopt Builder Pattern (Optional)

1. Convert engine initialization
2. Convert scene creation
3. Convert node creation
4. Test after each change

### Phase 4: Add TypeScript (Optional)

1. Create `tsconfig.json` in your project
2. Add type annotations to files
3. Run `npm run typecheck`

### Phase 5: Modernize Error Handling (Optional)

1. Replace `throw new Error()` with typed errors
2. Add parameter validation with utilities
3. Add error context and suggestions

## Compatibility Matrix

| Feature | Legacy | Modern | Notes |
|---------|--------|--------|-------|
| Deep imports | ✅ | ✅ | Both work |
| Module imports | ❌ | ✅ | Modern only |
| FamousEngine.init() | ✅ | ✅ | Still works |
| createEngine() | ❌ | ✅ | Modern only |
| scene.addChild() | ✅ | ✅ | Still works |
| createNode() | ❌ | ✅ | Modern only |
| throw new Error() | ✅ | ✅ | Still works |
| Typed errors | ❌ | ✅ | Modern only |
| TypeScript | ❌ | ✅ | Modern only |
| Browserify | ✅ | ⚠️ | Legacy scripts available |
| Vite | ❌ | ✅ | Modern only |
| Tape tests | ✅ | ⚠️ | Legacy scripts available |
| Vitest tests | ❌ | ✅ | Modern only |

## Troubleshooting

### Import Errors

If you see `Cannot find module 'famous/core'`:
- Ensure you're using Node 18+
- Run `npm install` to update dependencies
- Check that `package.json` has the `exports` field

### TypeScript Errors

If TypeScript can't find types:
- Ensure `types` field is in `package.json`
- Check `tsconfig.json` includes `node_modules/famous`
- Try restarting your IDE

### Build Errors

If Vite build fails:
- Check `vite.config.js` exists
- Run `npm install` to ensure all deps are installed
- Check for syntax errors in your code

## Getting Help

- [GitHub Issues](https://github.com/Famous/engine/issues)
- [API Documentation](./docs/API.md)
- [Examples](./examples/)
