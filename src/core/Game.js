import {Player} from '../player/Player.js';
import {Camera} from './Camera.js';
import {Input} from './Input.js';
import {Renderer} from '../renderer/Renderer.js';
import {WorldSession} from '../world/WorldSession.js';
import {UI} from '../ui/UI.js';
export class Game {
 constructor({canvas,controls,session=new WorldSession(),ui}={}){this.session=session;this.world=session.world;const s=session.spawn();this.player=new Player(s.x,s.y);if(this.world.collidesRect(s.x,s.y,this.player.width,this.player.height))throw Error('Spawn blocked');this.camera=new Camera();this.input=new Input(document,controls);this.renderer=new Renderer(canvas);this.ui=ui??new UI(document.querySelector('#app'));this.running=false;this.lastTime=0;this.frame=0;this.onResize=()=>{this.renderer.resize();this.updateCamera()};window.addEventListener('resize',this.onResize);this.resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(this.onResize):null;this.resizeObserver?.observe(canvas);this.onResize();this.ui.setStatus(this.world.label)}
 updateCamera(){this.camera.follow(this.player,this.world,this.renderer.width,this.renderer.height)}
 applyWorldEvent(e){if(!e)return null;if(e.type==='transition'){this.world=e.world;this.player.x=e.x;this.player.y=e.y;this.updateCamera();this.ui.setStatus(this.world.label)}else if(e.type==='dialog')this.ui.showDialog(e);else if(e.type==='blocked')this.ui.setStatus(e.reason);return e}
 interact(){if(this.ui.isDialogOpen()){this.ui.advanceDialog();return {type:'dialog-advance'}}return this.applyWorldEvent(this.session.interact(this.player))}
 update(dt){if(this.input.consumeInteract())this.interact();if(!this.ui.isDialogOpen()){this.player.update(dt,this.input.getVector(),this.world);this.applyWorldEvent(this.session.updatePosition(this.player))}this.updateCamera()}

 start(){if(this.running)return;this.running=true;this.lastTime=0;this.frame=requestAnimationFrame(t=>this.tick(t))}
 tick(t){if(!this.running)return;const dt=this.lastTime?Math.min((t-this.lastTime)/1000,.05):0;this.lastTime=t;this.update(dt);this.renderer.render(this);this.frame=requestAnimationFrame(t=>this.tick(t))}
 stop(){this.running=false;cancelAnimationFrame(this.frame);this.lastTime=0}
 destroy(){this.stop();this.input.destroy();window.removeEventListener('resize',this.onResize);this.resizeObserver?.disconnect()}
}
