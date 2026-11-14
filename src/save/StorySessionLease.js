import {slotKey} from './StorySaveValidation.js';

export const leaseName = slotId => `${slotKey(slotId)}session-lease`;
const failure = reason => ({status:'error',reason});
/** Web Locks request adapter; lease is held until release(), not merely until acquisition. */
export function createWebSessionLeaseAdapter(locks = globalThis.navigator?.locks) {
  return {
    async acquire(name, onLost) {
      if (typeof locks?.request !== 'function') return null;
      let signalAcquired, signalDone;
      const acquired = new Promise(resolve => { signalAcquired = resolve; });
      const done = new Promise(resolve => { signalDone = resolve; });
      let granted = false, closed = false, deliberate = false;
      let request;
      try {
        request = Promise.resolve(locks.request(name, {mode:'exclusive',ifAvailable:true}, async lock => {
          if (!lock) { signalAcquired(false); return; }
          granted = true;
          signalAcquired(true);
          await done;
        }));
      } catch { return null; }
      request.catch(() => { signalAcquired(false); }).finally(() => {
        if (granted && !deliberate) onLost?.();
        closed = true;
      });
      if (!await acquired) { signalDone(); return null; }
      return {
        get held() { return granted && !closed && !deliberate; },
        async release() { if (deliberate) return; deliberate = true; signalDone(); await request.catch(()=>{}); }
      };
    }
  };
}

/** Isolated coordinator: never mutates Game, Team, UI or DOM. */
export class StorySessionLease {
  constructor({save, leaseAdapter, epochIds, operationIds} = {}) {
    this.save = save; this.leaseAdapter = leaseAdapter;
    this.epochIds = epochIds; this.operationIds = operationIds;
    this.active = null; this.busy = false; this.sequence = 0;
  }
  get state() { return this.active ? {slotId:this.active.slotId,epoch:this.active.epoch,revision:this.active.snapshot?.revision,commitId:this.active.snapshot?.commitId,phase:this.active.phase} : null; }
  _ticketValid(ticket, allowBlocked=false) {
    const a=this.active;
    return !!(a && a.phase!=='lost' && (allowBlocked || a.phase==='ready') && a.lease.held && ticket?.mode==='story' && ticket.slotId===a.slotId && ticket.sessionEpoch===a.epoch && ticket.generation===a.generation && ticket.revision===a.snapshot?.revision && ticket.commitId===a.snapshot?.commitId);
  }
  ticket() {
    if (!this.active || this.active.phase!=='ready' || !this.active.lease.held) return null;
    const a=this.active;
    return Object.freeze({mode:'story',slotId:a.slotId,sessionEpoch:a.epoch,generation:a.generation,revision:a.snapshot.revision,commitId:a.snapshot.commitId,operationId:this.operationIds?.() ?? `op-${++this.sequence}`});
  }
  verify(ticket) { return this._ticketValid(ticket); }
  /** One-use rebind authorization after confirmed persistence. */
  verifyRebind(ticket) { return this._ticketValid(ticket,true) && this.active.phase==='awaiting-rebind'; }
  confirmRebind(ticket) { if(!this.verifyRebind(ticket))return failure('SESSION_CONFLICT');this.active.phase='ready';return {status:'ready',ticket:this.ticket()}; }
  _lost(record) { if(this.active===record) {record.phase='lost';record.generation++;} }
  async _prepare(slotId, createInitial) {
    slotKey(slotId);
    if(typeof this.epochIds!=='function'||!this.leaseAdapter?.acquire||!this.save) return failure('LOCK_UNAVAILABLE');
    const record={slotId,epoch:this.epochIds(),generation:++this.sequence,phase:'opening',lease:null,snapshot:null};
    try {record.lease=await this.leaseAdapter.acquire(leaseName(slotId),()=>this._lost(record));} catch {return failure('LOCK_UNAVAILABLE');}
    if(!record.lease?.held) return failure('LOCK_UNAVAILABLE');
    let loaded;
    try {
      loaded=await this.save.load(slotId);
      if(loaded.status==='empty' && createInitial!==undefined) {
        const created=await this.save.create(slotId,createInitial);
        if(created.status==='committed') loaded={status:'ok',snapshot:created.snapshot};
        else loaded={status:'error',reason:created.reason??'COMMIT_UNCERTAIN'};
      }
    } catch {loaded=failure('STORAGE_UNAVAILABLE');}
    if(!record.lease.held || record.phase==='lost') {await record.lease.release();return failure('LOCK_UNAVAILABLE');}
    if(loaded.status!=='ok') {await record.lease.release();return failure(loaded.reason??(loaded.status==='empty'?'SLOT_NOT_FOUND':'INVALID_STATE'));}
    record.snapshot=structuredClone(loaded.snapshot); record.phase='ready';
    return {status:'ready',record,snapshot:structuredClone(record.snapshot)};
  }
  async open(slotId,{initial}={}) {
    if(this.active||this.busy)return failure('SESSION_CONFLICT');
    this.busy=true;
    try {const prepared=await this._prepare(slotId,initial);if(prepared.status!=='ready')return prepared;this.active=prepared.record;return {status:'ready',ticket:this.ticket(),snapshot:prepared.snapshot};}
    finally {this.busy=false;}
  }
  async close() {
    if(this.busy)return failure('SESSION_CONFLICT');
    if(!this.active)return {status:'closed'};
    this.busy=true;
    const old=this.active;old.phase='closing';old.generation++;this.active=null;
    try {await old.lease.release();return {status:'closed'};}
    finally {this.busy=false;}
  }
  /** prepare -> caller's synchronous atomic rebind -> activate -> release old lease. */
  async switchSlot(slotId,{rebind}={}) {
    if(this.busy||!this.active||this.active.phase!=='ready'||!this.active.lease.held||typeof rebind!=='function')return failure('SESSION_CONFLICT');
    if(this.active.slotId===slotId)return failure('SESSION_CONFLICT');
    this.busy=true;
    const previous=this.active;
    try {
      const prepared=await this._prepare(slotId);
      if(prepared.status!=='ready')return prepared;
      if(previous!==this.active||!previous.lease.held||previous.phase!=='ready') {await prepared.record.lease.release();return failure('SESSION_CONFLICT');}
      try {const result=rebind(structuredClone(prepared.snapshot));if(result && typeof result.then==='function')throw new TypeError('rebind must be synchronous');}
      catch {await prepared.record.lease.release();return failure('REBIND_FAILED');}
      previous.phase='closing';previous.generation++;
      this.active=prepared.record;
      await previous.lease.release();
      return {status:'ready',ticket:this.ticket(),snapshot:structuredClone(prepared.snapshot)};
    } finally {this.busy=false;}
  }
  async commit(ticket,next,reason) {
    if(this.busy||!this._ticketValid(ticket))return {status:'not-committed',reason:'SESSION_CONFLICT'};
    this.busy=true;
    const record=this.active;
    try {
      const result=await this.save.commit({slotId:ticket.slotId,expectedRevision:ticket.revision,expectedCommitId:ticket.commitId,sessionEpoch:ticket.sessionEpoch,next:structuredClone(next),reason});
      if(record!==this.active||!record.lease.held||record.phase==='lost') {this._lost(record);return {status:'uncertain',reason:'LOCK_UNAVAILABLE'};}
      if(result.status==='committed') {
        record.snapshot=structuredClone(result.snapshot);
        record.generation++;record.phase='awaiting-rebind';
        return { ...result, ticket:this._rebindTicket(record) };
      }
      if(result.status==='uncertain') record.phase='uncertain';
      return result;
    } catch {record.phase='uncertain';return {status:'uncertain',reason:'COMMIT_UNCERTAIN'};}
    finally {this.busy=false;}
  }
  _rebindTicket(record) {return Object.freeze({mode:'story',slotId:record.slotId,sessionEpoch:record.epoch,generation:record.generation,revision:record.snapshot.revision,commitId:record.snapshot.commitId,operationId:this.operationIds?.() ?? `op-${++this.sequence}`});}
  async recover() {
    const record=this.active;
    if(this.busy||!record||record.phase!=='uncertain'||!record.lease.held)return failure('SESSION_CONFLICT');
    this.busy=true;
    try {
      const result=await this.save.recover(record.slotId);
      if(record!==this.active||!record.lease.held||record.phase==='lost') {this._lost(record);return {status:'uncertain',reason:'LOCK_UNAVAILABLE'};}
      if(result.status==='committed') {record.snapshot=structuredClone(result.snapshot);record.generation++;record.phase='awaiting-rebind';return {...result,ticket:this._rebindTicket(record)};}
      if(result.status==='not-committed') {record.phase='ready';return {...result,ticket:this.ticket()};}
      return result;
    } catch {return {status:'uncertain',reason:'COMMIT_UNCERTAIN'};}
    finally {this.busy=false;}
  }
}
