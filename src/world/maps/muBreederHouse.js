import {makeMuMap} from "./muMapFactory.js";
export const muBreederHouse=makeMuMap({
 id:'mu-breeder-house',label:'Haus der Adoptiveltern',width:16,height:12,spawn:'house-start',
 spawns:{'house-start':{x:8,y:6},'house-door-return':{x:8,y:8}},
 portals:[{id:'pt-house-exit',x:8,y:10,transitionId:'tr-farm-house-exit',targetMap:'mu-breeder-farm',spawnId:'farm-house-return'}],
 buildings:[[2,2,4,2], [10,2,3,2]],water:[],trees:[]
});
