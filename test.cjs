const assert=require('node:assert/strict');
const L=require('./core.js');
const g=Array(32).fill(1);
assert.equal(L.edges.length,32);
for(let i=0;i<16;i++){assert.equal(L.edges.filter(e=>e.a===i||e.b===i).length,4);for(let j=0;j<16;j++){const p=L.route(i,j,g);assert.equal(p.length-1,(i^j).toString(2).replaceAll('0','').length);}}
assert.equal(L.components(g),1);
L.edges.forEach((e,k)=>{if(e.axis===3)g[k]=0;});assert.equal(L.components(g),2);assert.equal(L.route(0,15,g),null);assert.ok(L.route(0,7,g));
const isolated=Array(32).fill(0);assert.equal(L.components(isolated),16);assert.equal(L.experiment(isolated).fixed.mean,null);
const all=Array(32).fill(1),r=L.experiment(all);assert.equal(r.fixed.delivered,160);assert.equal(r.adaptive.delivered,160);assert.deepEqual(r,L.experiment(all));assert.ok(r.estimates.every(Number.isFinite));
// Weighted routing avoids an expensive direct edge without taking a closed link.
const costs=Array(32).fill(1);costs[L.edgeIndex(0,1)]=100;assert.equal(L.route(0,1,all,costs).length,4);
const cutResult=L.experiment(g);assert.ok(cutResult.fixed.delivered>0&&cutResult.fixed.delivered<160);assert.equal(cutResult.fixed.delivered,cutResult.adaptive.delivered);
for(const trial of cutResult.trials)for(const name of ['fixedPath','adaptivePath'])if(trial[name])for(let i=1;i<trial[name].length;i++)assert.ok(L.open(g[L.edgeIndex(trial[name][i-1],trial[name][i])]));
console.log('PASS: topology, all-pairs intact paths, partitions, isolation, weighted detours, reproducibility, failure-aware experiment.');console.log(JSON.stringify({fixed:r.fixed,adaptive:r.adaptive,observations:r.observations}));
