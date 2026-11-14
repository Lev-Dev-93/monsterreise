export const STORY_PREFIX='monsterreise.story.v1.slot.';
export const STORY_VERSION=2;
export const MAX_BYTES=1048576;
export const slotKey=slot=>{if(!Number.isInteger(slot)||slot<1||slot>3)throw new RangeError('slotId must be 1..3');return STORY_PREFIX+slot;};
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const keys=(v,expected)=>plain(v)&&Object.keys(v).length===expected.length&&expected.every(k=>Object.hasOwn(v,k));
const bool=v=>typeof v==='boolean';
const id=v=>typeof v==='string'&&v.length>0&&v.length<=64;
const nullableId=v=>v===null||id(v);
const flags=(v,names)=>keys(v,names)&&names.every(n=>bool(v[n]));
const eventGift='story.prologue.birthday.egg-gift',eventHatch='story.prologue.route1.first-entry';
const error=reason=>({ok:false,reason});
export function validateStructure(v,slot){
 if(!keys(v,['schemaVersion','mode','slotId','revision','commitId','savedAt','team','location','story']))return error('INVALID_STATE');
 if(v.schemaVersion!==2)return error(Number.isInteger(v.schemaVersion)&&v.schemaVersion>2?'UNSUPPORTED_VERSION':'INVALID_STATE');
 if(v.mode!=='story'||v.slotId!==slot||!Number.isSafeInteger(v.revision)||v.revision<0||!id(v.commitId)||typeof v.savedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v.savedAt)||!Number.isFinite(Date.parse(v.savedAt)))return error('INVALID_STATE');
 const t=v.team,l=v.location,s=v.story;
 if(!keys(t,['starterAssigned','members','battleSync'])||!bool(t.starterAssigned)||!Array.isArray(t.members)||t.members.length>6||!plain(t.battleSync)||!keys(t.battleSync,['revisions','consumed'])||!plain(t.battleSync.revisions)||!Array.isArray(t.battleSync.consumed))return error('INVALID_STATE');
 if(!keys(l,['mapId','x','y','facing','returnPositions'])||!id(l.mapId)||!Number.isFinite(l.x)||!Number.isFinite(l.y)||!['up','down','left','right'].includes(l.facing)||!Array.isArray(l.returnPositions)||l.returnPositions.length>16||!l.returnPositions.every(p=>keys(p,['mapId','x','y'])&&id(p.mapId)&&Number.isFinite(p.x)&&Number.isFinite(p.y)))return error('INVALID_LOCATION');
 if(!keys(s,['birthday','starterEgg','rift','rival','professor','route1'])||!keys(s.birthday,['completed','wishId'])||!bool(s.birthday.completed)||!nullableId(s.birthday.wishId)||!flags(s.rift,['appearanceSeen','introResolved'])||!flags(s.rival,['absolPartnered'])||!flags(s.professor,['expeditionAccepted','shinyCaterpieDiscovered','battleDemonstrated','shinyCaterpieCaught','expeditionCompleted'])||!flags(s.route1,['starterHatched']))return error('INVALID_STATE');
 const e=s.starterEgg;
 if(!keys(e,['eggId','speciesId','pokemonInstanceId','ownership','received','hatchStatus','receivedAtEventId','hatchedAtEventId'])||!['not-received','unhatched','hatched'].includes(e.hatchStatus)||!bool(e.received)||!['player',null].includes(e.ownership)||!['eggId','speciesId','pokemonInstanceId','receivedAtEventId','hatchedAtEventId'].every(k=>nullableId(e[k])))return error('INVALID_EGG');
 if(!e.received){if(e.hatchStatus!=='not-received'||[e.eggId,e.speciesId,e.pokemonInstanceId,e.ownership,e.receivedAtEventId,e.hatchedAtEventId].some(x=>x!==null)||s.birthday.completed)return error('INVALID_EGG');}
 else if(!s.birthday.completed||!id(s.birthday.wishId)||!id(e.eggId)||!id(e.speciesId)||!id(e.pokemonInstanceId)||e.ownership!=='player'||e.receivedAtEventId!==eventGift||e.hatchStatus==='not-received')return error('INVALID_EGG');
 const hatched=s.route1.starterHatched;
 if(hatched!==t.starterAssigned||hatched!==(e.hatchStatus==='hatched')||e.hatchedAtEventId!==(hatched?eventHatch:null))return error('INVALID_STATE');
 if(s.rift.appearanceSeen&&!s.birthday.completed||s.rift.introResolved&&!s.rift.appearanceSeen||s.rival.absolPartnered&&(!s.rift.appearanceSeen||!s.birthday.completed))return error('INVALID_STATE');
 const p=s.professor;
 if(p.expeditionAccepted&&(!s.rift.introResolved||!s.rival.absolPartnered)||p.shinyCaterpieDiscovered&&!p.expeditionAccepted||p.battleDemonstrated&&!p.shinyCaterpieDiscovered||p.shinyCaterpieCaught&&!p.battleDemonstrated||p.expeditionCompleted&&!p.shinyCaterpieCaught||hatched&&!p.expeditionCompleted)return error('INVALID_STATE');
 return {ok:true};
}
export function validateMonotonic(before,after){
 const paths=['birthday.completed','rift.appearanceSeen','rift.introResolved','rival.absolPartnered','professor.expeditionAccepted','professor.shinyCaterpieDiscovered','professor.battleDemonstrated','professor.shinyCaterpieCaught','professor.expeditionCompleted','route1.starterHatched','starterEgg.received'];
 const get=(s,path)=>path.split('.').reduce((o,k)=>o[k],s.story);
 if(paths.some(p=>get(before,p)&&!get(after,p)))return error('INVALID_STATE');
 for(const path of ['birthday.wishId','starterEgg.eggId','starterEgg.speciesId','starterEgg.pokemonInstanceId']){const old=get(before,path);if(old!==null&&old!==get(after,path))return error('INVALID_STATE');}
 if(before.team.starterAssigned&&!after.team.starterAssigned)return error('INVALID_STATE');
 return {ok:true};
}
export function parseSnapshot(raw,slot){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_BYTES)return {ok:false,reason:'CORRUPT_SAVE'};
 let snapshot;try{snapshot=JSON.parse(raw);}catch{return error('CORRUPT_SAVE');}
 const valid=validateStructure(snapshot,slot);return valid.ok?{ok:true,snapshot}:valid;
}
