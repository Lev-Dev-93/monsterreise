import {createWorldRegistry} from './WorldRegistry.js';
/** Map transitions are triggered by entering a portal tile, not by interaction. */
export class WorldSession {
 constructor(registry=createWorldRegistry(),initialMap='start-village',battleLock=null){
  this.battleLock=battleLock;
  this.registry=registry;this.mapId=initialMap;this.returnPositions=[];
  this.lastPortalKey=null;
  if(!registry.has(initialMap))throw new Error('Unknown initial map');
 }
 get world(){return this.registry.get(this.mapId)}
 spawn(){const s=this.world.spawn;return{x:s.x*this.world.tileSize,y:s.y*this.world.tileSize}}
 /** Called after movement. A portal fires once per tile entry, never while standing on it. */
 updatePosition(player){if(this.battleLock?.isBattleActive())return null;
  const t=this.world.tileSize;
  const tx=Math.floor((player.x+player.width/2)/t),ty=Math.floor((player.y+player.height/2)/t);
  const key=`${this.mapId}:${tx}:${ty}`;
  if(key===this.lastPortalKey)return null;
  this.lastPortalKey=key;
  const portal=this.world.portals.find(p=>p.x===tx&&p.y===ty&&p.activation==='enter');
  if(!portal)return null;
  const from=this.mapId;
  let target,shouldPop=false;
  if(portal.returnToPrevious){
   const previous=this.returnPositions.at(-1);
   if(!previous||previous.mapId!==portal.targetMap)return{type:'blocked',reason:'No return position'};
   target=previous;shouldPop=true;
  }else{
   const destination=this.registry.get(portal.targetMap);
   target={mapId:portal.targetMap,x:portal.targetSpawn.x*destination.tileSize,y:portal.targetSpawn.y*destination.tileSize};
  }
  const destination=this.registry.get(target.mapId);
  if(destination.collidesRect(target.x,target.y,player.width,player.height))return{type:'blocked',reason:'Destination blocked'};
  if(shouldPop)this.returnPositions.pop();
  else{
   const s=portal.returnSpawn;
   if(!s)throw Error(`Portal ${portal.id} missing returnSpawn`);
   const x=s.x*this.world.tileSize,y=s.y*this.world.tileSize;
   if(this.world.collidesRect(x,y,player.width,player.height))throw Error('Return spawn blocked');
   this.returnPositions.push({mapId:from,x,y});
  }
  this.mapId=target.mapId;
  // Arm only after the player leaves the arrival tile, avoiding immediate bounce.
  this.lastPortalKey=`${this.mapId}:${Math.floor((target.x+player.width/2)/destination.tileSize)}:${Math.floor((target.y+player.height/2)/destination.tileSize)}`;
  return{type:'transition',from,to:this.mapId,x:target.x,y:target.y,world:destination};
 }
 /** Targeted interaction remains reserved for NPCs and future objects. */
 interact(player){if(this.battleLock?.isBattleActive())return null;
  const t=this.world.tileSize,cx=player.x+player.width/2,cy=player.y+player.height/2;
  const offsets={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const [dx,dy]=offsets[player.facing]??offsets.down;
  const tx=Math.floor(cx/t)+dx,ty=Math.floor(cy/t)+dy;
  const npc=this.world.npcs.find(n=>n.x===tx&&n.y===ty);
  return npc?{type:'dialog',npcId:npc.id,speaker:npc.label,lines:[...npc.dialog]}:null;
 }
}
