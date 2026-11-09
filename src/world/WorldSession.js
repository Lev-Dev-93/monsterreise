import {createWorldRegistry} from './WorldRegistry.js';
/** Pure world coordinator; Game owns when and how to apply the returned state. */
export class WorldSession {
 constructor(registry=createWorldRegistry(),initialMap='start-village'){this.registry=registry;this.mapId=initialMap;this.returnPositions=[];if(!registry.has(initialMap))throw new Error('Unknown initial map')}
 get world(){return this.registry.get(this.mapId)}
 spawn(){const s=this.world.spawn;return{x:s.x*this.world.tileSize,y:s.y*this.world.tileSize}}
 /** Interact only with the adjacent tile in the player's facing direction. */
 interact(player){const t=this.world.tileSize,cx=player.x+player.width/2,cy=player.y+player.height/2;const offsets={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};const [dx,dy]=offsets[player.facing]??offsets.down;const tx=Math.floor(cx/t)+dx,ty=Math.floor(cy/t)+dy;
 const npc=this.world.npcs.find(n=>n.x===tx&&n.y===ty);if(npc)return{type:'dialog',npcId:npc.id,speaker:npc.label,lines:[...npc.dialog]};
 const portal=this.world.portals.find(p=>p.x===tx&&p.y===ty);if(!portal)return null;
 const source=this.mapId,origin={mapId:source,x:player.x,y:player.y};let target;
 if(portal.returnToPrevious){const previous=this.returnPositions.at(-1);if(!previous||previous.mapId!==portal.targetMap)return{type:'blocked',reason:'No return position'};target={...this.returnPositions.pop()}}
 else {this.returnPositions.push(origin);target={mapId:portal.targetMap,x:portal.targetSpawn.x*this.registry.get(portal.targetMap).tileSize,y:portal.targetSpawn.y*this.registry.get(portal.targetMap).tileSize}}
 const destination=this.registry.get(target.mapId);if(destination.collidesRect(target.x,target.y,player.width,player.height))throw new Error('Destination blocked');this.mapId=target.mapId;return{type:'transition',from:source,to:this.mapId,x:target.x,y:target.y,world:destination};
 }
}
