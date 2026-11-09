/** Player position is the top-left of its collision rectangle, in world pixels. */
export class Player {
 constructor(x,y,{width=26,height=30,speed=170}={}){Object.assign(this,{x,y,width,height,speed,facing:'down'})}
 update(dt,vector,world){let {x:dx=0,y:dy=0}=vector;const mag=Math.hypot(dx,dy);if(!mag)return;dx/=mag;dy/=mag;this.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');const moveX=dx*this.speed*dt,moveY=dy*this.speed*dt;this.moveAxis('x',moveX,world);this.moveAxis('y',moveY,world)}
 moveAxis(axis,delta,world){const maxStep=Math.max(1,world.tileSize/3);const count=Math.ceil(Math.abs(delta)/maxStep);if(!count)return;const step=delta/count;for(let i=0;i<count;i++){const x=this.x+(axis==='x'?step:0),y=this.y+(axis==='y'?step:0);if(world.collidesRect(x,y,this.width,this.height))break;this[axis]+=step}}
 get center(){return {x:this.x+this.width/2,y:this.y+this.height/2}}
}
