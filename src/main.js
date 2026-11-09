import {Game} from './core/Game.js';
const game=new Game({canvas:document.querySelector('#game'),controls:document.querySelector('#controls')});
game.start();
