import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveSystem} from '../src/save/SaveSystem.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {makeTestTeam,createTestSave,inspectTestSlots,TEST_MODES} from '../src/ui/TestSaveMode.js';
import {createTrainerTestBattle,chooseOpponentMove} from '../src/battle/TrainerBattle.js';
const fixture=()=>{const map=new Map();const storage={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,v)};return {map,saveSystem:new SaveSystem({registry:sampleRegistry,storage})};};
test('Beide Modi: gleiches Evoli, Level 5, volle KP, ausschließlich Tackle',()=>{
 const a=makeTestTeam({registry:sampleRegistry}).getMembers()[0],b=makeTestTeam({registry:sampleRegistry,mode:'struggle'}).getMembers()[0];
 for(const p of [a,b]){assert.equal(p.speciesId,'eevee');assert.equal(p.level,5);assert.deepEqual(p.moveIds,['tackle']);assert.ok(p.currentHp>0);assert.equal(p.currentHp,p.maxHp);}
 assert.deepEqual(a.movePp.tackle,{current:35,max:35});assert.deepEqual(b.movePp.tackle,{current:0,max:35});
});
test('Beide Varianten speichern und laden über SaveSystem',()=>{
 for(const mode of Object.keys(TEST_MODES)){const {saveSystem}=fixture();const r=createTestSave({saveSystem,registry:sampleRegistry,slot:2,mode,confirmed:true});assert.equal(r.status,'ok');const p=saveSystem.load(2).team.getMembers()[0];assert.equal(p.movePp.tackle.current,mode==='struggle'?0:35);assert.equal(p.currentHp,p.maxHp);}
});
test('Bestätigung erforderlich, ungültige Variante wird abgewiesen',()=>{
 const {saveSystem,map}=fixture();assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,mode:'struggle'}).status,'confirmation-required');assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,mode:'unknown',confirmed:true}).status,'invalid-mode');assert.equal(map.size,0);
});
test('Belegte, defekte und inkompatible Plätze bleiben bytegenau erhalten',()=>{
 const {saveSystem,map}=fixture();map.set(saveSystem.key(1),'bad-json');map.set(saveSystem.key(2),'{}');const before=[...map.entries()];assert.equal(inspectTestSlots(saveSystem).freeSlot,3);for(const slot of [1,2])assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot,mode:'struggle',confirmed:true}).status,'occupied');assert.deepEqual([...map.entries()],before);
});
test('Bei drei geschützten Plätzen keine Erstellung',()=>{
 const {saveSystem,map}=fixture();for(let i=1;i<=3;i++)map.set(saveSystem.key(i),'{}');assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,mode:'struggle',confirmed:true}).status,'no-free-slot');assert.equal(map.size,3);
});
test('Trainerkampf aus geladenem 0-AP-Testteam löst automatisch Verzweifler aus',()=>{
 const {saveSystem}=fixture();assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,mode:'struggle',confirmed:true}).status,'ok');const team=saveSystem.load(1).team;const player=team.getMembers()[0];const battle=createTrainerTestBattle({team,registry:sampleRegistry,moveRegistry:sampleMoveRegistry,playerSnapshot:player});assert.ok(battle);assert.equal(battle.getState().remainingPp.player.tackle,0);assert.equal(battle.hasUsableMove('player'),false);battle.submitAction('player',{type:'move',moveId:'tackle'});assert.equal(battle.pending.player.moveId,'struggle');battle.submitAction('opponent',{type:'move',moveId:chooseOpponentMove(battle,sampleMoveRegistry)});assert.equal(battle.getState().remainingPp.player.tackle,0);
});
test('UI kennzeichnet beide Varianten und verlangt Bestätigung des Speicherplatzes',async()=>{
 const {readFile}=await import('node:fs/promises');const ui=await readFile(new URL('../src/ui/TestSaveMode.js',import.meta.url),'utf8');assert.match(ui,/Verzweifler-Test \(0 AP\)/);assert.match(ui,/Bestätigung:/);assert.match(ui,/Testvariante/);assert.match(ui,/confirmed:true/);
});
