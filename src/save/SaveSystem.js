import {restoreTeam} from '../pokemon/Team.js';
export const SAVE_VERSION = 1;
export const SAVE_PREFIX = 'monsterreise.v03.slot.';
const validSlot = slot => Number.isInteger(slot) && slot >= 1 && slot <= 3;
/** Fail-closed: no automatic rewriting/deleting of invalid or future-version data. */
export class SaveSystem {
  constructor({registry, storage = globalThis.localStorage} = {}) {
    if (!registry?.get || !storage?.getItem || !storage?.setItem) throw new TypeError('SaveSystem dependencies missing');
    this.registry = registry; this.storage = storage;
  }
  key(slot) {if (!validSlot(slot)) throw new RangeError('Speicherplatz muss 1–3 sein'); return `${SAVE_PREFIX}${slot}`;}
  load(slot) {
    const key = this.key(slot);
    let raw;
    try {raw = this.storage.getItem(key);}
    catch (error) {return {status:'error',reason:'storage',error};}
    if (raw === null) return {status:'empty'};
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data) || data.version !== SAVE_VERSION || !data.team) return {status:'incompatible'};
      const team = restoreTeam(data.team,this.registry);
      return {status:'ok',team};
    } catch (error) {return {status:'invalid',error};}
  }
  save(slot,team) {
    const key = this.key(slot);
    // Validate snapshot with the existing domain model before touching persistent data.
    const snapshot = team.toSaveData();
    restoreTeam(snapshot,this.registry);
    const payload = JSON.stringify({version:SAVE_VERSION,team:snapshot});
    try {this.storage.setItem(key,payload);return {status:'ok'};}
    catch(error) {return {status:'error',reason:'storage',error};}
  }
}
