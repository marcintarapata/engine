# Famous Engine

[![Build Status](https://github.com/Famous/engine/actions/workflows/ci.yml/badge.svg)](https://github.com/Famous/engine/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/famous.svg)](https://www.npmjs.com/package/famous)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

The Famous Engine is a free and open source JavaScript rendering engine. What makes the Famous Engine unique is its JavaScript rendering engine and 3D physics engine that gives developers the power and tools to build native quality apps and animations using pure JavaScript.

## Features

- **Unified Rendering** - Render to both DOM and WebGL with a single API
- **3D Scene Graph** - Hierarchical scene management with transforms
- **Physics Engine** - Built-in physics simulation with forces and constraints
- **Animation System** - Powerful transitions with easing curves
- **Component Architecture** - Modular, composable components
- **TypeScript Support** - Full type definitions included
- **Tree-shakeable** - Import only what you need
- **Modern Tooling** - Vite, Vitest, ESLint 9, Prettier

## Installation

```bash
npm install famous
```

**Requirements:** Node.js >= 18.0.0, npm >= 9.0.0

## Quick Start

### Modern Builder API (Recommended)

```javascript
const { createEngine, createScene, createNode } = require('famous');
const { DOMElement } = require('famous/dom-renderables');

// Create engine with fluent builder
const engine = createEngine()
  .withAutoStart()
  .build();

// Create scene
const scene = createScene('#app', engine).build();

// Create styled node with builder pattern
const node = createNode(scene)
  .withAlign(0.5, 0.5, 0)
  .withMountPoint(0.5, 0.5, 0)
  .withComponent(new DOMElement(null, {
    content: 'Hello Famous!',
    properties: {
      fontSize: '48px',
      fontFamily: 'Arial',
      textAlign: 'center',
      color: '#333'
    }
  }))
  .build();
```

### Classic API

```javascript
const FamousEngine = require('famous/core/FamousEngine');
const DOMElement = require('famous/dom-renderables/DOMElement');

FamousEngine.init();
const scene = FamousEngine.createScene();

const node = scene.addChild();
new DOMElement(node, {
  content: 'Hello World',
  properties: { fontFamily: 'Arial' }
});
```

## Usage Examples

### Positioning and Transforms

```javascript
const { createNode } = require('famous');

const box = createNode(scene)
  .withPosition(100, 200, 0)      // x, y, z position
  .withRotation(0, Math.PI/4, 0)  // Euler angles
  .withScale(1.5, 1.5, 1)         // Scale factors
  .withAlign(0.5, 0.5, 0)         // Alignment (0-1)
  .withMountPoint(0.5, 0.5, 0)    // Mount point (0-1)
  .withOpacity(0.8)               // Opacity (0-1)
  .build();
```

### Physics Simulation

```javascript
const { PhysicsEngine, Particle, Spring } = require('famous/physics');
const { Vec3 } = require('famous/math');

const physics = new PhysicsEngine();

// Create particles
const p1 = new Particle({ mass: 1, position: new Vec3(0, 0, 0) });
const p2 = new Particle({ mass: 1, position: new Vec3(100, 0, 0) });

physics.add(p1, p2);

// Connect with spring
const spring = new Spring(p1, p2, { stiffness: 100, damping: 10 });
physics.add(spring);
```

### Animations

```javascript
const { Transitionable } = require('famous/transitions');
const { Position } = require('famous/components');

const position = new Position(node);

// Animate with easing
position.set(200, 300, 0, {
  duration: 1000,
  curve: 'easeInOut'
});
```

### Error Handling

```javascript
const {
  FamousError,
  requireParameter,
  requireType
} = require('famous/errors');

function createWidget(config) {
  requireParameter(config, 'config');
  requireType(config.width, 'config.width', 'number');

  // Safe to use config.width
}
```

## Module Imports

Famous supports tree-shakeable imports for smaller bundles:

```javascript
// Import entire library
const Famous = require('famous');

// Import specific modules (recommended)
const { FamousEngine, Node, Scene } = require('famous/core');
const { Camera, Position, Rotation } = require('famous/components');
const { PhysicsEngine, Particle } = require('famous/physics');
const { Vec3, Quaternion, Mat33 } = require('famous/math');
const { Transitionable, Curves } = require('famous/transitions');
const { DOMElement } = require('famous/dom-renderables');

// Deep imports (legacy, still supported)
const FamousEngine = require('famous/core/FamousEngine');
```

## TypeScript Support

Famous includes TypeScript declaration files for full IDE support:

```typescript
import { createEngine, createScene, createNode } from 'famous';
import { DOMElement } from 'famous/dom-renderables';
import type { Node, Scene } from 'famous/core';

const engine = createEngine().withAutoStart().build();
const scene: Scene = createScene('#app', engine).build();
const node: Node = createNode(scene)
  .withPosition(0, 0, 0)
  .build();
```

## Available Modules

| Module | Description |
|--------|-------------|
| `famous/core` | FamousEngine, Node, Scene, Transform |
| `famous/components` | Camera, Position, Rotation, Scale, Size, Opacity |
| `famous/physics` | PhysicsEngine, Particle, forces, constraints |
| `famous/math` | Vec2, Vec3, Quaternion, Mat33 |
| `famous/transitions` | Transitionable, Curves |
| `famous/dom-renderables` | DOMElement |
| `famous/webgl-renderables` | Mesh, Light, AmbientLight, PointLight |
| `famous/webgl-geometries` | Box, Sphere, Plane, Circle |
| `famous/errors` | Error classes and validation utilities |
| `famous/builders` | EngineBuilder, SceneBuilder, NodeBuilder |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type checking
npm run typecheck

# Lint and format
npm run lint
npm run format

# Build for production
npm run build
```

## Migration from Legacy

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions from older Famous versions.

### Key Changes

1. **Builder Pattern** - Use `createEngine()`, `createScene()`, `createNode()` for cleaner initialization
2. **Module Imports** - Import from `famous/core`, `famous/components`, etc. for tree-shaking
3. **Error Handling** - Use typed errors with helpful suggestions
4. **TypeScript** - Full type definitions available

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

```bash
# Clone repository
git clone https://github.com/Famous/engine.git
cd engine

# Install dependencies
npm install

# Run tests
npm test

# Start dev server
npm run dev
```

## License

The Famous Engine is licensed under the [MIT License](./LICENSE).

## Links

- [API Documentation](./docs/API.md)
- [Migration Guide](./MIGRATION.md)
- [Examples](./examples/)
- [GitHub Issues](https://github.com/Famous/engine/issues)
