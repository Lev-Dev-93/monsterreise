import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeam,restoreTeam} from '../src/pokemon/Team.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {sampleMoveRegistry} from '../src/pokemon/sampleMoves.js';
import {healAtPokemonCenter} from '../src/center/PokemonCenter.js';
import {SaveSystem} from '../src/save/SaveSystem.js';
const teamWith = (count=1) => {
 const team=createTeam({registry:sampleRegistry});
 for(let i=0;i<count;i++)team.addMember({instanceId:`p${i}`,speciesId:'eevee',level:5,origin:'wild',shiny:false,iv:{hp:0,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0},ev:{hp:0,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0},moveIds:['tackle'],currentHp:i?0:3,maxHp:20,movePp:{tackle:{current:i?0:4,max:35}}});
 return team;
};
const heal=t=>healAtPokemonCenter({team:t,canHeal:()=>true,moveRegistry:sampleMoveRegistry});
test('partially damaged and fainted party heal fully; no identity/move changes',()=>{
 const t=teamWith(2),before=t.getMembers();assert.deepEqual(heal(t),{healed:2,changed:2});
 for(let i=0;i<2;i++){const p=t.getMembers()[i];assert.equal(p.currentHp,20);assert.deepEqual(p.movePp.tackle,{current:35,max:35});for(const k of ['instanceId','speciesId','level','experience','iv','ev','shiny','origin','moveIds','status'])assert.deepEqual(p[k],before[i][k]);}
});
test('repeat and empty team are safe',()=>{const t=teamWith();heal(t);assert.deepEqual(heal(t),{healed:1,changed:0});assert.deepEqual(heal(createTeam({registry:sampleRegistry})),{healed:0,changed:0});});
test('invalid second member causes no partial healing',()=>{const t=teamWith(2);const p=t.getMember('p1');t.removeMember('p1');t.addMember({...p,moveIds:['unknown'],movePp:null});const before=t.toSaveData();assert.throws(()=>heal(t),/Unbekannte Attacke/);assert.deepEqual(t.toSaveData(),before);});
test('active battle and denied world interaction block healing',()=>{const t=teamWith();const s=t.beginBattleSync('p0','battle');assert.throws(()=>heal(t),/aktiven Kampf/);assert.throws(()=>healAtPokemonCenter({team:t,canHeal:()=>false}),/nicht freigegeben/);assert.equal(t.getMember('p0').currentHp,3);t.cancelBattleSync(s.instanceId,s.battleId);assert.equal(heal(t).changed,1);});
test('save roundtrip preserves healed KP/AP',()=>{const t=teamWith();heal(t);const map=new Map();const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};const save=new SaveSystem({registry:sampleRegistry,storage});assert.equal(save.save(1,t).status,'ok');const loaded=save.load(1);assert.equal(loaded.status,'ok');assert.deepEqual(loaded.team.getMembers(),t.getMembers());});
test('legacy missing KP/AP can heal only with explicit HP calculator',()=>{const t=teamWith();const p=t.getMember('p0');p.maxHp=null;p.currentHp=null;p.movePp=null;const legacy=restoreTeam({members:[p],starterAssigned:false},sampleRegistry);assert.throws(()=>heal(legacy),/Maximale KP/);assert.equal(legacy.getMember('p0').currentHp,null);assert.deepEqual(legacy.healAll({calculateMaxHp:()=>19}),{healed:1,changed:1});assert.equal(legacy.getMember('p0').currentHp,19);assert.equal(legacy.getMember('p0').movePp.tackle.current,35);});
test('stored PP maxima must match registry, fail atomically',()=>{const t=teamWith();const p=t.getMember('p0');t.removeMember('p0');t.addMember({...p,movePp:{tackle:{current:1,max:99}}});const before=t.toSaveData();assert.throws(()=>heal(t),/Ungültige AP/);assert.deepEqual(t.toSaveData(),before);});
