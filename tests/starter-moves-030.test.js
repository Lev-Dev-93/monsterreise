import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeam,restoreTeam} from '../src/pokemon/Team.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {getStarterMoveIds,STARTER_MOVE_PROPOSALS} from '../src/pokemon/starterMoves.js';
import {createClassicBattleOptions} from '../src/battle/BattleRules.js';
import {Battle} from '../src/battle/Battle.js';
import {makeTestTeam} from '../src/ui/TestSaveMode.js';
const make=()=>createTeam({registry:sampleRegistry});
const opts=()=>createClassicBattleOptions({speciesRegistry:sampleRegistry,moveRegistry:sampleMoveRegistry,rng:()=>0.5});
test('030: Berechtigung und Vorschläge decken genau die registrierten Starter ab',()=>{
 assert.deepEqual(Object.keys(STARTER_MOVE_PROPOSALS).sort(),sampleRegistry.starterOptions().map(s=>s.speciesId).sort());
 assert.equal(sampleRegistry.get('lucario').starterEligible,false);assert.equal(sampleRegistry.get('mewtwo').starterEligible,false);
});
test('030: Riolu bekommt spielbaren Ruckzuckhieb mit korrekten AP und perfekten IV',()=>{
 const p=make().assignStarter({speciesId:'riolu',instanceId:'r',level:5});
 assert.deepEqual(p.moveIds,['quick-attack']);assert.deepEqual(p.movePp['quick-attack'],{current:30,max:30});
 assert(Object.values(p.iv).every(v=>v===31));
});
test('030: Keine doppelten, unbekannten, nicht unterstützten oder Verzweifler-Attacken',()=>{
 for(const [species,ids] of Object.entries(STARTER_MOVE_PROPOSALS)){
  assert.deepEqual(ids,getStarterMoveIds(species,sampleMoveRegistry));assert(ids.length<=4);assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){const move=sampleMoveRegistry.get(id);assert(move);assert(move.power>0);assert.equal(move.effectId,null);assert.notEqual(id,'struggle');}
 }
 assert.deepEqual(getStarterMoveIds('unregistered',sampleMoveRegistry),[]);
 assert.throws(()=>getStarterMoveIds('riolu',{get:()=>null}));
});
test('030: Einmalige Startervergabe und bisherige Glumanda/Evoli/Raupy-Movesets',()=>{
 for(const [species,ids] of Object.entries({charmander:['scratch','ember'],eevee:['tackle'],caterpie:['tackle']})){
  const team=make();assert.deepEqual(team.assignStarter({speciesId:species,instanceId:'s',level:5}).moveIds,ids);
  assert.throws(()=>team.assignStarter({speciesId:species,instanceId:'s2',level:5}));
 }
});
test('030: Verbrauchte AP bleiben nach Team-Save/Restore erhalten',()=>{
 const t=make();t.assignStarter({speciesId:'riolu',instanceId:'r',level:5});const saved=t.toSaveData();
 saved.members[0].movePp['quick-attack'].current=4;
 assert.equal(restoreTeam(saved,sampleRegistry).getMember('r').movePp['quick-attack'].current,4);
});
test('030: Legacy ohne AP bleibt lesbar und wird nicht automatisch verändert',()=>{
 const t=make();t.assignStarter({speciesId:'riolu',instanceId:'r',level:5});const saved=t.toSaveData();
 delete saved.members[0].movePp;
 const restored=restoreTeam(saved,sampleRegistry);assert.equal(restored.getMember('r').movePp,null);
});
test('030: Riolu kann regulär angreifen und verbraucht einen AP',()=>{
 const r=make().assignStarter({speciesId:'riolu',instanceId:'r',level:5});
 const e=make().assignStarter({speciesId:'eevee',instanceId:'e',level:5});
 const b=new Battle({playerPokemon:r,opponentPokemon:e,...opts()});
 assert(b.hasUsableMove('player'));
 b.submitAction('player',{type:'move',moveId:'quick-attack'});b.submitAction('opponent',{type:'move',moveId:'tackle'});
 assert.equal(r.movePp['quick-attack'].current,29);
});
test('030: Verzweifler ausschließlich ohne nutzbare AP',()=>{
 const r=make().assignStarter({speciesId:'riolu',instanceId:'r',level:5});
 const e=make().assignStarter({speciesId:'eevee',instanceId:'e',level:5});
 const b=new Battle({playerPokemon:r,opponentPokemon:e,...opts()});
 assert.throws(()=>b.submitAction('player',{type:'move',moveId:'struggle'}));
 const r2=make().assignStarter({speciesId:'riolu',instanceId:'r2',level:5});r2.movePp['quick-attack'].current=0;
 const e2=make().assignStarter({speciesId:'eevee',instanceId:'e2',level:5});
 const b2=new Battle({playerPokemon:r2,opponentPokemon:e2,...opts()});assert.equal(b2.hasUsableMove('player'),false);
 b2.submitAction('player',{type:'move',moveId:'quick-attack'});b2.submitAction('opponent',{type:'move',moveId:'tackle'});
 assert.equal(r2.movePp['quick-attack'].current,0);
 assert(b2.events.some(event=>event.type==='recoil'));
});
test('030: Isolierte Testspielstände behalten Tackle und 35/0 AP',()=>{
 for(const [mode,expected] of [['normal',35],['struggle',0]]){
  const p=makeTestTeam({registry:sampleRegistry,mode}).getMembers()[0];
  assert.deepEqual(p.moveIds,['tackle']);assert.equal(p.movePp.tackle.current,expected);
 }
});
