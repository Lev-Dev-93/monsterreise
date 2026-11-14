/** Isolated G4b adapter. The host owns all concrete live references and synchronous rebind. */
export class StoryEngineCoordinator {
 #gate;#lease;#tickets;#portal;#battle;#bindings;#fault=null;
 constructor({gate,lease,tickets,portal,battleLock,bindings}){
  if(!gate||!lease||!tickets||!portal||typeof bindings?.prepare!=='function'||typeof bindings?.apply!=='function'||typeof bindings?.restore!=='function')throw TypeError('Complete bindings required');
  this.#gate=gate;this.#lease=lease;this.#tickets=tickets;this.#portal=portal;this.#battle=battleLock;this.#bindings=bindings;
 }
 get fault(){return this.#fault;}
 #stop(reason){this.#fault??=this.#gate.acquire('recovery');return {status:'blocked',reason};}
 #ready(){return !this.#fault&&this.#gate.canWorldAction(this.#battle)&&this.#lease.state?.phase==='ready';}
 /** Snapshot is supplied by StoryController/StarterDomain, validated by StorySaveSystem; no live mutation before commit. */
 async hatch({player,makeCandidate}){
  if(!this.#ready())return {status:'blocked',reason:'NOT_READY'};
  const preview=this.#portal.preview(player);if(preview.status!=='ready'||!preview.capability.route1)return {status:'blocked',reason:'INVALID_PORTAL'};
  const ticket=this.#tickets.issue();if(!ticket)return {status:'blocked',reason:'LOCK_UNAVAILABLE'};
  const lock=this.#gate.acquire('transition'),commitGate=this.#gate.acquire('story-commit');
  let persistent=false;
  try {
   if(!this.#tickets.verify(ticket)||this.#battle?.isBattleActive?.())return {status:'blocked',reason:'SESSION_CONFLICT'};
   const event=this.#portal.consumeForHatch(preview.capability,player);
   const candidate=await makeCandidate(event,ticket.leaseTicket);
   if(!this.#tickets.verify(ticket))return this.#stop('STALE_OPERATION');
   if(!candidate||candidate.status!=='ready')return candidate??{status:'blocked',reason:'INVALID_CANDIDATE'};
   const result=await this.#lease.commit(ticket.leaseTicket,candidate.snapshot,'hatch');
   if(result.status==='uncertain')return this.#stop('COMMIT_UNCERTAIN');
   if(result.status!=='committed')return result;
   persistent=true;
   if(!this.#lease.verifyRebind(result.ticket)||result.ticket.sessionEpoch!==ticket.leaseTicket.sessionEpoch||result.ticket.slotId!==ticket.leaseTicket.slotId)return this.#stop('STALE_REBIND');
   try {this.#rebind(result.snapshot,result.ticket);}catch{return this.#stop('REBIND_FAILED');}
   const confirmed=this.#lease.confirmRebind(result.ticket);
   if(confirmed.status!=='ready')return this.#stop('REBIND_CONFIRM_FAILED');
   return {status:'committed',snapshot:result.snapshot};
  } catch {return persistent?this.#stop('REBIND_FAILED'):{status:'blocked',reason:'OPERATION_FAILED'};}
  finally {this.#tickets.complete(ticket);this.#gate.release(commitGate);this.#gate.release(lock);}
 }
 #rebind(snapshot,ticket){
  if(!this.#lease.verifyRebind(ticket))throw Error('STALE_REBIND');
  const prepared=this.#bindings.prepare(structuredClone(snapshot));
  if(prepared&&typeof prepared.then==='function')throw TypeError('Synchronous preparation required');
  const backup=this.#bindings.capture?.();
  try {const result=this.#bindings.apply(prepared);if(result&&typeof result.then==='function')throw TypeError('Synchronous rebind required');}
  catch(error){try{this.#bindings.restore(backup);}catch{}throw error;}
 }
 async switchSlot(slotId){
  if(!this.#ready())return {status:'blocked',reason:'INTERACTION_LOCKED'};
  const gate=this.#gate.acquire('slot-switch');
  try {
   const result=await this.#lease.switchSlot(slotId,{rebind:snapshot=>{
    const prepared=this.#bindings.prepare(snapshot);
    if(prepared&&typeof prepared.then==='function')throw TypeError('Async prepare');
    const backup=this.#bindings.capture?.();
    try {const r=this.#bindings.apply(prepared);if(r&&typeof r.then==='function')throw TypeError('Async rebind');}
    catch(e){try{this.#bindings.restore(backup);}catch{}throw e;}
   }});
   if(result.status==='ready'){this.#tickets.invalidate();return result;}
   if(result.reason==='REBIND_FAILED'||this.#lease.state?.phase==='lost')return this.#stop(result.reason??'LOCK_UNAVAILABLE');
   return result;
  }catch{return this.#stop('SLOT_SWITCH_FAILED');}
  finally{this.#gate.release(gate);}
 }
 /** Does not clear a fault automatically: recovery must read/validate/rebind first. */
 async recover(){
  if(!this.#fault)return {status:'blocked',reason:'NOT_IN_RECOVERY'};
  const result=await this.#lease.recover();
  if(result.status==='committed'){
   try{this.#rebind(result.snapshot,result.ticket);if(this.#lease.confirmRebind(result.ticket).status!=='ready')throw Error('confirm');}
   catch{return {status:'blocked',reason:'REBIND_FAILED'};}
  }else if(result.status!=='not-committed')return result;
  this.#gate.release(this.#fault);this.#fault=null;this.#tickets.invalidate();return result;
 }
}
