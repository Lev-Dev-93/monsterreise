/** Provisional layout; no canonical village name or building assignment. */
const W=32,H=24;
const grid=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||x===W-1||y===0||y===H-1?'#':'.'));
const terrain=Array.from({length:H},()=>Array(W).fill('grass'));
function paint(x,y,width,height,tile,solid=false){for(let j=y;j<y+height;j++)for(let i=x;i<x+width;i++){terrain[j][i]=tile;if(solid)grid[j][i]='#'}}
// Northern forest, southern meadows, central dirt/stone paths.
for(let x=1;x<W-1;x++)for(let y=1;y<4;y++)if(x<14||x>18)paint(x,y,1,1,'tree',true);
paint(14,1,5,3,'path');paint(15,3,3,18,'path');paint(4,11,24,3,'path');paint(12,9,9,8,'stone');
// The village square and buildings are prototypes, not approved placements.
for(const b of [{x:5,y:6,w:6,h:4},{x:22,y:6,w:6,h:4},{x:5,y:16,w:6,h:4},{x:22,y:16,w:6,h:4}])paint(b.x,b.y,b.w,b.h,'house',true);
// One visible, walkable doorway in the south wall; the tile below is its approach.
grid[9][7]='.';terrain[9][7]='door';terrain[10][7]='path';
paint(8,20,4,2,'field');paint(20,20,6,2,'field');
for(const [x,y] of [[2,5],[3,6],[29,5],[28,15],[3,20],[29,21],[11,5],[20,6]])paint(x,y,1,1,'tree',true);
paint(16,12,1,1,'well',true);
export const startVillage={id:'start-village',label:'Startdorf (Arbeitstitel)',tileSize:48,rows:grid.map(r=>r.join('')),terrain:terrain.map(r=>r.slice()),spawn:{x:15,y:17},portals:[{id:'village-house-door',x:7,y:9,targetMap:'sample-house',targetSpawn:{x:5,y:8},returnSpawn:{x:7,y:10},activation:'enter'}],npcs:[{id:'professor-test',x:18,y:16,label:'Professor (Test)',dialog:['Professor-Begegnung'],placeholder:true},{id:'trainer-test-017',x:19,y:18,label:'Testtrainer (vorläufig)',dialog:['Übungskampf'],placeholder:true},{id:'villager-01',x:20,y:14,label:'Dorfbewohner',dialog:['Willkommen im Dorf!','Im Norden beginnt der große Wald.'],placeholder:true}]};
