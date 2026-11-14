# Monsterreise 034 – G4 Session-Lease / Chat 09

## Paketstand

G2a-Archiv unverändert ergänzt um `src/save/StorySessionLease.js` und `tests/story-session-lease-034.test.js`. Kein Edit an `src/main.js`, Legacy-`SaveSystem.js`, UI, Bootstrap oder bestehendem G2a-Code. Schema v2 bleibt bestehen.

## API

```js
import {StorySessionLease,createWebSessionLeaseAdapter,leaseName} from './src/save/StorySessionLease.js';
const coordinator = new StorySessionLease({
  save: storySaveSystem, // G2a mit echten Domainvalidatoren
  leaseAdapter: createWebSessionLeaseAdapter(navigator.locks),
  epochIds: () => freshSessionEpoch(),
  operationIds: () => freshOperationId()
});
await coordinator.open(1, {initial: validInitialSnapshot}); // optional initial only for empty slot
const ticket = coordinator.ticket();
const result = await coordinator.commit(ticket, preparedFullSnapshot, 'hatch');
if (result.status === 'committed' && coordinator.verifyRebind(result.ticket)) {
  // Chat 01/10: synchronous, atomic rebind from result.snapshot, NOT before.
  coordinator.confirmRebind(result.ticket);
}
// on uncertain: block UI/input, await coordinator.recover(), then rebind if committed
await coordinator.switchSlot(2, {rebind: snapshot => synchronousAtomicRebind(snapshot)});
await coordinator.close();
```

- `leaseName(slot)` = `monsterreise.story.v1.slot.Nsession-lease`; transaction lock G2a remains `monsterreise.story.v1.slot.N`. They cannot self-deadlock.
- `open` holds lease until `close`/successful `switchSlot`, validates through G2a `load` or `create`, and returns `ready` with ticket/snapshot. `LOCK_UNAVAILABLE` is fail-closed.
- `ticket()` returns immutable `{mode,slotId,sessionEpoch,generation,revision,commitId,operationId}`. `verify(ticket)` checks current lease and state. Rebind ticket after commit is accepted **only** by `verifyRebind` / `confirmRebind`; normal operations are blocked until confirmation.
- `commit(ticket,next,reason)` delegates to G2a (which does revision/commitId/epoch check under transaction lock and readback). It never mutates live Game/Team/Story/Location. `committed` returns validated snapshot + rebind ticket; `not-committed` leaves old ticket valid; `uncertain` blocks all subsequent commits.
- `recover()` is only valid in `uncertain`. Confirmed candidate requires `confirmRebind` before gameplay resumes; unchanged old commit returns `not-committed` and restores readiness. Ambiguous recovery remains blocked.
- `switchSlot` stages the new slot while holding the old lease; synchronous `rebind` is supplied by Chat 01/10. A failed rebind retains old session and releases staged lease. Async rebind is rejected.
- `close()` invalidates tickets and releases the lease. A lost lease sets `phase:'lost'` and invalidates all tickets. After loss, no write or rebind is allowed; caller must enter controlled error state.

## Integration requirements / limitations

1. G2a `sessionEpoch()` must return the active lease epoch for commits; Chat 10 supplies a stable shared provider. If it differs, G2a rejects with `SESSION_CONFLICT`.
2. G2a `validators.team/story/location/transition` must be **real side-effect-free validators** supplied by Chat 03/06/01/02. This module deliberately supplies none. Missing validators fail closed via G2a.
3. `commit` requires a **fully prepared immutable candidate snapshot** (Team + Story + Location) from the domain controllers. No live starter may be assigned before confirmed commit and successful ticket verification/rebind.
4. Chat 01/10 must synchronously atomically bind all live references, guard interactions while switching/committing/recovering, and check ticket immediately before rebind. This adapter does not implement live rollback of a partially failing rebind. `rebind` must be all-or-nothing by caller contract.
5. Web Locks are cooperative. Browser tab termination should release locks through browser behavior; loss during a pending transaction may require manual recovery. Node fake locks do not establish real browser lock behavior.
6. For a strict one-writer policy, all Story entry points must use this coordinator. Direct use of G2a `commit` by other code bypasses the session lease and must be prohibited by integration ownership.
7. An external epoch change is checked by G2a on commit, but ticket validity is based on this coordinator's epoch/generation. Chat 01/10 must invalidate the coordinator on a session reset; never reuse an old coordinator across a new session.
8. A `committed` response followed by a failing Engine rebind leaves persisted state advanced. Chat 01/10 must freeze interaction and reload/rebind the confirmed snapshot, not retry the starter commit.
9. Starter species policy and actual Browser Web Locks E2E remain separate acceptance gates. No story hatch or production Engine integration is included.

## Tests

`node --test tests/story-session-lease-034.test.js`: 11 passing. `npm test`: 255 passing, 0 failing (220 legacy + 24 G2a + 11 G4). See `docs/G4_TESTPROTOKOLL_034.txt`.

Node simulation covers separate locks, competing sessions, release, slot switch and rollback-on-rebind-exception, corrupt target, lock loss, stale tickets, write failure, uncertain/readback/recovery, absent validator, absent lock adapter, and simulated Web Locks callback lifetime. **Real browser Web Locks / multi-tab: not tested.**
