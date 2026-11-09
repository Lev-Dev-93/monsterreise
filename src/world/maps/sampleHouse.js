/** Neutral test house; not the canonical two-storey family home. */
const rows=['############','#..........#','#..##......#','#..........#','#......##..#','#..........#','#..........#','#..........#','#..........#','#..........#','#..........#','############'];
const terrain=rows.map(r=>Array.from(r,c=>c==='#'?'wall':'floor'));
terrain[10][5]='door';
export const sampleHouse={id:'sample-house',label:'Testhaus (Platzhalter)',tileSize:48,rows,terrain,spawn:{x:5,y:7},portals:[{id:'house-exit',x:5,y:10,targetMap:'start-village',returnToPrevious:true,activation:'enter'}],npcs:[]};
