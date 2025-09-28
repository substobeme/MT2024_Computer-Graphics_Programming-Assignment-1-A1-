
import { initGL, loadTxt, makeProg, bindAttr, makeBufs, getLocs } from "./glUtils.js";
import { initGeom, updGeom } from "./geom.js";
import { drawScene } from "./draw.js";
import { setEvents } from "./events.js";


export const cfg = {
  rndN: 40,          
  pplN: 100,         
  obs: { x:200, y:150, w:250, h:100, rotDeg:30 },
  rotSpd: 2.0,
  movSpd: 5.0,
  sclFac: 1.05,
  ptSelR: 10,
  edSelR: 10,
  denThr: 4,
  denCol: {
    low: [0.3, 0.5, 1.0, 0.7],
    ok:  [0.3, 1.0, 0.5, 0.7],
    hi:  [1.0, 0.3, 0.3, 0.7],
  }
};


export const st = {
  gl:null, cvs:null, prog:{}, buf:{}, loc:{},
  bPts:[], pPts:[], edges:[], tris:[], triDen:[],
  selPt:null, dragIdx:null
};

async function boot(){
  st.cvs = document.getElementById("glCanvas");
  st.gl  = initGL(st.cvs);
  if(!st.gl){ alert("WebGL not supported"); return; }


  const [vs, fsLine, fsMark, fsBar, fsAgent, fsCell] = await Promise.all([
    loadTxt("./shaders/default.vert.glsl"),
    loadTxt("./shaders/line.frag.glsl"),
    loadTxt("./shaders/marker.frag.glsl"),
    loadTxt("./shaders/barrier.frag.glsl"),
    loadTxt("./shaders/agent.frag.glsl"),
    loadTxt("./shaders/cell.frag.glsl"),
  ]);


  st.prog.line = makeProg(st.gl, vs, fsLine);
  st.prog.mark = makeProg(st.gl, vs, fsMark);
  st.prog.bar  = makeProg(st.gl, vs, fsBar);
  st.prog.agent= makeProg(st.gl, vs, fsAgent);
  st.prog.cell = makeProg(st.gl, vs, fsCell);


  st.loc = getLocs(st.gl, st.prog);


  await initGeom(st, cfg);


  st.buf = makeBufs(st.gl);


  setEvents(st, cfg);

  requestAnimationFrame(loop);
}

function loop(){
  updGeom(st, cfg);
  drawScene(st, cfg);
  requestAnimationFrame(loop);
}

boot();
