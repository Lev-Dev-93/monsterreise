/** Auftrag 014: Regelneutrale Kampfwert- und Attackendaten. Keine festgelegte Schadensformel. */
import {STAT_KEYS} from './Pokemon.js';
const check=(ok,msg)=>{if(!ok)throw new TypeError(msg);};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const int=(x,min=0)=>Number.isSafeInteger(x)&&x>=min;
export const MOVE_CATEGORIES=Object.freeze(['physical','special','status']);
export const POKEMON_TYPES=Object.freeze(['Normal','Feuer','Wasser','Elektro','Pflanze','Eis','Kampf','Gift','Boden','Flug','Psycho','Käfer','Gestein','Geist','Drache','Unlicht','Stahl','Fee']);
export function defineMove(input){
  check(obj(input),'Attacke muss ein Objekt sein');
  const {moveId,name,type,category,power=null,accuracy=null,pp,priority=0,effectId=null}=input;
  check(typeof moveId==='string'&&/^[a-z0-9-]+$/.test(moveId),'Ungültige moveId');
  check(typeof name==='string'&&name.trim().length>0,'Attackenname fehlt');
  check(POKEMON_TYPES.includes(type),'Unbekannter Attackentyp');
  check(MOVE_CATEGORIES.includes(category),'Ungültige Kategorie');
  check(power===null||int(power,0),'Ungültige Stärke');
  check(accuracy===null||(int(accuracy,1)&&accuracy<=100),'Ungültige Genauigkeit');
  check(int(pp,1),'Ungültige AP');
  check(Number.isSafeInteger(priority),'Ungültige Priorität');
  check(effectId===null||(typeof effectId==='string'&&effectId.length>0),'Ungültige Effekt-ID');
  return Object.freeze({moveId,name,type,category,power,accuracy,pp,priority,effectId});
}
export function createMoveRegistry(entries){
  check(Array.isArray(entries),'Attackenliste erforderlich');const map=new Map();
  for(const entry of entries){const move=defineMove(entry);check(!map.has(move.moveId),'Doppelte Attacken-ID');map.set(move.moveId,move);}
  return Object.freeze({get:id=>map.get(id)??null,list:()=>[...map.values()]});
}
/** Nur Eingabewerte bereitstellen; Formel wird vom Kampfsystem/Projektleitung geliefert. */
export function getStatInputs(pokemon,speciesRegistry){
  check(obj(pokemon)&&speciesRegistry&&typeof speciesRegistry.get==='function','Pokémon und Artenregister erforderlich');
  const species=speciesRegistry.get(pokemon.speciesId);check(species,'Unbekannte Art');
  check(int(pokemon.level,1),'Ungültiges Level');
  for(const key of STAT_KEYS){check(int(species.baseStats[key],0),'Ungültiger Basiswert');check(int(pokemon.iv?.[key],0)&&pokemon.iv[key]<=31,'Ungültiger IV');check(int(pokemon.ev?.[key],0)&&pokemon.ev[key]<=252,'Ungültiger EV');}
  check(STAT_KEYS.reduce((sum,k)=>sum+pokemon.ev[k],0)<=510,'EV-Gesamtgrenze überschritten');
  return {level:pokemon.level,baseStats:{...species.baseStats},iv:{...pokemon.iv},ev:{...pokemon.ev},speciesId:species.speciesId};
}
/** Berechnet Werte ausschließlich mit explizit injizierter Formel; keine stillschweigende Spielregel. */
export function calculateBattleStats(pokemon,speciesRegistry,formula){
  check(typeof formula==='function','Statuswertformel muss explizit übergeben werden');
  const inputs=getStatInputs(pokemon,speciesRegistry);const result={};
  for(const stat of STAT_KEYS){const value=formula({stat,base:inputs.baseStats[stat],iv:inputs.iv[stat],ev:inputs.ev[stat],level:inputs.level,pokemon});check(int(value,stat==='hp'?1:0),`Ungültiger berechneter Wert: ${stat}`);result[stat]=value;}
  return result;
}
/** Anschluss an bestehendes Battle: damage und Gleichstandsregel bleiben explizit. */
export function createBattleStatAdapters(speciesRegistry,formula){
  check(typeof formula==='function','Statuswertformel fehlt');
  return {maxHp:p=>calculateBattleStats(p,speciesRegistry,formula).hp,speed:p=>calculateBattleStats(p,speciesRegistry,formula).speed};
}
/** Typenfaktor nicht definiert: externe Tabelle/Funktion ist Pflicht. */
export function typeEffectiveness(attackType,defenderTypes,resolver){
  check(POKEMON_TYPES.includes(attackType),'Unbekannter Angriffstyp');
  check(Array.isArray(defenderTypes)&&defenderTypes.length>=1&&defenderTypes.length<=2&&defenderTypes.every(t=>POKEMON_TYPES.includes(t)),'Ungültige Verteidigertypen');
  check(typeof resolver==='function','Typeneffektivität muss explizit bereitgestellt werden');
  const factor=resolver(attackType,[...defenderTypes]);check(typeof factor==='number'&&Number.isFinite(factor)&&factor>=0,'Ungültiger Typenfaktor');return factor;
}
