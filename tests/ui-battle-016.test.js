import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPokemon} from '../src/pokemon/Pokemon.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {createBattle} from '../src/battle/Battle.js';
import {createClassicBattleOptions} from '../src/battle/BattleRules.js';
import {eventMessage} from '../src/ui/BattleView.js';
const make=()=>{
 const player=createPokemon({registry:sampleRegistry,speciesId:'charmander',instanceId:'test-a',level:5,origin:'starter',moveIds:['scratch']});
 const opponent=createPokemon({registry:sampleRegistry,speciesId:'eevee',instanceId:'test-b',level:5,moveIds:['tackle']});
 return createBattle({playerPokemon:player,opponentPokemon:opponent,...createClassicBattleOptions({speciesRegistry:sampleRegistry,moveRegistry:sampleMoveRegistry,rng:()=>0.4})});
};
test('UI-Kampfadapter nutzt bestehende klassische Battle-Schnittstellen',()=>{const b=make();assert.equal(b.getState().round,0);b.submitAction('player',{type:'move',moveId:'scratch'});assert.deepEqual(b.getState().pendingSides,['player']);b.submitAction('opponent',{type:'move',moveId:'tackle'});assert.equal(b.getState().round,1);assert.ok(b.getState().playerHp<b.maxHp.player||b.getState().opponentHp<b.maxHp.opponent);});
test('Kampfmeldungen enthalten Treffer, Fehlschlag und Ergebnis',()=>{const b=make();assert.match(eventMessage({type:'move',side:'player',moveId:'scratch',damage:4},sampleRegistry,b,sampleMoveRegistry),/4 KP Schaden/);assert.match(eventMessage({type:'move-miss',side:'opponent',moveId:'tackle'},sampleRegistry,b,sampleMoveRegistry),/verfehlt/);assert.match(eventMessage({type:'battle-end',result:'player'},sampleRegistry,b,sampleMoveRegistry),/gewonnen/);});
test('Testoberfläche bietet keine erfundene KI oder Fangaktion',()=>{const src=readFileSync(new URL('../src/ui/BattleView.js',import.meta.url),'utf8');assert.match(src,/createClassicBattleOptions/);assert.match(src,/createBattle\(/);assert.match(src,/submitAction\(/);assert.match(src,/getState\(/);assert.match(src,/keine KI/);assert.doesNotMatch(src,/capturePokemon|trainerAI/);});
test('Kampfpanel ist responsiv, modal und mit beschriftetem Testeinstieg',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');assert.match(html,/id="battle-test-toggle"/);assert.match(html,/id="battle-panel" role="dialog" aria-modal="true"/);assert.match(css,/#battle-panel\[hidden\]/);assert.match(css,/@media\(max-width:580px\)/);});
