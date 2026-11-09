import {Player} from '../player/Player.js';
import {Camera} from './Camera.js';
import {Input} from './Input.js';
import {Renderer} from '../renderer/Renderer.js';
import {createTestWorld} from '../world/World.js';
import {UI} from '../ui/UI.js';
export class Game {
 constructor({canvas,controls,world=createTestWorld()}){this.world=world;this.player=new Player(3*world.tileSize,3*world.tileSize);if(world.collidesRect(this.player.x,this.player.y,this.player.width,this.player.height))throw new Error('Spawn point blocked');this.camera=new Camera();this.input=new Input(document,controls);this.renderer=new Renderer(canvas);this.ui=new UI(document.querySelector('#app'));this.running=false;this.lastTime=0;this.frame=0;this.onResize=()=>{this.renderer.resize();this.camera.follow(this.player,this.world,this.renderer.width,this.renderer.height)};window.addEventListener('resize',this.onResize);this.onResize()}
 start(){if(this.running)return;this.running=true;this.lastTime=0;this.frame=requestAnimationFrame(t=>this.tick(t))}
 tick(timestamp){if(!this.running)return;const dt=this.lastTime?Math.min((timestamp-this.lastTime)/1000,.05):0;this.lastTime=timestamp;this.player.update(dt,this.input.getVector(),this.world);this.camera.follow(this.player,this.world,this.renderer.width,this.renderer.height);this.renderer.render(this);this.frame=requestAnimationFrame(t=>this.tick(t))}
 stop(){this.running=false;cancelAnimationFrame(this.frame);this.lastTime=0}
 destroy(){this.stop();this.input.destroy();window.removeEventListener('resize',this.onResize)}
}
