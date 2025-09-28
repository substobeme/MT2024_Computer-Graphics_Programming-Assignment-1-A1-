
import { findClosestPt, findClosestEdge, rotRect, rebuild } from "./geom.js";

export function setEvents(st, cfg){
  window.addEventListener('keydown', e => onKey(st, cfg, e));
  st.cvs.addEventListener('mousedown', e => onDown(st, cfg, e));
  st.cvs.addEventListener('contextmenu', e => e.preventDefault());
  st.cvs.addEventListener('mousemove', e => onMove(st, cfg, e));
  st.cvs.addEventListener('mouseup',   e => onUp(st, cfg, e));
}

function onKey(st, cfg, e){
  let ch=false;
  if(e.key==='r'){ cfg.obs.rotDeg -= cfg.rotSpd; ch=true; }
  else if(e.key==='R'){ cfg.obs.rotDeg += cfg.rotSpd; ch=true; }
  else if(e.key==='w'){ cfg.obs.y -= cfg.movSpd; ch=true; }
  else if(e.key==='s'){ cfg.obs.y += cfg.movSpd; ch=true; } 
  else if(e.key==='a'){ cfg.obs.x -= cfg.movSpd; ch=true; }
  else if(e.key==='d'){ cfg.obs.x += cfg.movSpd; ch=true; }
  else if(e.key==='b'){ cfg.obs.w /= cfg.sclFac; cfg.obs.h /= cfg.sclFac; ch=true; }
  else if(e.key==='B'){ cfg.obs.w *= cfg.sclFac; cfg.obs.h *= cfg.sclFac; ch=true; }

  if(ch) rebuild(st, cfg);
}

function getMouse(st, e){
  const r = st.cvs.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}

function onDown(st, cfg, e){
  e.preventDefault();
  if(st.dragIdx!==null) return;

  const m = getMouse(st, e);
  let ch=false;

  if(e.button===2){ st.selPt=null; return; }

  const pIdx = findClosestPt(m, st.bPts, cfg.ptSelR);
  if(pIdx!==null){
    if(st.selPt===null){
      st.selPt=pIdx;
    }else{
      if(st.selPt!==pIdx){
        st.edges.push([st.selPt, pIdx]);
        ch=true;
      }
      st.selPt=null;
    }
    if(ch) rebuild(st, cfg);
    return;
  }

  if(st.selPt!==null) st.selPt=null;

  const eIdx = findClosestEdge(m, st.bPts, st.edges, cfg.edSelR);
  if(eIdx!==null){
    st.edges.splice(eIdx, 1);
    ch=true;
    rebuild(st, cfg);
    return;
  }

  const ppIdx = findClosestPt(m, st.pPts, cfg.ptSelR);
  if(ppIdx!==null){
    st.dragIdx = ppIdx;
  }
}

function onMove(st, cfg, e){
  if(st.dragIdx===null) return;
  const m = getMouse(st, e);
  st.pPts[st.dragIdx] = m;
}

function onUp(st, cfg, e){
  if(st.dragIdx!==null){
    rebuild(st, cfg);
    st.dragIdx=null;
  }
}
