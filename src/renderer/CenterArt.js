/** Provisional, original canvas pixel art. Visual only: never mutates world tiles. */
export const CENTER_ART_TILES=Object.freeze(['center-roof','center-door','center-floor','center-wall','center-exit','healing-station']);
export const CENTER_EFFECT_SECONDS=1.35;
export function centerArt(ctx,terrain,x,y,t,tx=-1,ty=-1){
 if(!CENTER_ART_TILES.includes(terrain))return false;
 const rect=(color,a,b,w,h)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x+a*t/48),Math.round(y+b*t/48),Math.ceil(w*t/48),Math.ceil(h*t/48));};
 if(terrain==='center-roof'){
  rect('#853c53',0,0,48,5);rect('#d46d79',0,5,48,34);rect('#f4b7a5',3,7,42,4);rect('#a64c60',0,37,48,11);
  if(tx===24&&ty===7){rect('#ffe4d3',20,16,8,18);rect('#ffe4d3',14,22,20,7);rect('#ad5265',23,19,2,12);rect('#ad5265',17,25,14,2);}
 }else if(terrain==='center-door'){
  rect('#693f51',4,0,40,48);rect('#f5e8c7',8,0,32,48);rect('#714b59',12,8,24,40);rect('#dba16f',15,10,18,38);rect('#ffe7b1',29,29,4,4);rect('#fff6cf',3,43,42,5);
 }else if(terrain==='center-wall'){
  rect('#455b70',0,0,48,48);rect('#7897a3',0,5,48,29);rect('#b8c8c2',0,35,48,5);rect('#435b67',0,40,48,8);
  rect('#a4b7b7',5,10,38,3);
 }else if(terrain==='center-floor'){
  rect('#e3d5ba',0,0,48,48);rect('#d5c7ae',0,0,48,2);rect('#f0e4cc',2,3,44,42);rect('#dccab2',0,46,48,2);
 }else if(terrain==='center-exit'){
  rect('#eadcc0',0,0,48,48);rect('#a96369',5,29,38,17);rect('#f7e6ba',9,34,30,9);rect('#fff8e5',20,37,8,4);
 }else if(terrain==='healing-station'){
  rect('#e3d5ba',0,0,48,48);rect('#537f86',2,19,44,26);rect('#b2e8dd',5,16,38,20);rect('#3f7f83',9,10,30,18);rect('#fff1df',20,13,8,15);rect('#fff1df',16,19,16,7);rect('#f3b0ac',12,38,24,5);
 }
 return true;
}
export function canShowCenterHealHint(world,player){
 if(world.id!=='pokemon-center')return false;
 const t=world.tileSize,cx=player.x+player.width/2,cy=player.y+player.height/2;
 const offsets={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 const [dx,dy]=offsets[player.facing]??offsets.down;
 const tx=Math.floor(cx/t)+dx,ty=Math.floor(cy/t)+dy;
 return world.npcs?.some(n=>n.id==='center-healing-station'&&n.x===tx&&n.y===ty)===true;
}
export function centerStationOverlay(ctx,world,camera,player,effectRemaining=0,viewportWidth=Infinity,viewportHeight=Infinity,canInteract=true){
 if(world.id!=='pokemon-center')return;
 const t=world.tileSize,x=Math.round(5*t-camera.x),y=Math.round(4*t-camera.y);
 // Icon and instruction use the same world coordinates as the existing station NPC.
 if(canInteract&&canShowCenterHealHint(world,player)){
  const label='E / Aktion: Heilen';ctx.save();ctx.font='bold 12px sans-serif';const w=ctx.measureText(label).width+16;
  const left=Math.max(0,Math.min(x+24-w/2,viewportWidth-w));const top=Math.max(0,Math.min(y-23,viewportHeight-20));
  if(viewportWidth>=w&&viewportHeight>=20){ctx.fillStyle='#263c49';ctx.fillRect(left,top,w,20);ctx.fillStyle='#fff5d9';ctx.fillText(label,left+8,top+14);}
  ctx.restore();
 }
 if(effectRemaining>0){
  ctx.save();ctx.globalAlpha=Math.min(.75,effectRemaining/CENTER_EFFECT_SECONDS);ctx.fillStyle='#fff6bd';ctx.fillRect(x+5,y+3,t-10,t-10);ctx.fillStyle='#ffffff';ctx.fillRect(x+21,y-8,6,20);ctx.fillRect(x+14,y-1,20,6);ctx.restore();
 }
}
