/** Auftrag 007: unabhängig von UI, Kampf und SaveSystem. */
export const STAT_KEYS = Object.freeze(['hp','attack','defense','specialAttack','specialDefense','speed']);
export const PERFECT_IV = 31;
const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const integer = (x,min,max=Infinity) => Number.isInteger(x) && x >= min && x <= max;
function check(condition,message){ if(!condition) throw new TypeError(message); }
function stats(value,label,{min=0,max=Infinity}={}){
  check(isObject(value),`${label} muss ein Objekt sein`);
  check(Object.keys(value).length===6 && STAT_KEYS.every(k=>integer(value[k],min,max)),`${label}: genau sechs gültige Werte erforderlich`);
  return Object.fromEntries(STAT_KEYS.map(k=>[k,value[k]]));
}
function clone(x){return JSON.parse(JSON.stringify(x));}
/** Stammdaten: speciesId, dexNumber, name, generation, types, baseStats,
 * starterEligible, evolutionTargets; optionale Größe/Gewicht/Beschreibung/Attacken. */
export function defineSpecies(input){
  check(isObject(input),'Art muss ein Objekt sein');
  const {speciesId,dexNumber,name,generation,types,baseStats,starterEligible,evolutionTargets=[]}=input;
  check(typeof speciesId==='string' && /^[a-z0-9-]+$/.test(speciesId),'Ungültige speciesId');
  check(integer(dexNumber,1),'Ungültige Pokédex-Nummer');
  check(typeof name==='string' && name.trim().length>0,'Name fehlt');
  check(integer(generation,1),'Ungültige Generation');
  check(Array.isArray(types) && types.length>=1 && types.length<=2 && types.every(t=>typeof t==='string'&&t.length>0) && new Set(types).size===types.length,'Ungültige Typen');
  check(typeof starterEligible==='boolean','Starterberechtigung muss explizit sein');
  check(Array.isArray(evolutionTargets) && evolutionTargets.every(t=>typeof t==='string'&&t.length>0),'Ungültige Entwicklungsverweise');
  const s={speciesId,dexNumber,name,generation,types:[...types],baseStats:stats(baseStats,'Basiswerte'),starterEligible,evolutionTargets:[...evolutionTargets]};
  for(const k of ['heightM','weightKg','description']) if(input[k]!==undefined){
    if(k==='description') check(typeof input[k]==='string','Beschreibung ungültig');
    else check(typeof input[k]==='number'&&Number.isFinite(input[k])&&input[k]>0,`${k} ungültig`);
    s[k]=input[k];
  }
  return Object.freeze(s);
}
export function createRegistry(species){
  check(Array.isArray(species),'Artenliste erforderlich');
  const map=new Map();
  for(const entry of species){const s=defineSpecies(entry);check(!map.has(s.speciesId),'Doppelte speciesId');map.set(s.speciesId,s);}
  return Object.freeze({get(id){return map.get(id)??null;},list(){return [...map.values()];},starterOptions(){return [...map.values()].filter(s=>s.starterEligible);}});
}
export function perfectIVs(){return Object.fromEntries(STAT_KEYS.map(k=>[k,PERFECT_IV]));}
/** rng liefert eine Zahl im Intervall [0,1); Injektion für deterministische Tests. */
export function randomIVs(rng=Math.random){
  const iv={};for(const k of STAT_KEYS){const v=rng();check(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<1,'rng muss [0,1) liefern');iv[k]=Math.floor(v*32);}return iv;
}
/** Für Starter und Shiny werden IVs zwingend perfekt gesetzt. */
export function createPokemon({registry,speciesId,instanceId,level,experience=0,origin='wild',shiny=false,iv,ev,moveIds=[],nickname=null,status=null,currentHp=null}){
  check(registry&&typeof registry.get==='function','Register fehlt');
  const species=registry.get(speciesId);check(species,'Unbekannte Pokémon-Art');
  check(typeof instanceId==='string'&&instanceId.length>0,'Instanz-ID fehlt');
  check(integer(level,1),'Level ungültig');check(integer(experience,0),'Erfahrung ungültig');
  check(['wild','starter','bred','gift','other'].includes(origin),'Herkunft ungültig');
  check(typeof shiny==='boolean','Shiny-Flag ungültig');
  if(origin==='starter') check(species.starterEligible,'Art ist nicht starterberechtigt');
  const fixed=origin==='starter'||shiny;
  if(fixed&&iv!==undefined)check(STAT_KEYS.every(k=>iv?.[k]===31)&&Object.keys(iv).length===6,'Starter/Shiny erfordert sechs perfekte IVs');
  const resolvedIV=fixed?perfectIVs():iv===undefined?randomIVs():stats(iv,'IV',{max:31});
  const resolvedEV=ev===undefined?Object.fromEntries(STAT_KEYS.map(k=>[k,0])):stats(ev,'EV',{max:252});
  check(STAT_KEYS.reduce((sum,k)=>sum+resolvedEV[k],0)<=510,'EV-Gesamtgrenze 510 überschritten');
  check(Array.isArray(moveIds)&&moveIds.every(m=>typeof m==='string'&&m.length>0),'Attackenliste ungültig');
  check(nickname===null||typeof nickname==='string','Spitzname ungültig');
  check(status===null||typeof status==='string','Status ungültig');
  check(currentHp===null||integer(currentHp,0),'Aktuelle KP ungültig');
  return {instanceId,speciesId,level,experience,origin,shiny,iv:resolvedIV,ev:resolvedEV,moveIds:[...moveIds],nickname,status,currentHp};
}
export function serializePokemon(pokemon){return clone(pokemon);}
export function deserializePokemon(data,registry){
  check(isObject(data),'Ungültige Spielstanddaten');
  return createPokemon({...clone(data),registry});
}
/** Entwicklungsbedingungen sind noch offen: nur Stammdaten-Verweise, keine automatische Evolution. */
export function evolutionTargets(registry,speciesId){
  const species=registry.get(speciesId);check(species,'Unbekannte Pokémon-Art');return [...species.evolutionTargets];
}
