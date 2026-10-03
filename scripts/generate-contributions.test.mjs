import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRoute,normalize,render} from './generate-contributions.mjs';
const calendar=(counts)=>({weeks:[{contributionDays:counts.map((count,i)=>({date:`2026-09-${String(27+i).padStart(2,'0')}`,contributionCount:count,contributionLevel:count?'FIRST_QUARTILE':'NONE'}))}]});
test('Yoshi collects each active cell exactly once along adjacent moves',()=>{
 const cells=[{x:0,y:0,count:1,date:'a'},{x:3,y:0,count:4,date:'b'},{x:3,y:5,count:2,date:'c'},{x:1,y:0,count:3,date:'d'},{x:2,y:1,count:0,date:'e'}];
 const {route,events}=makeRoute(cells);
 assert.deepEqual(events.map(e=>e.cell.date).sort(),['a','b','c','d']);
 events.forEach(e=>{assert.equal(route[e.frame].x,e.cell.x);assert.equal(route[e.frame].y,e.cell.y)});
 route.slice(1).forEach((p,i)=>assert.ok(Math.abs(p.x-route[i].x)+Math.abs(p.y-route[i].y)<=1));
});
test('An empty year remains empty, without invented contributions',()=>{
 const c=calendar([0,0,0]);const cells=normalize(c);assert.equal(makeRoute(cells).events.length,0);
 const svg=render(c,'arielpyetro');assert.match(svg,/0 CONTRIBUIÇÕES \/ 0 DIAS ATIVOS/);assert.ok(!svg.includes('class="food'));
});
test('The SVG preserves real totals, dates and reduced-motion support',()=>{
 const svg=render(calendar([3,0,2]),'arielpyetro');assert.match(svg,/5 CONTRIBUIÇÕES \/ 2 DIAS ATIVOS/);assert.match(svg,/2026-09-27: 3 contribuições/);assert.match(svg,/prefers-reduced-motion/);assert.ok(!svg.includes('<script'));
});
test('Invalid API data fails before replacing the image',()=>{
 assert.throws(()=>normalize(null));const c=calendar([1]);c.weeks[0].contributionDays[0].contributionCount=-1;assert.throws(()=>normalize(c));
});
