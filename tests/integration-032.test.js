import test from 'node:test';
import assert from 'node:assert/strict';
import {BattleLock} from '../src/battle/BattleLock.js';
import {BattleView} from '../src/ui/BattleView.js';
import {canShowCenterHealHint,centerStationOverlay,CENTER_EFFECT_SECONDS} from '../src/renderer/CenterArt.js';
import {pokemonCenter} from '../src/world/maps/pokemonCenter.js';
import {Game} from '../src/core/Game.js';
import {Input} from '../src/core/Input.js';
import {createTeam} from '../src/pokemon/Team.js';
import {createPokemon} from '../src/pokemon/Pokemon.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';

function harness(){
 const panel={hidden:true},content={replaceChildren(){}},closeButton={addEventListener(){},focus(){},disabled:false};
 const root={querySelector(s){return {'#battle-panel':panel,'#battle-content':content,'#battle-close':closeButton,'#battle-test-toggle':null}[s]}};
 const lock=new BattleLock(),calls=[];
 const baseTeam=createTeam({registry:sampleRegistry});baseTeam.addMember(createPokemon({registry:sampleRegistry,speciesId:'eevee',instanceId:'p',level:5,moveIds:['tackle']}));
 const team={...baseTeam,cancelBattleSync:(id,bid)=>{calls.push(['cancel',id,bid]);return baseTeam.cancelBattleSync(id,bid)}};
 const game={ui:{isDialogOpen:()=>false},menuOpen:false,input:{clear(){calls.push(['clear'])}},setMenuOpen(v){this.menuOpen=v;calls.push(['menu',v])},renderer:{canvas:{focus(){}}}};
 const oldDoc=globalThis.document;globalThis.document={addEventListener(){},removeEventListener(){}};
 const view=new BattleView({root,game,team,registry:sampleRegistry,battleLock:lock,onOpenChange:v=>calls.push(['open',v])});
 return {view,team,game,lock,calls,panel,restore(){globalThis.document=oldDoc}};
}

test('032: Renderfehler nach Lock-Erwerb gibt Team-Sync und eigene Sperre frei',()=>{
 const h=harness();try{h.view.render=()=>{throw Error('render failed')};assert.throws(()=>h.view.openTrainerBattle(),/render failed/);assert.equal(h.lock.isBattleActive(),false);assert.equal(h.game.menuOpen,false);assert.equal(h.panel.hidden,true);assert.equal(h.view.battleSync,null);assert.equal(h.calls.filter(c=>c[0]==='cancel').length,1)}finally{h.restore()}
});
test('032: Fehlgeschlagene Ergebnisübernahme lässt Sperre bestehen, erneuter Abschluss genau einmal',()=>{
 const h=harness();try{
  h.lock.acquire('owner');h.view.lockOwner='owner';h.view.trainerMode=true;h.panel.hidden=false;
  h.view.battle={finished:true,pokemon:{player:{currentHp:3,maxHp:20,movePp:{tackle:{current:0}}}}};h.view.battleSync={battleId:'owner',instanceId:'p',committed:false};
  let fail=true;h.team.applyBattleResult=()=>{if(fail)throw Error('temporary');h.calls.push(['apply'])};
  assert.throws(()=>h.view.close(),/temporary/);assert.equal(h.lock.isBattleActive(),true);assert.equal(h.panel.hidden,false);
  fail=false;assert.equal(h.view.close(),true);assert.equal(h.lock.isBattleActive(),false);assert.equal(h.calls.filter(c=>c[0]==='apply').length,1);assert.equal(h.view.close(),false);
 }finally{h.restore()}
});
test('032: fremder Lock bleibt bei Freigabeversuch erhalten',()=>{const l=new BattleLock();l.acquire('first');assert.equal(l.release('other'),false);assert.equal(l.isBattleActive(),true)});
test('032: Heilungshinweis nur im ansprechbaren Nachbarfeld mit Blickrichtung',()=>{
 const t=48,p={x:5*t,y:5*t,width:28,height:28,facing:'up'};
 assert.equal(canShowCenterHealHint(pokemonCenter,p),true);
 assert.equal(canShowCenterHealHint(pokemonCenter,{...p,facing:'down'}),false);
 assert.equal(canShowCenterHealHint(pokemonCenter,{...p,x:7*t}),false);
});
test('032: Hinweis wird in schmalen Viewports nicht außerhalb gezeichnet',()=>{
 const rectangles=[];const ctx={save(){},restore(){},measureText(){return{width:90}},fillText(){},fillRect(...a){rectangles.push(a)},set font(v){},set fillStyle(v){},set globalAlpha(v){}};
 const p={x:5*48,y:5*48,width:28,height:28,facing:'up'};
 centerStationOverlay(ctx,pokemonCenter,{x:240,y:180},p,0,120,80);
 assert.ok(rectangles.length>0);for(const [x,y,w,h] of rectangles){assert.ok(x>=0&&y>=0&&x+w<=120&&y+h<=80)}
 rectangles.length=0;centerStationOverlay(ctx,pokemonCenter,{x:240,y:180},p,0,30,15);assert.equal(rectangles.length,0);
});
test('032: Center-Effekt wird beim Kartenwechsel zurückgesetzt',()=>{
 const g={isBattleActive:()=>false,world:pokemonCenter,centerHealEffect:CENTER_EFFECT_SECONDS,player:{},updateCamera(){},ui:{setStatus(){}}};
 Game.prototype.applyWorldEvent.call(g,{type:'transition',world:{id:'start-village',label:'Dorf'},x:1,y:2});assert.equal(g.centerHealEffect,0)
});
test('032: Input.clear unterdrückt gehaltene Tasten bis keyup',()=>{
 const src=Input.prototype.clear.toString();assert.match(src,/suppressedKeys\.add/);assert.match(src,/this\.queued=false/)
});
