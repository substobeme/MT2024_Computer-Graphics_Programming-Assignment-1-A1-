# MT2024_Computer-Graphics_Programming-Assignment-1-A1-

## Overview
This project is a WebGL-based interactive visualization of a 2-D crowd renderer simulation with with 2D translation, rotation, scaling/zooming.

## Features
- Random generation of base points and people points
- Delaunay triangulation to form triangles
- Movable, rotatable, and scalable rectangular obstacle
- Add/remove edges with mouse clicks
- Real-time triangle density updates with color coding:
  - **Blue**: under density threshold
  - **Green**: correct density
  - **Red**: over density threshold

## Controls

### Obstacle
- **Move:** `W` (up), `A` (left), `S` (down), `D` (right)
- **Rotate:** `L` (left), `R` (right)
- **Scale:** `T` (smaller), `B` (bigger)

### Points & Edges
- **Add Edge:** Click on first point, then second point
- **Remove Edge:** Click near an edge
- **Drag People Points:** Click and drag points

## Installation & Run
1. Download the project folder.
2. Open `index.html` in a modern web browser(use VScode go live option).
3. Ensure internet connection to load Delaunator library:
```html
<script src="https://unpkg.com/delaunator@5.0.0/delaunator.min.js"></script>
