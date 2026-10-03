export const palette={K:'#111111',W:'#f5f5f5',G:'#a3a3a3',D:'#595959'};
// Hand-drawn monochrome Yoshi: tall eyes, round snout, saddle, tail and boots.
export const yoshi=[
'............KK.KK...............',
'...........KWWKWWK..............',
'...........KWKKWKK..............',
'...........KWKKWKKKKKK..........',
'..........KWWWWWWGGGGGK.........',
'.........KWWWWWWGGGGGGGK........',
'.........KWWWWWGGGGKGGGK........',
'..........KWWWWGGGGGGGGK........',
'...........KWWWWGGGGGGGK........',
'..........KWWWWWWWWWWKK.........',
'.........KGGGWWKKKKKK...........',
'........KDDDGWWWK...............',
'.......KDDDDGGWWWKK.............',
'.......KDDDDGGWWWWGK............',
'.......KGGGGGWWWWKK.............',
'......KGGGGGGWWWWK..............',
'..KK.KGGGGGGGWWWWK..............',
'..KGKGGGGGGGGWWWWK..............',
'..KGGGGGGGGGWWWWWK..............',
'...KKGGGGGGWWWWWK...............',
'.....KKGGGWWWWWK................',
'.......KKWWWWKK.................',
'.......KDDK.KDDK................',
'......KDDDK.KDDDK...............',
'.....KDDDDK.KDDDDK..............',
'.....KKKKKK.KKKKKK..............'];
export function pixels(rows,x=0,y=0,scale=1,colors=palette){return `<g transform="translate(${x} ${y}) scale(${scale})" shape-rendering="crispEdges">${rows.map((row,j)=>[...row].map((c,i)=>colors[c]?`<path d="M${i} ${j}h1v1h-1z" fill="${colors[c]}"/>`:'').join('')).join('')}</g>`}
const font={A:['01110','11011','11011','11111','11011','11011','11011'],R:['11110','11011','11011','11110','11100','11010','11011'],I:['11111','00100','00100','00100','00100','00100','11111'],E:['11111','11000','11000','11110','11000','11000','11111'],L:['11000','11000','11000','11000','11000','11000','11111'],P:['11110','11011','11011','11110','11000','11000','11000'],Y:['11011','11011','01110','00100','00100','00100','00100'],T:['11111','00100','00100','00100','00100','00100','00100'],O:['01110','11011','11011','11011','11011','11011','01110'],' ':['00000','00000','00000','00000','00000','00000','00000']};
export function pixelText(s,x,y,k=7,color='#f5f5f5'){return [...s].map((c,i)=>pixels(font[c],x+i*k*6,y,k,{'1':color})).join('')}
export const egg=['..KKK..','.KWWWK.','KWWGWWK','KWGGWWK','KWWWGWK','.KWWWK.','..KKK..'];
