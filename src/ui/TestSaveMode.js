/** Auftrag 021: isolierte Testdaten; ausschließlich vorhandene Team-/Save-APIs. */
import {createTeam} from '../pokemon/Team.js';
import {createPokemon,initializeHp,initializeMovePp} from '../pokemon/Pokemon.js';
import {createClassicStatAdapters} from '../battle/BattleRules.js';
import {sampleMoveRegistry} from '../pokemon/sampleMoves.js';

export const TEST_SPECIES_ID='eevee';
export const TEST_MOVE_ID='tackle';
export const TEST_LEVEL=5;
export const TEST_MODES=Object.freeze({normal:'Normaler Test (Tackle)',struggle:'Verzweifler-Test (0 AP)'});

/** Nur explizit leere Plätze sind verfügbar. Fehler/inkompatible Daten gelten als belegt. */
export function inspectTestSlots(saveSystem){
  const slots=[1,2,3].map(slot=>({slot,status:saveSystem.load(slot).status}));
  return {slots,freeSlot:slots.find(s=>s.status==='empty')?.slot??null};
}

export function makeTestTeam({registry,moveRegistry=sampleMoveRegistry,mode='normal'}={}){
  if(!Object.hasOwn(TEST_MODES,mode))throw new Error('Unbekannter Testmodus');
  if(!registry?.get(TEST_SPECIES_ID)||!moveRegistry?.get(TEST_MOVE_ID))throw new Error('Testdaten fehlen');
  const team=createTeam({registry});
  const pokemon=createPokemon({registry,speciesId:TEST_SPECIES_ID,instanceId:`test-021-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`}`,level:TEST_LEVEL,origin:'other',moveIds:[TEST_MOVE_ID]});
  const stats=createClassicStatAdapters(registry);
  initializeHp(pokemon,p=>stats.stats(p).hp);
  initializeMovePp(pokemon,moveRegistry);
  if(mode==='struggle')pokemon.movePp[TEST_MOVE_ID].current=0;
  team.addMember(pokemon);
  return team;
}

/** Explizite Bestätigung wird von der UI übergeben; vor dem Schreiben erneut prüfen. */
export function createTestSave({saveSystem,registry,slot,confirmed=false,location,mode='normal'}={}){
  if(!Object.hasOwn(TEST_MODES,mode))return {status:'invalid-mode'};
  if(!confirmed)return {status:'confirmation-required'};
  if(![1,2,3].includes(slot))return {status:'invalid-slot'};
  const inspection=inspectTestSlots(saveSystem);
  if(inspection.freeSlot===null)return {status:'no-free-slot'};
  if(saveSystem.load(slot).status!=='empty')return {status:'occupied'};
  const team=makeTestTeam({registry,mode});
  // Synchroner zweiter Check direkt vor dem SaveSystem-Schreibvorgang.
  if(saveSystem.load(slot).status!=='empty')return {status:'occupied'};
  const saved=saveSystem.save(slot,team,location);
  return saved.status==='ok'?{status:'ok',slot,team,mode}:saved;
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
      const label=document.createElement('label');label.textContent='Testvariante: ';
      const select=document.createElement('select');select.setAttribute('aria-label','Testvariante');
      for(const [value,name] of Object.entries(TEST_MODES)){
        const option=document.createElement('option');option.value=value;option.textContent=name;select.append(option);
      }
      label.append(select);this.content.append(label);
      const summary=document.createElement('p');summary.setAttribute('aria-live','polite');this.content.append(summary);
      const update=()=>{summary.textContent=`Bestätigung: ${TEST_MODES[select.value]} auf freiem Speicherplatz ${result.freeSlot}. ${select.value==='struggle'?'Tackle startet mit 0/35 AP; KP bleiben voll.':'Tackle startet mit vollen AP.'} Es wird ausschließlich dieser freie Platz neu angelegt.`;};
      select.addEventListener('change',update);update();
      const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Ausgewählten Testspielstand erstellen';
      confirm.addEventListener('click',()=>{
        const mode=select.value;
        // Erneute Prüfung direkt vor dem Schreiben; kein Überschreiben anderer Slots.
        const created=createTestSave({saveSystem:this.saveSystem,registry:this.registry,slot:result.freeSlot,mode,confirmed:true,location:this.game.getSaveLocation()});
        if(created.status==='ok'){
          this.close();this.loadSlot(created.slot);
          this.report(`${TEST_MODES[mode]} auf Platz ${created.slot} erstellt. Team öffnen oder vorläufigen Trainer ansprechen. Nach dem Kampf nur manuell speichern.`);
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
