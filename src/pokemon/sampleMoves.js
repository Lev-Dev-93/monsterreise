import {createMoveRegistry} from './CombatData.js';
/** Technischer Testdatensatz, NICHT als endgültiges Attacken-Balancing beschlossen. */
export const sampleMoveRegistry=createMoveRegistry([
  {moveId:'tackle',name:'Tackle',type:'Normal',category:'physical',power:40,accuracy:100,pp:35},
  {moveId:'scratch',name:'Kratzer',type:'Normal',category:'physical',power:40,accuracy:100,pp:35},
  {moveId:'ember',name:'Glut',type:'Feuer',category:'special',power:40,accuracy:100,pp:25},
  // Auftrag 030: vorläufiger Riolu-Testmove; Priorität wird von Battle bereits verarbeitet.
  {moveId:'quick-attack',name:'Ruckzuckhieb',type:'Normal',category:'physical',power:40,accuracy:100,pp:30,priority:1},
  {moveId:'growl',name:'Heuler',type:'Normal',category:'status',power:null,accuracy:100,pp:40,effectId:'lower-attack'}
]);
