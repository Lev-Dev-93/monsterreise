import test from 'node:test';
import assert from 'node:assert/strict';
import {ProfessorEncounter} from '../src/dialog/ProfessorEncounter.js';
import {createTeam} from '../src/pokemon/Team.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {WorldSession} from '../src/world/WorldSession.js';
import {Game} from '../src/core/Game.js';
const event={type:'dialog',npcId:'professor-test',speaker:'Professor (Test)',lines:['placeholder']};
test('Professor-NPC ist erreichbar, blockiert seine Kachel und lässt Portale bestehen',()=>{
 const session=new WorldSession();const world=session.world;
 assert(world.npcs.some(n=>n.id==='professor-test'&&n.x===18&&n.y===16));
 assert.equal(world.isSolidTile(18,16),true);
 assert(world.portals.some(p=>p.activation==='enter'));
 const player={x:18*48,y:17*48,width:26,height:30,facing:'up'};
 assert.equal(session.interact(player).npcId,'professor-test');
});
test('Dialog startet vorhandenen Hook erst nach Abschluss und nur vor Startervergabe',()=>{
 const team=createTeam({registry:sampleRegistry});let opens=0;
 const scene=new ProfessorEncounter({team,openStarterSelection:()=>{opens++;return true;}});
 const result=scene.handle(event);
 assert.equal(opens,0);assert.equal(result.lines.length,2);
 result.onComplete();assert.equal(opens,1);
 team.assignStarter({speciesId:'riolu',instanceId:'starter-riolu',level:5});
 result.onComplete();assert.equal(opens,1);
 const again=scene.handle(event);assert.equal(again.onComplete,undefined);
 assert.match(again.lines[0],/Pokémon/);assert.equal(team.size,1);
 assert.equal(scene.handle({type:'dialog',npcId:'villager-01'}).npcId,'villager-01');
});
test('Dialogabschluss und Menü verhindern Bewegung sowie automatische Übergänge',()=>{
 const original=Game.prototype.update.toString();
 assert.match(original,/!this\.menuOpen&&!this\.ui\.isDialogOpen\(\)/);
 const interact=Game.prototype.interact.toString();
 assert.match(interact,/this\.dialogComplete=null;complete\?\.\(\)/);
 assert.match(interact,/if\(this\.menuOpen\)return null/);
});
test('Game integriert Dialogabschluss mit Hook und sperrt Bewegung während des Menüs',()=>{
 const team=createTeam({registry:sampleRegistry});let opens=0;
 const professor=new ProfessorEncounter({team,openStarterSelection:()=>{opens++;game.setMenuOpen(true);}});
 const game=Object.create(Game.prototype);game.session=new WorldSession();game.world=game.session.world;
 game.player={x:18*48,y:17*48,width:26,height:30,facing:'up',update(){throw Error('Movement while locked')}};
 game.camera={follow(){}};game.renderer={width:320,height:240};
 game.ui={lines:[],isDialogOpen(){return this.lines.length>0},showDialog(e){this.lines=[...e.lines]},advanceDialog(){this.lines.shift()},setStatus(){}};
 game.onWorldEvent=e=>professor.handle(e);game.menuOpen=false;game.input={clear(){},consumeInteract(){return false},getVector(){return {x:0,y:0}}};
 assert.equal(game.interact().type,'dialog');assert.equal(opens,0);
 game.update(0.016);game.interact();assert.equal(opens,0);
 game.interact();assert.equal(opens,1);assert.equal(game.menuOpen,true);
 assert.equal(game.interact(),null);game.update(0.016);
});
