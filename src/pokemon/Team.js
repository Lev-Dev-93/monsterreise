/** Auftrag 008: Teamverwaltung; verwendet ausschließlich Pokemon.js-Instanzen. */
import {createPokemon, serializePokemon, deserializePokemon} from './Pokemon.js';
export const MAX_TEAM_SIZE = 6;
const assert = (ok, message) => { if (!ok) throw new TypeError(message); };
const copy = value => JSON.parse(JSON.stringify(value));
export function createTeam({registry, members = [], starterAssigned = false} = {}) {
  assert(registry && typeof registry.get === 'function', 'Pokémon-Register fehlt');
  assert(Array.isArray(members) && members.length <= MAX_TEAM_SIZE, 'Ungültige Teamgröße');
  assert(typeof starterAssigned === 'boolean', 'Ungültiger Starterstatus');
  let team = members.map(p => deserializePokemon(p, registry));
  assert(new Set(team.map(p => p.instanceId)).size === team.length, 'Doppelte Instanz-ID');
  assert(team.filter(p => p.origin === 'starter').length <= 1, 'Mehrere Starter im Team');
  assert(!team.some(p => p.origin === 'starter') || starterAssigned, 'Starterstatus fehlt');
  let assigned = starterAssigned;
  const indexOf = id => team.findIndex(p => p.instanceId === id);
  const validateMember = pokemon => {
    const p = deserializePokemon(pokemon, registry);
    assert(indexOf(p.instanceId) < 0, 'Doppelte Instanz-ID');
    assert(team.length < MAX_TEAM_SIZE, 'Team ist voll');
    assert(p.origin !== 'starter', 'Starter nur über assignStarter vergeben');
    return p;
  };
  return Object.freeze({
    getMembers() { return team.map(serializePokemon); },
    getMember(id) { const p = team.find(p => p.instanceId === id); return p ? serializePokemon(p) : null; },
    get size() { return team.length; },
    get starterAssigned() { return assigned; },
    addMember(pokemon) { const p = validateMember(pokemon); team.push(p); return serializePokemon(p); },
    assignStarter({speciesId, instanceId, level}) {
      assert(!assigned, 'Starter wurde bereits vergeben');
      assert(team.length < MAX_TEAM_SIZE, 'Team ist voll');
      assert(indexOf(instanceId) < 0, 'Doppelte Instanz-ID');
      const p = createPokemon({registry, speciesId, instanceId, level, origin:'starter'});
      team.push(p); assigned = true;
      return serializePokemon(p);
    },
    removeMember(instanceId) {
      const index = indexOf(instanceId);
      if (index < 0) return null;
      return serializePokemon(team.splice(index, 1)[0]);
    },
    moveMember(instanceId, targetIndex) {
      assert(Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < team.length, 'Ungültige Zielposition');
      const index = indexOf(instanceId);
      assert(index >= 0, 'Teammitglied nicht gefunden');
      const [p] = team.splice(index, 1); team.splice(targetIndex, 0, p);
      return this.getMembers();
    },
    toSaveData() { return {starterAssigned: assigned, members: team.map(serializePokemon)}; }
  });
}
export function restoreTeam(saved, registry) {
  assert(saved && typeof saved === 'object' && !Array.isArray(saved), 'Ungültige Teamdaten');
  return createTeam({registry, members: saved.members, starterAssigned: saved.starterAssigned});
}
