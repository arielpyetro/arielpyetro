import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pixels,yoshi,egg} from './pixel-art.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const LEVELS=['NONE','FIRST_QUARTILE','SECOND_QUARTILE','THIRD_QUARTILE','FOURTH_QUARTILE'];
const COLORS=['#202020','#595959','#929292','#c9c9c9','#f5f5f5'];
export function normalize(calendar){
 if(!calendar?.weeks?.length)throw Error('Contribution calendar is missing. Previous image preserved.');
 const cells=[];
 calendar.weeks.forEach((w,x)=>w.contributionDays.forEach(d=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!Number.isInteger(d.contributionCount)||d.contributionCount<0)throw Error('Invalid contribution day');
  const level=LEVELS.indexOf(d.contributionLevel);
  if(level<0)throw Error('Invalid contribution level');
  cells.push({x,y:new Date(d.date+'T00:00:00Z').getUTCDay(),date:d.date,count:d.contributionCount,level});
 }));
 if(new Set(cells.map(d=>d.date)).size!==cells.length)throw Error('Duplicate dates');
 return cells;
}
// Shortest Manhattan hops to the nearest uneaten day. All crossed active cells
// are consumed exactly once; pause on them to make the eating animation visible.
export function makeRoute(cells){
 const pending=new Map(cells.filter(c=>c.count>0).map(c=>[`${c.x},${c.y}`,c]));
 const route=[{x:-2,y:3}],events=[];let pos=route[0];
 function step(x,y){pos={x,y};route.push(pos);const key=`${x},${y}`;if(pending.has(key)){events.push({cell:pending.get(key),frame:route.length-1});pending.delete(key);route.push({...pos},{...pos},{...pos});}}
 while(pending.size){const next=[...pending.values()].sort((a,b)=>(Math.abs(a.x-pos.x)+Math.abs(a.y-pos.y))-(Math.abs(b.x-pos.x)+Math.abs(b.y-pos.y))||a.x-b.x||a.y-b.y)[0];
  while(pos.x!==next.x)step(pos.x+Math.sign(next.x-pos.x),pos.y);
  while(pos.y!==next.y)step(pos.x,pos.y+Math.sign(next.y-pos.y));
  if(pending.has(`${pos.x},${pos.y}`))step(pos.x,pos.y);
 }
 if(!events.length){for(let x=-1;x<12;x++)step(x,3)}
 return {route,events};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function render(calendar,username){
 const cells=normalize(calendar),{route,events}=makeRoute(cells),cols=calendar.weeks.length;
 const width=Math.max(960,cols*16+100),height=252,x0=(width-cols*16)/2,y0=76;
 const duration=Math.max(16,route.length*.12+4),pct=i=>+(6+84*i/Math.max(1,route.length-1)).toFixed(4);
 const xy=p=>[x0+p.x*16+6.5,y0+p.y*16+6.5];
 const translate=p=>{let [x,y]=xy(p);return `translate(${x}px,${y}px)`};
 let css=`.runner{animation:run ${duration}s linear infinite}.egg1{animation:egg1 ${duration}s linear infinite}.egg2{animation:egg2 ${duration}s linear infinite}.feet{animation:feet .24s steps(2,end) infinite}.tongue{animation:tongue .48s steps(1,end) infinite;transform-origin:7px 0px}.face{animation:face ${duration}s steps(1,end) infinite}@keyframes feet{50%{transform:translateY(-1px)}}@keyframes tongue{0%,70%,100%{transform:scaleX(0)}75%,90%{transform:scaleX(1)}}`;
 for(const [name,delay]of [['run',0],['egg1',3],['egg2',6]]){
  css+=`@keyframes ${name}{0%,6%{transform:${translate(route[0])}}`;
  route.forEach((p,i)=>{css+=`${pct(i)}%{transform:${translate(route[Math.max(0,i-delay)])}}`});
  css+=`94%{transform:${translate(route.at(-1))};opacity:1}97%{transform:${translate(route.at(-1))};opacity:0}97.1%{transform:${translate(route[0])};opacity:0}100%{transform:${translate(route[0])};opacity:1}}`;
 }
 let direction=1;css+='@keyframes face{0%{transform:scaleX(1)}';
 route.forEach((p,i)=>{if(i&&p.x!==route[i-1].x){const d=Math.sign(p.x-route[i-1].x);if(d!==direction){direction=d;css+=`${pct(i)}%{transform:scaleX(${d})}`}}});css+='100%{transform:scaleX(1)}}';
 events.forEach((e,i)=>{const p=pct(e.frame);css+=`.food${i}{animation:eat${i} ${duration}s steps(1,end) infinite}@keyframes eat${i}{0%{opacity:1}${p}%{opacity:0}99.99%{opacity:0}100%{opacity:1}}`});
 css+='@media(prefers-reduced-motion:reduce){*{animation:none!important}}';
 const tx=(x,y,t,size=12,color='#aaaaaa',more='')=>`<text x="${x}" y="${y}" font-family="monospace" font-size="${size}" fill="${color}" ${more}>${esc(t)}</text>`;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">Yoshi e as contribuições de ${esc(username)}</title><desc id="desc">Calendário real de contribuições do GitHub, em tons de cinza. Yoshi percorre os dias ativos e coleta seus quadradinhos. ${cells.reduce((s,c)=>s+c.count,0)} contribuições, ${events.length} dias ativos, de ${cells[0].date} a ${cells.at(-1).date}.</desc><style>${css}</style><rect width="${width}" height="${height}" fill="#0b0b0b"/><path d="M20 40H${width-20}" stroke="#333"/>${tx(24,26,'YOSHI / CONTRIBUTION RUN',13,'#f5f5f5')}${tx(width-24,26,'@'+username,12,'#999','text-anchor="end"')}`;
 let month='';const months=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
 calendar.weeks.forEach((w,x)=>{const d=w.contributionDays[0]?.date;if(!d)return;const m=d.slice(0,7);if(m!==month){if(x<cols-2 && (x>0 || Number(d.slice(8,10))<8))out+=tx(x0+x*16,64,months[Number(d.slice(5,7))-1],10,'#777');month=m}});
 const eventMap=new Map(events.map((e,i)=>[e.cell.date,i]));
 out+='<g shape-rendering="crispEdges">';
 cells.forEach(c=>{let x=x0+c.x*16,y=y0+c.y*16;out+=`<rect x="${x}" y="${y}" width="13" height="13" fill="${COLORS[0]}"/>`;if(c.count)out+=`<rect class="food${eventMap.get(c.date)}" x="${x}" y="${y}" width="13" height="13" fill="${COLORS[c.level]}"><title>${c.date}: ${c.count} contribuições</title></rect>`});
 out+=`</g><g class="egg2" transform="translate(${xy(route[0]).join(' ')})">${pixels(egg,-4,-4,1.2)}</g><g class="egg1" transform="translate(${xy(route[0]).join(' ')})">${pixels(egg,-5,-5,1.5)}</g><g class="runner" transform="translate(${xy(route[0]).join(' ')})"><g class="face"><g class="feet">${pixels(yoshi,-17,-17,1.3)}<path class="tongue" d="M14 -4h10v3H14z" fill="#f5f5f5"/></g></g></g>`;
 out+=`<path d="M20 207H${width-20}" stroke="#333"/>${tx(24,232,`${cells.reduce((s,c)=>s+c.count,0)} CONTRIBUIÇÕES / ${events.length} DIAS ATIVOS`,12,'#bbb')}${tx(width-24,232,'EAT. CODE. REPEAT.',12,'#bbb','text-anchor="end"')}</svg>`;
 return out;
}
async function main(){
 const args=process.argv.slice(2);let calendar;
 const username=process.env.PROFILE_USERNAME||'arielpyetro';
 if(args[0]==='--input'){calendar=JSON.parse(await fs.readFile(args[1],'utf8'))}else{
  if(!process.env.GITHUB_TOKEN)throw Error('GITHUB_TOKEN is required to load real contributions.');
  const response=await fetch('https://api.github.com/graphql',{method:'POST',headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json','User-Agent':'yoshi-profile'},body:JSON.stringify({query:'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}',variables:{login:username}}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`GitHub API returned ${response.status}`);
  const body=await response.json();if(body.errors)throw Error('GitHub GraphQL returned an error; previous image preserved.');
  calendar=body.data?.user?.contributionsCollection?.contributionCalendar;
 }
 const svg=render(calendar,username);
 await fs.mkdir(path.join(ROOT,'assets'),{recursive:true});
 const dest=path.join(ROOT,'assets/yoshi-contributions.svg');
 await fs.writeFile(dest+'.tmp',svg);await fs.rename(dest+'.tmp',dest);
 console.log('Updated Yoshi animation from real contribution dates.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1});
