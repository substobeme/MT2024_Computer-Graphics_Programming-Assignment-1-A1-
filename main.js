import { WebGLRenderer } from './renderer.js';
import { Triangle, Quadrilateral, Point } from './geometry.js';
import { Crowd } from './crowd.js';
import { Obstacles } from './obstacles.js';
import { Interaction } from './interaction.js';
import { getDensityColor, generateRandomPoints, delaunayTriangulation } from './utils.js';

const IDEAL_DENSITY = 2; // 2 people per triangle for better visual balance
const canvas = document.getElementById('glCanvas');
const renderer = new WebGLRenderer(canvas);

// Generate random points for triangulation - even smaller area for demo
const boundaryPoints = [
    new Point(-0.5, -0.5), // Bottom-left
    new Point(0.5, -0.5),  // Bottom-right
    new Point(0.5, 0.5),   // Top-right
    new Point(-0.5, 0.5)   // Top-left
];

// Generate fewer random interior points for cleaner look
const randomPoints = generateRandomPoints(4, -0.4, 0.4, -0.4, 0.4);

// Create only 1 obstacle for cleaner demo
const obstacles = new Obstacles([
    new Quadrilateral(-0.1, -0.1, 0.1, -0.1, 0.1, 0.1, -0.1, 0.1)
]);

// Add obstacle corners to the point set for triangulation
const allPoints = [...boundaryPoints, ...randomPoints, ...obstacles.getAllCornerPoints()];

// Generate initial triangulation
let triangles = delaunayTriangulation(allPoints);

// Mark obstacle triangles
function markObstacleTriangles(triangles, obstacles) {
    for (let tri of triangles) {
        tri.isObstacle = false;
        const centroid = tri.getCentroid();
        
        for (const obs of obstacles) {
            if (pointInQuadrilateral(centroid.x, centroid.y, obs)) {
                tri.isObstacle = true;
                break;
            }
        }
    }
}

function pointInQuadrilateral(x, y, quad) {
    const vertices = [
        [quad.ax, quad.ay],
        [quad.bx, quad.by],
        [quad.cx, quad.cy],
        [quad.dx, quad.dy]
    ];
    
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i][0], yi = vertices[i][1];
        const xj = vertices[j][0], yj = vertices[j][1];
        const intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

markObstacleTriangles(triangles, obstacles.obstacles);

const crowd = new Crowd(triangles);

// Ensure no people are on obstacles after initial setup
crowd.relocatePeopleFromObstacles();
// Validate all people placement
crowd.validatePeoplePlacement();
const interaction = new Interaction(renderer, obstacles, crowd, triangles, IDEAL_DENSITY);

function animate() {
    renderer.clear(0.95, 0.95, 0.95, 1);
    
    // Draw triangles with density-based colors
    triangles.forEach((tri, i) => {
        if (tri.isObstacle) {
            renderer.drawTriangle(tri, [0.4, 0.4, 0.4, 0.8]); // Darker gray for obstacles
        } else {
            const density = crowd.getDensity(i);
            const color = getDensityColor(density, IDEAL_DENSITY);
            renderer.drawTriangle(tri, color);
        }
    });
    
    // Draw triangle borders for demo visibility
    triangles.forEach((tri, i) => {
        if (!tri.isObstacle) {
            renderer.drawTriangleBorder(tri, [0.1, 0.1, 0.1, 0.6]); // Dark borders for non-obstacle triangles
        }
    });
    
    // Draw obstacles
    obstacles.draw(renderer);
    
    // Draw crowd
    crowd.draw(renderer);
    
    requestAnimationFrame(animate);
}
animate();
