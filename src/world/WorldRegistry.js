import {World} from './World.js';
import {startVillage} from './maps/startVillage.js';
import {sampleHouse} from './maps/sampleHouse.js';
/** World extends the v0.1 collision contract without changing engine code. */
export class MapWorld extends World {
 constructor(data){super(data.rows,data.tileSize);this.id=data.id;this.label=data.label;this.terrain=data.terrain;this.portals=data.portals.map(p=>({...p}));this.npcs=data.npcs.map(n=>({...n}));this.spawn={...data.spawn};this.validate()}
 validate(){if(this.terrain.length!==this.rows.length||this.terrain.some((r,i)=>r.length!==this.rows[i].length))throw new Error('Terrain dimensions mismatch');for(const e of [...this.portals,...this.npcs]){if(!Number.isInteger(e.x)||!Number.isInteger(e.y)||super.isSolidTile(e.x,e.y))throw new Error(`Blocked or invalid entity: ${e.id}`)}}
 isSolidTile(x,y){return super.isSolidTile(x,y)||this.npcs?.some(n=>n.x===x&&n.y===y)===true}
 tileAt(x,y){return this.terrain[y]?.[x]??null}
}
export function createWorldRegistry(data=[startVillage,sampleHouse]){const maps=new Map(data.map(d=>[d.id,new MapWorld(d)]));if(maps.size!==data.length)throw new Error('Duplicate map ID');for(const map of maps.values())for(const portal of map.portals)if(!maps.has(portal.targetMap))throw new Error(`Missing destination ${portal.targetMap}`);return maps}
