import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Input} from '../src/core/Input.js';

function harness(){
 const listeners=new Map();
 const target={addEventListener(n,f){listeners.set('key:'+n,f)},removeEventListener(){}};
 const windowListeners=new Map();globalThis.window={addEventListener(n,f){windowListeners.set(n,f)},removeEventListener(){}};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 const buttons=[];
 const controls={handlers:new Map(),addEventListener(n,f){this.handlers.set(n,f)},removeEventListener(){},contains(b){return buttons.includes(b)},querySelectorAll(){return buttons}};
 function button(dir,action){const b={dataset:action?{action:'interact'}:{dir},classList:{active:false,add(){this.active=true},remove(){this.active=false}},setPointerCapture(){},closest(){return this}};buttons.push(b);return b}
 return {input:new Input(target,controls),controls,button,windowListeners,listeners};
}
function fire(h,name,id,b){let prevented=false;h.controls.handlers.get(name)({pointerId:id,target:b,preventDefault(){prevented=true}});return prevented}
test('holding a direction retains continuous movement and releases on pointerup',()=>{const h=harness(),b=h.button('up');assert.equal(fire(h,'pointerdown',1,b),true);for(let i=0;i<100;i++)assert.deepEqual(h.input.getVector(),{x:0,y:-1});fire(h,'pointerup',1,b);assert.deepEqual(h.input.getVector(),{x:0,y:0});assert.equal(b.classList.active,false);h.input.destroy()});
test('cancel and lost capture release touches even with different event target',()=>{const h=harness(),b=h.button('left'),other=h.button('right');fire(h,'pointerdown',2,b);fire(h,'pointercancel',2,other);assert.equal(h.input.getVector().x,0);fire(h,'pointerdown',3,b);fire(h,'lostpointercapture',3,other);assert.equal(h.input.getVector().x,0);h.input.destroy()});
test('multitouch and blur release all held directions',()=>{const h=harness(),a=h.button('up'),b=h.button('right');fire(h,'pointerdown',1,a);fire(h,'pointerdown',2,b);fire(h,'pointerup',1,a);assert.deepEqual(h.input.getVector(),{x:1,y:0});h.windowListeners.get('blur')();assert.deepEqual(h.input.getVector(),{x:0,y:0});assert.equal(b.classList.active,false);h.input.destroy()});
test('action fires once per hold and is available after release',()=>{const h=harness(),b=h.button(null,true);fire(h,'pointerdown',1,b);assert.equal(h.input.consumeInteract(),true);assert.equal(h.input.consumeInteract(),false);fire(h,'pointerdown',1,b);assert.equal(h.input.consumeInteract(),false);fire(h,'pointerup',1,b);fire(h,'pointerdown',2,b);assert.equal(h.input.consumeInteract(),true);h.input.destroy()});
test('Safari context menu and selection suppressed only on controls',()=>{const h=harness(),b=h.button('down');for(const type of ['contextmenu','selectstart','dragstart'])assert.equal(fire(h,type,1,b),true);const outside={closest(){return null}};assert.equal(fire(h,'contextmenu',1,outside),false);h.input.destroy()});
test('Safari CSS protection scoped to control buttons',()=>{const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');for(const rule of ['-webkit-user-select:none','-webkit-touch-callout:none','touch-action:none'])assert.ok(css.includes(rule));assert.match(css,/#controls, #controls button/)});
