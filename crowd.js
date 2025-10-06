import { randomPointInTriangle } from './utils.js';
export class Crowd {
    constructor(triangles) {
        this.triangles = triangles;
        this.people = [];
        this.populateCrowd();
    }
    populateCrowd() {
        this.people = [];
        for (let i=0; i<this.triangles.length; i++) {
            if (this.triangles[i].isObstacle) continue;
            let tri = this.triangles[i];
            // Reduced max people per triangle for cleaner visual
            let n = Math.floor(Math.random()*6); // 0-5 people per triangle
            for(let j=0; j<n; j++) {
                this.people.push({triIdx: i, pos: randomPointInTriangle(tri)});
            }
        }
    }
    
    // Remove people from obstacle triangles
    removePeopleFromObstacles() {
        this.people = this.people.filter(person => {
            const triangle = this.triangles[person.triIdx];
            return !triangle.isObstacle;
        });
    }
    
    // Move people from obstacle triangles to nearby non-obstacle triangles
    relocatePeopleFromObstacles() {
        for (let i = this.people.length - 1; i >= 0; i--) {
            const person = this.people[i];
            const triangle = this.triangles[person.triIdx];
            
            if (triangle.isObstacle) {
                // Find a nearby non-obstacle triangle
                let newTriIdx = -1;
                for (let j = 0; j < this.triangles.length; j++) {
                    if (!this.triangles[j].isObstacle) {
                        newTriIdx = j;
                        break;
                    }
                }
                
                if (newTriIdx >= 0) {
                    const newPos = randomPointInTriangle(this.triangles[newTriIdx]);
                    this.people[i] = {triIdx: newTriIdx, pos: newPos};
                } else {
                    // If no non-obstacle triangles, remove the person
                    this.people.splice(i, 1);
                }
            }
        }
    }
    
    // Validate and fix people placement
    validatePeoplePlacement() {
        for (let i = this.people.length - 1; i >= 0; i--) {
            const person = this.people[i];
            const triangle = this.triangles[person.triIdx];
            
            // Check if person is actually inside their assigned triangle
            if (!triangle.containsPoint(person.pos[0], person.pos[1])) {
                // Find the correct triangle for this person
                let correctTriIdx = -1;
                for (let j = 0; j < this.triangles.length; j++) {
                    if (!this.triangles[j].isObstacle && this.triangles[j].containsPoint(person.pos[0], person.pos[1])) {
                        correctTriIdx = j;
                        break;
                    }
                }
                
                if (correctTriIdx >= 0) {
                    // Update to correct triangle
                    this.people[i].triIdx = correctTriIdx;
                } else {
                    // Place in a random valid triangle
                    const validTriangles = this.triangles.filter(t => !t.isObstacle);
                    if (validTriangles.length > 0) {
                        const randomTri = validTriangles[Math.floor(Math.random() * validTriangles.length)];
                        const newPos = randomPointInTriangle(randomTri);
                        this.people[i] = {triIdx: this.triangles.indexOf(randomTri), pos: newPos};
                    } else {
                        // Remove if no valid triangles
                        this.people.splice(i, 1);
                    }
                }
            }
        }
    }
    draw(renderer) {
        this.people.forEach(p => renderer.drawDot(p.pos[0], p.pos[1], [0,0,0,1], 3));
    }
    getDensity(triIdx) {
        if(this.triangles[triIdx].isObstacle) return 0;
        return this.people.filter(p => p.triIdx === triIdx).length;
    }
    movePerson(personIdx, triIdx, newPos) {
        this.people[personIdx].triIdx = triIdx;
        this.people[personIdx].pos = newPos;
    }
}

