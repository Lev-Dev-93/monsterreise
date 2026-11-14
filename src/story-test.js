/** G5/G6 development-only map harness. No canonical prologue, no starter assignment or story writes. */
import {Game} from './core/Game.js';
import {BattleLock} from './battle/BattleLock.js';
import {InteractionGate} from './core/adapters/InteractionGate.js';
import {TrustedPortalAdapter} from './core/adapters/TrustedPortalAdapter.js';
import {MuStorySession} from './world/MuStoryWorld.js';
const root=document.querySelector('#app');
for(const id of ['save-slot','save-button','battle-test-toggle','test-save-toggle','team-toggle']){
 const el=document.getElementById(id);if(el)el.hidden=true;
}
const header=document.querySelector('.header-actions');
const label=document.createElement('strong');label.textContent='034 · STORY-KARTENTEST (kein Prolog / kein Speichern)';header.prepend(label);
const status=document.querySelector('#save-status');
const lock=new BattleLock();
const session=new MuStorySession({battleLock:lock});
let gate,portal;
// A facade preserves the 033 Game interface; all transitions pass the trusted portal adapter.
const facade={
 get registry(){return session.registry},get mapId(){return session.mapId},get world(){return session.world},get returnPositions(){return session.returnPositions},
 spawn:()=>session.spawn('house-start'),
 interact(player){if(!gate?.canWorldAction(lock))return null;
  const t=session.world.tileSize,cx=Math.floor((player.x+player.width/2)/t),cy=Math.floor((player.y+player.height/2)/t);
  const [dx,dy]=({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]})[player.facing]??[0,1];
  const npc=session.world.npcs?.find(n=>n.x===cx+dx&&n.y===cy+dy);
  return npc?{type:'dialog',speaker:npc.label,lines:[...npc.dialog]}:null;
 },
 updatePosition(player){
  if(!gate?.canWorldAction(lock))return null;
  const preview=portal.preview(player);
  if(preview.status!=='ready')return preview.status==='blocked'?{type:'blocked',reason:preview.reason}:null;
  if(preview.capability.route1){
   const token=gate.acquire('recovery');game.input.clear();status.textContent='Route 1: Schlüpfen gesperrt – Starterregeln/Prolog-UI nicht freigegeben. Bitte DEV-Kartentest neu laden.';
   return {type:'blocked',reason:'Route-1-Storycommit nicht freigegeben'};
  }
  try{return portal.applyOrdinary(preview.capability,player)}catch{gate.acquire('recovery');status.textContent='Portalfehler: Sitzung gesperrt, neu laden.';return {type:'blocked',reason:'Portalfehler'};}
 }
};
const game=new Game({session:facade,battleLock:lock,canvas:document.querySelector('#game'),controls:document.querySelector('#controls')});
gate=new InteractionGate({input:game.input});portal=new TrustedPortalAdapter({session,gate,battleLock:lock});
status.textContent='Nur Karten, Bewegung und Portale. Story, Starter und Speichern absichtlich deaktiviert.';
game.start();
