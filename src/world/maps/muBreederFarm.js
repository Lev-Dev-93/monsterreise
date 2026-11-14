import {makeMuMap} from "./muMapFactory.js";
export const muBreederFarm=makeMuMap({
 id:'mu-breeder-farm',label:'Züchterhof',width:24,height:18,spawn:'farm-arrival',
 spawns:{'farm-arrival':{x:12,y:10},'farm-house-return':{x:11,y:9},'farm-village-return':{x:19,y:10}},
 portals:[{id:'pt-farm-house-door',x:11,y:7,transitionId:'tr-farm-house-enter',targetMap:'mu-breeder-house',spawnId:'house-door-return'},{id:'pt-farm-village',x:22,y:10,transitionId:'tr-farm-village',targetMap:'mu-start-village',spawnId:'village-farm-entry'}],
 buildings:[[7,3,9,4]],water:[[3,12,5,3]],trees:[[3,3,2,3]]
});
