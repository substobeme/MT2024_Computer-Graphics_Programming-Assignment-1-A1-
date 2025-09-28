
export function initGL(canvas){
  const gl = canvas.getContext("webgl");
  return gl;
}

export async function loadTxt(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Failed to load: ${url}`);
  return res.text();
}

export function makeShader(gl, type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
    const msg = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile error: ${msg}`);
  }
  return sh;
}

export function makeProg(gl, vsSrc, fsSrc){
  const vs = makeShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = makeShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const p  = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
    const msg = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`Program link error: ${msg}`);
  }
  return p;
}

export function makeBufs(gl){
  return {
    line: gl.createBuffer(),
    mark: gl.createBuffer(),
    bar:  gl.createBuffer(),
    agent:gl.createBuffer(),
    cell: gl.createBuffer(),
  };
}

export function bindAttr(gl, loc, buf, data=null){
  gl.enableVertexAttribArray(loc);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  if(data){
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

export function getLocs(gl, prog){
  return {
    line: { aPos: gl.getAttribLocation(prog.line, 'a_position'),
            uRes: gl.getUniformLocation(prog.line, 'u_resolution') },
    mark: { aPos: gl.getAttribLocation(prog.mark, 'a_position'),
            uRes: gl.getUniformLocation(prog.mark, 'u_resolution'),
            uSize:gl.getUniformLocation(prog.mark, 'u_pointSize'),
            uCol: gl.getUniformLocation(prog.mark, 'u_color') },
    bar:  { aPos: gl.getAttribLocation(prog.bar, 'a_position'),
            uRes: gl.getUniformLocation(prog.bar, 'u_resolution') },
    agent:{ aPos: gl.getAttribLocation(prog.agent, 'a_position'),
            uRes: gl.getUniformLocation(prog.agent, 'u_resolution'),
            uSize:gl.getUniformLocation(prog.agent, 'u_pointSize') },
    cell: { aPos: gl.getAttribLocation(prog.cell, 'a_position'),
            uRes: gl.getUniformLocation(prog.cell, 'u_resolution'),
            uCol: gl.getUniformLocation(prog.cell, 'u_color') },
  };
}
