import {restoreTeam} from '../pokemon/Team.js';
export const SAVE_VERSION = 1;
export const SAVE_PREFIX = 'monsterreise.v03.slot.';
const validSlot = slot => Number.isInteger(slot) && slot >= 1 && slot <= 3;
const FACINGS = new Set(['up','down','left','right']);
const validPoint = (point,maps,width,height) => {
  if (!point || typeof point !== 'object' || typeof point.mapId !== 'string' || !maps.has(point.mapId) ||
      !Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;
  return !maps.get(point.mapId).collidesRect(point.x,point.y,width,height);
};
/** Validate a world snapshot against the existing map collision contract. */
export function restoreLocation(snapshot,worldRegistry,{width=26,height=30}={}) {
  if (!worldRegistry?.has || !worldRegistry?.get) throw new TypeError('World registry required');
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot) ||
      !validPoint(snapshot,worldRegistry,width,height) || !FACINGS.has(snapshot.facing) ||
      !Array.isArray(snapshot.returnPositions) ||
      !snapshot.returnPositions.every(p=>validPoint(p,worldRegistry,width,height))) return null;
  // A return stack is meaningful only for a map entered via a return portal.
  if (snapshot.returnPositions.length > 16) return null;
  const map = worldRegistry.get(snapshot.mapId);
  const returnPortal = map.portals.some(p=>p.returnToPrevious);
  if (returnPortal && (snapshot.returnPositions.length === 0 ||
      !map.portals.some(p=>p.returnToPrevious && p.targetMap===snapshot.returnPositions.at(-1).mapId))) return null;
  if (!returnPortal && snapshot.returnPositions.length) return null;
  return {mapId:snapshot.mapId,x:snapshot.x,y:snapshot.y,facing:snapshot.facing,
    returnPositions:snapshot.returnPositions.map(p=>({mapId:p.mapId,x:p.x,y:p.y}))};
}
/** Fail closed for invalid team data; invalid location falls back without losing the team. */
export class SaveSystem {
  constructor({registry,storage=globalThis.localStorage,worldRegistry}={}) {
    if (!registry?.get || !storage?.getItem || !storage?.setItem) throw new TypeError('SaveSystem dependencies missing');
    this.registry=registry;this.storage=storage;this.worldRegistry=worldRegistry;
  }
  key(slot){if(!validSlot(slot))throw new RangeError('Speicherplatz muss 1–3 sein');return `${SAVE_PREFIX}${slot}`;}
  load(slot){
    const key=this.key(slot);let raw;
    try{raw=this.storage.getItem(key);}catch(error){return {status:'error',reason:'storage',error};}
    if(raw===null)return {status:'empty'};
    try{
      const data=JSON.parse(raw);
      if(!data || typeof data!=='object' || Array.isArray(data) || data.version!==SAVE_VERSION || !data.team)return {status:'incompatible'};
      const team=restoreTeam(data.team,this.registry);
      const hasLocation=Object.hasOwn(data,'location');
      const location=hasLocation && this.worldRegistry ? restoreLocation(data.location,this.worldRegistry) : null;
      return {status:'ok',team,location,locationStatus:!hasLocation?'legacy':location?'ok':'invalid'};
    }catch(error){return {status:'invalid',error};}
  }
  save(slot,team,location){
    const key=this.key(slot);
    const snapshot=team.toSaveData();restoreTeam(snapshot,this.registry);
    if(location!==undefined && (!this.worldRegistry || !restoreLocation(location,this.worldRegistry)))
      return {status:'error',reason:'location'};
    const payload=JSON.stringify({version:SAVE_VERSION,team:snapshot,...(location===undefined?{}:{location})});
    try{this.storage.setItem(key,payload);return {status:'ok'};}
    catch(error){return {status:'error',reason:'storage',error};}
  }
}
