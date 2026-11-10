import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeam,restoreTeam} from '../src/pokemon/Team.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {STARTER_MOVE_PROPOSALS,getStarterMoveIds} from '../src/pokemon/starterMoves.js';
import {deserializePokemon} from '../src/pokemon/Pokemon.js';
import {makeTestTeam} from '../src/ui/TestSaveMode.js';
const make=()=>createTeam({registry:sampleRegistry});
test('Starter-Movesets referenzieren nur unterstützte, eindeutige Attacken (maximal vier)',()=>{
 for(const [id,ids] of Object.entries(STARTER_MOVE_PROPOSALS)){
  assert(sampleRegistry.get(id)?.starterEligible);assert(ids.length<=4);assert.equal(new Set(ids).size,ids.length);
  for(const moveId of getStarterMoveIds(id,sampleMoveRegistry)){const move=sampleMoveRegistry.get(moveId);assert(move);assert.notEqual(move.category,'status');assert.equal(move.effectId,null);assert(move.power>0);}
 }
});
test('Alle vier Starterarten erhalten exakt die vorläufigen Anfangsattacken',()=>{
 for(const [id,ids] of Object.entries(STARTER_MOVE_PROPOSALS)){
  const p=make().assignStarter({speciesId:id,instanceId:`starter-${id}`,level:5});
  assert.deepEqual(p.moveIds,ids);assert.deepEqual(Object.keys(p.movePp),ids);
 }
});
test('Anfängliche AP stimmen mit Attackenregister überein',()=>{
 const p=make().assignStarter({speciesId:'charmander',instanceId:'s',level:5});
 for(const id of p.moveIds)assert.deepEqual(p.movePp[id],{current:sampleMoveRegistry.get(id).pp,max:sampleMoveRegistry.get(id).pp});
});
test('Starterberechtigung, Level und perfekte IVs bleiben unverändert',()=>{
 const team=make();assert.throws(()=>team.assignStarter({speciesId:'lucario',instanceId:'x',level:5}));
 const p=team.assignStarter({speciesId:'eevee',instanceId:'s',level:5});assert.equal(p.level,5);assert(Object.values(p.iv).every(v=>v===31));assert.throws(()=>team.assignStarter({speciesId:'caterpie',instanceId:'other',level:5}));
});
test('Verbrauchte AP werden bei Team-Serialisierung und Wiederherstellung nicht aufgefüllt',()=>{
 const team=make();team.assignStarter({speciesId:'eevee',instanceId:'s',level:5});
 const save=team.toSaveData();save.members[0].movePp.tackle.current=3;
 const restored=restoreTeam(save,sampleRegistry);assert.equal(restored.getMember('s').movePp.tackle.current,3);
 assert.equal(restoreTeam(restored.toSaveData(),sampleRegistry).getMember('s').movePp.tackle.current,3);
});
test('Alte Pokémon-Daten ohne AP-Felder bleiben unverändert lesbar',()=>{
 const legacy={...make().assignStarter({speciesId:'eevee',instanceId:'s',level:5})};
 delete legacy.movePp;delete legacy.currentHp;delete legacy.maxHp;
 const p=deserializePokemon(legacy,sampleRegistry);assert.equal(p.movePp,null);assert.equal(p.currentHp,null);
});
test('Bestehende normale und Verzweifler-Testspielstände bleiben unverändert',()=>{
 for(const mode of ['normal','struggle']){
  const team=makeTestTeam({registry:sampleRegistry,mode});const p=team.getMembers()[0];
  assert.deepEqual(p.moveIds,['tackle']);assert.equal(p.movePp.tackle.current,mode==='normal'?35:0);assert.equal(p.movePp.tackle.max,35);
 }
});
test('Verzweifler ist kein regulärer Starter-Move',()=>{
 for(const ids of Object.values(STARTER_MOVE_PROPOSALS))assert(!ids.includes('struggle'));
 assert.deepEqual(getStarterMoveIds('riolu',sampleMoveRegistry),[]);
});
test('Unbekannte oder nicht unterstützte Movesets werden abgewiesen',()=>{
 assert.deepEqual(getStarterMoveIds('unknown',sampleMoveRegistry),[]);
 assert.throws(()=>getStarterMoveIds('charmander',{get:()=>null}));
});
