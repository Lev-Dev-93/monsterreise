/** Optional presentation-only fullscreen controller. No game/input state changes. */
export class Fullscreen {
 constructor({root,button,doc=document,win=window}){
  this.root=root;this.button=button;this.doc=doc;this.win=win;this.fallback=false;
  this.onChange=()=>this.sync();
  this.onClick=()=>{void this.toggle()};
  this.onKey=e=>{if(e.key==='Escape'&&this.fallback)this.disableFallback()};
  button.addEventListener('click',this.onClick);
  doc.addEventListener('fullscreenchange',this.onChange);
  doc.addEventListener('fullscreenerror',this.onChange);
  doc.addEventListener('keydown',this.onKey);
  this.sync();
 }
 get active(){return this.doc.fullscreenElement===this.root||this.fallback}
 sync(){
  const active=this.active;
  this.root.classList.toggle('display-expanded',active);
  this.button.setAttribute('aria-pressed',String(active));
  this.button.setAttribute('aria-label',active?'Vollbilddarstellung beenden':'Vollbilddarstellung einschalten');
  this.button.title=active?'Vollbilddarstellung beenden':'Vollbilddarstellung einschalten';
  this.button.querySelector('[data-fullscreen-icon]').textContent=active?'⤢':'⛶';
 }
 enableFallback(){this.fallback=true;this.root.classList.add('display-fallback');this.sync()}
 disableFallback(){this.fallback=false;this.root.classList.remove('display-fallback');this.sync()}
 async toggle(){
  if(this.fallback){this.disableFallback();return}
  if(this.doc.fullscreenElement===this.root){
   try{await this.doc.exitFullscreen()}catch{this.sync()}
   return;
  }
  // iPhone Safari does not offer the standard element fullscreen API.
  if(typeof this.root.requestFullscreen==='function'){
   try{await this.root.requestFullscreen();this.sync();return}catch{/* rejected or unsupported: use honest layout fallback */}
  }
  this.enableFallback();
 }
 destroy(){this.button.removeEventListener('click',this.onClick);this.doc.removeEventListener('fullscreenchange',this.onChange);this.doc.removeEventListener('fullscreenerror',this.onChange);this.doc.removeEventListener('keydown',this.onKey);this.disableFallback()}
}
