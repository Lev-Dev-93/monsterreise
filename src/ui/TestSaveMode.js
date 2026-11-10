/** Auftrag 021: isolierte Testdaten; ausschließlich vorhandene Team-/Save-APIs. */
import {createTeam} from '../pokemon/Team.js';
import {createPokemon,initializeHp,initializeMovePp} from '../pokemon/Pokemon.js';
import {createClassicStatAdapters} from '../battle/BattleRules.js';
import {sampleMoveRegistry} from '../pokemon/sampleMoves.js';

export const TEST_SPECIES_ID='eevee';
export const TEST_MOVE_ID='tackle';
export const TEST_LEVEL=5;

/** Nur explizit leere Plätze sind verfügbar. Fehler/inkompatible Daten gelten als belegt. */
export function inspectTestSlots(saveSystem){
  const slots=[1,2,3].map(slot=>({slot,status:saveSystem.load(slot).status}));
  return {slots,freeSlot:slots.find(s=>s.status==='empty')?.slot??null};
}

export function makeTestTeam({registry,moveRegistry=sampleMoveRegistry}={}){
  if(!registry?.get(TEST_SPECIES_ID)||!moveRegistry?.get(TEST_MOVE_ID))throw new Error('Testdaten fehlen');
  const team=createTeam({registry});
  const pokemon=createPokemon({registry,speciesId:TEST_SPECIES_ID,instanceId:`test-021-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`}`,level:TEST_LEVEL,origin:'other',moveIds:[TEST_MOVE_ID]});
  const stats=createClassicStatAdapters(registry);
  initializeHp(pokemon,p=>stats.stats(p).hp);
  initializeMovePp(pokemon,moveRegistry);
  team.addMember(pokemon);
  return team;
}

/** Explizite Bestätigung wird von der UI übergeben; vor dem Schreiben erneut prüfen. */
export function createTestSave({saveSystem,registry,slot,confirmed=false,location}={}){
  if(!confirmed)return {status:'confirmation-required'};
  if(![1,2,3].includes(slot))return {status:'invalid-slot'};
  const inspection=inspectTestSlots(saveSystem);
  if(inspection.freeSlot===null)return {status:'no-free-slot'};
  if(saveSystem.load(slot).status!=='empty')return {status:'occupied'};
  const team=makeTestTeam({registry});
  // Synchroner zweiter Check direkt vor dem SaveSystem-Schreibvorgang.
  if(saveSystem.load(slot).status!=='empty')return {status:'occupied'};
  const saved=saveSystem.save(slot,team,location);
  return saved.status==='ok'?{status:'ok',slot,team}:saved;
}

export class TestSaveMode {
  constructor({root,saveSystem,registry,game,loadSlot,report,onOpenChange=()=>{},canOpen=()=>true}){
    Object.assign(this,{root,saveSystem,registry,game,loadSlot,report,onOpenChange,canOpen});
    this.panel=root.querySelector('#test-save-panel');
    this.content=root.querySelector('#test-save-content');
    this.trigger=root.querySelector('#test-save-toggle');
    this.trigger.addEventListener('click',()=>this.open());
    root.querySelector('#test-save-close').addEventListener('click',()=>this.close());
  }
  isOpen(){return !this.panel.hidden;}
  open(){
    if(this.isOpen()||!this.canOpen())return false;
    const result=inspectTestSlots(this.saveSystem);
    this.content.replaceChildren();
    const p=document.createElement('p');
    p.textContent=result.freeSlot===null
      ?'Kein freier Speicherplatz. Es wird nichts erstellt oder überschrieben.'
      :`Freier Speicherplatz: ${result.freeSlot}. Dort wird ein isolierter TESTSPIELSTAND mit Evoli (Level 5) und der vorläufigen Beispielattacke Tackle erstellt. Vorhandene Plätze bleiben unverändert. Kein automatisches Speichern nach Kämpfen.`;
    this.content.append(p);
    const list=document.createElement('p');
    list.textContent=result.slots.map(s=>`Platz ${s.slot}: ${s.status==='empty'?'frei':'belegt / geschützt'}`).join(' · ');
    this.content.append(list);
    if(result.freeSlot!==null){
      const confirm=document.createElement('button');confirm.type='button';confirm.textContent=`Testspielstand auf Platz ${result.freeSlot} erstellen`;
      confirm.addEventListener('click',()=>{
        const created=createTestSave({saveSystem:this.saveSystem,registry:this.registry,slot:result.freeSlot,confirmed:true,location:this.game.getSaveLocation()});
        if(created.status==='ok'){
          this.close();this.loadSlot(created.slot);
          this.report(`Testspielstand auf Platz ${created.slot} erstellt. Team öffnen oder den vorläufigen Trainer ansprechen. KP/AP nach dem Kampf manuell speichern.`);
        }else{
          this.report(`Testspielstand nicht erstellt (${created.status}). Keine vorhandenen Spielstände überschrieben.`);
          this.close();
        }
      });this.content.append(confirm);
    }
    this.panel.hidden=false;this.game.setMenuOpen(true);this.onOpenChange(true);
    rootFocus(this.panel);return true;
  }
  close(){if(!this.isOpen())return false;this.panel.hidden=true;this.game.setMenuOpen(false);this.onOpenChange(false);this.game.input.clear();this.trigger.focus();return true;}
}
function rootFocus(panel){panel.querySelector('#test-save-close')?.focus();}
