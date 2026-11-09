import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Fullscreen} from '../src/ui/Fullscreen.js';
function harness({api=true,reject=false}={}){
 const listeners=new Map(),docListeners=new Map(),classes=new Set(),attrs=new Map();
 const doc={fullscreenElement:null,addEventListener(n,f){docListeners.set(n,f)},removeEventListener(n){docListeners.delete(n)},async exitFullscreen(){this.fullscreenElement=null;docListeners.get('fullscreenchange')?.()}};
 const root={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle(x,v){v?classes.add(x):classes.delete(x)}}};
 if(api)root.requestFullscreen=async()=>{if(reject)throw Error('denied');doc.fullscreenElement=root;docListeners.get('fullscreenchange')?.()};
 const icon={textContent:''},button={addEventListener(n,f){listeners.set(n,f)},removeEventListener(n){listeners.delete(n)},setAttribute(k,v){attrs.set(k,v)},querySelector(){return icon}};
 const controller=new Fullscreen({root,button,doc,win:{}});
 return {controller,doc,root,button,classes,attrs,icon,listeners,docListeners};
}
test('native fullscreen enters and exits without fallback',async()=>{const h=harness();await h.controller.toggle();assert.equal(h.doc.fullscreenElement,h.root);assert.equal(h.attrs.get('aria-pressed'),'true');assert.equal(h.classes.has('display-fallback'),false);await h.controller.toggle();assert.equal(h.doc.fullscreenElement,null);assert.equal(h.classes.has('display-expanded'),false);h.controller.destroy()});
test('external browser fullscreen exit restores original layout',async()=>{const h=harness();await h.controller.toggle();await h.doc.exitFullscreen();assert.equal(h.classes.has('display-expanded'),false);assert.equal(h.attrs.get('aria-pressed'),'false');h.controller.destroy()});
test('iPhone no API uses reversible layout fallback, not browser fullscreen',async()=>{const h=harness({api:false});await h.controller.toggle();assert.equal(h.doc.fullscreenElement,null);assert.equal(h.classes.has('display-fallback'),true);await h.controller.toggle();assert.equal(h.classes.has('display-fallback'),false);h.controller.destroy()});
test('rejected fullscreen request falls back safely',async()=>{const h=harness({reject:true});await h.controller.toggle();assert.equal(h.classes.has('display-fallback'),true);h.docListeners.get('keydown')({key:'Escape'});assert.equal(h.classes.has('display-expanded'),false);h.controller.destroy()});
test('cleanup removes listeners',()=>{const h=harness();h.controller.destroy();assert.equal(h.listeners.size,0);assert.equal(h.docListeners.size,0)});
test('viewport-safe UI, responsive controls and canvas resize observer are present',()=>{const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const game=readFileSync(new URL('../src/core/Game.js',import.meta.url),'utf8');assert.match(html,/viewport-fit=cover/);assert.match(html,/id="fullscreen-toggle"/);assert.match(css,/safe-area-inset-bottom/);assert.match(css,/height:100dvh/);assert.match(css,/--dpad:/);assert.match(game,/ResizeObserver/)});
