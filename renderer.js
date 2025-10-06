import { Triangle } from './geometry.js';

const vertexShaderSource = `attribute vec2 aPosition;
uniform vec4 uColor;
varying vec4 vColor;
void main() {
    gl_Position = vec4(aPosition,0,1);
    vColor = uColor;
    gl_PointSize = 5.0;
}`;
const fragmentShaderSource = `precision mediump float;
varying vec4 vColor;
void main() {
    gl_FragColor = vColor;
}`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function createProgram(gl,vShader,fShader) {
    const program = gl.createProgram();
    gl.attachShader(program,vShader);
    gl.attachShader(program,fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

export class WebGLRenderer {
    constructor(canvas) {
        this.gl = canvas.getContext('webgl');
        if(!this.gl) throw new Error("No WebGL");
        this.vShader = createShader(this.gl,this.gl.VERTEX_SHADER,vertexShaderSource);
        this.fShader = createShader(this.gl,this.gl.FRAGMENT_SHADER,fragmentShaderSource);
        this.program = createProgram(this.gl,this.vShader,this.fShader);
        this.gl.useProgram(this.program);
        this.positionLoc = this.gl.getAttribLocation(this.program,"aPosition");
        this.colorLoc = this.gl.getUniformLocation(this.program,"uColor");
        this.gl.viewport(0,0,canvas.width,canvas.height);
        this.gl.clearColor(1,1,1,1);
    }
    clear(r,g,b,a) {
        this.gl.clearColor(r,g,b,a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    drawTriangle(tri,color) {
        const verts = new Float32Array([
            tri.ax,tri.ay,
            tri.bx,tri.by,
            tri.cx,tri.cy
        ]);
        this._drawShape(verts,color);
    }
    drawQuadrilateral(quad, color = [0.6,0.6,0.6,0.7]) {
        this.drawTriangle(new Triangle(quad.ax,quad.ay,quad.bx,quad.by,quad.cx,quad.cy),color);
        this.drawTriangle(new Triangle(quad.ax,quad.ay,quad.cx,quad.cy,quad.dx,quad.dy),color);
    }
    drawDot(x,y,color,size=5) {
        const verts = new Float32Array([x,y]);
        this._drawPoints(verts,color,size);
    }
    _drawShape(vertices,color) {
        const gl = this.gl;
        gl.useProgram(this.program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc,2,gl.FLOAT,false,0,0);
        gl.uniform4fv(this.colorLoc,color);
        gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);
        gl.disableVertexAttribArray(this.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.deleteBuffer(buffer);
    }
    _drawPoints(vertices,color,size) {
        const gl = this.gl;
        gl.useProgram(this.program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc,2,gl.FLOAT,false,0,0);
        gl.uniform4fv(this.colorLoc,color);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS,0,vertices.length/2);
        gl.disable(gl.BLEND);
        gl.disableVertexAttribArray(this.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.deleteBuffer(buffer);
    }
    
    drawTriangleBorder(tri, color = [0.2, 0.2, 0.2, 0.8]) {
        const gl = this.gl;
        const vertices = new Float32Array([
            tri.ax, tri.ay,
            tri.bx, tri.by,
            tri.bx, tri.by,
            tri.cx, tri.cy,
            tri.cx, tri.cy,
            tri.ax, tri.ay
        ]);
        
        gl.useProgram(this.program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(this.colorLoc, color);
        gl.drawArrays(gl.LINES, 0, 6);
        gl.disableVertexAttribArray(this.positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteBuffer(buffer);
    }
}
