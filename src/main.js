import {Fullscreen} from './ui/Fullscreen.js';
import {Game} from './core/Game.js';
const game=new Game({canvas:document.querySelector('#game'),controls:document.querySelector('#controls')});
game.start();

const fullscreen=new Fullscreen({root:document.querySelector('#app'),button:document.querySelector('#fullscreen-toggle')});
