const assert=require('node:assert/strict');
const L=require('./core.js');
const g=Array(32).fill(1);
assert.equal(L.edges.length,32);
assert.equal(L.faces.length,24);
assert.equal(new Set(L.faces.map(f=>f.vertices.slice().sort((a,b)=>a-b).join(','))).size,24);
const pairCounts=new Map(),edgeMembership=Array(32).fill(0);
for(const face of L.faces){
 assert.equal(new Set(face.vertices).size,4);
 assert.equal(new Set(face.edges).size,4);
 const pair=face.axes.join(',');pairCounts.set(pair,(pairCounts.get(pair)||0)+1);
 const freeMask=face.axes.reduce((mask,axis)=>mask|(1<<axis),0);
 const fixedMask=15^freeMask;
 assert.ok(face.vertices.every(v=>(v&fixedMask)===(face.vertices[0]&fixedMask)));
 assert.equal(new Set(face.vertices.map(v=>v&freeMask)).size,4);
 for(let i=0;i<4;i++){
  const a=face.vertices[i],b=face.vertices[(i+1)%4],edge=L.edges[face.edges[i]];
  assert.ok(edge&&(edge.a===a&&edge.b===b||edge.a===b&&edge.b===a));
  assert.ok(face.axes.includes(edge.axis));edgeMembership[face.edges[i]]++;
 }
 assert.ok(L.faceAlive(face,g));
}
assert.equal(pairCounts.size,6);assert.ok([...pairCounts.values()].every(n=>n===4));
assert.ok(edgeMembership.every(n=>n===3));assert.equal(L.liveFaceCount(g),24);
for(let cut=0;cut<32;cut++){
 const gates=g.slice();gates[cut]=0;
 assert.equal(L.liveFaceCount(gates),21);
 assert.deepEqual(L.faces.filter(f=>!L.faceAlive(f,gates)),L.faces.filter(f=>f.edges.includes(cut)));
 gates[cut]=.1;assert.equal(L.liveFaceCount(gates),24);
 gates[cut]=.099;assert.equal(L.liveFaceCount(gates),21);
}
for(let i=0;i<16;i++){assert.equal(L.edges.filter(e=>e.a===i||e.b===i).length,4);for(let j=0;j<16;j++){const p=L.route(i,j,g);assert.equal(p.length-1,(i^j).toString(2).replaceAll('0','').length);}}
assert.equal(L.components(g),1);
L.edges.forEach((e,k)=>{if(e.axis===3)g[k]=0;});assert.equal(L.components(g),2);assert.equal(L.route(0,15,g),null);assert.ok(L.route(0,7,g));
assert.equal(L.liveFaceCount(g),12);
assert.ok(L.faces.filter(f=>L.faceAlive(f,g)).every(f=>!f.axes.includes(3)));
const isolated=Array(32).fill(0);assert.equal(L.components(isolated),16);assert.equal(L.experiment(isolated).fixed.mean,null);
assert.equal(L.liveFaceCount(isolated),0);
const all=Array(32).fill(1),r=L.experiment(all);assert.equal(r.fixed.delivered,160);assert.equal(r.adaptive.delivered,160);assert.deepEqual(r,L.experiment(all));assert.ok(r.estimates.every(Number.isFinite));
// Weighted routing avoids an expensive direct edge without taking a closed link.
const costs=Array(32).fill(1);costs[L.edgeIndex(0,1)]=100;assert.equal(L.route(0,1,all,costs).length,4);
const cutResult=L.experiment(g);assert.ok(cutResult.fixed.delivered>0&&cutResult.fixed.delivered<160);assert.equal(cutResult.fixed.delivered,cutResult.adaptive.delivered);
for(const trial of cutResult.trials)for(const name of ['fixedPath','adaptivePath'])if(trial[name])for(let i=1;i<trial[name].length;i++)assert.ok(L.open(g[L.edgeIndex(trial[name][i-1],trial[name][i])]));
console.log('PASS: square-face geometry, incidence, cuts and thresholds; topology, all-pairs intact paths, partitions, isolation, weighted detours, reproducibility, failure-aware experiment.');console.log(JSON.stringify({fixed:r.fixed,adaptive:r.adaptive,observations:r.observations}));
