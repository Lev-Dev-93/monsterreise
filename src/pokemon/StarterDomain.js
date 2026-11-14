/** Monsterreise 034 G3b: isolated, non-persistent starter/egg domain. */
import {restoreTeam, MAX_TEAM_SIZE} from './Team.js';
import {serializePokemon} from './Pokemon.js';

export const EGG_GIFT_EVENT = 'story.prologue.birthday.egg-gift';
export const HATCH_EVENT = 'story.prologue.route1.first-entry';
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const validId = x => typeof x === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(x);
const clone = x => structuredClone(x);
const fail = (code, detail = code) => { const e = new Error(detail); e.code = code; throw e; };
const ensure = (condition, code) => { if (!condition) fail(code); };
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);

/** Registry IDs are canonical; never silently translate names, numbers or aliases. */
export function resolveCanonicalSpeciesId(speciesId, registry) {
  ensure(typeof speciesId === 'string' && /^[a-z0-9-]+$/.test(speciesId), 'INVALID_SPECIES');
  ensure(registry && typeof registry.get === 'function', 'INVALID_REGISTRY');
  const species = registry.get(speciesId);
  ensure(species && species.speciesId === speciesId, 'INVALID_SPECIES');
  return speciesId;
}

/** Explicit injected policy; missing exclusions/approval fail closed. */
export function validateStarterSpecies(speciesId, {registry, policy} = {}) {
  const id = resolveCanonicalSpeciesId(speciesId, registry);
  ensure(object(policy) && policy.approved === true &&
    typeof policy.isBaseSpecies === 'function' &&
    typeof policy.isExcluded === 'function', 'POLICY_NOT_APPROVED');
  const s = registry.get(id);
  ensure(Number.isSafeInteger(s.generation) && s.generation >= 1 && s.generation <= 4,
    'INVALID_GENERATION');
  ensure(policy.isBaseSpecies(s) === true, 'NOT_BASE_SPECIES');
  ensure(policy.isExcluded(s) === false, 'EXCLUDED_SPECIES');
  // 033 createPokemon(origin:'starter') also requires this existing registry flag.
  ensure(s.starterEligible === true, 'REGISTRY_STARTER_INELIGIBLE');
  return id;
}

/** All known ownership IDs (team, PC, daycare, eggs) must be provided by integrator. */
export function reserveStarterIds({generateId, ownedIds, eggIds = [], maxAttempts = 32} = {}) {
  ensure(typeof generateId === 'function' && ownedIds && Symbol.iterator in Object(ownedIds) &&
    eggIds && Symbol.iterator in Object(eggIds), 'INVALID_ID_DEPENDENCIES');
  ensure(Number.isSafeInteger(maxAttempts) && maxAttempts > 0 && maxAttempts <= 1024, 'INVALID_ID_DEPENDENCIES');
  const used = new Set([...ownedIds, ...eggIds]);
  const reserve = prefix => {
    for (let i=0;i<maxAttempts;i++) {
      const raw = generateId();
      const id = `${prefix}${raw}`;
      if (validId(id) && !used.has(id)) { used.add(id); return id; }
    }
    fail('DUPLICATE_ID');
  };
  return Object.freeze({eggId:reserve('egg-'), pokemonInstanceId:reserve('pokemon-')});
}

export function createStarterEgg({speciesId, registry, policy, ids} = {}) {
  const id = validateStarterSpecies(speciesId,{registry,policy});
  ensure(object(ids) && validId(ids.eggId) && validId(ids.pokemonInstanceId) &&
    ids.eggId !== ids.pokemonInstanceId, 'INVALID_EGG');
  return {eggId:ids.eggId,speciesId:id,pokemonInstanceId:ids.pokemonInstanceId,
    ownership:'player',received:true,hatchStatus:'unhatched',
    receivedAtEventId:EGG_GIFT_EVENT,hatchedAtEventId:null};
}

/** Validates G2a egg state; does not alter the input. */
export function validateStarterEgg({egg, wishId, registry, policy, ownedIds = [], eggIds = []} = {}) {
  ensure(object(egg), 'INVALID_EGG');
  const fields = ['eggId','speciesId','pokemonInstanceId','ownership','received','hatchStatus','receivedAtEventId','hatchedAtEventId'];
  ensure(fields.every(k => Object.hasOwn(egg,k)), 'INVALID_EGG');
  if (egg.received === false) {
    ensure(egg.eggId===null && egg.speciesId===null && egg.pokemonInstanceId===null &&
      egg.ownership===null && egg.hatchStatus==='not-received' &&
      egg.receivedAtEventId===null && egg.hatchedAtEventId===null, 'INVALID_EGG');
    return true;
  }
  ensure(egg.received === true && validId(egg.eggId) && validId(egg.pokemonInstanceId) &&
    egg.eggId!==egg.pokemonInstanceId && egg.ownership==='player' &&
    egg.receivedAtEventId===EGG_GIFT_EVENT && wishId===egg.speciesId, 'INVALID_EGG');
  validateStarterSpecies(egg.speciesId,{registry,policy});
  ensure(egg.hatchStatus==='unhatched' || egg.hatchStatus==='hatched','INVALID_EGG');
  ensure(egg.hatchedAtEventId === (egg.hatchStatus==='hatched' ? HATCH_EVENT : null), 'INVALID_EGG');
  // Reserved pokemon ID must not already belong to another member. The hatched
  // starter may legitimately be in the team, so caller excludes that same ID.
  const other = new Set([...ownedIds, ...eggIds]);
  ensure(!other.has(egg.eggId) && !other.has(egg.pokemonInstanceId), 'DUPLICATE_ID');
  return true;
}

/** Strict story-team check, including required battleSync and lossless 033 roundtrip. */
export function validateStoryTeam(teamSave, registry, {ownedIds = []} = {}) {
  ensure(object(teamSave) && Array.isArray(teamSave.members) &&
    teamSave.members.length <= MAX_TEAM_SIZE && object(teamSave.battleSync) &&
    object(teamSave.battleSync.revisions) && Array.isArray(teamSave.battleSync.consumed), 'INVALID_TEAM');
  const ids = teamSave.members.map(p=>p?.instanceId);
  ensure(ids.every(validId) && new Set(ids).size===ids.length &&
    ids.every(id=>!new Set(ownedIds).has(id)), 'DUPLICATE_ID');
  let restored;
  try { restored = restoreTeam(clone(teamSave),registry); }
  catch (error) { fail('INVALID_TEAM',error.message); }
  ensure(same(restored.toSaveData(),teamSave), 'INVALID_TEAM');
  return true;
}

/** Candidate only: no storage, no UI, no live team changes, no automatic hatch. */
export function prepareStarterAssignment({teamSave, egg, wishId, registry, policy,
  ownedIds = [], eggIds = [], starterParameters} = {}) {
  validateStoryTeam(teamSave,registry,{ownedIds});
  validateStarterEgg({egg,wishId,registry,policy,ownedIds,eggIds});
  if (egg.hatchStatus === 'hatched') {
    ensure(teamSave.starterAssigned === true, 'INVALID_STATE');
    return {status:'already-hatched',teamSave:clone(teamSave),egg:clone(egg)};
  }
  ensure(egg.hatchStatus==='unhatched' && teamSave.starterAssigned===false, 'INVALID_STATE');
  ensure(teamSave.members.length < MAX_TEAM_SIZE, 'TEAM_FULL');
  ensure(!teamSave.members.some(p=>p.instanceId===egg.pokemonInstanceId), 'DUPLICATE_ID');
  // Deliberately no level/moves/HP/shiny production defaults.
  ensure(object(starterParameters) && Number.isSafeInteger(starterParameters.level) &&
    starterParameters.level >= 1 && starterParameters.level <= 100 &&
    starterParameters.explicitTestOrApproved === true, 'STARTER_PARAMETERS_REQUIRED');
  const team = restoreTeam(clone(teamSave),registry);
  let pokemon;
  try { pokemon = team.assignStarter({speciesId:egg.speciesId,
    instanceId:egg.pokemonInstanceId,level:starterParameters.level}); }
  catch(error) { fail('STARTER_ASSIGNMENT_FAILED',error.message); }
  // 033 initializes proposed moves and PP. They are not yet approved for story.
  ensure(starterParameters.acceptLegacyMovesForTest === true ||
    (Array.isArray(starterParameters.approvedMoveIds) &&
      same(pokemon.moveIds,starterParameters.approvedMoveIds)), 'MOVES_NOT_APPROVED');
  ensure(starterParameters.shiny === false || starterParameters.shiny === true, 'SHINY_RULE_REQUIRED');
  // 033 assignStarter hardcodes shiny:false; shiny:true needs a later approved
  // integration strategy. Fail closed instead of silently misrepresenting it.
  ensure(starterParameters.shiny === false, 'SHINY_NOT_SUPPORTED_BY_033_ASSIGNMENT');
  ensure(typeof starterParameters.calculateMaxHp === 'function', 'HP_RULE_REQUIRED');
  const hp = starterParameters.calculateMaxHp(serializePokemon(pokemon));
  ensure(Number.isSafeInteger(hp) && hp >= 1, 'INVALID_HP');
  // 033 team has no dedicated setter for HP: update only on detached save data,
  // then validate through canonical restoreTeam roundtrip.
  const candidate = team.toSaveData();
  const last = candidate.members[candidate.members.length-1];
  last.maxHp = hp; last.currentHp = hp;
  validateStoryTeam(candidate,registry,{ownedIds});
  ensure(same(candidate.battleSync.revisions,
    {...teamSave.battleSync.revisions,[egg.pokemonInstanceId]:0}) &&
    same(candidate.battleSync.consumed,teamSave.battleSync.consumed), 'BATTLE_SYNC_CHANGED');
  return {status:'prepared',teamSave:candidate,pokemon:clone(last),egg:{...clone(egg),
    hatchStatus:'hatched',hatchedAtEventId:HATCH_EVENT}};
}
