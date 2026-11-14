/** Isolated G3b prologue state machine. No storage, engine or live-team writes. */
import {createStarterEgg,validateStarterSpecies,validateStarterEgg,prepareStarterAssignment,validateStoryTeam} from '../pokemon/StarterDomain.js';
export const PROLOGUE_EVENTS=Object.freeze([
 'story.prologue.birthday.begin','story.prologue.birthday.wish-selected','story.prologue.birthday.egg-gift',
 'story.prologue.rift.appearance','story.prologue.rift.giratina-seals','story.prologue.rival.absol-partnered',
 'story.prologue.professor.invitation','story.prologue.professor.shiny-caterpie-discovered',
 'story.prologue.professor.battle-demonstrated','story.prologue.professor.shiny-caterpie-caught',
 'story.prologue.professor.expedition-completed','story.prologue.route1.first-entry']);
const E=PROLOGUE_EVENTS;
const clone=x=>structuredClone(x);
const fail=(reason)=>({status:'blocked',reason});
const steps=[null,'birthday.wishId','birthday.completed','rift.appearanceSeen','rift.introResolved','rival.absolPartnered','professor.expeditionAccepted','professor.shinyCaterpieDiscovered','professor.battleDemonstrated','professor.shinyCaterpieCaught','professor.expeditionCompleted','route1.starterHatched'];
const get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
const set=(o,path,value)=>{const keys=path.split('.');let x=o;for(const k of keys.slice(0,-1))x=x[k];x[keys.at(-1)]=value;};
const allPrior=(s,i)=>steps.slice(1,i).every(p=>Boolean(get(s,p)));
const validContext=(snapshot,context)=>snapshot?.schemaVersion===2&&snapshot?.mode==='story'&&[1,2,3].includes(snapshot.slotId)&&context?.mode==='story'&&context.slotId===snapshot.slotId&&typeof context.sessionEpoch==='string'&&context.sessionEpoch.length>0&&context.sessionEpoch===context.activeSessionEpoch&&context.locked!==true&&context.battleActive!==true;
export function createInitialStoryState(){return {birthday:{completed:false,wishId:null},starterEgg:{eggId:null,speciesId:null,pokemonInstanceId:null,ownership:null,received:false,hatchStatus:'not-received',receivedAtEventId:null,hatchedAtEventId:null},rift:{appearanceSeen:false,introResolved:false},rival:{absolPartnered:false},professor:{expeditionAccepted:false,shinyCaterpieDiscovered:false,battleDemonstrated:false,shinyCaterpieCaught:false,expeditionCompleted:false},route1:{starterHatched:false}};}
/** Strict complete-state validation. Throws on invalid state; G2a adapter should return true only on success. */
export function validateStoryState(snapshot,{registry,policy,ownedIds=[],eggIds=[]}={}){
 const s=snapshot?.story,t=snapshot?.team;if(!s||!t)throw Error('INVALID_STATE');
 if(typeof s.birthday?.completed!=='boolean'||!(s.birthday.wishId===null||typeof s.birthday.wishId==='string'))throw Error('INVALID_STATE');
 if(s.birthday.wishId!==null)validateStarterSpecies(s.birthday.wishId,{registry,policy});
 validateStarterEgg({egg:s.starterEgg,wishId:s.birthday.wishId,registry,policy,ownedIds,eggIds});
 validateStoryTeam(t,registry,{ownedIds});
 for(const p of steps.slice(2)){if(typeof get(s,p)!=='boolean')throw Error('INVALID_STATE');}
 if(s.birthday.completed!==s.starterEgg.received)throw Error('INVALID_STATE');
 for(let i=3;i<steps.length;i++)if(get(s,steps[i])&&!allPrior(s,i))throw Error('INVALID_STATE');
 const hatched=s.route1.starterHatched;
 if(hatched!==(s.starterEgg.hatchStatus==='hatched')||hatched!==t.starterAssigned)throw Error('INVALID_STATE');
 if(hatched&&!allPrior(s,11))throw Error('INVALID_STATE');
 return true;
}
/** Monotonic story-only validation for G2a transition adapter. */
export function validateStoryTransition(before,after,{registry,policy,ownedIds=[],eggIds=[]}={}){
 validateStoryState(before,{registry,policy,ownedIds,eggIds});validateStoryState(after,{registry,policy,ownedIds,eggIds});
 const a=before.story,b=after.story;
 for(const p of steps.slice(2))if(get(a,p)&&!get(b,p))return false;
 if(a.birthday.wishId!==null&&a.birthday.wishId!==b.birthday.wishId)return false;
 if(a.starterEgg.received){for(const k of ['eggId','speciesId','pokemonInstanceId','ownership','receivedAtEventId'])if(a.starterEgg[k]!==b.starterEgg[k])return false;}
 return true;
}
export function canEnterRoute1(snapshot,context,deps={}){
 if(!validContext(snapshot,context))return fail('SESSION_OR_LOCK');
 try{validateStoryState(snapshot,deps);}catch{return fail('INVALID_STATE');}
 const s=snapshot.story;
 if(!allPrior(s,11))return fail('PROLOGUE_INCOMPLETE');
 if(s.route1.starterHatched)return {status:'already-hatched'};
 if(s.starterEgg.hatchStatus!=='unhatched')return fail('INVALID_EGG');
 if(snapshot.team.members.length>=6)return fail('TEAM_FULL');
 return {status:'ready'};
}
/** Must be invoked only with portal metadata supplied by a validating world adapter. */
export function validateRoute1Entry(event,context){return event?.eventId===E[11]&&event?.mode==='story'&&event?.slotId===context?.slotId&&event?.fromMapId==='mu-start-village'&&event?.mapId==='mu-route-1'&&event?.transitionId==='tr-village-route1'&&event?.spawnId==='route1-village-entry'&&event?.validated===true&&event?.source==='portal'&&typeof event.transitionToken==='string'&&event.transitionToken.length>0&&event?.sessionEpoch===context?.sessionEpoch;}
/** All outputs are detached candidates. Caller commits one entire snapshot with G2a, then rebinds. */
export class StoryController {
 constructor({registry,policy,reserveIds,starterParameters,ownedIds=[],eggIds=[]}={}){this.deps={registry,policy,ownedIds,eggIds};this.reserveIds=reserveIds;this.starterParameters=starterParameters;this.tokens=new Set();}
 onEggWishSelected(speciesId,snapshot,context){
  if(!validContext(snapshot,context))return fail('SESSION_OR_LOCK');
  try{validateStoryState(snapshot,this.deps);validateStarterSpecies(speciesId,this.deps);}catch(e){return fail(e.code||'INVALID_SPECIES');}
  const s=snapshot.story;
  if(s.birthday.wishId!==null)return s.birthday.wishId===speciesId?{status:'already-selected',snapshot:clone(snapshot)}:fail('WISH_LOCKED');
  const next=clone(snapshot);next.story.birthday.wishId=speciesId;
  return {status:'prepared',eventId:E[1],snapshot:next};
 }
 handleStoryEvent(event,snapshot,context){
  const i=E.indexOf(event?.eventId);if(i<0)return fail('UNKNOWN_EVENT');
  if(!validContext(snapshot,context)||event?.mode!=='story'||event.slotId!==context.slotId||event.sessionEpoch!==context.sessionEpoch)return fail('SESSION_OR_LOCK');
  try{validateStoryState(snapshot,this.deps);}catch{return fail('INVALID_STATE');}
  if(i===0)return event.mapId==='mu-breeder-house'&&!snapshot.story.birthday.completed?{status:'scene',eventId:E[0]}:fail('INVALID_START');
  if(i===1)return this.onEggWishSelected(event.speciesId,snapshot,context);
  if(i===11){
   if(!validateRoute1Entry(event,context))return fail('INVALID_TRANSITION');
   const gate=canEnterRoute1(snapshot,context,this.deps);
   if(gate.status==='already-hatched')return gate;
   if(gate.status!=='ready')return gate;
   const token=`${context.slotId}:${context.sessionEpoch}:${event.transitionToken}`;
   if(this.tokens.has(token))return fail('DUPLICATE_TRANSITION');
   if(!event.targetLocation||event.targetLocation.mapId!=='mu-route-1')return fail('INVALID_LOCATION');
   try{
    const assigned=prepareStarterAssignment({teamSave:snapshot.team,egg:snapshot.story.starterEgg,wishId:snapshot.story.birthday.wishId,...this.deps,starterParameters:this.starterParameters});
    if(assigned.status!=='prepared')return fail('INVALID_STATE');
    const next=clone(snapshot);next.team=assigned.teamSave;next.story.starterEgg=assigned.egg;next.story.route1.starterHatched=true;next.location=clone(event.targetLocation);
    if(!validateStoryTransition(snapshot,next,this.deps))return fail('INVALID_STATE');
    this.tokens.add(token);return {status:'prepared',eventId:E[i],snapshot:next,transitionToken:event.transitionToken};
   }catch(e){return fail(e.code||'HATCH_PREPARATION_FAILED');}
  }
  if(get(snapshot.story,steps[i]))return {status:'already-completed',eventId:E[i],snapshot:clone(snapshot)};
  if(!allPrior(snapshot.story,i))return fail('OUT_OF_ORDER');
  if(i===2){
   if(!snapshot.story.birthday.wishId)return fail('WISH_REQUIRED');
   if(event.mapId!=='mu-breeder-house')return fail('INVALID_LOCATION');
   try{if(typeof this.reserveIds!=='function')return fail('IDS_UNAVAILABLE');const ids=this.reserveIds();const egg=createStarterEgg({speciesId:snapshot.story.birthday.wishId,...this.deps,ids});const next=clone(snapshot);next.story.starterEgg=egg;next.story.birthday.completed=true;return {status:'prepared',eventId:E[i],snapshot:next};}catch(e){return fail(e.code||'INVALID_EGG');}
  }
  if(i===6&&event.voluntary!==true)return fail('INVITATION_NOT_ACCEPTED');
  if(i===9&&event.caughtBy!=='professor')return fail('PROFESSOR_CATCH_REQUIRED');
  if(i===10&&event.safeReturn!==true)return fail('SAFE_RETURN_REQUIRED');
  if(event.sceneCompleted!==true)return fail('SCENE_NOT_COMPLETED');
  const next=clone(snapshot);set(next.story,steps[i],true);
  return {status:'prepared',eventId:E[i],snapshot:next};
 }
 /** A failed commit discards the candidate; after uncertainty, integrator must recover before retry. */
 resetTransitionTokens(){this.tokens.clear();}
}
