
import { bindAttr } from "./glUtils.js";

export async function initGeom(st, cfg){
  const w = st.cvs.width, h = st.cvs.height;
  for(let i=0;i<cfg.rndN;i++){
    st.bPts.push([Math.random()*w, Math.random()*h]);
  }
  const oc = rotRect(cfg.obs);
  oc.forEach(c => st.bPts.push(c));
  st.bPts.push([0,0],[w,0],[0,h],[w,h]);

  for(let i=0;i<cfg.pplN;i++){
    let px, py;
    do{
      px = Math.random()*w;
      py = Math.random()*h;
    }while(inPoly([px,py], rotRect(cfg.obs)));
    st.pPts.push([px,py]);
  }
  const d = Delaunator.from(st.bPts);
  st.edges = triToEdges(d.triangles);

  rebuild(st, cfg);
}

export function updGeom(st, cfg){
  const gl = st.gl;
  const oc = rotRect(cfg.obs);
  const oV = oc.flat();
  for(let i=0;i<4;i++){
    st.bPts[cfg.rndN + i] = oc[i];
  }

  // Prevent points from being inside the obstacle
  st.pPts = st.pPts.map(p => {
    if(inPoly(p, oc)){
      // push point outside obstacle along y-axis or x-axis (simple fix)
      let [px, py] = p;
      const center = [cfg.obs.x + cfg.obs.w/2, cfg.obs.y + cfg.obs.h/2];
      if(px < center[0]) px = cfg.obs.x - 1;
      else px = cfg.obs.x + cfg.obs.w + 1;
      if(py < center[1]) py = cfg.obs.y - 1;
      else py = cfg.obs.y + cfg.obs.h + 1;
      return [px, py];
    }
    return p;
  });

  const bV = st.bPts.flat();
  const lV = [];
  st.edges.forEach(([i,j])=>{
    if(i<st.bPts.length && j<st.bPts.length){
      lV.push(...st.bPts[i], ...st.bPts[j]);
    }
  });

  gl.bindBuffer(gl.ARRAY_BUFFER, st.buf.bar);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oV), gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, st.buf.mark);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bV), gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, st.buf.line);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lV), gl.DYNAMIC_DRAW);
}


export function rebuild(st, cfg){
  st.tris   = findTris(st.bPts, st.edges);
  st.triDen = triDensity(st.pPts, st.bPts, st.tris);
}

export function triToEdges(tri){
  const set = new Set();
  for(let i=0;i<tri.length;i+=3){
    const a=tri[i], b=tri[i+1], c=tri[i+2];
    set.add([a,b].sort((x,y)=>x-y).join("-"));
    set.add([b,c].sort((x,y)=>x-y).join("-"));
    set.add([c,a].sort((x,y)=>x-y).join("-"));
  }
  return Array.from(set).map(s => s.split("-").map(Number));
}

export function rotRect({x,y,w,h,rotDeg}){
  const hw=w/2, hh=h/2;
  const cx=x+w/2, cy=y+h/2;
  const rad = rotDeg*Math.PI/180.0;
  const cs=Math.cos(rad), sn=Math.sin(rad);
  const vs=[[-hw,-hh],[ hw,-hh],[ hw, hh],[-hw, hh]];
  return vs.map(([px,py])=>{
    const rx=px*cs - py*sn;
    const ry=px*sn + py*cs;
    return [rx+cx, ry+cy];
  });
}

export function findClosestPt(p, pts, r){
  let idx=null, best=r*r;
  for(let i=0;i<pts.length;i++){
    const dx=pts[i][0]-p[0], dy=pts[i][1]-p[1];
    const d=dx*dx+dy*dy;
    if(d<best){ best=d; idx=i; }
  }
  return idx;
}

export function distSeg(p, a, b){
  const l2 = (a[0]-b[0])**2 + (a[1]-b[1])**2;
  if(l2===0) return Math.hypot(p[0]-a[0], p[1]-a[1]);
  let t=((p[0]-a[0])*(b[0]-a[0])+(p[1]-a[1])*(b[1]-a[1]))/l2;
  t=Math.max(0, Math.min(1,t));
  const px=a[0]+t*(b[0]-a[0]), py=a[1]+t*(b[1]-a[1]);
  return Math.hypot(p[0]-px, p[1]-py);
}

export function findClosestEdge(p, pts, edges, r){
  let idx=null, best=r;
  for(let i=0;i<edges.length;i++){
    const e=edges[i]; if(!e) continue;
    if(pts[e[0]]===undefined || pts[e[1]]===undefined) continue;
    const d = distSeg(p, pts[e[0]], pts[e[1]]);
    if(d<best){ best=d; idx=i; }
  }
  return idx;
}

export function inTri(p, tri){
  const [p0,p1,p2]=tri;
  const s = p0[1]*p2[0]-p0[0]*p2[1] + (p2[1]-p0[1])*p[0] + (p0[0]-p2[0])*p[1];
  const t = p0[0]*p1[1]-p0[1]*p1[0] + (p0[1]-p1[1])*p[0] + (p1[0]-p0[0])*p[1];
  if((s<0)!=(t<0) && s!=0 && t!=0) return false;
  const A = -p1[1]*p2[0] + p0[1]*(p2[0]-p1[0]) + p0[0]*(p1[1]-p2[1]) + p1[0]*p2[1];
  return A<0 ? (s<=0 && s+t>=A) : (s>=0 && s+t<=A);
}

export function inPoly(p, poly){
  const x=p[0], y=p[1];
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i][0], yi=poly[i][1];
    const xj=poly[j][0], yj=poly[j][1];
    const inter=((yi>y)!=(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi) + xi);
    if(inter) inside=!inside;
  }
  return inside;
}

export function findTris(pts, edges){
  const tris=[];
  const adj=new Map(pts.map((_,i)=>[i,[]]));
  for(const [u,v] of edges){
    if(adj.has(u) && adj.has(v)){ adj.get(u).push(v); adj.get(v).push(u); }
  }
  for(let u=0;u<pts.length;u++){
    const n=adj.get(u);
    for(let i=0;i<n.length;i++){
      for(let j=i+1;j<n.length;j++){
        const v=n[i], w=n[j];
        if(adj.get(v).includes(w)){
          const t=[u,v,w].sort((a,b)=>a-b);
          if(!tris.some(q=>q[0]===t[0] && q[1]===t[1] && q[2]===t[2])) tris.push(t);
        }
      }
    }
  }
  return tris;
}

export function triDensity(ppl, pts, tris){
  const den=new Array(tris.length).fill(0);
  ppl.forEach(p=>{
    for(let i=0;i<tris.length;i++){
      const ti=tris[i];
      const tv=[pts[ti[0]], pts[ti[1]], pts[ti[2]]];
      if(inTri(p, tv)){ den[i]++; break; }
    }
  });
  return den;
}
