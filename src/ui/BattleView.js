/** Auftrag 016: ausschließlich Anzeige und Bedienung einer bestehenden Battle-Sitzung. */
import {createBattle} from '../battle/Battle.js';
import {createClassicBattleOptions} from '../battle/BattleRules.js';
import {createPokemon} from '../pokemon/Pokemon.js';
import {sampleMoveRegistry} from '../pokemon/sampleMoves.js';
import {chooseOpponentMove,createTrainerTestBattle} from '../battle/TrainerBattle.js';

let battleSequence=0;
export function nextTrainerBattleId(){
  battleSequence++;
  const random=globalThis.crypto?.randomUUID?.();
  return `trainer-020-${random??`${Date.now().toString(36)}-${battleSequence.toString(36)}-${Math.random().toString(36).slice(2)}`}`;
}
const supported = move => move && move.category !== 'status' && move.effectId === null && move.power > 0;
const label = (registry,p) => p.nickname || registry.get(p.speciesId)?.name || p.speciesId;
export function eventMessage(event, registry, battle, moves) {
  if(event.type==='battle-start') return 'Testkampf gestartet.';
  if(event.type==='round-start') return `Runde ${event.round} beginnt.`;
  if(event.type==='move-miss') return `${label(registry,battle.pokemon[event.side])}: ${moves.get(event.moveId)?.name || event.moveId} verfehlt!`;
  if(event.type==='move') return `${label(registry,battle.pokemon[event.side])} setzt ${moves.get(event.moveId)?.name || event.moveId} ein: ${event.damage} KP Schaden.`;
  if(event.type==='battle-end') return event.result==='draw'?'Unentschieden.':event.result==='player'?'Testkampf gewonnen.':'Testkampf verloren.';
  return null;
}
export class BattleView {
  constructor({root,game,team,registry,moveRegistry=sampleMoveRegistry,onOpenChange=()=>{}}){
    this.root=root;this.game=game;this.team=team;this.registry=registry;this.moveRegistry=moveRegistry;this.onOpenChange=onOpenChange;
    this.panel=root.querySelector('#battle-panel');this.content=root.querySelector('#battle-content');
    this.openButton=root.querySelector('#battle-test-toggle');this.closeButton=root.querySelector('#battle-close');
    this.openButton?.addEventListener('click',()=>this.openTestBattle());
    this.closeButton.addEventListener('click',()=>this.close());
    this.onKey=e=>{if(this.isOpen()&&e.key==='Escape'){e.preventDefault();if(this.battle?.finished)this.close();}};
    document.addEventListener('keydown',this.onKey);
    this.battle=null;this.seen=0;this.log=[];this.trainerMode=false;this.battleSync=null;
  }
  isOpen(){return !this.panel.hidden;}
  openTrainerBattle(){
    if(this.isOpen()||this.game.ui.isDialogOpen()||this.game.menuOpen)return false;
    const member=this.team.getMembers().find(p=>p.currentHp===null||p.currentHp>0);
    if(!member||!member.moveIds.some(id=>supported(this.moveRegistry.get(id))&&(member.movePp?.[id]?.current??this.moveRegistry.get(id)?.pp??0)>0))return false;
    const battleId=nextTrainerBattleId();
    const sync=this.team.beginBattleSync(member.instanceId,battleId);
    let battle;
    try{battle=createTrainerTestBattle({team:this.team,registry:this.registry,moveRegistry:this.moveRegistry,playerSnapshot:sync.pokemon});
      if(!battle)throw new Error('Kein kampffähiges Pokémon');
    }catch(error){this.team.cancelBattleSync(member.instanceId,battleId);throw error;}
    this.battleSync={battleId,instanceId:member.instanceId,committed:false};
    this.trainerMode=true;this.battle=battle;this.seen=0;this.log=[];
    this.panel.hidden=false;this.game.setMenuOpen(true);this.onOpenChange(true);this.render();this.closeButton.focus();return true;
  }
  openTestBattle(){
    if(this.isOpen()||this.game.ui.isDialogOpen()||this.game.menuOpen)return false;
    const member=this.team.getMembers()[0];
    if(!member){if(this.openButton)this.openButton.title='Zuerst beim Professor einen Starter wählen';return false;}
    // Separate Testinstanzen: weder Team-KP noch gespeicherte Attacken verändern.
    const player=createPokemon({...member,registry:this.registry,instanceId:'battle-test-player',currentHp:null,moveIds:['tackle','scratch']});
    const opponent=createPokemon({registry:this.registry,speciesId:'eevee',instanceId:'battle-test-opponent',level:5,moveIds:['tackle'],currentHp:null});
    this.battle=createBattle({playerPokemon:player,opponentPokemon:opponent,...createClassicBattleOptions({speciesRegistry:this.registry,moveRegistry:this.moveRegistry})});
    this.trainerMode=false;this.seen=0;this.log=[];this.panel.hidden=false;this.game.setMenuOpen(true);this.onOpenChange(true);this.render();this.closeButton.focus();return true;
  }
  commitTrainerResult(){
    const sync=this.battleSync;
    if(!sync||sync.committed||!this.battle?.finished)return false;
    const p=this.battle.pokemon.player;
    this.team.applyBattleResult({battleId:sync.battleId,instanceId:sync.instanceId,
      currentHp:p.currentHp,maxHp:p.maxHp,movePp:p.movePp});
    sync.committed=true;
    return true;
  }
  cancelTrainerBattle(){
    if(!this.battleSync||this.battleSync.committed||this.battle?.finished)return false;
    this.team.cancelBattleSync(this.battleSync.instanceId,this.battleSync.battleId);
    this.battleSync=null;
    this.panel.hidden=true;this.battle=null;this.trainerMode=false;
    this.game.setMenuOpen(false);this.onOpenChange(false);this.game.input.clear();
    return true;
  }
  close(){if(!this.isOpen()||(this.trainerMode&&!this.battle?.finished))return false;if(this.trainerMode)this.commitTrainerResult();this.panel.hidden=true;this.battle=null;this.battleSync=null;this.trainerMode=false;this.game.setMenuOpen(false);this.onOpenChange(false);this.game.input.clear();this.game.renderer.canvas?.focus?.();return true;}
  choose(side,moveId){
    if(!this.isOpen()||!this.battle||this.battle.finished)return false;
    const move=this.moveRegistry.get(moveId),state=this.battle.getState();
    if(!supported(move)||state.pendingSides.includes(side)||!this.battle.pokemon[side].moveIds.includes(moveId)||state.remainingPp[side][moveId]<=0)return false;
    this.battle.submitAction(side,{type:'move',moveId});
    if(this.trainerMode&&!this.battle.finished){const reply=chooseOpponentMove(this.battle,this.moveRegistry);if(reply)this.battle.submitAction('opponent',{type:'move',moveId:reply});}
    if(this.trainerMode&&this.battle.finished)this.commitTrainerResult();
    this.render();return true;
  }
  element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
  render(){
    const b=this.battle;if(!b)return;
    const state=b.getState();this.content.replaceChildren();
    const arena=this.element('div','battle-arena');
    for(const side of ['opponent','player']){
      const p=b.pokemon[side],species=this.registry.get(p.speciesId),hp=side==='player'?state.playerHp:state.opponentHp,max=b.maxHp[side];
      const card=this.element('section','battle-combatant');card.setAttribute('aria-label',side==='player'?'Eigenes Pokémon':'Gegnerisches Pokémon');
      card.append(this.element('div','battle-sprite','?'));
      const info=this.element('div','battle-combatant-info');
      info.append(this.element('strong','',`${label(this.registry,p)} · Lv. ${p.level}`));
      info.append(this.element('span','',`Typ: ${species?.types.join(' / ')||'Unbekannt'}`));
      info.append(this.element('span','',`KP: ${hp} / ${max}`));
      const meter=this.element('progress','battle-hp');meter.max=max;meter.value=hp;meter.setAttribute('aria-label',`${label(this.registry,p)} KP`);info.append(meter);card.append(info);arena.append(card);
    }
    this.content.append(arena);
    const moves=this.element('div','battle-move-area');
    for(const side of (this.trainerMode?['player']:['player','opponent'])){
      const section=this.element('section','battle-moves');
      section.append(this.element('h3','',side==='player'?'Deine Attacke wählen':'Teststeuerung: gegnerische Attacke wählen (keine KI)'));
      const list=this.element('div','battle-move-grid');
      for(const id of b.pokemon[side].moveIds){
        const move=this.moveRegistry.get(id);const button=this.element('button','battle-move',`${move?.name||id} · ${move?.type||'?'} · AP ${state.remainingPp[side][id]??'–'}/${move?.pp??'–'}`);
        button.type='button';button.disabled=state.finished||state.pendingSides.includes(side)||!supported(move)||(state.remainingPp[side][id]??0)<=0;
        if(!supported(move))button.title='Attackeneffekt noch nicht unterstützt';
        button.addEventListener('click',()=>this.choose(side,id));list.append(button);
      }
      section.append(list);moves.append(section);
    }
    this.content.append(moves);this.closeButton.disabled=this.trainerMode&&!state.finished;
    for(const event of state.events.slice(this.seen)){const msg=eventMessage(event,this.registry,b,this.moveRegistry);if(msg)this.log.push(msg);}
    this.seen=state.events.length;
    const log=this.element('section','battle-log');log.setAttribute('aria-label','Kampfmeldungen');log.setAttribute('role','log');log.setAttribute('aria-live','polite');
    for(const msg of this.log.slice(-8))log.append(this.element('p','',msg));
    this.content.append(log);
    if(state.finished)this.content.append(this.element('p','battle-result','Testkampf beendet. Mit „Schließen“ zur Welt zurückkehren.'));
    else if(!this.trainerMode&&state.pendingSides.length===1)this.content.append(this.element('p','battle-hint','Aktion vorgemerkt. Für diesen Testkampf die andere Seite manuell auswählen.'));
  }
  destroy(){if(this.battleSync&&!this.battleSync.committed&&!this.battle?.finished)this.cancelTrainerBattle();document.removeEventListener('keydown',this.onKey);}
}
