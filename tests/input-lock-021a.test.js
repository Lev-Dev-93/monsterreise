import test from 'node:test';
import assert from 'node:assert/strict';
import {Input} from '../src/core/Input.js';

function setup(){
 const handlers=new Map();
 const target={addEventListener(k,f){handlers.set(k,f)},removeEventListener(){}};
 globalThis.window={addEventListener(){},removeEventListener(){}};
 globalThis.document={addEventListener(){},removeEventListener(){},hidden:false};
 const controls={addEventListener(){},removeEventListener(){},querySelectorAll(){return []}};
 const input=new Input(target,controls);
 const key=(type,name)=>handlers.get(type)({key:name,preventDefault(){}});
 return {input,key};
}
test('held movement key stays blocked after modal closes until physical keyup',()=>{
 const {input,key}=setup();key('keydown','ArrowRight');assert.equal(input.getVector().x,1);
 input.clear();key('keydown','ArrowRight');key('keydown','ArrowRight');assert.equal(input.getVector().x,0);
 key('keyup','ArrowRight');key('keydown','ArrowRight');assert.equal(input.getVector().x,1);input.destroy();
});
test('held interaction key does not queue an action after modal closes',()=>{
 const {input,key}=setup();key('keydown','Enter');assert.equal(input.consumeInteract(),true);
 input.clear();key('keydown','Enter');assert.equal(input.consumeInteract(),false);
 key('keyup','Enter');key('keydown','Enter');assert.equal(input.consumeInteract(),true);input.destroy();
});
test('touch direction is released on modal lock and stays released without new pointerdown',()=>{
 const {input}=setup();input.touch.set(1,'up');assert.equal(input.getVector().y,-1);
 input.clear();assert.equal(input.getVector().y,0);input.destroy();
});
