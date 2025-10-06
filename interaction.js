import { randomPointInTriangle, findTriangleContainingPoint, delaunayTriangulation } from './utils.js';

export class Interaction {
    constructor(renderer, obstacles, crowd, triangles, idealDensity) {
        this.renderer = renderer;
        this.obstacles = obstacles;
        this.crowd = crowd;
        this.triangles = triangles;
        this.idealDensity = idealDensity;
        this.selectedObstacle = 0;
        this.selectedPerson = -1;
        this.isDragging = false;
        this.setupEvents();
    }
    
    setupEvents() {
        document.addEventListener('keydown', e => this.handleKey(e));
        this.renderer.gl.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
        this.renderer.gl.canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        this.renderer.gl.canvas.addEventListener('mouseup', e => this.handleMouseUp(e));
    }
    
    handleKey(e) {
        switch(e.key) {
            case 'ArrowRight': 
                this.obstacles.translate(this.selectedObstacle, 0.05, 0); 
                this.updateTriangulation();
                break;
            case 'ArrowLeft': 
                this.obstacles.translate(this.selectedObstacle, -0.05, 0); 
                this.updateTriangulation();
                break;
            case 'ArrowUp': 
                this.obstacles.translate(this.selectedObstacle, 0, 0.05); 
                this.updateTriangulation();
                break;
            case 'ArrowDown': 
                this.obstacles.translate(this.selectedObstacle, 0, -0.05); 
                this.updateTriangulation();
                break;
            case 'r': 
                this.obstacles.rotate(this.selectedObstacle, Math.PI/18); 
                this.updateTriangulation();
                break;
            case 'R': 
                this.obstacles.rotate(this.selectedObstacle, -Math.PI/18); 
                this.updateTriangulation();
                break;
            case 's': 
                this.obstacles.scale(this.selectedObstacle, 0.9); 
                this.updateTriangulation();
                break;
            case 'S': 
                this.obstacles.scale(this.selectedObstacle, 1.1); 
                this.updateTriangulation();
                break;
            case 'c': 
                this.selectedObstacle = (this.selectedObstacle + 1) % this.obstacles.obstacles.length; 
                break;
            case 'C': 
                this.selectedObstacle = (this.selectedObstacle - 1 + this.obstacles.obstacles.length) % this.obstacles.obstacles.length; 
                break;
        }
    }
    
    handleMouseDown(e) {
        const rect = this.renderer.gl.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
        
        // Check if clicking on a person
        for (let i = 0; i < this.crowd.people.length; i++) {
            const person = this.crowd.people[i];
            const dx = person.pos[0] - x;
            const dy = person.pos[1] - y;
            if (dx * dx + dy * dy < 0.01) { // Within click radius
                this.selectedPerson = i;
                this.isDragging = true;
                return;
            }
        }
        
        // If not clicking on a person, move a random person to clicked triangle
        const triIndex = findTriangleContainingPoint(this.triangles, x, y);
        if (triIndex >= 0 && this.crowd.people.length > 0 && !this.triangles[triIndex].isObstacle) {
            const randomPersonIndex = Math.floor(Math.random() * this.crowd.people.length);
            const newPos = randomPointInTriangle(this.triangles[triIndex]);
            this.crowd.movePerson(randomPersonIndex, triIndex, newPos);
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging && this.selectedPerson >= 0) {
            const rect = this.renderer.gl.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
            
            const triIndex = findTriangleContainingPoint(this.triangles, x, y);
            if (triIndex >= 0 && !this.triangles[triIndex].isObstacle) {
                this.crowd.people[this.selectedPerson].pos = [x, y];
                this.crowd.people[this.selectedPerson].triIdx = triIndex;
            }
        }
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.selectedPerson = -1;
    }
    
    updateTriangulation() {
        // Regenerate triangulation with updated obstacle positions
        const boundaryPoints = [
            {x: -0.5, y: -0.5},
            {x: 0.5, y: -0.5},
            {x: 0.5, y: 0.5},
            {x: -0.5, y: 0.5}
        ];
        
        const randomPoints = [
            {x: -0.3, y: -0.3},
            {x: 0.3, y: -0.3},
            {x: 0.3, y: 0.3},
            {x: -0.3, y: 0.3}
        ];
        
        const allPoints = [...boundaryPoints, ...randomPoints, ...this.obstacles.getAllCornerPoints()];
        
        // Regenerate triangulation
        this.triangles = delaunayTriangulation(allPoints);
        
        // Mark obstacle triangles
        this.markObstacleTriangles();
        // Relocate people from obstacle triangles
        this.crowd.relocatePeopleFromObstacles();
        // Validate all people placement
        this.crowd.validatePeoplePlacement();
    }
    
    markObstacleTriangles() {
        for (let tri of this.triangles) {
            tri.isObstacle = false;
            const centroid = tri.getCentroid();
            
            for (const obs of this.obstacles.obstacles) {
                if (this.pointInQuadrilateral(centroid.x, centroid.y, obs)) {
                    tri.isObstacle = true;
                    break;
                }
            }
        }
    }
    
    pointInQuadrilateral(x, y, quad) {
        // Simple point-in-polygon test for quadrilateral
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
}
