export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export class Triangle {
    constructor(ax,ay,bx,by,cx,cy) {
        Object.assign(this,{ax,ay,bx,by,cx,cy});
        this.isObstacle = false;
    }
    
    getCentroid() {
        return {
            x: (this.ax + this.bx + this.cx) / 3,
            y: (this.ay + this.by + this.cy) / 3
        };
    }
    
    containsPoint(x, y) {
        // Barycentric coordinate method with strict interior check
        const denom = (this.by - this.cy) * (this.ax - this.cx) + (this.cx - this.bx) * (this.ay - this.cy);
        
        // Avoid division by zero
        if (Math.abs(denom) < 1e-10) return false;
        
        const a = ((this.by - this.cy) * (x - this.cx) + (this.cx - this.bx) * (y - this.cy)) / denom;
        const b = ((this.cy - this.ay) * (x - this.cx) + (this.ax - this.cx) * (y - this.cy)) / denom;
        const c = 1 - a - b;
        
        // Strict interior check - exclude edges
        return a > 0.01 && b > 0.01 && c > 0.01;
    }
}
export class Quadrilateral {
    constructor(ax,ay,bx,by,cx,cy,dx,dy,color=[0.4,0.4,0.4,0.8]) {
        Object.assign(this,{ax,ay,bx,by,cx,cy,dx,dy,color});
    }
    translate(dx,dy) {
        this.ax += dx; this.ay += dy;
        this.bx += dx; this.by += dy;
        this.cx += dx; this.cy += dy;
        this.dx += dx; this.dy += dy;
    }
    rotate(angle,originX,originY) {
        function rot(x,y) {
            return [
                originX + Math.cos(angle)*(x-originX) - Math.sin(angle)*(y-originY),
                originY + Math.sin(angle)*(x-originX) + Math.cos(angle)*(y-originY)
            ];
        }
        [this.ax,this.ay] = rot(this.ax,this.ay);
        [this.bx,this.by] = rot(this.bx,this.by);
        [this.cx,this.cy] = rot(this.cx,this.cy);
        [this.dx,this.dy] = rot(this.dx,this.dy);
    }
    scale(factor,originX,originY) {
        function scl(x,y) {
            return [
                originX + factor*(x-originX),
                originY + factor*(y-originY)
            ];
        }
        [this.ax,this.ay] = scl(this.ax,this.ay);
        [this.bx,this.by] = scl(this.bx,this.by);
        [this.cx,this.cy] = scl(this.cx,this.cy);
        [this.dx,this.dy] = scl(this.dx,this.dy);
    }
}
