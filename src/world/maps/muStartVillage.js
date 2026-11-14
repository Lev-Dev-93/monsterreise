import {makeMuMap} from "./muMapFactory.js";
export const muStartVillage=makeMuMap({
 id:'mu-start-village',label:'Startdorf Mu',width:30,height:22,spawn:'village-farm-entry',
 spawns:{'village-farm-entry':{x:3,y:11},'village-route1-return':{x:25,y:11},'village-professor-return':{x:15,y:11}},
 portals:[{id:'pt-village-farm',x:1,y:11,transitionId:'tr-village-farm',targetMap:'mu-breeder-farm',spawnId:'farm-village-return'},{id:'pt-professor-door',x:15,y:8,transitionId:'tr-village-professor-enter',targetMap:'mu-professor-house',spawnId:'professor-entry'},{id:'pt-village-route1',x:28,y:11,transitionId:'tr-village-route1',targetMap:'mu-route-1',spawnId:'route1-village-entry'}],
 buildings:[[11,3,8,5], [4,4,5,4], [21,4,5,4]],water:[],trees:[[5,16,3,3], [22,16,3,3]]
});
