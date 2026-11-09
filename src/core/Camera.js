export class Camera {
 constructor(){this.x=0;this.y=0;this.width=0;this.height=0}
 follow(player,world,width,height){this.width=width;this.height=height;const c=player.center;this.x=Math.max(0,Math.min(c.x-width/2,Math.max(0,world.width-width)));this.y=Math.max(0,Math.min(c.y-height/2,Math.max(0,world.height-height)))}
}
