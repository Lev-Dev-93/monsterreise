import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveSystem,SAVE_PREFIX} from '../src/save/SaveSystem.js';
import {createTeam} from '../src/pokemon/Team.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {createWorldRegistry} from '../src/world/WorldRegistry.js';
import {WorldSession} from '../src/world/WorldSession.js';
import {Player} from '../src/player/Player.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),map};};
const setup=()=>{const storage=memory(),worldRegistry=createWorldRegistry();return {storage,worldRegistry,save:new SaveSystem({registry:sampleRegistry,worldRegistry,storage}),team:createTeam({registry:sampleRegistry})};};
const loc=(mapId='start-village',x=15*48,y=17*48,returnPositions=[])=>({mapId,x,y,facing:'left',returnPositions});
test('roundtrip preserves position, direction, Pokémon and starter flag in slot 1',()=>{
 const {save,team}=setup();team.assignStarter({speciesId:'riolu',instanceId:'starter',level:5});
 assert.equal(save.save(1,team,loc()).status,'ok');const loaded=save.load(1);
 assert.equal(loaded.locationStatus,'ok');assert.deepEqual(loaded.location,loc());
 assert.deepEqual(loaded.team.toSaveData(),team.toSaveData());assert.throws(()=>loaded.team.assignStarter({speciesId:'eevee',instanceId:'other'}));
});
test('three slots have independent locations and teams',()=>{
 const {save,team}=setup();save.save(1,team,loc());save.save(2,team,loc('start-village',7*48,10*48));
 save.save(3,team,loc('sample-house',5*48,8*48,[{mapId:'start-village',x:7*48,y:10*48}]));
 assert.equal(save.load(1).location.x,720);assert.equal(save.load(2).location.x,336);
 assert.equal(save.load(3).location.mapId,'sample-house');
});
test('invalid and blocked locations retain team and do not rewrite stored data',()=>{
 const {save,storage,team}=setup();team.assignStarter({speciesId:'eevee',instanceId:'s',level:5});
 for(const location of [loc('missing'),loc('start-village',0,0),loc('start-village',NaN,0),
  loc('sample-house',5*48,8*48),{...loc(),facing:'sideways'}, {...loc(),returnPositions:[{mapId:'missing',x:0,y:0}]}]){
  const raw=JSON.stringify({version:1,team:team.toSaveData(),location});storage.setItem(SAVE_PREFIX+'1',raw);
  const loaded=save.load(1);assert.equal(loaded.status,'ok');assert.equal(loaded.locationStatus,'invalid');
  assert.equal(loaded.team.starterAssigned,true);assert.equal(storage.getItem(SAVE_PREFIX+'1'),raw);
 }
 assert.equal(save.save(1,team,loc('missing')).status,'error');
});
test('legacy v011 team-only saves load with default spawn fallback',()=>{
 const {save,storage,team}=setup();storage.setItem(SAVE_PREFIX+'1',JSON.stringify({version:1,team:team.toSaveData()}));
 const loaded=save.load(1);assert.equal(loaded.status,'ok');assert.equal(loaded.locationStatus,'legacy');assert.equal(loaded.location,null);
});
test('loaded indoor return stack permits exit and portal does not bounce',()=>{
 const {save,team,worldRegistry}=setup();const position=loc('sample-house',5*48,10*48,[{mapId:'start-village',x:7*48,y:10*48}]);
 save.save(1,team,position);const restored=save.load(1).location;
 const session=new WorldSession(worldRegistry,restored.mapId);session.returnPositions=restored.returnPositions;
 const player=new Player(restored.x,restored.y);player.facing=restored.facing;
 const key=`${restored.mapId}:${Math.floor((player.x+player.width/2)/48)}:${Math.floor((player.y+player.height/2)/48)}`;
 session.lastPortalKey=key;assert.equal(session.updatePosition(player),null);
 player.y=9*48;session.updatePosition(player);player.y=10*48;
 const transition=session.updatePosition(player);assert.equal(transition.type,'transition');assert.equal(transition.to,'start-village');
 player.x=transition.x;player.y=transition.y;assert.equal(session.updatePosition(player),null);
});
