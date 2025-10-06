import { Triangle } from './geometry.js';

export function getDensityColor(count, ideal) {
    if (count > ideal) return [0.9, 0.3, 0.3, 0.7]; // Brighter red for overpopulated
    if (count < ideal) return [0.3, 0.3, 0.9, 0.7]; // Brighter blue for underpopulated
    return [0.3, 0.9, 0.3, 0.7]; // Brighter green for ideal density
}

export function randomPointInTriangle(tri) {
    let ax=tri.ax, ay=tri.ay;
    let bx=tri.bx, by=tri.by;
    let cx=tri.cx, cy=tri.cy;
    
    // Use barycentric coordinates to ensure point is inside triangle
    let r1 = Math.random();
    let r2 = Math.random();
    
    // Ensure r1 + r2 <= 1 for proper barycentric coordinates
    if (r1 + r2 > 1) { 
        r1 = 1 - r1; 
        r2 = 1 - r2; 
    }
    
    // Add small margin to avoid edges
    const margin = 0.05;
    r1 = margin + r1 * (1 - 2 * margin);
    r2 = margin + r2 * (1 - 2 * margin);
    
    let x = ax + r1*(bx-ax) + r2*(cx-ax);
    let y = ay + r1*(by-ay) + r2*(cy-ay);
    
    return [x, y];
}

export function generateRandomPoints(count, minX, maxX, minY, maxY) {
    const points = [];
    for (let i = 0; i < count; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        points.push({x, y});
    }
    return points;
}

export function delaunayTriangulation(points) {
    // Proper Delaunay triangulation that adapts to obstacle positions
    const triangles = [];
    
    // Convert points to array format
    const pointArray = points.map(p => ({x: p.x, y: p.y}));
    
    // Add boundary points if not already present
    const boundaryPoints = [
        {x: -0.5, y: -0.5},
        {x: 0.5, y: -0.5},
        {x: 0.5, y: 0.5},
        {x: -0.5, y: 0.5}
    ];
    
    // Combine all points
    const allPoints = [...pointArray, ...boundaryPoints];
    
    // Remove duplicates
    const uniquePoints = [];
    for (const p of allPoints) {
        if (!uniquePoints.some(up => Math.abs(up.x - p.x) < 0.001 && Math.abs(up.y - p.y) < 0.001)) {
            uniquePoints.push(p);
        }
    }
    
    // Simple Delaunay triangulation using Bowyer-Watson algorithm
    return bowyerWatson(uniquePoints);
}

function bowyerWatson(points) {
    // Create super triangle that contains all points
    const superTriangle = [
        {x: -1, y: -1},
        {x: 3, y: -1},
        {x: 1, y: 3}
    ];
    
    let triangles = [new Triangle(superTriangle[0].x, superTriangle[0].y, 
                                 superTriangle[1].x, superTriangle[1].y,
                                 superTriangle[2].x, superTriangle[2].y)];
    
    // Add each point
    for (const point of points) {
        const badTriangles = [];
        
        // Find all triangles whose circumcircle contains the point
        for (const triangle of triangles) {
            if (pointInCircumcircle(point, triangle)) {
                badTriangles.push(triangle);
            }
        }
        
        // Find the boundary of the polygonal hole
        const polygon = [];
        for (const triangle of badTriangles) {
            for (let i = 0; i < 3; i++) {
                const edge = getEdge(triangle, i);
                let shared = false;
                
                for (const other of badTriangles) {
                    if (other !== triangle && hasEdge(other, edge)) {
                        shared = true;
                        break;
                    }
                }
                
                if (!shared) {
                    polygon.push(edge);
                }
            }
        }
        
        // Remove bad triangles
        triangles = triangles.filter(t => !badTriangles.includes(t));
        
        // Create new triangles from the polygon
        for (const edge of polygon) {
            triangles.push(new Triangle(edge[0].x, edge[0].y, 
                                       edge[1].x, edge[1].y,
                                       point.x, point.y));
        }
    }
    
    // Remove triangles that share vertices with super triangle
    triangles = triangles.filter(t => 
        !isVertex(t, superTriangle[0]) && 
        !isVertex(t, superTriangle[1]) && 
        !isVertex(t, superTriangle[2])
    );
    
    return triangles;
}

function pointInCircumcircle(point, triangle) {
    const ax = triangle.ax - point.x;
    const ay = triangle.ay - point.y;
    const bx = triangle.bx - point.x;
    const by = triangle.by - point.y;
    const cx = triangle.cx - point.x;
    const cy = triangle.cy - point.y;
    
    const det = ax * (by * (cx * cx + cy * cy) - cy * (bx * bx + by * by)) -
                ay * (bx * (cx * cx + cy * cy) - cx * (bx * bx + by * by)) +
                (ax * ax + ay * ay) * (bx * cy - cx * by);
    
    return det > 0;
}

function getEdge(triangle, index) {
    const vertices = [
        {x: triangle.ax, y: triangle.ay},
        {x: triangle.bx, y: triangle.by},
        {x: triangle.cx, y: triangle.cy}
    ];
    
    return [vertices[index], vertices[(index + 1) % 3]];
}

function hasEdge(triangle, edge) {
    const edges = [
        getEdge(triangle, 0),
        getEdge(triangle, 1),
        getEdge(triangle, 2)
    ];
    
    return edges.some(e => 
        (e[0].x === edge[0].x && e[0].y === edge[0].y && e[1].x === edge[1].x && e[1].y === edge[1].y) ||
        (e[0].x === edge[1].x && e[0].y === edge[1].y && e[1].x === edge[0].x && e[1].y === edge[0].y)
    );
}

function isVertex(triangle, vertex) {
    return (triangle.ax === vertex.x && triangle.ay === vertex.y) ||
           (triangle.bx === vertex.x && triangle.by === vertex.y) ||
           (triangle.cx === vertex.x && triangle.cy === vertex.y);
}

export function findTriangleContainingPoint(triangles, x, y) {
    for (let i = 0; i < triangles.length; i++) {
        if (triangles[i].containsPoint(x, y)) {
            return i;
        }
    }
    return -1;
}
