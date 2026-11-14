// G4a: tile coordinates in maps, pixel coordinates in 033 location snapshots.
export function makeMuMap({id,label,width,height,spawn,spawns,portals,buildings=[],water=[],trees=[]}) {
 const grid=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>x===0||y===0||x===width-1||y===height-1?'#':'.'));
 const terrain=grid.map(r=>r.map(c=>c==='#'?'wall':'grass'));
 function paint(rect,kind){const [x,y,w,h]=rect;for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){if(i<1||j<1||i>=width-1||j>=height-1)throw Error('Geometry outside interior');grid[j][i]='#';terrain[j][i]=kind;}}
 buildings.forEach(r=>paint(r,'house'));water.forEach(r=>paint(r,'water'));trees.forEach(r=>paint(r,'tree'));
 for(const portal of portals){if(grid[portal.y]?.[portal.x]!==' .'.trim())throw Error('Portal blocked '+portal.id);terrain[portal.y][portal.x]='door';}
 for(const [name,s] of Object.entries(spawns)){if(grid[s.y]?.[s.x]!=='.'||portals.some(q=>q.x===s.x&&q.y===s.y))throw Error('Unsafe spawn '+id+':'+name);}
 return {id,label,tileSize:48,rows:grid.map(r=>r.join('')),terrain,spawn:{x:spawns[spawn].x,y:spawns[spawn].y},spawns,portals:portals.map(q=>({...q,activation:'enter'})),npcs:[]};
}
