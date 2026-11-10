/** Auftrag 008: Teamverwaltung; verwendet ausschließlich Pokemon.js-Instanzen. */
import {createPokemon, serializePokemon, deserializePokemon, initializeMovePp} from './Pokemon.js';
import {getStarterMoveIds} from './starterMoves.js';
import {sampleMoveRegistry} from './sampleMoves.js';
export const MAX_TEAM_SIZE = 6;
const assert = (ok, message) => { if (!ok) throw new TypeError(message); };
const copy = value => JSON.parse(JSON.stringify(value));
export function createTeam({registry, members = [], starterAssigned = false, moveRegistry = sampleMoveRegistry} = {}) {
  assert(registry && typeof registry.get === 'function', 'Pokémon-Register fehlt');
  assert(Array.isArray(members) && members.length <= MAX_TEAM_SIZE, 'Ungültige Teamgröße');
  assert(typeof starterAssigned === 'boolean', 'Ungültiger Starterstatus');
  let team = members.map(p => deserializePokemon(p, registry));
  assert(new Set(team.map(p => p.instanceId)).size === team.length, 'Doppelte Instanz-ID');
  assert(team.filter(p => p.origin === 'starter').length <= 1, 'Mehrere Starter im Team');
  assert(!team.some(p => p.origin === 'starter') || starterAssigned, 'Starterstatus fehlt');
  let assigned = starterAssigned;
  // Revisions and consumed battle IDs are persisted to reject stale/replayed results.
  const revisions = new Map(team.map(p => [p.instanceId, 0]));
  const consumed = new Set();
  const active = new Map();
  const validId = id => typeof id === 'string' && id.length > 0;
  const integer = (n, min, max = Infinity) => Number.isSafeInteger(n) && n >= min && n <= max;
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  function validateResult(before, after) {
    assert(after && typeof after === 'object' && !Array.isArray(after), 'Ungültiges Kampfergebnis');
    // Never accept identity or arbitrary changes via a battle result.
    const permitted = new Set(['currentHp','maxHp','movePp']);
    assert(Object.keys(after).every(k => permitted.has(k)), 'Unerlaubtes Kampffeld');
    assert(own(after,'currentHp') && own(after,'maxHp') && own(after,'movePp'), 'Unvollständiger Kampfzustand');
    const maxHp = after.maxHp;
    assert(integer(maxHp,1) && (before.maxHp === null || before.maxHp === maxHp), 'Ungültige maximale KP');
    assert(integer(after.currentHp,0,maxHp) && (before.currentHp === null || after.currentHp <= before.currentHp), 'Ungültige aktuelle KP');
    assert(after.movePp && typeof after.movePp === 'object' && !Array.isArray(after.movePp), 'Ungültige AP');
    assert(Object.keys(after.movePp).length === new Set(before.moveIds).size &&
      before.moveIds.every(id => own(after.movePp,id)), 'Attacken-AP unvollständig');
    for (const id of before.moveIds) {
      const next=after.movePp[id], old=before.movePp?.[id];
      assert(next && typeof next==='object' && !Array.isArray(next) &&
        Object.keys(next).length===2 && own(next,'current') && own(next,'max') &&
        integer(next.max,1) && integer(next.current,0,next.max) &&
        (!old || (next.max===old.max && next.current<=old.current)), 'Ungültige AP-Werte');
    }
    return {currentHp:after.currentHp,maxHp,movePp:copy(after.movePp)};
  }
  const indexOf = id => team.findIndex(p => p.instanceId === id);
  const validateMember = pokemon => {
    const p = deserializePokemon(pokemon, registry);
    assert(indexOf(p.instanceId) < 0, 'Doppelte Instanz-ID');
    assert(team.length < MAX_TEAM_SIZE, 'Team ist voll');
    assert(p.origin !== 'starter', 'Starter nur über assignStarter vergeben');
    return p;
  };
  return Object.freeze({
    _restoreBattleSync(data) {
      assert(data && typeof data==='object' && !Array.isArray(data) &&
        data.revisions && typeof data.revisions==='object' && !Array.isArray(data.revisions) &&
        Array.isArray(data.consumed), 'Ungültige Kampf-Metadaten');
      assert(Object.keys(data.revisions).length===team.length &&
        team.every(p=>integer(data.revisions[p.instanceId],0)) &&
        data.consumed.every(validId) && new Set(data.consumed).size===data.consumed.length, 'Ungültige Kampf-Metadaten');
      revisions.clear();for(const p of team)revisions.set(p.instanceId,data.revisions[p.instanceId]);
      consumed.clear();for(const id of data.consumed)consumed.add(id);
    },
    /** Explicit, atomic Pokémon-Center healing. Never called by loading or initialization. */
    healAll({calculateMaxHp, moveRegistry:healingMoves = moveRegistry} = {}) {
      assert(active.size === 0, 'Heilung während eines aktiven Kampfes gesperrt');
      assert(healingMoves && typeof healingMoves.get === 'function', 'Attackenregister fehlt');
      // Stage and validate the entire party before committing a single member.
      const healed = team.map(member => {
        const next = serializePokemon(member);
        const maximum = next.maxHp === null
          ? (typeof calculateMaxHp === 'function' ? calculateMaxHp(copy(next)) : null)
          : next.maxHp;
        assert(integer(maximum, 1), 'Maximale KP fehlen oder sind ungültig');
        assert(next.currentHp === null || integer(next.currentHp, 0, maximum), 'Ungültige aktuelle KP');
        next.maxHp = maximum;
        next.currentHp = maximum;
        assert(new Set(next.moveIds).size === next.moveIds.length, 'Doppelte Attacke');
        assert(next.movePp === null || (next.movePp && typeof next.movePp === 'object' && !Array.isArray(next.movePp)), 'Ungültige AP-Daten');
        assert(next.movePp === null || Object.keys(next.movePp).every(id => next.moveIds.includes(id)), 'AP für unbekannte Attacke');
        const pp = {};
        for (const id of next.moveIds) {
          const move = healingMoves.get(id);
          assert(move && integer(move.pp, 1), `Unbekannte Attacke: ${id}`);
          const old = next.movePp?.[id];
          assert(old === undefined || (old && integer(old.max, 1) && integer(old.current, 0, old.max) && old.max === move.pp), `Ungültige AP: ${id}`);
          pp[id] = {current: move.pp, max: move.pp};
        }
        next.movePp = pp;
        return deserializePokemon(next, registry);
      });
      const changed = healed.filter((p, i) => !same(p, team[i])).length;
      for (let i = 0; i < healed.length; i++) {
        if (!same(healed[i], team[i])) {
          team[i] = healed[i];
          revisions.set(healed[i].instanceId, revisions.get(healed[i].instanceId) + 1);
        }
      }
      return {healed: team.length, changed};
    },
    getMembers() { return team.map(serializePokemon); },
    getMember(id) { const p = team.find(p => p.instanceId === id); return p ? serializePokemon(p) : null; },
    get size() { return team.length; },
    get starterAssigned() { return assigned; },
    addMember(pokemon) { const p = validateMember(pokemon); team.push(p); revisions.set(p.instanceId,0); return serializePokemon(p); },
    /** Start a battle against a detached snapshot. Only one pending result per member. */
    beginBattleSync(instanceId, battleId) {
      assert(validId(battleId) && validId(instanceId), 'Ungültige Kampf- oder Pokémon-ID');
      assert(!consumed.has(battleId) && ![...active.values()].some(v=>v.battleId===battleId), 'Kampf-ID bereits verwendet');
      const p=team.find(p=>p.instanceId===instanceId);
      assert(p, 'Teammitglied nicht gefunden');
      assert(!active.has(instanceId), 'Kampf für Teammitglied bereits aktiv');
      const baseline=serializePokemon(p);
      active.set(instanceId,{battleId,revision:revisions.get(instanceId),baseline});
      return {battleId,instanceId,pokemon:copy(baseline)};
    },
    /** Commit only HP and PP. Call once after Battle.finished; never pass a full Pokémon object. */
    applyBattleResult({battleId,instanceId,currentHp,maxHp,movePp,...unexpected}={}) {
      assert(Object.keys(unexpected).length===0, 'Unerlaubtes Kampffeld');
      assert(validId(battleId) && validId(instanceId), 'Ungültige Kampf- oder Pokémon-ID');
      assert(!consumed.has(battleId), 'Kampfergebnis bereits übernommen');
      const pending=active.get(instanceId);
      assert(pending && pending.battleId===battleId, 'Unbekannter oder veralteter Kampf');
      const index=indexOf(instanceId);
      assert(index>=0 && revisions.get(instanceId)===pending.revision, 'Veralteter Teamzustand');
      const state=validateResult(pending.baseline,{currentHp,maxHp,movePp});
      // A second validation through the canonical Pokémon model, before any mutation.
      const updated=deserializePokemon({...team[index],...state},registry);
      team[index]=updated;
      revisions.set(instanceId,revisions.get(instanceId)+1);
      active.delete(instanceId);consumed.add(battleId);
      return serializePokemon(updated);
    },
    cancelBattleSync(instanceId,battleId) {
      const pending=active.get(instanceId);
      assert(pending && pending.battleId===battleId, 'Unbekannter Kampf');
      active.delete(instanceId);consumed.add(battleId);
    },
    assignStarter({speciesId, instanceId, level}) {
      assert(!assigned, 'Starter wurde bereits vergeben');
      assert(team.length < MAX_TEAM_SIZE, 'Team ist voll');
      assert(indexOf(instanceId) < 0, 'Doppelte Instanz-ID');
      const moveIds=getStarterMoveIds(speciesId,moveRegistry);
      const p = createPokemon({registry, speciesId, instanceId, level, origin:'starter',moveIds});
      initializeMovePp(p,moveRegistry);
      team.push(p); revisions.set(p.instanceId,0); assigned = true;
      return serializePokemon(p);
    },
    removeMember(instanceId) {
      const index = indexOf(instanceId);
      if (index < 0) return null;
      active.delete(instanceId); revisions.delete(instanceId); return serializePokemon(team.splice(index, 1)[0]);
    },
    moveMember(instanceId, targetIndex) {
      assert(Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < team.length, 'Ungültige Zielposition');
      const index = indexOf(instanceId);
      assert(index >= 0, 'Teammitglied nicht gefunden');
      const [p] = team.splice(index, 1); team.splice(targetIndex, 0, p);
      return this.getMembers();
    },
    toSaveData() { return {starterAssigned: assigned, members: team.map(serializePokemon),
      battleSync:{revisions:Object.fromEntries(revisions),consumed:[...consumed]}}; }
  });
}
export function restoreTeam(saved, registry) {
  assert(saved && typeof saved === 'object' && !Array.isArray(saved), 'Ungültige Teamdaten');
  const result=createTeam({registry, members:saved.members, starterAssigned:saved.starterAssigned});
  // Legacy saves lack battleSync; they remain valid. Metadata is imported via a private setup hook.
  if (saved.battleSync !== undefined) result._restoreBattleSync(saved.battleSync);
  return result;
}
