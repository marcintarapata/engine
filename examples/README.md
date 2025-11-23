# Famous Engine Examples

Interactive examples demonstrating the Famous Engine API.

## Running the Examples

1. Build the project:
   ```bash
   npm run build
   ```

2. Start a local server from the project root:
   ```bash
   npm run preview
   # Or use any static server:
   npx serve .
   ```

3. Open `http://localhost:5000/examples/` in your browser.

## Available Examples

### Hello World
**File:** `hello-world.html`

Basic example showing engine initialization and DOM rendering using the classic API.

### Builder Pattern
**File:** `builder-pattern.html`

Demonstrates the modern builder API with fluent, chainable configuration methods.

### Transforms
**File:** `transforms.html`

Shows position, rotation, scale, and opacity transforms on nodes.

### Animation
**File:** `animation.html`

Interactive animation example using Position, Rotation, and Scale components with Transitionable.

### Physics
**File:** `physics.html`

Particle system demonstration with gravity and interactive particle spawning.

### Error Handling
**File:** `error-handling.html`

Interactive demo of the error handling system including validation utilities and typed errors.

## Example Structure

Each example follows a consistent structure:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example - Famous Engine</title>
  <style>/* Styling */</style>
</head>
<body>
  <div id="app"></div>
  <script src="../dist/famous.umd.js"></script>
  <script>
    // Example code using Famous Engine
  </script>
</body>
</html>
```

## Creating New Examples

1. Create a new HTML file in this directory
2. Include the Famous Engine: `<script src="../dist/famous.umd.js"></script>`
3. Access Famous through the global `famous` object
4. Add a link to `index.html` for navigation
