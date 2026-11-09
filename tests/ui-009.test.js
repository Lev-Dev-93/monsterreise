import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PokemonMenus} from '../src/ui/PokemonMenus.js';
import {sampleRegistry} from '../src/pokemon/sampleData.js';
import {createTeam} from '../src/pokemon/Team.js';

class Element {
  constructor(){this.children=[];this.hidden=false;this.textContent='';this.listeners={};this.attributes={};this.className='';}
  addEventListener(name,callback){this.listeners[name]=callback;}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  setAttribute(k,v){this.attributes[k]=v;}
  focus(){}
  click(){this.listeners.click?.();}
}
function setup(){
  const nodes=Object.fromEntries(['#pokemon-panel','#pokemon-panel-content','#pokemon-panel-title','#team-toggle','#pokemon-panel-close'].map(k=>[k,new Element()]));
  nodes['#pokemon-panel'].hidden=true;
  const previousDocument=globalThis.document;
  globalThis.document={createElement:()=>new Element(),addEventListener(){},removeEventListener(){}};
  const root={querySelector:key=>nodes[key]};
  const team=createTeam({registry:sampleRegistry});
  const changes=[];
  const menu=new PokemonMenus({root,registry:sampleRegistry,team,onOpenChange:open=>changes.push(open)});
  return {menu,team,nodes,changes,restore:()=>{globalThis.document=previousDocument;}};
}
test('Starterliste verwendet nur Registry-Berechtigung und zeigt keine unzulässigen Arten',()=>{
 const x=setup();try{x.menu.openStarterSelection();const labels=x.nodes['#pokemon-panel-content'].children.filter(n=>n.className==='starter-option').map(n=>n.textContent);assert.equal(labels.length,sampleRegistry.starterOptions().length);assert(labels.some(s=>s.includes('Riolu')));assert(!labels.some(s=>s.includes('Lucario')));assert(!labels.some(s=>s.includes('Mewtu')));}finally{x.restore();}
});
test('Startervergabe nutzt Team und Level 5, verhindert zweite Vergabe',()=>{
 const x=setup();try{assert.equal(x.menu.openStarterSelection(),true);assert.equal(x.menu.chooseStarter('lucario'),false);assert.equal(x.menu.chooseStarter('riolu'),true);assert.equal(x.team.getMembers()[0].level,5);assert.equal(x.team.getMembers()[0].speciesId,'riolu');assert.equal(x.team.starterAssigned,true);assert.equal(x.menu.openStarterSelection(),false);assert.equal(x.menu.chooseStarter('eevee'),false);assert.equal(x.team.size,1);}finally{x.restore();}
});
test('Teamansicht zeigt Art, Level, Typ und vorhandene Statusdaten',()=>{
 const x=setup();try{x.team.assignStarter({speciesId:'eevee',instanceId:'starter-eevee',level:5});x.menu.openTeam();const card=x.nodes['#pokemon-panel-content'].children[0];assert.equal(card.className,'pokemon-card');assert.match(card.children[1].children[0].textContent,/Evoli · Lv\. 5/);assert.match(card.children[1].children[1].textContent,/Normal/);assert.match(card.children[1].children[2].textContent,/Status: Keiner/);assert.equal(card.children[0].attributes['aria-label'],'Sprite-Platzhalter');}finally{x.restore();}
});
test('Menüöffnung und Schließen signalisieren Eingabesperre',()=>{
 const x=setup();try{x.menu.openTeam();assert.equal(x.menu.isOpen(),true);x.menu.close();assert.equal(x.menu.isOpen(),false);assert.deepEqual(x.changes,[true,false]);}finally{x.restore();}
});
test('Spielintegration sperrt Bewegung, Interaktion und Portalprüfung während Menü',()=>{
 const source=readFileSync(new URL('../src/core/Game.js',import.meta.url),'utf8');assert.match(source,/setMenuOpen\(open\).*input\.clear\(\)/);assert.match(source,/interact\(\)\{if\(this\.menuOpen\)return null/);assert.match(source,/update\(dt\)\{if\(this\.menuOpen\)\{/);
});
test('Professor-Auslösung ist nur vorbereiteter Hook, kein automatischer Spielstart',()=>{
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');assert.match(main,/export function openProfessorStarterSelection\(\)/);assert.doesNotMatch(main,/pokemonMenus\.openStarterSelection\(\);\s*$/m);
});
