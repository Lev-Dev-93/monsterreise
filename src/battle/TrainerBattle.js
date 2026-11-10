/** Auftrag 017: vorläufiger Welttrainer, ohne Story- oder Team-Persistenz. */
import {createPokemon,deserializePokemon} from '../pokemon/Pokemon.js';
import {createClassicBattleOptions} from './BattleRules.js';
import {createBattle} from './Battle.js';
export const TEST_TRAINER_ID='trainer-test-017';
export function firstBattleReady(team){return team.getMembers().find(p=>p.currentHp===null||p.currentHp>0)??null;}
export function chooseOpponentMove(battle,moveRegistry){
  if(battle.finished||battle.getState().pendingSides.includes('opponent'))return null;
  const state=battle.getState();
  return battle.pokemon.opponent.moveIds.find(id=>{
    const m=moveRegistry.get(id);
    return m&&m.category!=='status'&&m.effectId===null&&m.power>0&&(state.remainingPp.opponent[id]??0)>0;
  })??null;
}
export function createTrainerTestBattle({team,registry,moveRegistry,playerSnapshot=null}){
  const member=playerSnapshot??firstBattleReady(team);
  if(!member)return null;
  // Separate Kampfkopien; keine Änderung am Team oder an Spielständen.
  const player=playerSnapshot?deserializePokemon(member,registry):createPokemon({...member,registry,instanceId:'trainer017-player',currentHp:null,moveIds:['tackle','scratch']});
  const opponent=createPokemon({registry,speciesId:'eevee',instanceId:'trainer017-opponent',level:5,moveIds:['tackle'],currentHp:null});
  return createBattle({playerPokemon:player,opponentPokemon:opponent,...createClassicBattleOptions({speciesRegistry:registry,moveRegistry})});
}
export function trainerWorldEvent(event,{team,startBattle}){
  if(event?.type!=='dialog'||event.npcId!==TEST_TRAINER_ID)return event;
  const ready=firstBattleReady(team);
  return {...event,lines:ready?['Testtrainer (vorläufig): Bereit für einen Übungskampf?','Dann zeig mir, was dein Pokémon kann!']:['Testtrainer (vorläufig): Du brauchst zuerst ein kampffähiges Pokémon.'],onComplete:ready?()=>startBattle():undefined};
}
