import test from 'node:test';
import assert from 'node:assert/strict';
import {createPokemon} from '../src/pokemon/Pokemon.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {createBattle} from '../src/battle/Battle.js';
import {createClassicBattleOptions,createClassicStatAdapters} from '../src/battle/BattleRules.js';
import {createTeam,restoreTeam} from '../src/pokemon/Team.js';
import {chooseOpponentMove} from '../src/battle/TrainerBattle.js';
const pokemon=(id,speciesId='charmander')=>createPokemon({registry:sampleRegistry,instanceId:id,speciesId,level:5,moveIds:['tackle']});
function setup({playerPp=0,opponentPp=0,damage,rng=()=>.999}={}){
 const player=pokemon('p'),opponent=pokemon('o','eevee');
 player.movePp={tackle:{current:playerPp,max:35}};opponent.movePp={tackle:{current:opponentPp,max:35}};
 const options=createClassicBattleOptions({speciesRegistry:sampleRegistry,moveRegistry:sampleMoveRegistry,rng});
 return createBattle({playerPokemon:player,opponentPokemon:opponent,...options,...(damage?{damage}:{})});
}
test('Spieler und Gegner ohne AP verwenden automatisch Verzweifler, keine AP-Veränderung',()=>{
 const b=setup();assert.equal(chooseOpponentMove(b,sampleMoveRegistry),'struggle');
 b.submitAction('player',{type:'move',moveId:'tackle'});assert.equal(b.pending.player.moveId,'struggle');
 const state=b.submitAction('opponent',{type:'move',moveId:'struggle'});
 assert.equal(state.round,1);assert.equal(state.remainingPp.player.tackle,0);assert.equal(state.remainingPp.opponent.tackle,0);
 assert.equal(state.events.filter(e=>e.type==='recoil').length,2);
});
test('Verzweifler nicht auswählbar solange nutzbare AP vorhanden sind',()=>{
 const b=setup({playerPp:1,opponentPp:1});assert.throws(()=>b.submitAction('player',{type:'move',moveId:'struggle'}),/nur ohne/);
 b.submitAction('player',{type:'move',moveId:'tackle'});b.submitAction('opponent',{type:'move',moveId:'tackle'});
 assert.equal(b.getState().remainingPp.player.tackle,0);
});
test('Typenloser Schaden ohne STAB und Immunität, Stärke 50, fester Zufall',()=>{
 const b=setup();const d=b.rules.damage({attacker:b.pokemon.player,defender:b.pokemon.opponent,moveId:'struggle'});
 const adapters=createClassicStatAdapters(sampleRegistry);const stats=adapters.stats(b.pokemon.player),def=adapters.stats(b.pokemon.opponent);
 const expected=Math.max(1,Math.floor((Math.floor(Math.floor(Math.floor((Math.floor(2*5/5+2)*50*stats.attack)/def.defense)/50)+2))*1));
 assert.equal(d,expected);
 assert.ok(d>0); // typeless move bypasses chart; no species-specific immunity lookup
});
test('Rückstoß: abrunden, mindestens 1, höchstens aktuelle KP',()=>{
 const b=setup({damage:()=>0});b.pokemon.player.currentHp=1;
 b.submitAction('player',{type:'move',moveId:'struggle'});const state=b.submitAction('opponent',{type:'move',moveId:'struggle'});
 assert.equal(state.playerHp,0);assert.equal(state.result,'opponent');
 assert.equal(state.events.find(e=>e.type==='recoil'&&e.side==='player').damage,1);
});
test('Sieg, Niederlage und gleichzeitiges KO durch Rückstoß',()=>{
 const win=setup({damage:()=>999});win.rules.speed=p=>p.instanceId==='p'?100:1;win.submitAction('player',{type:'move',moveId:'struggle'});assert.equal(win.submitAction('opponent',{type:'move',moveId:'struggle'}).result,'player');
 const lose=setup({damage:()=>999});lose.rules.speed=p=>p.instanceId==='o'?100:1;lose.submitAction('player',{type:'move',moveId:'struggle'});assert.equal(lose.submitAction('opponent',{type:'move',moveId:'struggle'}).result,'opponent');
 const draw=setup({damage:()=>999});draw.rules.speed=p=>p.instanceId==='p'?100:1;draw.pokemon.player.currentHp=1;draw.submitAction('player',{type:'move',moveId:'struggle'});assert.equal(draw.submitAction('opponent',{type:'move',moveId:'struggle'}).result,'draw');
});
test('Rückstoß-KP werden über vorhandene Teamsynchronisation und Save-Daten übernommen',()=>{
 const t=createTeam({registry:sampleRegistry});t.addMember(pokemon('p'));const sync=t.beginBattleSync('p','023-1');
 const b=setup({damage:()=>999});b.pokemon.player.currentHp=sync.pokemon.currentHp??b.pokemon.player.currentHp;
 b.submitAction('player',{type:'move',moveId:'struggle'});b.submitAction('opponent',{type:'move',moveId:'struggle'});
 t.applyBattleResult({battleId:'023-1',instanceId:'p',currentHp:b.pokemon.player.currentHp,maxHp:b.pokemon.player.maxHp,movePp:b.pokemon.player.movePp});
 assert.equal(restoreTeam(t.toSaveData(),sampleRegistry).getMember('p').currentHp,b.pokemon.player.currentHp);
});
