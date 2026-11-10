import test from 'node:test';
import assert from 'node:assert/strict';
import {createRegistry,createPokemon} from '../src/pokemon/Pokemon.js';
import {createMoveRegistry,POKEMON_TYPES} from '../src/pokemon/CombatData.js';
import {createBattle} from '../src/battle/Battle.js';
import {classicStat,classicDamage,modernTypeEffectiveness,TYPE_CHART,createClassicBattleOptions} from '../src/battle/BattleRules.js';
const base={hp:50,attack:60,defense:50,specialAttack:70,specialDefense:50,speed:60};
const registry=createRegistry([{speciesId:'fire',dexNumber:1,name:'Fire',generation:1,types:['Feuer'],baseStats:base,starterEligible:true},{speciesId:'grass',dexNumber:2,name:'Grass',generation:1,types:['Pflanze'],baseStats:base,starterEligible:true}]);
const moves=createMoveRegistry([{moveId:'hit',name:'Hit',type:'Feuer',category:'physical',power:40,accuracy:100,pp:2},{moveId:'quick',name:'Quick',type:'Normal',category:'physical',power:40,accuracy:100,pp:5,priority:1},{moveId:'miss',name:'Miss',type:'Feuer',category:'special',power:40,accuracy:50,pp:3},{moveId:'status',name:'Status',type:'Normal',category:'status',pp:5,effectId:'x'}]);
const make=(id,speciesId='fire',moveIds=['hit'])=>createPokemon({registry,speciesId,instanceId:id,level:50,origin:'starter',moveIds});
const battle=(p,o,extra={})=>createBattle({playerPokemon:p,opponentPokemon:o,...createClassicBattleOptions({speciesRegistry:registry,moveRegistry:moves,rng:()=>0}),...extra});
test('Statusformeln und Wesen, EV floor, Grenzwerte',()=>{
 const x={stat:'hp',base:50,iv:31,ev:252,level:50};assert.equal(classicStat(x),157);
 assert.equal(classicStat({...x,stat:'attack',natureFactors:{attack:1.1}}),112);
 assert.equal(classicStat({...x,stat:'attack',natureFactors:{attack:.9}}),91);
 assert.equal(classicStat({...x,ev:251}),156);
 assert.throws(()=>classicStat({...x,ev:253}));assert.throws(()=>classicStat({...x,iv:32}));
 assert.throws(()=>createPokemon({registry,speciesId:'fire',instanceId:'bad',level:5,ev:{hp:252,attack:252,defense:7,specialAttack:0,specialDefense:0,speed:0}}));
});
test('18 Typen und 324 Einzelpaarungen mit gültigen Faktoren',()=>{
 assert.equal(POKEMON_TYPES.length,18);
 for(const a of POKEMON_TYPES)for(const d of POKEMON_TYPES){assert.ok([0,.5,1,2].includes(modernTypeEffectiveness(a,[d])),`${a}/${d}`);}
 assert.equal(Object.values(TYPE_CHART).reduce((n,row)=>n+Object.keys(row).length,0),120);
 assert.equal(modernTypeEffectiveness('Feuer',['Pflanze']),2);
 assert.equal(modernTypeEffectiveness('Wasser',['Feuer']),2);
 assert.equal(modernTypeEffectiveness('Elektro',['Boden']),0);
 assert.equal(modernTypeEffectiveness('Feuer',['Wasser']),.5);
 assert.equal(modernTypeEffectiveness('Eis',['Drache','Flug']),4);
});
test('Referenzschaden physisch/speziell, STAB, Krit, Zufall, Immunität',()=>{
 const p=make('p'),d=make('d','grass');
 const args={attacker:p,defender:d,move:moves.get('hit'),attackerStats:{attack:100,specialAttack:120},defenderStats:{defense:80,specialDefense:60},attackerTypes:['Feuer'],defenderTypes:['Pflanze'],rng:()=>0};
 // floor( floor(22*40*100/80)/50 + 2)=24; floor(24*1.5)=36; *2=72; *0.85=61
 assert.equal(classicDamage(args),61);
 assert.equal(classicDamage({...args,critical:true}),91);
 assert.equal(classicDamage({...args,rng:()=>.999999}),72);
 assert.equal(classicDamage({...args,move:moves.get('miss')}),93);
 assert.equal(classicDamage({...args,attackerTypes:['Wasser']}),40);
 assert.equal(classicDamage({...args,defenderTypes:['Wasser']}),15);
 assert.equal(classicDamage({...args,move:{...moves.get('hit'),type:'Elektro'},defenderTypes:['Boden']}),0);
});
test('Priorität vor Initiative, Gleichstand per rng',()=>{
 const b=battle(make('p','fire',['quick']),make('o','grass',['hit']),{speed:p=>p.instanceId==='p'?1:100});
 b.submitAction('player',{type:'move',moveId:'quick'});const s=b.submitAction('opponent',{type:'move',moveId:'hit'});
 assert.equal(s.events.find(e=>e.type==='round-start').first,'player');
 const t=battle(make('p','fire',['hit']),make('o','grass',['hit']),{speed:()=>10,rng:()=>.9,tieBreaker:()=> 'opponent'});
 t.submitAction('player',{type:'move',moveId:'hit'});assert.equal(t.submitAction('opponent',{type:'move',moveId:'hit'}).events.find(e=>e.type==='round-start').first,'opponent');
});
test('Genauigkeit, AP-Verbrauch, ungültige und nicht unterstützte Aktionen',()=>{
 const b=battle(make('p','fire',['miss','status']),make('o','grass',['hit']),{rng:()=>.9,damage:()=>1});
 assert.throws(()=>b.submitAction('player',{type:'move',moveId:'status'}),/nicht unterstützt/);
 b.submitAction('player',{type:'move',moveId:'miss'});const s=b.submitAction('opponent',{type:'move',moveId:'hit'});
 assert.equal(s.remainingPp.player.miss,2);assert.equal(s.events.filter(e=>e.type==='move-miss').length,1);
 assert.throws(()=>b.submitAction('player',{type:'move',moveId:'nope'}));
});
test('Sieg/Niederlage und AP erschöpft',()=>{
 const b=battle(make('p'),make('o','grass'),{damage:()=>999});
 b.submitAction('player',{type:'move',moveId:'hit'});assert.equal(b.submitAction('opponent',{type:'move',moveId:'hit'}).result,'player');
 const l=battle(make('p'),make('o','grass'),{damage:()=>999,speed:p=>p.instanceId==='o'?100:1});
 l.submitAction('player',{type:'move',moveId:'hit'});assert.equal(l.submitAction('opponent',{type:'move',moveId:'hit'}).result,'opponent');
 const e=battle(make('p'),make('o','grass'),{damage:()=>0});
 for(let i=0;i<2;i++){e.submitAction('player',{type:'move',moveId:'hit'});e.submitAction('opponent',{type:'move',moveId:'hit'});}
 assert.throws(()=>e.submitAction('player',{type:'move',moveId:'hit'}),/Keine AP/);
});
