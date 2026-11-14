import {createWorldRegistry} from './WorldRegistry.js';
import {muBreederHouse} from './maps/muBreederHouse.js';
import {muBreederFarm} from './maps/muBreederFarm.js';
import {muStartVillage} from './maps/muStartVillage.js';
import {muProfessorHouse} from './maps/muProfessorHouse.js';
import {muRoute1} from './maps/muRoute1.js';

export const MU_STORY_MAPS=Object.freeze([muBreederHouse,muBreederFarm,muStartVillage,muProfessorHouse,muRoute1]);
export const MU_STORY_START='mu-breeder-house';
export const ROUTE1_EVENT_ID='story.prologue.route1.first-entry';
export function createMuStoryRegistry(){const registry=createWorldRegistry(MU_STORY_MAPS);for(const data of MU_STORY_MAPS)registry.get(data.id).spawns=structuredClone(data.spawns);return registry;}

// Isolated adapter: never writes story, egg, team, storage, or 033 DEV world state.
export class MuStorySession {
 constructor({registry=createMuStoryRegistry(),initialMap=MU_STORY_START,battleLock=null}={}) {
  if(!registry.has(initialMap))throw Error('Unknown initial map');
  this.registry=registry;this.mapId=initialMap;this.battleLock=battleLock;
  this.returnPositions=[];this.lastPortalKey=null;this.sequence=0;
 }
 get world(){return this.registry.get(this.mapId);}
 spawn(spawnId){const s=spawnId?this.world.spawns[spawnId]:this.world.spawn;if(!s)throw Error('Unknown spawn');return{x:s.x*this.world.tileSize,y:s.y*this.world.tileSize};}
 // A pure preflight: can be called by Chat 01 before input lock / story commit.
 previewTransition(player){
  if(this.battleLock?.isBattleActive())return {status:'blocked',reason:'battle'};
  const t=this.world.tileSize,tx=Math.floor((player.x+player.width/2)/t),ty=Math.floor((player.y+player.height/2)/t);
  const key=`${this.mapId}:${tx}:${ty}`;
  if(key===this.lastPortalKey)return {status:'none',key};
  const portal=this.world.portals.find(p=>p.x===tx&&p.y===ty&&p.activation==='enter');
  if(!portal)return {status:'none',key};
  const destination=this.registry.get(portal.targetMap),target=destination?.spawns?.[portal.spawnId];
  if(!destination||!target)return {status:'blocked',reason:'missing-destination',key};
  const x=target.x*destination.tileSize,y=target.y*destination.tileSize;
  if(destination.collidesRect(x,y,player.width,player.height))return {status:'blocked',reason:'blocked-destination',key};
  const source={mapId:this.mapId,x:player.x,y:player.y,facing:player.facing};
  return {status:'ready',key,source,portal,target:{mapId:portal.targetMap,x,y,facing:player.facing},world:destination};
 }
 // No mutation until preflight and optional synchronous gate approval succeed.
 updatePosition(player,{canTransition}={}){
  const plan=this.previewTransition(player);
  if(plan.status==='none'){this.lastPortalKey=plan.key;return null;}
  if(plan.status==='blocked')return {type:'blocked',reason:plan.reason};
  const {portal,target,source,world}=plan;
  const request={fromMapId:source.mapId,mapId:target.mapId,transitionId:portal.transitionId,spawnId:portal.spawnId,portalId:portal.id};
  if(canTransition && canTransition(request)!==true)return {type:'blocked',reason:'gate-denied',...request};
  this.mapId=target.mapId;
  this.lastPortalKey=`${target.mapId}:${Math.floor((target.x+player.width/2)/world.tileSize)}:${Math.floor((target.y+player.height/2)/world.tileSize)}`;
  const transitionToken=`mu-transition-${++this.sequence}`;this.activeTransitionToken=transitionToken;
  return {type:'transition',from:source.mapId,to:target.mapId,x:target.x,y:target.y,world,
   ...request,transitionToken,sourceCheckpoint:source,
   eventId:portal.transitionId==='tr-village-route1'?ROUTE1_EVENT_ID:null};
 }
 // Explicit rollback for a rejected/uncommitted Route-1 gate; no save writes.
 rollbackTransition(transition){
  if(transition?.type!=='transition'||transition.mapId!==this.mapId||!transition.sourceCheckpoint||transition.transitionToken!==this.activeTransitionToken)throw Error('Invalid rollback');
  this.mapId=transition.sourceCheckpoint.mapId;this.activeTransitionToken=null;
  this.lastPortalKey=`${this.mapId}:${Math.floor((transition.sourceCheckpoint.x+1)/this.world.tileSize)}:${Math.floor((transition.sourceCheckpoint.y+1)/this.world.tileSize)}`;
  return {...transition.sourceCheckpoint};
 }
 // 033-compatible location format: pixels, English facing, returnPositions.
 getLocation(player){return {mapId:this.mapId,x:player.x,y:player.y,facing:player.facing,returnPositions:this.returnPositions.map(p=>({...p}))};}
 validateLocation(location,width=32,height=32){
  if(!location||!this.registry.has(location.mapId)||!['up','down','left','right'].includes(location.facing)||!Number.isFinite(location.x)||!Number.isFinite(location.y)||!Array.isArray(location.returnPositions)||location.returnPositions.length>16)return false;
  if(this.registry.get(location.mapId).collidesRect(location.x,location.y,width,height))return false;
  return location.returnPositions.every(p=>this.registry.has(p.mapId)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&!this.registry.get(p.mapId).collidesRect(p.x,p.y,width,height));
 }
 restoreLocation(location,width=32,height=32){if(!this.validateLocation(location,width,height))throw Error('Invalid story location');this.mapId=location.mapId;this.returnPositions=location.returnPositions.map(p=>({...p}));this.lastPortalKey=`${location.mapId}:${Math.floor((location.x+width/2)/this.world.tileSize)}:${Math.floor((location.y+height/2)/this.world.tileSize)}`;this.activeTransitionToken=null;return {x:location.x,y:location.y,facing:location.facing};}
}
