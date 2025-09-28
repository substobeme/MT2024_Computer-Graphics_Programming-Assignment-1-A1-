
import { bindAttr } from "./glUtils.js";

export function drawScene(st, cfg){
  const gl = st.gl;
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.1,0.1,0.15,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  drawCells(st, cfg);
  drawBar(st);
  drawLines(st);
  drawBasePts(st);
  drawAgents(st);

  gl.disable(gl.BLEND);
}

function drawCells(st, cfg){
  const gl=st.gl, loc=st.loc, prog=st.prog;
  gl.useProgram(prog.cell);
  gl.uniform2f(loc.cell.uRes, gl.canvas.width, gl.canvas.height);
  st.tris.forEach((id,i)=>{
    const d = st.triDen[i];
    let col = cfg.denCol.ok;
    if(d>cfg.denThr) col = cfg.denCol.hi;
    else if(d<cfg.denThr) col = cfg.denCol.low;
    gl.uniform4fv(loc.cell.uCol, col);
    const v=[...st.bPts[id[0]], ...st.bPts[id[1]], ...st.bPts[id[2]]];
    bindAttr(gl, loc.cell.aPos, st.buf.cell, new Float32Array(v));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
}

function drawBar(st){
  const gl=st.gl, loc=st.loc, prog=st.prog;
  gl.useProgram(prog.bar);
  gl.uniform2f(loc.bar.uRes, gl.canvas.width, gl.canvas.height);
  bindAttr(gl, loc.bar.aPos, st.buf.bar);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawLines(st){
  const gl=st.gl, loc=st.loc, prog=st.prog;
  gl.useProgram(prog.line);
  gl.uniform2f(loc.line.uRes, gl.canvas.width, gl.canvas.height);
  bindAttr(gl, loc.line.aPos, st.buf.line);
  gl.drawArrays(gl.LINES, 0, st.edges.length*2);
}

function drawBasePts(st){
  const gl=st.gl, loc=st.loc, prog=st.prog;
  gl.useProgram(prog.mark);
  gl.uniform2f(loc.mark.uRes, gl.canvas.width, gl.canvas.height);
  gl.uniform4f(loc.mark.uCol, 1.0,0.8,0.0,1.0);
  gl.uniform1f(loc.mark.uSize, 5.0);
  bindAttr(gl, loc.mark.aPos, st.buf.mark);
  gl.drawArrays(gl.POINTS, 0, st.bPts.length);

  if(st.selPt!==null){
    const p = st.bPts[st.selPt];
    gl.uniform4f(loc.mark.uCol, 0.0,1.0,0.0,1.0);
    gl.uniform1f(loc.mark.uSize, 10.0);
    bindAttr(gl, loc.mark.aPos, st.buf.mark, new Float32Array(p));
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

function drawAgents(st){
  const gl=st.gl, loc=st.loc, prog=st.prog;
  gl.useProgram(prog.agent);
  gl.uniform2f(loc.agent.uRes, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(loc.agent.uSize, 3.0);
  const data = new Float32Array(st.pPts.flat());
  bindAttr(gl, loc.agent.aPos, st.buf.agent, data);
  gl.drawArrays(gl.POINTS, 0, st.pPts.length);
}
