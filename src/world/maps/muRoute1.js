import {makeMuMap} from "./muMapFactory.js";
export const muRoute1=makeMuMap({
 id:'mu-route-1',label:'Route 1',width:30,height:20,spawn:'route1-village-entry',
 spawns:{'route1-village-entry':{x:4,y:10},'route1-return-entry':{x:8,y:10}},
 portals:[{id:'pt-route1-village',x:1,y:10,transitionId:'tr-route1-village',targetMap:'mu-start-village',spawnId:'village-route1-return'}],
 buildings:[],water:[[18,2,3,7], [18,12,3,6]],trees:[[9,3,3,3], [23,4,3,3], [23,14,3,3]]
});
