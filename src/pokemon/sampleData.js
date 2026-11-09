import {createRegistry} from './Pokemon.js';
// Kleiner Testdatensatz, keine vollständige Datenbank. Basiswerte nach bekannten Pokémon-Stammdaten.
const species=[
 ['charmander',4,'Glumanda',1,['Feuer'],[39,52,43,60,50,65],true,['charmeleon']],
 ['eevee',133,'Evoli',1,['Normal'],[55,55,50,45,65,55],true,['vaporeon','jolteon','flareon','espeon','umbreon','leafeon','glaceon','sylveon']],
 ['riolu',447,'Riolu',4,['Kampf'],[40,70,40,35,40,60],true,['lucario']],
 ['lucario',448,'Lucario',4,['Kampf','Stahl'],[70,110,70,115,70,90],false,[]],
 ['mewtwo',150,'Mewtu',1,['Psycho'],[106,110,90,154,90,130],false,[]],
 ['caterpie',10,'Raupy',1,['Käfer'],[45,30,35,20,20,45],true,['metapod']]
];
export const sampleRegistry=createRegistry(species.map(([speciesId,dexNumber,name,generation,types,values,starterEligible,evolutionTargets])=>({speciesId,dexNumber,name,generation,types,baseStats:Object.fromEntries(['hp','attack','defense','specialAttack','specialDefense','speed'].map((k,i)=>[k,values[i]])),starterEligible,evolutionTargets})));
