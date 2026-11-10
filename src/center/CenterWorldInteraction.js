import {healAtPokemonCenter} from './PokemonCenter.js';
import {createClassicStatAdapters} from '../battle/BattleRules.js';
import {sampleMoveRegistry} from '../pokemon/sampleMoves.js';
export const CENTER_STATION_ID='center-healing-station';
/** Existing world dialog event adapter. No HP/PP logic or independent dialog system. */
export function centerWorldEvent(event,{team,canHeal,speciesRegistry,moveRegistry=sampleMoveRegistry}){
 if(event?.type!=='dialog'||event.npcId!==CENTER_STATION_ID)return event;
 if(!team||typeof canHeal!=='function'||!speciesRegistry)throw new TypeError('Center dependencies missing');
 if(team.getMembers().length===0)return {...event,lines:['Du hast noch keine Pokémon im Team.']};
 try{
  const result=healAtPokemonCenter({team,canHeal,calculateMaxHp:createClassicStatAdapters(speciesRegistry).maxHp,moveRegistry});
  return {...event,lines:[result.healed?'Deine Pokémon sind wieder vollständig geheilt!':'Es konnten keine Pokémon geheilt werden.']};
 }catch(error){return {...event,lines:['Die Heilung ist derzeit nicht möglich. Bitte versuche es später erneut.']};}
}
