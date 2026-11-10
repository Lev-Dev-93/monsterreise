/** Auftrag 015: vereinfachte klassische Kampfberechnungen, unabhängig von UI. */
import {POKEMON_TYPES,calculateBattleStats,createBattleStatAdapters,typeEffectiveness} from '../pokemon/CombatData.js';
const check=(ok,msg)=>{if(!ok)throw new TypeError(msg);};
const chart={
Normal:{Gestein:.5,Geist:0,Stahl:.5},
Feuer:{Feuer:.5,Wasser:.5,Pflanze:2,Eis:2,Käfer:2,Gestein:.5,Drache:.5,Stahl:2},
Wasser:{Feuer:2,Wasser:.5,Pflanze:.5,Boden:2,Gestein:2,Drache:.5},
Elektro:{Wasser:2,Elektro:.5,Pflanze:.5,Boden:0,Flug:2,Drache:.5},
Pflanze:{Feuer:.5,Wasser:2,Pflanze:.5,Gift:.5,Boden:2,Flug:.5,Käfer:.5,Gestein:2,Drache:.5,Stahl:.5},
Eis:{Feuer:.5,Wasser:.5,Pflanze:2,Eis:.5,Boden:2,Flug:2,Drache:2,Stahl:.5},
Kampf:{Normal:2,Eis:2,Gift:.5,Flug:.5,Psycho:.5,Käfer:.5,Gestein:2,Geist:0,Unlicht:2,Stahl:2,Fee:.5},
Gift:{Pflanze:2,Gift:.5,Boden:.5,Gestein:.5,Geist:.5,Stahl:0,Fee:2},
Boden:{Feuer:2,Elektro:2,Pflanze:.5,Gift:2,Flug:0,Käfer:.5,Gestein:2,Stahl:2},
Flug:{Elektro:.5,Pflanze:2,Kampf:2,Käfer:2,Gestein:.5,Stahl:.5},
Psycho:{Kampf:2,Gift:2,Psycho:.5,Unlicht:0,Stahl:.5},
Käfer:{Feuer:.5,Pflanze:2,Kampf:.5,Gift:.5,Flug:.5,Psycho:2,Geist:.5,Unlicht:2,Stahl:.5,Fee:.5},
Gestein:{Feuer:2,Eis:2,Kampf:.5,Boden:.5,Flug:2,Käfer:2,Stahl:.5},
Geist:{Normal:0,Psycho:2,Geist:2,Unlicht:.5},
Drache:{Drache:2,Stahl:.5,Fee:0},
Unlicht:{Kampf:.5,Psycho:2,Geist:2,Unlicht:.5,Fee:.5},
Stahl:{Feuer:.5,Wasser:.5,Elektro:.5,Eis:2,Gestein:2,Stahl:.5,Fee:2},
Fee:{Feuer:.5,Kampf:2,Gift:.5,Drache:2,Unlicht:2,Stahl:.5}
};
export const TYPE_CHART=Object.freeze(Object.fromEntries(POKEMON_TYPES.map(t=>[t,Object.freeze({...chart[t]})])));
export function modernTypeEffectiveness(attackType,defenderTypes){return typeEffectiveness(attackType,defenderTypes,(a,ds)=>ds.reduce((v,d)=>v*(TYPE_CHART[a][d]??1),1));}
export function classicStat({stat,base,iv,ev,level,pokemon,natureFactors={}}){
 check(Number.isSafeInteger(base)&&base>=0&&Number.isSafeInteger(iv)&&iv>=0&&iv<=31&&Number.isSafeInteger(ev)&&ev>=0&&ev<=252&&Number.isSafeInteger(level)&&level>=1,'Ungültige Statuswert-Eingaben');
 const factor=natureFactors[stat]??1;
 check([.9,1,1.1].includes(factor),'Wesensfaktor muss 0.9, 1 oder 1.1 sein');
 const core=Math.floor(((2*base+iv+Math.floor(ev/4))*level)/100);
 if(stat==='hp'){
  check(pokemon?.speciesId!=='shedinja' && pokemon?.speciesId!=='ninjatom','Ninjatom-Sonderregel noch nicht implementiert');
  return core+level+10;
 }
 return Math.floor((core+5)*factor);
}
export function createClassicStatAdapters(speciesRegistry,{natureFactors}={}){
 const formula=ctx=>classicStat({...ctx,natureFactors:natureFactors?.(ctx.pokemon)??natureFactors??{}});
 return {...createBattleStatAdapters(speciesRegistry,formula),stats:p=>calculateBattleStats(p,speciesRegistry,formula)};
}
export function sampleRandom(rng=Math.random){const v=rng();check(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<1,'Zufallsquelle muss [0,1) liefern');return v;}
/** Modifikator-Reihenfolge: Basisschaden -> STAB -> Typ -> Krit -> Zufall, jeweils floor.
 * Nicht identisch mit jeder generationsspezifischen Original-Engine. */
export function classicDamage({attacker,defender,move,attackerStats,defenderStats,attackerTypes,defenderTypes,rng=Math.random,critical=false}){
 check(move?.category==='physical'||move?.category==='special','Nur physische/spezielle Schadensattacken unterstützt');
 check(Number.isSafeInteger(move.power)&&move.power>0,'Attacke benötigt positive Stärke');
 const atk=attackerStats[move.category==='physical'?'attack':'specialAttack'];
 const def=defenderStats[move.category==='physical'?'defense':'specialDefense'];
 check(Number.isSafeInteger(atk)&&atk>=0&&Number.isSafeInteger(def)&&def>0,'Ungültige Angriffs-/Verteidigungswerte');
 const effectiveness=modernTypeEffectiveness(move.type,defenderTypes);
 if(effectiveness===0)return 0;
 const base=Math.floor(Math.floor(Math.floor((Math.floor(2*attacker.level/5+2)*move.power*atk)/def)/50)+2);
 const randomPercent=85+Math.floor(sampleRandom(rng)*16);
 let result=base;
 for(const modifier of [attackerTypes.includes(move.type)?1.5:1,effectiveness,critical?1.5:1,randomPercent/100])result=Math.floor(result*modifier);
 return Math.max(1,result);
}
/** Opt-in für bestehende Battle-Engine; die Attackendaten kommen aus CombatData. */
export function createClassicBattleOptions({speciesRegistry,moveRegistry,rng=Math.random,natureFactors,criticalChance=0}={}){
 check(speciesRegistry?.get&&moveRegistry?.get,'Arten- und Attackenregister erforderlich');
 check(typeof rng==='function'&&typeof criticalChance==='number'&&criticalChance>=0&&criticalChance<=1,'Ungültige Zufallsoptionen');
 const adapters=createClassicStatAdapters(speciesRegistry,{natureFactors});
 return {...adapters,moveRegistry,rng,
  tieBreaker:()=>sampleRandom(rng)<.5?'player':'opponent',
  damage:({attacker,defender,moveId})=>{
   const move=moveRegistry.get(moveId);
   check(move,'Unbekannte Attacke');
   const a=speciesRegistry.get(attacker.speciesId),d=speciesRegistry.get(defender.speciesId);
   check(a&&d,'Unbekannte Pokémon-Art');
   return classicDamage({attacker,defender,move,attackerStats:adapters.stats(attacker),defenderStats:adapters.stats(defender),attackerTypes:a.types,defenderTypes:d.types,rng,critical:sampleRandom(rng)<criticalChance});
  }
 };
}
