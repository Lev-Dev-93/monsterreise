import {makeMuMap} from "./muMapFactory.js";
export const muProfessorHouse=makeMuMap({
 id:'mu-professor-house',label:'Haus des Professors',width:16,height:12,spawn:'professor-entry',
 spawns:{'professor-entry':{x:8,y:8}},
 portals:[{id:'pt-professor-exit',x:8,y:10,transitionId:'tr-professor-village-exit',targetMap:'mu-start-village',spawnId:'village-professor-return'}],
 buildings:[[2,2,3,2], [10,2,3,2]],water:[],trees:[]
});
