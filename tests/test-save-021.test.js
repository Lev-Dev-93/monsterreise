import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveSystem} from '../src/save/SaveSystem.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {createTeam} from '../src/pokemon/Team.js';
import {inspectTestSlots,makeTestTeam,createTestSave} from '../src/ui/TestSaveMode.js';
function fixture(){
  const store=new Map();const storage={getItem:key=>store.has(key)?store.get(key):null,setItem:(key,value)=>store.set(key,value)};
  return {saveSystem:new SaveSystem({registry:sampleRegistry,storage}),store};
}
test('Testteam verwendet bestehendes Modell mit Beispielattacke und initialisierten KP/AP',()=>{
  const team=makeTestTeam({registry:sampleRegistry});const [p]=team.getMembers();
  assert.equal(team.size,1);assert.equal(p.speciesId,'eevee');assert.equal(p.level,5);
  assert.deepEqual(p.moveIds,['tackle']);assert.ok(p.maxHp>0);assert.equal(p.currentHp,p.maxHp);
  assert.deepEqual(p.movePp,{tackle:{current:35,max:35}});
  assert.equal(team.starterAssigned,false);
});
test('Ohne explizite Bestätigung wird kein Spielstand geschrieben',()=>{
  const {saveSystem,store}=fixture();
  assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1}).status,'confirmation-required');
  assert.equal(store.size,0);
});
test('Belegte Plätze bleiben bytegenau unverändert; erster freier Platz wird erkannt',()=>{
  const {saveSystem,store}=fixture();const team=createTeam({registry:sampleRegistry});
  assert.equal(saveSystem.save(1,team).status,'ok');const old=store.get(saveSystem.key(1));
  assert.equal(inspectTestSlots(saveSystem).freeSlot,2);
  assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,confirmed:true}).status,'occupied');
  assert.equal(store.get(saveSystem.key(1)),old);
  assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:2,confirmed:true}).status,'ok');
  assert.equal(store.get(saveSystem.key(1)),old);
  assert.equal(saveSystem.load(2).team.getMembers()[0].moveIds[0],'tackle');
});
test('Bei drei belegten Plätzen wird kein Testspielstand angelegt',()=>{
  const {saveSystem,store}=fixture();for(let i=1;i<=3;i++)saveSystem.save(i,createTeam({registry:sampleRegistry}));
  const before=[...store.entries()];assert.equal(inspectTestSlots(saveSystem).freeSlot,null);
  assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,confirmed:true}).status,'no-free-slot');
  assert.deepEqual([...store.entries()],before);
});
test('Inkompatible und beschädigte Daten werden nicht überschrieben',()=>{
  const {saveSystem,store}=fixture();store.set(saveSystem.key(1),'not-json');store.set(saveSystem.key(2),'{}');
  assert.equal(inspectTestSlots(saveSystem).freeSlot,3);
  assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:1,confirmed:true}).status,'occupied');
  assert.equal(createTestSave({saveSystem,registry:sampleRegistry,slot:2,confirmed:true}).status,'occupied');
  assert.equal(store.get(saveSystem.key(1)),'not-json');assert.equal(store.get(saveSystem.key(2)),'{}');
});
test('Testspielstand bleibt nach SaveSystem-Roundtrip unverändert',()=>{
  const {saveSystem}=fixture();const result=createTestSave({saveSystem,registry:sampleRegistry,slot:3,confirmed:true});
  assert.equal(result.status,'ok');assert.deepEqual(saveSystem.load(3).team.getMembers(),result.team.getMembers());
});
test('Testoberfläche ist eingebunden und trägt eindeutige Testkennzeichnung',async()=>{
  const {readFile}=await import('node:fs/promises');
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(html,/id="test-save-toggle"/);assert.match(html,/id="test-save-panel"/);
  assert.match(html,/TESTMODUS/);assert.match(main,/new TestSaveMode/);
  assert.match(main,/loadSlot,report/);
});
test('Erstellter Teststand kann über bestehende Trainer-Battle-API gestartet werden',async()=>{
  const {createTrainerTestBattle}=await import('../src/battle/TrainerBattle.js');
  const {sampleMoveRegistry}=await import('../src/pokemon/sampleMoves.js');
  const team=makeTestTeam({registry:sampleRegistry});const member=team.getMembers()[0];
  const sync=team.beginBattleSync(member.instanceId,'test-021-battle');
  const battle=createTrainerTestBattle({team,registry:sampleRegistry,moveRegistry:sampleMoveRegistry,playerSnapshot:sync.pokemon});
  assert.ok(battle);assert.equal(battle.pokemon.player.moveIds[0],'tackle');
  assert.ok(battle.getState().remainingPp.player.tackle>0);
  team.cancelBattleSync(member.instanceId,'test-021-battle');
});
