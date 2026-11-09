const keys={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
export class Input {
 constructor(target=document,controls=document.querySelector('#controls')){this.target=target;this.controls=controls;this.keyDirs=new Map();this.touch=new Map();this.held=new Set();this.pointerActions=new Set();this.queued=false;
 this.onKeyDown=e=>{const k=e.key.toLowerCase();if(keys[k]){e.preventDefault();this.keyDirs.set(k,keys[k])}if(k==='enter'||k===' '){e.preventDefault();if(!this.held.has(k)){this.held.add(k);this.queued=true}}};
 this.onKeyUp=e=>{const k=e.key.toLowerCase();if(keys[k]){e.preventDefault();this.keyDirs.delete(k)}if(k==='enter'||k===' '){e.preventDefault();this.held.delete(k)}};
 this.onBlur=()=>this.clear();target.addEventListener('keydown',this.onKeyDown);target.addEventListener('keyup',this.onKeyUp);window.addEventListener('blur',this.onBlur);document.addEventListener('visibilitychange',this.onBlur);
 this.pointerButtons=new Map();
 this.onPointerDown=e=>{const b=e.target.closest?.('[data-dir],[data-action="interact"]');if(!b||!this.controls.contains(b))return;
 e.preventDefault();if(this.pointerButtons.has(e.pointerId))return;
 this.pointerButtons.set(e.pointerId,b);
 if(b.setPointerCapture){try{b.setPointerCapture(e.pointerId)}catch{ /* capture can fail if pointer ended */ }}
 if(b.dataset.action==='interact'){if(!this.pointerActions.size)this.queued=true;this.pointerActions.add(e.pointerId)}else this.touch.set(e.pointerId,b.dataset.dir);
 b.classList.add('active')};
 this.onPointerEnd=e=>{const b=this.pointerButtons.get(e.pointerId);if(!b)return;
 this.pointerButtons.delete(e.pointerId);this.touch.delete(e.pointerId);this.pointerActions.delete(e.pointerId);
 if(![...this.pointerButtons.values()].includes(b))b.classList.remove('active')};
 this.onSuppress=e=>{if(e.target.closest?.('[data-dir],[data-action="interact"]')&&this.controls.contains(e.target))e.preventDefault()};
 this.controls.addEventListener('pointerdown',this.onPointerDown);
 for(const k of ['pointerup','pointercancel','lostpointercapture'])this.controls.addEventListener(k,this.onPointerEnd);
 // Safari can initiate a callout/selection independently of Pointer Events.
 for(const k of ['contextmenu','selectstart','dragstart'])this.controls.addEventListener(k,this.onSuppress);
 this.onVisibility=()=>{if(document.hidden)this.clear()};
 document.removeEventListener('visibilitychange',this.onBlur);document.addEventListener('visibilitychange',this.onVisibility);
 }
 getVector(){const s=new Set([...this.keyDirs.values(),...this.touch.values()]);return{x:Number(s.has('right'))-Number(s.has('left')),y:Number(s.has('down'))-Number(s.has('up'))}}
 consumeInteract(){const v=this.queued;this.queued=false;return v}
 clear(){this.keyDirs.clear();this.touch.clear();this.held.clear();this.pointerActions.clear();this.pointerButtons.clear();this.queued=false;this.controls.querySelectorAll('button').forEach(b=>b.classList.remove('active'))}
 destroy(){this.target.removeEventListener('keydown',this.onKeyDown);this.target.removeEventListener('keyup',this.onKeyUp);window.removeEventListener('blur',this.onBlur);document.removeEventListener('visibilitychange',this.onVisibility);for(const k of ['contextmenu','selectstart','dragstart'])this.controls.removeEventListener(k,this.onSuppress);this.controls.removeEventListener('pointerdown',this.onPointerDown);for(const k of ['pointerup','pointercancel','lostpointercapture'])this.controls.removeEventListener(k,this.onPointerEnd)}
}
