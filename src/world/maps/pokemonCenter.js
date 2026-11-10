/** Auftrag 027: provisional center interior, no canonical design or story. */
const rows=[
 '############',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '#..........#',
 '############'
];
const terrain=rows.map(row=>Array.from(row,t=>t==='#'?'center-wall':'center-floor'));
terrain[10][5]='center-exit';
terrain[4][5]='healing-station';
export const pokemonCenter={id:'pokemon-center',label:'Pokémon-Center (Platzhalter)',tileSize:48,rows,terrain,
 spawn:{x:5,y:8},
 portals:[{id:'center-exit',x:5,y:10,targetMap:'start-village',returnToPrevious:true,activation:'enter'}],
 npcs:[{id:'center-healing-station',x:5,y:4,label:'Heilungsstation',dialog:['Heilungsstation'],placeholder:true}]
};
