/** World contract: tile grid, dimensions in world pixels, solid rectangle checks. */
export class World {
  constructor(rows, tileSize=48) {
    if (!rows.length || rows.some(row=>row.length!==rows[0].length)) throw new Error('Rectangular map required');
    this.rows=rows.map(row=>[...row]);this.tileSize=tileSize;
    this.width=rows[0].length*tileSize;this.height=rows.length*tileSize;
  }
  isSolidTile(tx,ty){return ty<0||tx<0||ty>=this.rows.length||tx>=this.rows[0].length||this.rows[ty][tx]==='#'}
  collidesRect(x,y,w,h){const t=this.tileSize, eps=0.00001;for(let ty=Math.floor(y/t);ty<=Math.floor((y+h-eps)/t);ty++)for(let tx=Math.floor(x/t);tx<=Math.floor((x+w-eps)/t);tx++)if(this.isSolidTile(tx,ty))return true;return false}
}
/** Test data only, not the canon world. */
export function createTestWorld(){const w=34,h=24;const rows=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>(x===0||y===0||x===w-1||y===h-1)?'#':'.'));for(const [x,y] of [[6,6],[7,6],[8,6],[9,6],[9,7],[9,8],[15,10],[15,11],[15,12],[16,12],[21,5],[22,5],[23,5],[24,5],[24,6],[5,17],[6,17],[7,17],[25,16],[25,17],[25,18]])rows[y][x]='#';return new World(rows.map(r=>r.join('')))}
