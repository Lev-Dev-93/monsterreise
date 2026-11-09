import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveSystem,SAVE_PREFIX} from '../src/save/SaveSystem.js';
import {createTeam} from '../src/pokemon/Team.js';
import {sampleRegistry as registry} from '../src/pokemon/sampleData.js';
const memory = () => {const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v),raw:data};};
test('roundtrip preserves Pokémon, IV, starter flag and blocks second starter',()=>{
 const storage=memory(),save=new SaveSystem({registry,storage}),team=createTeam({registry});
 team.assignStarter({speciesId:'riolu',instanceId:'starter-riolu',level:5});
 assert.equal(save.save(1,team).status,'ok');
 const result=save.load(1);assert.equal(result.status,'ok');assert.deepEqual(result.team.toSaveData(),team.toSaveData());
 assert.throws(()=>result.team.assignStarter({speciesId:'eevee',instanceId:'another',level:5}),/bereits/);
});
test('starter flag persists even if original starter removed',()=>{
 const storage=memory(),save=new SaveSystem({registry,storage}),team=createTeam({registry});
 team.assignStarter({speciesId:'eevee',instanceId:'s',level:5});team.removeMember('s');save.save(1,team);
 const restored=save.load(1).team;assert.equal(restored.size,0);assert.equal(restored.starterAssigned,true);
 assert.throws(()=>restored.assignStarter({speciesId:'riolu',instanceId:'x',level:5}),/bereits/);
});
test('three independent slots; empty slot',()=>{
 const storage=memory(),save=new SaveSystem({registry,storage}),team=createTeam({registry});
 assert.equal(save.load(2).status,'empty');team.assignStarter({speciesId:'eevee',instanceId:'s',level:5});save.save(1,team);
 assert.equal(save.load(2).status,'empty');assert.equal(save.load(3).status,'empty');
 save.save(2,createTeam({registry}));assert.equal(save.load(2).team.starterAssigned,false);
 assert.equal(save.load(1).team.starterAssigned,true);
});
test('invalid JSON, incompatible schema and tampered Pokémon do not overwrite stored bytes',()=>{
 const storage=memory(),save=new SaveSystem({registry,storage});
 for(const raw of ['{','{"version":0,"team":{}}','{"version":99,"team":{}}',JSON.stringify({version:1,team:{starterAssigned:false,members:[{speciesId:'unknown'}]}})]){
 storage.setItem(SAVE_PREFIX+'1',raw);const result=save.load(1);
 assert.ok(['invalid','incompatible'].includes(result.status));assert.equal(storage.getItem(SAVE_PREFIX+'1'),raw);
 }
});
test('storage failures and slot range handled safely',()=>{
 const storage={getItem(){throw Error('denied');},setItem(){throw Error('quota');}};
 const save=new SaveSystem({registry,storage});assert.equal(save.load(1).status,'error');
 assert.equal(save.save(1,createTeam({registry})).status,'error');
 assert.throws(()=>save.load(0),RangeError);assert.throws(()=>save.save(4,createTeam({registry})),RangeError);
});
