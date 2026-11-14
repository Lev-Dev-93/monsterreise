import {STORY_PREFIX,MAX_BYTES,slotKey,validateStructure,validateMonotonic,parseSnapshot} from './StorySaveValidation.js';
const reject=reason=>({status:'not-committed',reason});
const safeJson=v=>{try{return JSON.stringify(v);}catch{return null;}};
/** Lock adapter contract: runExclusive(name, callback) -> callback result, or null if unavailable. */
export function createWebLockAdapter(locks=globalThis.navigator?.locks){return {async runExclusive(name,callback){if(!locks?.request)return null;return locks.request(name,{mode:'exclusive',ifAvailable:true},lock=>lock?callback():null);}};}
export class StorySaveSystem {
 constructor({storage,locks,clock,ids,validators,sessionEpoch}={}){
  this.storage=storage;this.locks=locks;this.clock=clock;this.ids=ids;this.validators=validators;this.sessionEpoch=sessionEpoch;
  this.uncertain=new Map();
 }
 key(slot){return slotKey(slot);}
 _ready(){return !!(this.storage?.getItem&&this.storage?.setItem&&this.locks?.runExclusive&&typeof this.clock==='function'&&typeof this.ids==='function'&&typeof this.validators?.team==='function'&&typeof this.validators?.story==='function'&&typeof this.validators?.location==='function'&&typeof this.validators?.transition==='function');}
 async validateSnapshot(snapshot,slot=snapshot?.slotId){const structural=validateStructure(snapshot,slot);if(!structural.ok)return structural;if(!this._ready())return {ok:false,reason:'VALIDATOR_UNAVAILABLE'};
  for(const [name,fn] of [['team',this.validators.team],['story',this.validators.story],['location',this.validators.location]]){try{if(await fn(structuredClone(snapshot))!==true)return {ok:false,reason:name==='location'?'INVALID_LOCATION':'INVALID_STATE'};}catch{return {ok:false,reason:'VALIDATOR_UNAVAILABLE'};}}
  return {ok:true};
 }
 async validateTransition(before,after,reason){const check=validateMonotonic(before,after);if(!check.ok)return check;if(!this._ready())return {ok:false,reason:'VALIDATOR_UNAVAILABLE'};try{return await this.validators.transition(structuredClone(before),structuredClone(after),reason)===true?{ok:true}:{ok:false,reason:'INVALID_STATE'};}catch{return {ok:false,reason:'VALIDATOR_UNAVAILABLE'};}}
 async _read(slot){let raw;try{raw=this.storage.getItem(this.key(slot));}catch{return {ok:false,reason:'STORAGE_UNAVAILABLE'};}if(raw===null)return {ok:false,reason:'SLOT_NOT_FOUND',raw:null};const parsed=parseSnapshot(raw,slot);if(!parsed.ok)return {...parsed,raw};const valid=await this.validateSnapshot(parsed.snapshot,slot);return valid.ok?{ok:true,raw,snapshot:parsed.snapshot}:{...valid,raw};}
 async load(slot){this.key(slot);const r=await this._read(slot);return r.ok?{status:'ok',snapshot:structuredClone(r.snapshot)}:r.reason==='SLOT_NOT_FOUND'?{status:'empty'}:{status:'error',reason:r.reason};}
 async listSlots(){const result=[];for(let slotId=1;slotId<=3;slotId++){const r=await this.load(slotId);result.push({slotId,status:r.status, ...(r.status==='ok'?{revision:r.snapshot.revision,commitId:r.snapshot.commitId,savedAt:r.snapshot.savedAt}:r.status==='error'?{reason:r.reason}:{})});}return result;}
 async _exclusive(slot,fn){if(!this.locks?.runExclusive)return reject('LOCK_UNAVAILABLE');if(!this._ready())return reject('VALIDATOR_UNAVAILABLE');try{const value=await this.locks.runExclusive(this.key(slot),fn);return value===null?reject('LOCK_UNAVAILABLE'):value;}catch{return reject('LOCK_UNAVAILABLE');}}
 _stamp(next,slot,revision){let commitId,savedAt;try{commitId=this.ids();savedAt=this.clock();}catch{return null;}return {...structuredClone(next),slotId:slot,schemaVersion:2,mode:'story',revision,commitId,savedAt};}
 async create(slot,initial){this.key(slot);if(this.uncertain.has(slot))return {status:'uncertain',reason:'COMMIT_UNCERTAIN'};return this._exclusive(slot,async()=>{
  const old=await this._read(slot);if(old.ok||old.reason!=='SLOT_NOT_FOUND')return reject(old.ok?'SLOT_OCCUPIED':old.reason);
  const candidate=this._stamp(initial,slot,0);if(!candidate)return reject('INVALID_STATE');return this._write(slot,candidate,null);
 });}
 async commit({slotId,expectedRevision,expectedCommitId,sessionEpoch,next,reason}={}){this.key(slotId);if(this.uncertain.has(slotId))return {status:'uncertain',reason:'COMMIT_UNCERTAIN'};if(typeof sessionEpoch!=='string'||sessionEpoch!==this.sessionEpoch?.())return reject('SESSION_CONFLICT');if(!['story-event','hatch','manual-save'].includes(reason))return reject('INVALID_STATE');
 return this._exclusive(slotId,async()=>{
  if(sessionEpoch!==this.sessionEpoch?.())return reject('SESSION_CONFLICT');const old=await this._read(slotId);if(!old.ok)return reject(old.reason);
  if(old.snapshot.revision!==expectedRevision||old.snapshot.commitId!==expectedCommitId)return reject('REVISION_CONFLICT');
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision===Number.MAX_SAFE_INTEGER)return reject('INVALID_STATE');
  const candidate=this._stamp(next,slotId,expectedRevision+1);if(!candidate)return reject('INVALID_STATE');
  const transition=await this.validateTransition(old.snapshot,candidate,reason);if(!transition.ok)return reject(transition.reason);
  if(sessionEpoch!==this.sessionEpoch?.())return reject('SESSION_CONFLICT');
  return this._write(slotId,candidate,old.raw);
 });}
 async _write(slot,candidate,oldRaw){const valid=await this.validateSnapshot(candidate,slot);if(!valid.ok)return reject(valid.reason);
  const payload=safeJson(candidate);if(payload===null||new TextEncoder().encode(payload).length>MAX_BYTES)return reject('INVALID_STATE');
  try{this.storage.setItem(this.key(slot),payload);}catch{/* Readback determines actual result. */}
  let actual;try{actual=this.storage.getItem(this.key(slot));}catch{return this._markUncertain(slot,candidate,oldRaw,'STORAGE_UNAVAILABLE');}
  if(actual===payload){const parsed=parseSnapshot(actual,slot);if(parsed.ok&&(await this.validateSnapshot(parsed.snapshot,slot)).ok)return {status:'committed',slotId:slot,revision:candidate.revision,commitId:candidate.commitId,snapshot:structuredClone(parsed.snapshot)};}
  if(actual===oldRaw)return reject('STORAGE_WRITE_FAILED');
  return this._markUncertain(slot,candidate,oldRaw,'READBACK_MISMATCH');
 }
 _markUncertain(slot,candidate,oldRaw,reason){this.uncertain.set(slot,{candidate:structuredClone(candidate),oldRaw});return {status:'uncertain',reason};}
 async recover(slot){this.key(slot);const pending=this.uncertain.get(slot);if(!pending)return {status:'error',reason:'NO_PENDING_RECOVERY'};
 return this._exclusive(slot,async()=>{const r=await this._read(slot);if(!r.ok)return {status:'uncertain',reason:r.reason};const candidateRaw=safeJson(pending.candidate);
  if(r.raw===candidateRaw){this.uncertain.delete(slot);return {status:'committed',slotId:slot,revision:r.snapshot.revision,commitId:r.snapshot.commitId,snapshot:structuredClone(r.snapshot)};}
  if(r.raw===pending.oldRaw){this.uncertain.delete(slot);return reject('STORAGE_WRITE_FAILED');}
  return {status:'uncertain',reason:'REVISION_CONFLICT'};
 });}
}
export {STORY_PREFIX};
