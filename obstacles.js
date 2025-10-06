export class Obstacles {
    constructor(obstacles) {
        this.obstacles = obstacles || [];
    }
    draw(renderer) {
        this.obstacles.forEach(obs => renderer.drawQuadrilateral(obs, obs.color));
    }
    translate(index, dx, dy) {
        this.obstacles[index].translate(dx, dy);
    }
    rotate(index, angle) {
        const obs = this.obstacles[index];
        const cx = (obs.ax + obs.bx + obs.cx + obs.dx)/4;
        const cy = (obs.ay + obs.by + obs.cy + obs.dy)/4;
        obs.rotate(angle, cx, cy);
    }
    scale(index, factor) {
        const obs = this.obstacles[index];
        const cx = (obs.ax + obs.bx + obs.cx + obs.dx)/4;
        const cy = (obs.ay + obs.by + obs.cy + obs.dy)/4;
        obs.scale(factor, cx, cy);
    }
    
    getAllCornerPoints() {
        const points = [];
        this.obstacles.forEach(obs => {
            points.push(
                {x: obs.ax, y: obs.ay},
                {x: obs.bx, y: obs.by},
                {x: obs.cx, y: obs.cy},
                {x: obs.dx, y: obs.dy}
            );
        });
        return points;
    }
}

