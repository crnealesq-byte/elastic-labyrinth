/* Pure graph and routing model. No browser dependencies. */
(function(root){
'use strict';
const edges=[];for(let a=0;a<16;a++)for(let axis=0;axis<4;axis++){const b=a^(1<<axis);if(a<b)edges.push({a,b,axis});}
const label=n=>n.toString(2).padStart(4,'0');
const open=g=>g>=.1;
const edgeIndex=(a,b)=>edges.findIndex(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a));
// Choose two free bits; the remaining bits identify one of four square faces.
// Cyclic vertex order follows four existing fibers and never adds a diagonal.
const faces=[];
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
 const free=(1<<i)|(1<<j);
 for(let base=0;base<16;base++){
  if(base&free)continue;
  const vertices=[base,base^(1<<i),base^free,base^(1<<j)];
  faces.push({vertices,edges:vertices.map((v,k)=>edgeIndex(v,vertices[(k+1)%4])),axes:[i,j]});
 }
}
const faceAlive=(face,gates)=>face.edges.every(k=>open(gates[k]));
const liveFaceCount=gates=>faces.filter(face=>faceAlive(face,gates)).length;
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function route(from,to,gates,costs){const dist=Array(16).fill(Infinity),prev=Array(16).fill(-1),used=new Set();dist[from]=0;for(let n=0;n<16;n++){let u=-1;for(let i=0;i<16;i++)if(!used.has(i)&&(u<0||dist[i]<dist[u]))u=i;if(u<0||!Number.isFinite(dist[u]))break;if(u===to)break;used.add(u);edges.forEach((e,k)=>{if(!open(gates[k]))return;const v=e.a===u?e.b:e.b===u?e.a:-1;if(v<0)return;const d=dist[u]+(costs?costs[k]:1);if(d<dist[v]){dist[v]=d;prev[v]=u;}});}if(!Number.isFinite(dist[to]))return null;const path=[to];while(path[0]!==from)path.unshift(prev[path[0]]);return path;}
function components(gates){const seen=new Set();let c=0;for(let i=0;i<16;i++){if(seen.has(i))continue;c++;const q=[i];seen.add(i);while(q.length){const a=q.pop();edges.forEach((e,k)=>{const b=e.a===a?e.b:e.b===a?e.a:-1;if(b>=0&&open(gates[k])&&!seen.has(b)){seen.add(b);q.push(b);}});}}return c;}
const latent=edges.map((e,k)=>1+((k*13+e.a*7+e.axis*11)%17)/3);
const effective=(g,est)=>est.map((v,k)=>v/Math.max(.1,g[k]));
function experiment(gates,seed=1729){const random=rng(seed),est=Array(32).fill(3),counts=Array(32).fill(0);const observe=k=>{const x=latent[k]*(.8+.4*random());counts[k]++;est[k]+=(x-est[k])/counts[k];};
// Forced exploration samples each usable edge once; included in reported observations.
 edges.forEach((_,k)=>{if(open(gates[k]))observe(k);});
for(let t=0;t<240;t++){const a=Math.floor(random()*16),b=(a+1+Math.floor(random()*15))%16;const explore=t%4===0;const path=route(a,b,gates,explore?null:effective(gates,est));if(path)for(let i=1;i<path.length;i++)observe(edgeIndex(path[i-1],path[i]));}
const trials=[];for(let t=0;t<160;t++){const a=Math.floor(random()*16),b=(a+1+Math.floor(random()*15))%16;const costs=latent.map((v,k)=>v*(.8+.4*random())/Math.max(.1,gates[k]));const fixed=route(a,b,gates),adaptive=route(a,b,gates,effective(gates,est));const sum=p=>p?p.slice(1).reduce((s,n,i)=>s+costs[edgeIndex(p[i],n)],0):null;trials.push({from:label(a),to:label(b),fixed:sum(fixed),adaptive:sum(adaptive),fixedPath:fixed,adaptivePath:adaptive});}
const summarize=key=>{const vals=trials.map(t=>t[key]).filter(x=>x!==null);return {delivered:vals.length,mean:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null};};
return {seed,trainingJourneys:240,testJourneys:160,observations:counts.reduce((a,b)=>a+b,0),estimates:est,counts,gates:gates.slice(),fixed:summarize('fixed'),adaptive:summarize('adaptive'),trials};}
const api={edges,faces,faceAlive,liveFaceCount,label,open,edgeIndex,rng,route,components,effective,experiment};if(typeof module!=='undefined')module.exports=api;root.Labyrinth=api;
})(typeof globalThis!=='undefined'?globalThis:this);
