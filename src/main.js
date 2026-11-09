import {sampleRegistry} from './pokemon/sampleData.js';
import {createTeam} from './pokemon/Team.js';
import {SaveSystem} from './save/SaveSystem.js';
import {PokemonMenus} from './ui/PokemonMenus.js';
import {Fullscreen} from './ui/Fullscreen.js';
import {Game} from './core/Game.js';
import {ProfessorEncounter} from './dialog/ProfessorEncounter.js';
const saveSystem=new SaveSystem({registry:sampleRegistry});
let activeSlot=1;
let loaded=saveSystem.load(activeSlot);
let team=loaded.status==='ok'?loaded.team:createTeam({registry:sampleRegistry});
const saveStatus=document.querySelector('#save-status');
function report(message){saveStatus.textContent=message;}
function saveCurrent(){const result=saveSystem.save(activeSlot,team);report(result.status==='ok'?`Platz ${activeSlot} gespeichert.`:'Speichern fehlgeschlagen (Browserspeicher prüfen).');return result;}
function loadSlot(slot){
  const result=saveSystem.load(slot);
  if(result.status==='ok' || result.status==='empty'){
    activeSlot=slot; team=result.status==='ok'?result.team:createTeam({registry:sampleRegistry});
    professor.team=team;pokemonMenus.team=team;
    if(pokemonMenus.isOpen())pokemonMenus.close();
    report(result.status==='ok'?`Platz ${slot} geladen.`:`Platz ${slot} ist leer (neues Team).`);
  } else report(`Platz ${slot} nicht geladen: ${result.status}. Bestehende Daten bleiben erhalten.`);
  document.querySelector('#save-slot').value=String(activeSlot);
  return result;
}
let pokemonMenus;
const professor=new ProfessorEncounter({team,openStarterSelection:()=>openProfessorStarterSelection()});
const game=new Game({canvas:document.querySelector('#game'),controls:document.querySelector('#controls'),onWorldEvent:event=>professor.handle(event)});
game.start();

const fullscreen=new Fullscreen({root:document.querySelector('#app'),button:document.querySelector('#fullscreen-toggle')});

pokemonMenus=new PokemonMenus({root:document.querySelector('#app'),registry:sampleRegistry,team,onOpenChange:open=>game.setMenuOpen(open),onTeamChanged:()=>saveCurrent()});
// Invoked only after the temporary professor dialog has completed.
export function openProfessorStarterSelection(){return pokemonMenus.openStarterSelection();}
export {team,pokemonMenus};

document.querySelector('#save-slot').addEventListener('change',e=>loadSlot(Number(e.target.value)));
document.querySelector('#save-button').addEventListener('click',()=>{if(!game.ui.isDialogOpen()&&!pokemonMenus.isOpen())saveCurrent();else report('Während Dialog oder Menü nicht speichern.');});
report(loaded.status==='ok'?'Platz 1 geladen.':loaded.status==='empty'?'Platz 1 ist leer.':`Platz 1 nicht geladen: ${loaded.status}. Daten bleiben erhalten.`);
export {saveSystem,saveCurrent,loadSlot};
