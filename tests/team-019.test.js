import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeam,restoreTeam} from '../src/pokemon/Team.js';
import {createPokemon} from '../src/pokemon/Pokemon.js';
import {sampleRegistry as registry} from '../src/pokemon/sampleData.js';
import {SaveSystem} from '../src/save/SaveSystem.js';
const make = () => {
  const team=createTeam({registry});
  const pokemon=createPokemon({registry,speciesId:'eevee',instanceId:'s',level:5,origin:'wild',moveIds:['tackle'],maxHp:25,currentHp:25,movePp:{tackle:{max:35,current:35}}});
  team.assignStarter({speciesId:'riolu',instanceId:'starter',level:5});
  team.addMember(pokemon);
  return team;
};
const commit=(team,id,hp,pp,extras={})=>team.applyBattleResult({battleId:id,instanceId:'s',currentHp:hp,maxHp:25,movePp:{tackle:{max:35,current:pp}},...extras});
test('Sieg: KP und AP werden aus Kopie übernommen, Identität bleibt unverändert',()=>{
  const team=make();const before=team.getMember('s');const ctx=team.beginBattleSync('s','win');
  ctx.pokemon.currentHp=19;ctx.pokemon.movePp.tackle.current=33;
  assert.equal(team.getMember('s').currentHp,25);
  commit(team,'win',19,33);
  assert.equal(team.getMember('s').currentHp,19);assert.equal(team.getMember('s').movePp.tackle.current,33);
  for(const field of ['speciesId','iv','shiny','origin','experience','moveIds'])assert.deepEqual(team.getMember('s')[field],before[field]);
});
test('Niederlage: 0 KP bleibt 0 und keine automatische Heilung',()=>{const t=make();t.beginBattleSync('s','loss');commit(t,'loss',0,30);assert.equal(t.getMember('s').currentHp,0);});
test('Doppelte Übernahme und Kampf-ID-Replay werden verweigert',()=>{const t=make();t.beginBattleSync('s','once');commit(t,'once',20,32);assert.throws(()=>commit(t,'once',20,32),/bereits/);assert.throws(()=>t.beginBattleSync('s','once'),/bereits/);});
test('Ungültige ID und nicht begonnene Ergebnisse werden verweigert',()=>{const t=make();assert.throws(()=>t.beginBattleSync('unknown','x'),/nicht gefunden/);assert.throws(()=>commit(t,'fake',1,1),/Unbekannter/);});
test('Manipulierte Identität und KP-Erhöhung werden verweigert, ohne Teiländerung',()=>{const t=make();t.beginBattleSync('s','bad');assert.throws(()=>commit(t,'bad',20,30,{speciesId:'lucario'}),/Unerlaubtes/);assert.throws(()=>commit(t,'bad',26,30),/KP/);assert.equal(t.getMember('s').currentHp,25);commit(t,'bad',21,31);});
test('AP-Manipulationen: negative, überhöhte, fremde und fehlende AP',()=>{
  for(const pp of [-1,36,1.5]){const t=make();t.beginBattleSync('s','bad');assert.throws(()=>commit(t,'bad',20,pp),/AP/);}
  const t=make();t.beginBattleSync('s','bad');assert.throws(()=>t.applyBattleResult({battleId:'bad',instanceId:'s',currentHp:20,maxHp:25,movePp:{tackle:{max:35,current:30},hack:{max:5,current:5}}}),/AP/);
});
test('Veralteter Kampf wird nach Entfernen und Ersetzen nicht angewendet',()=>{const t=make();t.beginBattleSync('s','old');t.removeMember('s');t.addMember(createPokemon({registry,speciesId:'eevee',instanceId:'s',level:5}));assert.throws(()=>commit(t,'old',1,1),/Unbekannter/);});
test('Gleichzeitiger Kampf für dasselbe Pokémon verweigert, Abbruch blockiert Replay',()=>{const t=make();t.beginBattleSync('s','a');assert.throws(()=>t.beginBattleSync('s','b'),/aktiv/);t.cancelBattleSync('s','a');assert.throws(()=>commit(t,'a',1,1),/bereits/);});
test('Save-Roundtrip bewahrt KP/AP und Replay-Schutz',()=>{
  const t=make();t.beginBattleSync('s','persist');commit(t,'persist',12,29);
  const storage=new Map();const adapter={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
  const save=new SaveSystem({registry,storage:adapter});assert.equal(save.save(1,t).status,'ok');
  const loaded=save.load(1);assert.equal(loaded.status,'ok');assert.equal(loaded.team.getMember('s').currentHp,12);
  assert.equal(loaded.team.getMember('s').movePp.tackle.current,29);
  assert.throws(()=>loaded.team.beginBattleSync('s','persist'),/bereits/);
});
test('Legacy-Spielstand ohne KP/AP und battleSync wird geladen',()=>{
  const t=make();const old=t.toSaveData();delete old.battleSync;
  for(const p of old.members){delete p.currentHp;delete p.maxHp;delete p.movePp;}
  const restored=restoreTeam(old,registry);assert.equal(restored.getMember('s').currentHp,null);
  assert.equal(restored.getMember('s').movePp,null);
});
test('Manipulierte Save-Metadaten werden abgewiesen',()=>{const t=make();const data=t.toSaveData();data.battleSync.consumed=['same','same'];assert.throws(()=>restoreTeam(data,registry),/Metadaten/);});
