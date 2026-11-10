import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeam,restoreTeam} from '../src/pokemon/Team.js';
import {createPokemon} from '../src/pokemon/Pokemon.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {createTrainerTestBattle,firstBattleReady} from '../src/battle/TrainerBattle.js';
import {nextTrainerBattleId} from '../src/ui/BattleView.js';
const setup=()=>{const team=createTeam({registry:sampleRegistry});team.addMember(createPokemon({registry:sampleRegistry,speciesId:'charmander',instanceId:'sync020',level:5,moveIds:['scratch']}));return team;};
function start(team,id){const member=firstBattleReady(team),sync=team.beginBattleSync(member.instanceId,id);const battle=createTrainerTestBattle({team,registry:sampleRegistry,moveRegistry:sampleMoveRegistry,playerSnapshot:sync.pokemon});return {sync,battle};}
test('Echte Teamkopie statt Test-Pokémon; KP/AP bleiben nach Kampf und Reload erhalten',()=>{const team=setup(),{sync,battle}=start(team,'020-a');assert.equal(battle.pokemon.player.instanceId,'sync020');for(let i=0;i<80&&!battle.finished;i++){battle.submitAction('player',{type:'move',moveId:'scratch'});if(!battle.finished)battle.submitAction('opponent',{type:'move',moveId:'tackle'});}assert.ok(battle.finished);const p=battle.pokemon.player;const result={battleId:sync.battleId,instanceId:sync.instanceId,currentHp:p.currentHp,maxHp:p.maxHp,movePp:p.movePp};team.applyBattleResult(result);assert.throws(()=>team.applyBattleResult(result));const restored=restoreTeam(team.toSaveData(),sampleRegistry);assert.equal(restored.getMember('sync020').currentHp,p.currentHp);assert.deepEqual(restored.getMember('sync020').movePp,p.movePp);if(p.currentHp===0)assert.equal(firstBattleReady(restored),null);});
test('Abbruch verwirft unvollständige Änderungen',()=>{const team=setup(),before=team.getMembers(),{sync,battle}=start(team,'020-b');battle.submitAction('player',{type:'move',moveId:'scratch'});team.cancelBattleSync(sync.instanceId,sync.battleId);assert.deepEqual(team.getMembers(),before);assert.throws(()=>team.applyBattleResult({battleId:sync.battleId,instanceId:sync.instanceId,currentHp:0,maxHp:20,movePp:{}}));});
test('Kampf-IDs sind innerhalb der Sitzung verschieden',()=>{assert.notEqual(nextTrainerBattleId(),nextTrainerBattleId());});
